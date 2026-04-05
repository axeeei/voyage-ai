import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Paperclip, X, FileText } from 'lucide-react';

export interface AttachedFile {
  name: string;
  type: 'image' | 'file';
  mimeType: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

interface ChatInputProps {
  onSend: (text: string, attachments?: AttachedFile[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled = false, placeholder = 'Message Voyage AI' }: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const handleSend = useCallback(() => {
    if (disabled || (!text.trim() && attachments.length === 0)) return;
    onSend(text.trim(), attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [disabled, text, attachments, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const results: AttachedFile[] = [];
    for (const file of Array.from(files)) {
      const base64 = await new Promise<string>(res => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });
      results.push({
        name: file.name, type: file.type.startsWith('image/') ? 'image' : 'file',
        mimeType: file.type, size: file.size, base64,
        previewUrl: file.type.startsWith('image/') ? base64 : undefined,
      });
    }
    setAttachments(prev => [...prev, ...results].slice(0, 5));
  }, []);

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div style={{ padding: '8px 12px 12px' }}>
      <div className="glass-input rounded-[22px]">
        {/* Attachments */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ padding: '10px 12px 0', display: 'flex', gap: 8, flexWrap: 'wrap' as const }}
            >
              {attachments.map((att, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  className="relative group"
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <img src={att.previewUrl} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                      <FileText size={11} style={{ color: '#a78bfa' }} />
                      <span style={{ maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', opacity: 0 }}
                    className="group-hover:opacity-100 transition-opacity"
                  >
                    <X size={9} color="white" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, padding: '8px 8px 8px 10px' }}>
          {/* Attach */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', marginBottom: 2, transition: 'color 0.2s',
            }}
          >
            <Paperclip size={17} strokeWidth={1.8} />
          </motion.button>

          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.txt,.doc,.docx" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files)} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.55,
              resize: 'none', minHeight: 36, maxHeight: 160,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              padding: '6px 0',
            }}
            className="placeholder:text-white/[0.22]"
          />

          {/* Send */}
          <motion.button
            whileTap={{ scale: 0.87 }}
            onClick={handleSend}
            disabled={!canSend}
            style={{ flexShrink: 0, width: 34, height: 34, borderRadius: '50%', marginBottom: 2, cursor: canSend ? 'pointer' : 'default', border: 'none' }}
            className={canSend ? 'btn-send' : 'btn-send-off'}
            animate={{ scale: canSend ? 1 : 0.9, opacity: canSend ? 1 : 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUp size={16} strokeWidth={2.5} color={canSend ? '#fff' : 'rgba(255,255,255,0.25)'} />
          </motion.button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.12)', marginTop: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Voyage AI · Advanced intelligence
      </p>
    </div>
  );
}
