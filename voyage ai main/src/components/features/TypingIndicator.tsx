import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 mb-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/10 mt-0.5">
        <img
          src="https://files.catbox.moe/u1jflu.jpg"
          alt="Voyage AI"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dots container */}
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-[6px] h-[6px] rounded-full"
            style={{ background: 'rgba(139,92,246,0.7)' }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.15, 0.8],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
