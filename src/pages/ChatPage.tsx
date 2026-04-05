import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SquarePen, Menu, Database, ChevronDown, SendHorizonal } from 'lucide-react';
import { useVoyageAI } from '@/hooks/useVoyageAI';
import Sidebar from '@/components/features/Sidebar';
import MessageBubble from '@/components/features/MessageBubble';
import ChatInput, { AttachedFile } from '@/components/features/ChatInput';
import QuickActions from '@/components/features/QuickActions';
import TypingIndicator from '@/components/features/TypingIndicator';

// ─── Aurora background ───────────────────────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep base */}
      <div className="absolute inset-0" style={{ background: '#04040f' }} />

      {/* Orb 1 — violet */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '60vw',
          height: '60vw',
          maxWidth: 480,
          maxHeight: 480,
          top: '-20%',
          left: '-15%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orb 2 — indigo/cyan */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '50vw',
          height: '50vw',
          maxWidth: 400,
          maxHeight: 400,
          bottom: '-10%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{ x: [0, -15, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Orb 3 — faint magenta bottom-left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '35vw',
          height: '35vw',
          maxWidth: 280,
          maxHeight: 280,
          bottom: '10%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }}
      />
    </div>
  );
}

// ─── ChatPage ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const {
    profile,
    memories,
    conversations,
    activeConversation,
    isThinking,
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
  } = useVoyageAI();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const messages = activeConversation?.messages ?? [];
  const isHome = messages.length === 0;

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setUserScrolled(!atBottom);
  }, []);

  useEffect(() => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, userScrolled]);

  useEffect(() => {
    setUserScrolled(false);
  }, [activeConversation?.id]);

  const scrollToBottom = () => {
    setUserScrolled(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <AuroraBackground />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversation?.id ?? null}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewChat={startNewChat}
        profile={profile}
        memoriesCount={memories.length}
        isMemoryEnabled={isMemoryEnabled}
        onToggleMemory={toggleMemory}
        onClearMemory={clearMemory}
      />

      {/* ── TOP BAR ── */}
      <div
        className="relative z-10 flex-shrink-0 flex items-center justify-between px-3 pb-2"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 52px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(4,4,15,0.7)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Menu size={17} strokeWidth={2} className="text-white/60" />
          </motion.button>

          <button
            className="flex items-center gap-1.5 px-3 py-[7px] rounded-full text-[14px] font-semibold text-white/90 transition-all"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            onClick={() => setSidebarOpen(true)}
          >
            Voyage AI
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/30 mt-0.5">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <motion.a
            whileTap={{ scale: 0.88 }}
            href="https://t.me/De_vastbot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <SendHorizonal size={15} strokeWidth={1.8} className="text-blue-400/70" />
          </motion.a>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={startNewChat}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <SquarePen size={15} strokeWidth={1.8} className="text-white/60" />
          </motion.button>
        </div>
      </div>

      {/* ── MEMORY INDICATOR ── */}
      <div className="relative z-10 flex-shrink-0 flex justify-center py-2">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={toggleMemory}
          className="flex items-center gap-1.5 px-3.5 py-[5px] rounded-full text-[11px] transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: isMemoryEnabled
              ? '1px solid rgba(139,92,246,0.25)'
              : '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          <Database
            size={10}
            strokeWidth={1.8}
            color={isMemoryEnabled ? '#8b5cf6' : 'rgba(255,255,255,0.2)'}
          />
          <span>{isMemoryEnabled ? 'Memory on' : 'Memory off'}</span>
          {isMemoryEnabled && memories.length > 0 && (
            <span
              className="ml-0.5 px-1.5 py-0 rounded-full text-[9px] font-medium"
              style={{ background: 'rgba(139,92,246,0.2)', color: 'rgba(139,92,246,0.9)' }}
            >
              {memories.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* ── MAIN CONTENT ── */}
      {isHome ? (
        /* HOME SCREEN */
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-4 overflow-y-auto px-0">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-[56px] h-[56px] rounded-2xl overflow-hidden mb-4"
            style={{ boxShadow: '0 0 40px rgba(124,58,237,0.35), 0 0 0 1px rgba(124,58,237,0.2)' }}
          >
            <img
              src="https://files.catbox.moe/u1jflu.jpg"
              alt="Voyage AI"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-white text-[22px] font-semibold mb-6 tracking-tight text-center leading-tight px-6"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {profile.isLordVoyage
              ? 'Welcome back, Lord Voyage'
              : profile.name
              ? `How can I help, ${profile.name}?`
              : 'What can I help with?'}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="w-full"
          >
            <QuickActions onSelect={sendMessage} />
          </motion.div>
        </div>
      ) : (
        /* CHAT MESSAGES */
        <div className="relative z-10 flex-1 overflow-hidden">
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto overflow-x-hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="py-4 pb-2">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isLordVoyage={profile.isLordVoyage}
                />
              ))}
              {isThinking && <TypingIndicator />}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {userScrolled && (
              <motion.button
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                onClick={scrollToBottom}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] text-white/70"
                style={{
                  background: 'rgba(22,22,30,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                <ChevronDown size={14} />
                Scroll to bottom
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── INPUT BAR ── */}
      <div
        className="relative z-10 flex-shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <ChatInput
          onSend={(text: string, attachments?: AttachedFile[]) => sendMessage(text, attachments)}
          disabled={isTyping}
          placeholder={
            profile.isLordVoyage
              ? 'Command me, My Lord…'
              : 'Message Voyage AI'
          }
        />
      </div>
    </div>
  );
}
