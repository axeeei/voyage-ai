import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Paperclip, X, Image, FileText, Mic, Square } from 'lucide-react';

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
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [disabled, text, attachments, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: AttachedFile[] = [];

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        name: file.name,
        type: isImage ? 'image' : 'file',
        mimeType: file.type,
        size: file.size,
        base64,
        previewUrl: isImage ? base64 : undefined,
      });
    }

    setAttachments(prev => [...prev, ...newAttachments].slice(0, 5));
  }, []);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="px-3 pt-2 pb-3">
      <motion.div
        className="relative rounded-[22px] overflow-hidden"
        style={{
          background: 'rgba(22, 22, 30, 0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(139,92,246,0.08), 0 8px 32px rgba(0,0,0,0.4)',
        }}
        whileFocus={{ borderColor: 'rgba(139,92,246,0.3)' }}
      >
        {/* Attachment Previews */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 px-3 pt-3 flex-wrap"
            >
              {attachments.map((att, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                      <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-white/60"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <FileText size={12} className="text-violet-400" />
                      <span className="max-w-[80px] truncate">{att.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={9} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Input Row */}
        <div className="flex items-end gap-1 px-2 py-2">
          {/* Attach button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all mb-0.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <Paperclip size={17} strokeWidth={1.8} />
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent text-white text-[14px] leading-[1.5] resize-none outline-none placeholder:text-white/25 py-1.5 min-h-[36px] max-h-[160px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />

          {/* Send or mic button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleSend}
            disabled={!canSend}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all mb-0.5"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                : 'rgba(255,255,255,0.06)',
              boxShadow: canSend ? '0 0 16px rgba(124,58,237,0.5)' : 'none',
            }}
            animate={{ scale: canSend ? 1 : 0.95 }}
          >
            <ArrowUp
              size={16}
              strokeWidth={2.5}
              className={canSend ? 'text-white' : 'text-white/25'}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Hint text */}
      <p className="text-center text-[10.5px] text-white/15 mt-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Voyage AI · Powered by advanced intelligence
      </p>
    </div>
  );
}
