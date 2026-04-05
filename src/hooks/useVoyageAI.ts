import { useState, useCallback, useRef } from 'react';
import { Message, Conversation, UserProfile, Memory } from '@/types';
import {
  loadProfile, saveProfile, loadMemories, saveMemories,
  loadConversations, saveConversations, loadMemoryEnabled, saveMemoryEnabled,
  analyzeUserInput, extractMemorableInfo,
} from '@/lib/storage';
import { AttachedFile } from '@/components/features/ChatInput';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function buildConversationTitle(firstMessage: string): string {
  const clean = firstMessage.replace(/[^\w\s]/g, '').trim();
  const words = clean.split(/\s+/).slice(0, 6).join(' ');
  return words.length > 2 ? words : 'New Chat';
}

export function useVoyageAI() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [memories, setMemories] = useState<Memory[]>(() => loadMemories());
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(() => loadMemoryEnabled());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null;
  const isTyping = isThinking || isStreaming;

  const updateConversations = useCallback((updated: Conversation[]) => {
    setConversations(updated);
    saveConversations(updated);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      saveProfile(next);
      return next;
    });
  }, []);

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    setIsThinking(false);
    setIsStreaming(false);
    setActiveConversationId(null);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveConversations(updated);
      return updated;
    });
    if (activeConversationId === id) setActiveConversationId(null);
  }, [activeConversationId]);

  const toggleMemory = useCallback(() => {
    setIsMemoryEnabled(prev => {
      saveMemoryEnabled(!prev);
      return !prev;
    });
  }, []);

  const clearMemory = useCallback(() => {
    setMemories([]);
    saveMemories([]);
  }, []);

  const sendMessage = useCallback(async (text: string, attachments?: AttachedFile[]) => {
    if ((!text.trim() && (!attachments || attachments.length === 0)) || isTyping) return;

    const profileUpdates = analyzeUserInput(text, profile);
    const updatedProfile = { ...profile, ...profileUpdates };
    updateProfile(profileUpdates);

    if (isMemoryEnabled) {
      const newMemories = extractMemorableInfo(text);
      if (newMemories.length > 0) {
        const updatedMemories = [...memories, ...newMemories].slice(-100);
        setMemories(updatedMemories);
        saveMemories(updatedMemories);
      }
    }

    // Build display content for user message
    const displayContent = text || (attachments && attachments.length > 0 ? `[${attachments.map(a => a.name).join(', ')}]` : '');

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: displayContent,
      timestamp: Date.now(),
      attachments: attachments?.map(a => ({
        name: a.name,
        type: a.type,
        previewUrl: a.previewUrl,
        mimeType: a.mimeType,
        size: a.size,
      })),
    };

    let convId = activeConversationId;
    let currentMessages: Message[] = [];

    if (!convId) {
      convId = generateId();
      const newConv: Conversation = {
        id: convId,
        title: buildConversationTitle(text || (attachments?.[0]?.name ?? 'New Chat')),
        messages: [userMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newConv, ...conversations];
      updateConversations(updated);
      setActiveConversationId(convId);
      currentMessages = [userMessage];
    } else {
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === convId
            ? { ...c, messages: [...c.messages, userMessage], updatedAt: Date.now() }
            : c
        );
        saveConversations(updated);
        return updated;
      });
      currentMessages = [...(conversations.find(c => c.id === convId)?.messages ?? []), userMessage];
    }

    setIsThinking(true);

    const historyMessages = currentMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Serialize attachments for edge function (strip large base64 for non-images if needed)
    const serializedAttachments = attachments?.map(a => ({
      name: a.name,
      type: a.type,
      mimeType: a.mimeType,
      size: a.size,
      base64: a.base64, // full base64 data URL
    }));

    try {
      abortRef.current = new AbortController();

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/voyage-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: historyMessages,
            userProfile: updatedProfile,
            stream: true,
            attachments: serializedAttachments,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Check content type — image generation returns JSON, text returns SSE
      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('application/json')) {
        // Image generation response
        const data = await response.json();

        setIsThinking(false);

        if (data.type === 'image_generation') {
          const assistantId = generateId();
          const assistantMessage: Message = {
            id: assistantId,
            role: 'assistant',
            content: data.textContent || 'Here is your generated image!',
            timestamp: Date.now(),
            isStreaming: false,
            generatedImage: data.imageUrl,
          };

          setConversations(prev => {
            const updated = prev.map(c =>
              c.id === convId
                ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: Date.now() }
                : c
            );
            saveConversations(updated);
            return updated;
          });
        } else {
          // Error or non-stream response
          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: data.content || data.error || 'An error occurred.',
            timestamp: Date.now(),
            isStreaming: false,
          };
          setConversations(prev => {
            const updated = prev.map(c =>
              c.id === convId ? { ...c, messages: [...c.messages, assistantMessage] } : c
            );
            saveConversations(updated);
            return updated;
          });
        }
        return;
      }

      // SSE streaming
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';
      let assistantId: string | null = null;
      let gotFirstToken = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;

              if (!gotFirstToken) {
                gotFirstToken = true;
                assistantId = generateId();
                const assistantMessage: Message = {
                  id: assistantId,
                  role: 'assistant',
                  content: fullContent,
                  timestamp: Date.now(),
                  isStreaming: true,
                };

                setIsThinking(false);
                setIsStreaming(true);

                setConversations(prev =>
                  prev.map(c =>
                    c.id === convId
                      ? { ...c, messages: [...c.messages, assistantMessage] }
                      : c
                  )
                );
              } else {
                setConversations(prev =>
                  prev.map(c =>
                    c.id === convId
                      ? {
                          ...c,
                          messages: c.messages.map(m =>
                            m.id === assistantId
                              ? { ...m, content: fullContent, isStreaming: true }
                              : m
                          ),
                        }
                      : c
                  )
                );
              }
            }
          } catch {
            // skip malformed chunk
          }
        }
      }

      // Finalize streaming
      if (assistantId) {
        setConversations(prev => {
          const updated = prev.map(c =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === assistantId
                      ? { ...m, content: fullContent || 'I encountered an issue. Please try again.', isStreaming: false }
                      : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          );
          saveConversations(updated);
          return updated;
        });
      } else {
        const fallback: Message = {
          id: generateId(),
          role: 'assistant',
          content: 'I encountered an issue generating a response. Please try again.',
          timestamp: Date.now(),
          isStreaming: false,
        };
        setConversations(prev => {
          const updated = prev.map(c =>
            c.id === convId ? { ...c, messages: [...c.messages, fallback] } : c
          );
          saveConversations(updated);
          return updated;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Stream error:', err);

      const errMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Connection error. Please check your network and try again.',
        timestamp: Date.now(),
        isStreaming: false,
      };
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === convId ? { ...c, messages: [...c.messages, errMsg] } : c
        );
        saveConversations(updated);
        return updated;
      });
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
    }
  }, [isTyping, profile, memories, conversations, activeConversationId, isMemoryEnabled, updateProfile, updateConversations]);

  return {
    profile,
    memories,
    conversations,
    activeConversation,
    isThinking,
    isStreaming,
    isTyping,
    isMemoryEnabled,
    sidebarOpen,
    setSidebarOpen,
    sendMessage,
    startNewChat,
    selectConversation,
    deleteConversation,
    toggleMemory,
    clearMemory,
  };
}
