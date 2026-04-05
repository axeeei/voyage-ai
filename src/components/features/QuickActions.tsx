import { motion } from 'framer-motion';
import { ImagePlus, Lightbulb, GraduationCap, BarChart2, Code2, PenLine, Globe, Dumbbell } from 'lucide-react';

const ACTIONS = [
  { icon: ImagePlus,     label: 'Create image',    sub: 'Generate visuals',    color: '#10b981', glow: 'rgba(16,185,129,0.22)',  border: 'rgba(16,185,129,0.25)',  prompt: 'I want to create an image. Please guide me with detailed questions about what I want to generate.' },
  { icon: Lightbulb,     label: 'Make a plan',     sub: 'Strategy & roadmaps', color: '#f59e0b', glow: 'rgba(245,158,11,0.22)',  border: 'rgba(245,158,11,0.25)',  prompt: 'Help me make a plan. Ask me what I want to plan and guide me step by step.' },
  { icon: GraduationCap, label: 'Get advice',      sub: 'Honest guidance',     color: '#60a5fa', glow: 'rgba(96,165,250,0.22)', border: 'rgba(96,165,250,0.25)', prompt: 'I need advice. Ask me about my situation and give me your best, honest guidance.' },
  { icon: Code2,         label: 'Write code',      sub: 'Build & debug',       color: '#a78bfa', glow: 'rgba(167,139,250,0.25)', border: 'rgba(167,139,250,0.28)', prompt: 'Help me write or debug code. Ask me what I\'m building and in what language.' },
  { icon: BarChart2,     label: 'Analyze data',    sub: 'Extract insights',    color: '#22d3ee', glow: 'rgba(34,211,238,0.22)', border: 'rgba(34,211,238,0.25)', prompt: 'I want to analyze data. Ask me what data I have and what insights I\'m looking for.' },
  { icon: PenLine,       label: 'Write content',   sub: 'Any format',          color: '#f472b6', glow: 'rgba(244,114,182,0.22)', border: 'rgba(244,114,182,0.25)', prompt: 'Help me write something. Ask me what type of content and the details I want.' },
  { icon: Globe,         label: 'Translate',       sub: 'Any language',        color: '#fb923c', glow: 'rgba(251,146,60,0.22)', border: 'rgba(251,146,60,0.25)', prompt: 'Help me translate text. Ask me what I want to translate and to which language.' },
  { icon: Dumbbell,      label: 'Health & fitness',sub: 'Wellness guidance',   color: '#a3e635', glow: 'rgba(163,230,53,0.22)', border: 'rgba(163,230,53,0.25)', prompt: 'Give me health and fitness guidance. Ask about my goals, current routine, and any constraints.' },
];

interface QuickActionsProps { onSelect: (prompt: string) => void; }

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div style={{ padding: '0 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
      {ACTIONS.map((action, idx) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.055, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect(action.prompt)}
            className="qa-card"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 18, padding: '13px 13px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9,
              cursor: 'pointer', textAlign: 'left',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.background = `rgba(255,255,255,0.065)`;
              el.style.borderColor = action.border;
              el.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px ${action.glow}`;
              el.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.background = 'rgba(255,255,255,0.04)';
              el.style.borderColor = 'rgba(255,255,255,0.08)';
              el.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.07)';
              el.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon */}
            <div style={{
              width: 34, height: 34, borderRadius: 11,
              background: action.glow,
              border: `1px solid ${action.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={16} color={action.color} strokeWidth={1.9} />
            </div>

            {/* Labels */}
            <div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 500, lineHeight: 1.3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {action.label}
              </p>
              <p style={{ margin: '3px 0 0', color: 'rgba(255,255,255,0.28)', fontSize: 11, lineHeight: 1.3 }}>
                {action.sub}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
