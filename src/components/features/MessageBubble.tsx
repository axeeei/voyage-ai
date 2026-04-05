import { useEffect, useRef, memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types';
import { Download, ZoomIn, X, Copy, Check, Code2 } from 'lucide-react';

interface Props { message: Message; isLordVoyage: boolean; }

// ── Code block ──────────────────────────────────────────────────
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="code-block" style={{ margin: '12px 0', fontSize: 12 }}>
      <div className="code-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Code2 size={11} style={{ color: '#a78bfa' }} />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {language || 'code'}
          </span>
        </div>
        <motion.button whileTap={{ scale: 0.88 }} onClick={copy}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'rgb(134,239,172)' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}>
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>
      <pre style={{ padding: '12px 14px', overflowX: 'auto', margin: 0 }}>
        <code style={{ color: 'rgba(134,239,172,0.85)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre' }}>
          {code}
        </code>
      </pre>
    </div>
  );
}

// ── Content renderer ─────────────────────────────────────────────
function renderContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const codeRe = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0; let match; let idx = 0;
  while ((match = codeRe.exec(text)) !== null) {
    if (match.index > last) nodes.push(<span key={`t${idx}`}>{renderLines(text.slice(last, match.index))}</span>);
    nodes.push(<CodeBlock key={`c${idx}`} language={match[1]} code={match[2].trim()} />);
    last = match.index + match[0].length; idx++;
  }
  if (last < text.length) nodes.push(<span key="tend">{renderLines(text.slice(last))}</span>);
  return nodes;
}

function renderLines(text: string): React.ReactNode[] {
  return text.split('\n').map((line, i, arr) => {
    const h = line.match(/^#{1,3}\s+(.+)/);
    if (h) return <span key={i} style={{ display: 'block', fontWeight: 600, color: '#fff', marginTop: 10, marginBottom: 2, fontSize: 14 }}>{h[1]}</span>;
    const isBullet = /^[\-\*•]\s/.test(line);
    const content = isBullet ? line.replace(/^[\-\*•]\s/, '') : line;
    const parts = renderInline(content);
    if (isBullet) return (
      <span key={i} style={{ display: 'flex', gap: 8, marginTop: 3 }}>
        <span style={{ color: 'rgba(167,139,250,0.6)', flexShrink: 0, marginTop: 3, fontSize: 8 }}>◆</span>
        <span>{parts}</span>
      </span>
    );
    return <span key={i} style={{ display: 'block', lineHeight: 1.72 }}>{parts}{i < arr.length - 1 && line.trim() === '' && <br />}</span>;
  });
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []; let rem = text; let k = 0;
  while (rem.length) {
    const ci = rem.indexOf('`');
    const bi = rem.indexOf('**');
    if (ci !== -1 && (bi === -1 || ci < bi)) {
      if (ci > 0) parts.push(<span key={k++}>{rem.slice(0, ci)}</span>);
      const ce = rem.indexOf('`', ci + 1);
      if (ce === -1) { parts.push(<span key={k++}>{rem.slice(ci)}</span>); rem = ''; }
      else {
        parts.push(<code key={k++} style={{ padding: '1px 6px', borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", background: 'rgba(0,0,0,0.4)', color: 'rgba(134,239,172,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}>{rem.slice(ci + 1, ce)}</code>);
        rem = rem.slice(ce + 1);
      }
    } else if (bi !== -1) {
      if (bi > 0) parts.push(<span key={k++}>{rem.slice(0, bi)}</span>);
      const be = rem.indexOf('**', bi + 2);
      if (be === -1) { parts.push(<span key={k++}>{rem.slice(bi)}</span>); rem = ''; }
      else {
        parts.push(<strong key={k++} style={{ fontWeight: 600, color: '#fff' }}>{rem.slice(bi + 2, be)}</strong>);
        rem = rem.slice(be + 2);
      }
    } else { parts.push(<span key={k++}>{rem}</span>); rem = ''; }
  }
  return parts;
}

// ── Lightbox ──────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
        style={{ position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
        <X size={16} />
      </motion.button>
      <motion.img initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        src={src} alt="" style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 16 }} onClick={e => e.stopPropagation()} />
      <a href={src} download="voyage-ai.png" onClick={e => e.stopPropagation()}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: 12, textDecoration: 'none' }}>
        <Download size={12} /> Download
      </a>
    </motion.div>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({ message, isLordVoyage }: Props) {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState(false);

  useEffect(() => {
    if (message.isStreaming && contentRef.current)
      contentRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [message.content, message.isStreaming]);

  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, padding: '0 16px' }}>
        <div style={{ maxWidth: '82%' }}>
          {message.attachments && message.attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, justifyContent: 'flex-end', marginBottom: 6 }}>
              {message.attachments.map((att, i) => (
                att.type === 'image' && att.previewUrl
                  ? <div key={i} style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}><img src={att.previewUrl} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  : <div key={i} style={{ padding: '6px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>📎 {att.name}</div>
              ))}
            </div>
          )}
          {message.content && !message.content.startsWith('[') && (
            <div className="bubble-user" style={{ borderRadius: '18px 18px 5px 18px', padding: '10px 14px', float: 'right', clear: 'both' }}>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.92)', fontSize: 13.5, lineHeight: 1.62, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {message.content}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <AnimatePresence>{lb && message.generatedImage && <Lightbox src={message.generatedImage} onClose={() => setLb(false)} />}</AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 18, padding: '0 16px' }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', marginTop: 2, boxShadow: '0 0 10px rgba(109,40,217,0.3)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <img src="https://files.catbox.moe/u1jflu.jpg" alt="Voyage AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          {isLordVoyage && (
            <p style={{ margin: '0 0 5px', fontSize: 9.5, color: 'rgba(167,139,250,0.4)', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Voyage AI · Your Servant
            </p>
          )}

          {message.generatedImage && (
            <div style={{ marginBottom: 10 }}>
              <div onClick={() => setLb(true)} style={{ position: 'relative', display: 'inline-block', borderRadius: 16, overflow: 'hidden', maxWidth: 260, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}
                className="group">
                <img src={message.generatedImage} alt="Generated" style={{ width: '100%', display: 'block', borderRadius: 16 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', borderRadius: 16 }}
                  className="group-hover:bg-black/20">
                  <ZoomIn size={22} style={{ color: 'white', opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100" />
                </div>
              </div>
              <p style={{ margin: '5px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Tap to enlarge</p>
            </div>
          )}

          <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', wordBreak: 'break-word' }}>
            {renderContent(message.content)}
            {message.isStreaming && <span className="cursor-blink" />}
          </div>
        </div>
      </motion.div>
    </>
  );
});

export default MessageBubble;
