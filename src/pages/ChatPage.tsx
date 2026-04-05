import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SquarePen, Menu, Database, ChevronDown, Send } from 'lucide-react';
import { useVoyageAI } from '@/hooks/useVoyageAI';
import Sidebar from '@/components/features/Sidebar';
import MessageBubble from '@/components/features/MessageBubble';
import ChatInput, { AttachedFile } from '@/components/features/ChatInput';
import QuickActions from '@/components/features/QuickActions';
import TypingIndicator from '@/components/features/TypingIndicator';

export default function ChatPage() {
  const {
    profile, memories, conversations, activeConversation,
    isThinking, isTyping, isMemoryEnabled, sidebarOpen, setSidebarOpen,
    sendMessage, startNewChat, selectConversation, deleteConversation,
    toggleMemory, clearMemory,
  } = useVoyageAI();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const messages = activeConversation?.messages ?? [];
  const isHome = messages.length === 0;

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    setUserScrolled(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }, []);

  useEffect(() => {
    if (!userScrolled) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, userScrolled]);

  useEffect(() => { setUserScrolled(false); }, [activeConversation?.id]);

  return (
    <div className="fixed inset-0 flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#03030d' }}>

      {/* ── AURORA BACKGROUND ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Base gradient */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 60%), #03030d'
        }} />
        {/* Orb 1 — main violet */}
        <div className="aurora-orb-1 absolute rounded-full" style={{
          width: '70vw', height: '70vw', maxWidth: 560, maxHeight: 560,
          top: '-25%', left: '-20%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.55) 0%, rgba(109,40,217,0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        {/* Orb 2 — indigo right */}
        <div className="aurora-orb-2 absolute rounded-full" style={{
          width: '60vw', height: '60vw', maxWidth: 500, maxHeight: 500,
          bottom: '-20%', right: '-15%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.5) 0%, rgba(79,70,229,0.18) 40%, transparent 70%)',
          filter: 'blur(70px)',
        }} />
        {/* Orb 3 — cyan accent */}
        <div className="aurora-orb-3 absolute rounded-full" style={{
          width: '45vw', height: '45vw', maxWidth: 380, maxHeight: 380,
          top: '30%', right: '-5%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(6,182,212,0.08) 50%, transparent 70%)',
          filter: 'blur(65px)',
        }} />
        {/* Orb 4 — deep magenta */}
        <div className="aurora-orb-4 absolute rounded-full" style={{
          width: '35vw', height: '35vw', maxWidth: 300, maxHeight: 300,
          bottom: '15%', left: '5%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 65%)',
          filter: 'blur(55px)',
        }} />
        {/* Centre glow vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(109,40,217,0.08) 0%, transparent 60%)'
        }} />
      </div>

      {/* Grain */}
      <div className="grain" />

      {/* ── SIDEBAR ── */}
      <Sidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        conversations={conversations} activeConversationId={activeConversation?.id ?? null}
        onSelectConversation={selectConversation} onDeleteConversation={deleteConversation}
        onNewChat={startNewChat} profile={profile} memoriesCount={memories.length}
        isMemoryEnabled={isMemoryEnabled} onToggleMemory={toggleMemory} onClearMemory={clearMemory}
      />

      {/* ── TOPBAR ── */}
      <div className="topbar relative flex-shrink-0 flex items-center justify-between px-3 pb-2"
        style={{ paddingTop: 'max(env(safe-area-inset-top,0px),52px)', zIndex: 10 }}>
        <div className="flex items-center gap-2">
          <button className="icon-btn w-9 h-9" onClick={() => setSidebarOpen(true)}>
            <Menu size={17} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
          <button
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all"
            style={{ fontFamily: "'Outfit', sans-serif" }}
            onClick={() => setSidebarOpen(true)}
          >
            <span className="gradient-text text-[15px] font-semibold">Voyage AI</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(167,139,250,0.5)', marginTop: 1 }}>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <a href="https://t.me/De_vastbot" target="_blank" rel="noopener noreferrer"
            className="icon-btn w-9 h-9">
            <Send size={14} strokeWidth={1.8} style={{ color: 'rgba(96,165,250,0.75)' }} />
          </a>
          <button className="icon-btn w-9 h-9" onClick={startNewChat}>
            <SquarePen size={14} strokeWidth={1.8} style={{ color: 'rgba(255,255,255,0.55)' }} />
          </button>
        </div>
      </div>

      {/* ── MEMORY PILL ── */}
      <div className="relative flex justify-center py-2" style={{ zIndex: 10 }}>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={toggleMemory}
          className={`flex items-center gap-1.5 px-3.5 py-[5px] rounded-full text-[11px] transition-all ${isMemoryEnabled ? 'memory-on' : 'memory-off'}`}
          style={{ color: isMemoryEnabled ? 'rgba(196,181,253,0.85)' : 'rgba(255,255,255,0.3)' }}
        >
          <Database size={10} strokeWidth={1.8}
            style={{ color: isMemoryEnabled ? '#a78bfa' : 'rgba(255,255,255,0.2)' }} />
          <span>{isMemoryEnabled ? 'Memory on' : 'Memory off'}</span>
          {isMemoryEnabled && memories.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0 rounded-full text-[9px] font-semibold"
              style={{ background: 'rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
              {memories.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* ── CONTENT ── */}
      {isHome ? (
        <div className="relative flex-1 flex flex-col items-center justify-center pb-4 overflow-y-auto px-0" style={{ zIndex: 5 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="mb-5"
            style={{
              width: 60, height: 60, borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(139,92,246,0.3), 0 0 40px rgba(109,40,217,0.5), 0 0 80px rgba(109,40,217,0.2)',
            }}
          >
            <img src="https://files.catbox.moe/u1jflu.jpg" alt="Voyage AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[23px] font-semibold text-center px-6 mb-1"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', lineHeight: 1.3 }}
          >
            {profile.isLordVoyage
              ? <><span className="gradient-text">Welcome back</span>, Lord Voyage</>
              : profile.name
              ? <>How can I help, <span className="gradient-text">{profile.name}</span>?</>
              : <><span className="gradient-text">What</span> can I help with?</>
            }
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[12px] mb-7"
            style={{ color: 'rgba(167,139,250,0.45)' }}
          >
            Advanced intelligence at your command
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-full"
          >
            <QuickActions onSelect={sendMessage} />
          </motion.div>
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden" style={{ zIndex: 5 }}>
          <div ref={scrollAreaRef} onScroll={handleScroll}
            className="h-full overflow-y-auto overflow-x-hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="py-4 pb-2">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isLordVoyage={profile.isLordVoyage} />
              ))}
              {isThinking && <TypingIndicator />}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>

          {/* Scroll to bottom */}
          <AnimatePresence>
            {userScrolled && (
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.88 }}
                onClick={() => { setUserScrolled(false); messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px]"
                style={{
                  background: 'rgba(10,8,28,0.92)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139,92,246,0.25)', color: 'rgba(196,181,253,0.8)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 14px rgba(109,40,217,0.2)',
                }}
              >
                <ChevronDown size={13} /> Scroll down
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── INPUT ── */}
      <div className="relative flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)', zIndex: 10 }}>
        <ChatInput
          onSend={(text: string, attachments?: AttachedFile[]) => sendMessage(text, attachments)}
          disabled={isTyping}
          placeholder={profile.isLordVoyage ? 'Command me, My Lord…' : 'Message Voyage AI'}
        />
      </div>
    </div>
  );
}
