import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Trash2, MessageSquare, Database, Brain,
  ChevronRight, Sparkles, Clock, Settings
} from 'lucide-react';
import { Conversation, UserProfile } from '@/types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
  profile: UserProfile;
  memoriesCount: number;
  isMemoryEnabled: boolean;
  onToggleMemory: () => void;
  onClearMemory: () => void;
}

function formatTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function Sidebar({
  open,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  profile,
  memoriesCount,
  isMemoryEnabled,
  onToggleMemory,
  onClearMemory,
}: SidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <motion.div
            key="sidebar"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 35, mass: 0.8 }}
            className="fixed top-0 left-0 bottom-0 z-50 flex flex-col w-[300px] overflow-hidden"
            style={{
              background: 'rgba(8, 8, 16, 0.95)',
              borderRight: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-0 left-0 w-full h-48 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 30% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)',
              }}
            />

            {/* Header */}
            <div
              className="flex items-center justify-between px-4 pt-12 pb-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg overflow-hidden"
                  style={{ boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}
                >
                  <img
                    src="https://files.catbox.moe/u1jflu.jpg"
                    alt="Voyage AI"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className="text-white text-[15px] font-semibold tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Voyage AI
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
              >
                <X size={15} />
              </motion.button>
            </div>

            {/* User info pill */}
            {profile.name && (
              <div className="px-4 py-3 flex-shrink-0">
                <div
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-violet-300"
                    style={{ background: 'rgba(124,58,237,0.25)' }}
                  >
                    {profile.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-[13px] font-medium leading-tight">{profile.name}</p>
                    <p className="text-white/35 text-[10.5px]">{profile.isLordVoyage ? 'Lord Voyage · Creator' : `${profile.messageCount} messages`}</p>
                  </div>
                  {profile.isLordVoyage && (
                    <Sparkles size={13} className="ml-auto text-violet-400" />
                  )}
                </div>
              </div>
            )}

            {/* New Chat button */}
            <div className="px-4 pb-3 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onNewChat(); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-white/80 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Plus size={15} strokeWidth={2} className="text-violet-400" />
                New conversation
              </motion.button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-3 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <MessageSquare size={18} className="text-white/20" />
                  </div>
                  <p className="text-white/25 text-[12px] text-center">No conversations yet.<br />Start a new chat!</p>
                </div>
              ) : (
                <>
                  <p className="text-white/20 text-[10.5px] uppercase tracking-widest font-medium px-1 mb-2">
                    History
                  </p>
                  <div className="space-y-0.5">
                    {conversations.map((conv) => {
                      const isActive = conv.id === activeConversationId;
                      return (
                        <motion.div
                          key={conv.id}
                          layout
                          className="group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                            border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                          }}
                          onClick={() => onSelectConversation(conv.id)}
                          whileTap={{ scale: 0.98 }}
                        >
                          <MessageSquare
                            size={13}
                            className={isActive ? 'text-violet-400 flex-shrink-0' : 'text-white/25 flex-shrink-0'}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12.5px] truncate leading-tight ${isActive ? 'text-white' : 'text-white/60'}`}>
                              {conv.title}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock size={9} className="text-white/20" />
                              <span className="text-[10px] text-white/20">{formatTime(conv.updatedAt)}</span>
                            </div>
                          </div>
                          <motion.button
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(239,68,68,0.12)', color: 'rgba(239,68,68,0.6)' }}
                            onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                            whileTap={{ scale: 0.88 }}
                          >
                            <Trash2 size={11} />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Memory section */}
            <div
              className="flex-shrink-0 px-4 py-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="space-y-2">
                {/* Memory toggle */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <Brain size={13} className={isMemoryEnabled ? 'text-violet-400' : 'text-white/25'} />
                    <div>
                      <p className="text-white/70 text-[12px] font-medium">Memory</p>
                      <p className="text-white/25 text-[10px]">
                        {isMemoryEnabled ? `${memoriesCount} items stored` : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={onToggleMemory}
                    className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
                    style={{
                      background: isMemoryEnabled
                        ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                        : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <motion.div
                      animate={{ x: isMemoryEnabled ? 16 : 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow"
                    />
                  </motion.button>
                </div>

                {/* Clear memory */}
                {isMemoryEnabled && memoriesCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onClearMemory}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] text-red-400/60 transition-all"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)' }}
                  >
                    <span>Clear all memories</span>
                    <Database size={11} />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
