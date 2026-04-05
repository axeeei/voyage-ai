import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '0 16px 18px' }}
    >
      {/* Avatar */}
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
        overflow: 'hidden', marginTop: 2,
        boxShadow: '0 0 10px rgba(109,40,217,0.35)',
        border: '1px solid rgba(139,92,246,0.3)',
      }}>
        <img src="https://files.catbox.moe/u1jflu.jpg" alt="Voyage AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Dots */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '10px 16px', borderRadius: '20px 20px 20px 6px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="typing-dot"
            style={{
              display: 'block', width: 7, height: 7, borderRadius: '50%',
              background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
