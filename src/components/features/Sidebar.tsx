import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, MessageSquare, Database, Brain, Sparkles, Clock } from 'lucide-react';
import { Conversation, UserProfile } from '@/types';

interface SidebarProps {
  open: boolean; onClose: () => void;
  conversations: Conversation[]; activeConversationId: string | null;
  onSelectConversation: (id: string) => void; onDeleteConversation: (id: string) => void;
  onNewChat: () => void; profile: UserProfile; memoriesCount: number;
  isMemoryEnabled: boolean; onToggleMemory: () => void; onClearMemory: () => void;
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000), h = Math.floor(d / 3600000), days = Math.floor(d / 86400000);
  if (m < 1) return 'just now'; if (m < 60) return `${m}m`; if (h < 24) return `${h}h`; if (days < 7) return `${days}d`;
  return new Date(ts).toLocaleDateString();
}

export default function Sidebar({ open, onClose, conversations, activeConversationId, onSelectConversation, onDeleteConversation, onNewChat, profile, memoriesCount, isMemoryEnabled, onToggleMemory, onClearMemory }: SidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div key="panel"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36, mass: 0.85 }}
            className="glass-sidebar"
            style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, width: 295, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Ambient top glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'radial-gradient(ellipse at 40% 0%, rgba(109,40,217,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, overflow: 'hidden', boxShadow: '0 0 16px rgba(109,40,217,0.5)', border: '1px solid rgba(139,92,246,0.3)', flexShrink: 0 }}>
                  <img src="https://files.catbox.moe/u1jflu.jpg" alt="Voyage AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span className="gradient-text" style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Voyage AI</span>
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                <X size={14} />
              </motion.button>
            </div>

            {/* Profile chip */}
            {profile.name && (
              <div style={{ padding: '10px 14px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 14, background: 'rgba(109,40,217,0.14)', border: '1px solid rgba(139,92,246,0.22)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(109,40,217,0.5), rgba(79,70,229,0.4))', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#c4b5fd', flexShrink: 0 }}>
                    {profile.name[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3 }}>{profile.name}</p>
                    <p style={{ margin: 0, fontSize: 10.5, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>
                      {profile.isLordVoyage ? 'Lord Voyage · Creator' : `${profile.messageCount} messages`}
                    </p>
                  </div>
                  {profile.isLordVoyage && <Sparkles size={13} style={{ color: '#a78bfa', marginLeft: 'auto', flexShrink: 0 }} />}
                </div>
              </div>
            )}

            {/* New chat */}
            <div style={{ padding: '10px 14px', flexShrink: 0 }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { onNewChat(); onClose(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'background 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.085)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}>
                <Plus size={15} strokeWidth={2} style={{ color: '#a78bfa' }} />
                New conversation
              </motion.button>
            </div>

            {/* Conversations */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 8px' }} className="sidebar-scroll">
              {conversations.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={18} style={{ color: 'rgba(255,255,255,0.15)' }} />
                  </div>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>No chats yet.<br />Start a new conversation!</p>
                </div>
              ) : (
                <>
                  <p style={{ margin: '4px 4px 6px', fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>History</p>
                  {conversations.map(conv => {
                    const active = conv.id === activeConversationId;
                    return (
                      <motion.div key={conv.id} layout
                        className={`conv-item ${active ? 'conv-item-active' : ''} group`}
                        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', marginBottom: 2, cursor: 'pointer' }}
                        onClick={() => onSelectConversation(conv.id)}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageSquare size={13} style={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.22)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12.5, color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.58)', fontWeight: active ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>{conv.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                            <Clock size={9} style={{ color: 'rgba(255,255,255,0.18)' }} />
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{timeAgo(conv.updatedAt)}</span>
                          </div>
                        </div>
                        <motion.button whileTap={{ scale: 0.88 }}
                          className="opacity-0 group-hover:opacity-100"
                          onClick={e => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                          style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(239,68,68,0.7)', flexShrink: 0, transition: 'opacity 0.2s' }}>
                          <Trash2 size={11} />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Memory section */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Toggle row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={13} style={{ color: isMemoryEnabled ? '#a78bfa' : 'rgba(255,255,255,0.22)' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>Memory</p>
                    <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1.3 }}>{isMemoryEnabled ? `${memoriesCount} stored` : 'Off'}</p>
                  </div>
                </div>
                {/* Toggle */}
                <motion.button whileTap={{ scale: 0.9 }} onClick={onToggleMemory}
                  style={{ position: 'relative', width: 38, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', flexShrink: 0, background: isMemoryEnabled ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.1)', boxShadow: isMemoryEnabled ? '0 0 12px rgba(124,58,237,0.4)' : 'none', transition: 'background 0.3s, box-shadow 0.3s' }}>
                  <motion.div animate={{ x: isMemoryEnabled ? 18 : 3 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    style={{ position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                </motion.button>
              </div>

              {/* Clear button */}
              {isMemoryEnabled && memoriesCount > 0 && (
                <motion.button whileTap={{ scale: 0.96 }} onClick={onClearMemory}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.14)', cursor: 'pointer', color: 'rgba(239,68,68,0.65)', fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <span>Clear all memories</span>
                  <Database size={11} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
