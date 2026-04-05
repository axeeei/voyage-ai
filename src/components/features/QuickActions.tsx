import { motion } from 'framer-motion';
import {
  ImagePlus, Lightbulb, GraduationCap, BarChart2,
  Code2, PenLine, Globe, Dumbbell
} from 'lucide-react';

const ACTIONS = [
  {
    icon: ImagePlus,
    label: 'Create image',
    description: 'Generate stunning visuals',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
    prompt: 'I want to create an image. Please guide me with detailed questions about what I want to generate.',
  },
  {
    icon: Lightbulb,
    label: 'Make a plan',
    description: 'Strategy & roadmaps',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    prompt: 'Help me make a plan. Ask me what I want to plan and guide me step by step.',
  },
  {
    icon: GraduationCap,
    label: 'Get advice',
    description: 'Honest guidance',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
    prompt: 'I need advice. Ask me about my situation and give me your best, honest guidance.',
  },
  {
    icon: Code2,
    label: 'Write code',
    description: 'Build & debug anything',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
    prompt: 'Help me write or debug code. Ask me what I\'m building and in what language.',
  },
  {
    icon: BarChart2,
    label: 'Analyze data',
    description: 'Extract insights',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.2)',
    prompt: 'I want to analyze data. Ask me what data I have and what insights I\'m looking for.',
  },
  {
    icon: PenLine,
    label: 'Write content',
    description: 'Craft any format',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.2)',
    prompt: 'Help me write something. Ask me what type of content and the details I want.',
  },
  {
    icon: Globe,
    label: 'Translate',
    description: 'Any language',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.2)',
    prompt: 'Help me translate text. Ask me what I want to translate and to which language.',
  },
  {
    icon: Dumbbell,
    label: 'Health & fitness',
    description: 'Wellness guidance',
    color: '#84cc16',
    glow: 'rgba(132,204,22,0.2)',
    prompt: 'Give me health and fitness guidance. Ask about my goals, current routine, and any constraints.',
  },
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="w-full px-3">
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.3, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(action.prompt)}
              className="relative flex flex-col items-start gap-2 p-3.5 rounded-2xl text-left overflow-hidden transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 30% 30%, ${action.glow} 0%, transparent 70%)`,
                }}
              />

              {/* Icon container */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${action.glow}`,
                  border: `1px solid ${action.color}28`,
                }}
              >
                <Icon size={16} color={action.color} strokeWidth={1.8} />
              </div>

              {/* Labels */}
              <div>
                <p
                  className="text-white/85 text-[13px] font-medium leading-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {action.label}
                </p>
                <p className="text-white/30 text-[11px] mt-0.5 leading-tight">
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
