import { useEffect, useRef, memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types';
import { Download, ZoomIn, X, Copy, Check, Code } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isLordVoyage: boolean;
}

// ─── Code block parser ──────────────────────────────────────────────────────

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div
      className="my-3 rounded-xl overflow-hidden text-[12.5px]"
      style={{
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Code header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-1.5">
          <Code size={11} className="text-violet-400" />
          <span className="text-white/40 text-[10.5px] font-mono uppercase tracking-wide">
            {language || 'code'}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10.5px] transition-colors"
          style={{ color: copied ? 'rgb(134,239,172)' : 'rgba(255,255,255,0.35)' }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
      </div>
      {/* Code body */}
      <pre className="p-3 overflow-x-auto text-[12px] leading-relaxed">
        <code className="text-emerald-300/80 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

// ─── Content renderer ────────────────────────────────────────────────────────

function renderContent(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIdx = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Render text before this code block
    if (match.index > lastIndex) {
      nodes.push(
        <span key={`text-${blockIdx}`}>
          {renderInlineContent(text.slice(lastIndex, match.index))}
        </span>
      );
    }
    nodes.push(
      <CodeBlock key={`code-${blockIdx}`} language={match[1]} code={match[2].trim()} />
    );
    lastIndex = match.index + match[0].length;
    blockIdx++;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(
      <span key={`text-end`}>
        {renderInlineContent(text.slice(lastIndex))}
      </span>
    );
  }

  return nodes;
}

function renderInlineContent(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      return (
        <span key={lineIdx} className="block font-semibold text-white mt-3 mb-1 text-[14px]">
          {headingMatch[1]}
        </span>
      );
    }

    const isBullet = /^[\-\*•]\s/.test(line);
    const lineContent = isBullet ? line.replace(/^[\-\*•]\s/, '') : line;

    const parts = renderBoldText(lineContent);

    if (isBullet) {
      return (
        <span key={lineIdx} className="flex gap-2 mt-1">
          <span className="text-violet-400/60 flex-shrink-0 mt-1 text-[9px]">◆</span>
          <span>{parts}</span>
        </span>
      );
    }

    return (
      <span key={lineIdx} className="block leading-[1.7]">
        {parts}
        {lineIdx < lines.length - 1 && line.trim() === '' && <br />}
      </span>
    );
  });
}

function renderBoldText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let rem = text;
  let k = 0;

  while (rem.length > 0) {
    // Check for inline code `...`
    const inlineCodeIdx = rem.indexOf('`');
    const boldIdx = rem.indexOf('**');

    if (inlineCodeIdx !== -1 && (boldIdx === -1 || inlineCodeIdx < boldIdx)) {
      if (inlineCodeIdx > 0) parts.push(<span key={k++}>{rem.slice(0, inlineCodeIdx)}</span>);
      const endCode = rem.indexOf('`', inlineCodeIdx + 1);
      if (endCode === -1) {
        parts.push(<span key={k++}>{rem.slice(inlineCodeIdx)}</span>);
        rem = '';
      } else {
        parts.push(
          <code key={k++} className="px-1.5 py-0.5 rounded text-[11px] font-mono text-emerald-300/90"
            style={{ background: 'rgba(0,0,0,0.35)' }}>
            {rem.slice(inlineCodeIdx + 1, endCode)}
          </code>
        );
        rem = rem.slice(endCode + 1);
      }
    } else if (boldIdx !== -1) {
      if (boldIdx > 0) parts.push(<span key={k++}>{rem.slice(0, boldIdx)}</span>);
      const endBold = rem.indexOf('**', boldIdx + 2);
      if (endBold === -1) {
        parts.push(<span key={k++}>{rem.slice(boldIdx)}</span>);
        rem = '';
      } else {
        parts.push(
          <strong key={k++} className="font-semibold text-white">
            {rem.slice(boldIdx + 2, endBold)}
          </strong>
        );
        rem = rem.slice(endBold + 2);
      }
    } else {
      parts.push(<span key={k++}>{rem}</span>);
      rem = '';
    }
  }

  return parts;
}

// ─── Lightbox ───────────────────────────────────────────────────────────────

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white/60"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={onClose}
      >
        <X size={17} />
      </motion.button>

      <motion.img
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        src={src}
        alt="Generated image"
        className="max-w-full max-h-[88vh] object-contain rounded-2xl"
        style={{ maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
      />

      <a
        href={src}
        download="voyage-ai-image.png"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-white/60 text-[12px] transition-colors"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Download size={13} /> Download
      </a>
    </motion.div>
  );
}

// ─── MessageBubble ───────────────────────────────────────────────────────────

const MessageBubble = memo(function MessageBubble({ message, isLordVoyage }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (message.isStreaming && contentRef.current) {
      contentRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [message.content, message.isStreaming]);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex justify-end mb-3 px-4"
      >
        <div className="max-w-[82%] space-y-1.5">
          {/* Attachment previews */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end mb-1">
              {message.attachments.map((att, i) => (
                att.type === 'image' && att.previewUrl ? (
                  <div key={i} className="w-20 h-20 rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl text-[12px] text-white/60"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    📎 {att.name}
                  </div>
                )
              ))}
            </div>
          )}

          {message.content && !message.content.startsWith('[') && (
            <div
              className="rounded-[18px] rounded-br-[5px] px-4 py-2.5 inline-block float-right clear-both"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.3))',
                border: '1px solid rgba(124,58,237,0.25)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-white text-[13.5px] leading-[1.6] whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <>
      <AnimatePresence>
        {lightboxOpen && message.generatedImage && (
          <ImageLightbox src={message.generatedImage} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-start gap-2.5 mb-5 px-4"
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/10"
          style={{ boxShadow: '0 0 10px rgba(124,58,237,0.25)' }}
        >
          <img
            src="https://files.catbox.moe/u1jflu.jpg"
            alt="Voyage AI"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 min-w-0 pt-0.5">
          {isLordVoyage && (
            <p className="text-[9.5px] text-violet-400/50 font-medium mb-1.5 tracking-widest uppercase">
              Voyage AI · Your Servant
            </p>
          )}

          {/* Generated image */}
          {message.generatedImage && (
            <div className="mb-3">
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer group"
                style={{ maxWidth: '280px', border: '1px solid rgba(255,255,255,0.08)' }}
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={message.generatedImage}
                  alt="Generated by Voyage AI"
                  className="w-full h-auto rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded-2xl">
                  <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <p className="text-white/20 text-[10px] mt-1.5">Tap to enlarge · Generated by Voyage AI</p>
            </div>
          )}

          {/* Text content */}
          <div className="text-[13.5px] leading-[1.7] text-white/85 break-words">
            {renderContent(message.content)}
            {message.isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.85, repeat: Infinity, ease: 'steps(1)' }}
                className="inline-block w-[2px] h-[14px] bg-violet-400/80 ml-[2px] align-middle rounded-sm"
              />
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
});

export default MessageBubble;
