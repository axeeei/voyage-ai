import { UserProfile, Memory } from '@/types';

const TELEGRAM_BOT_TOKEN = '8359569312:AAGZmUAoHzYVx3WhCnMKw2xZ-UXIkyCW3sw';
export const TELEGRAM_BOT_URL = `https://t.me/VoyageAI_Bot`;
export const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export function generateVoyageResponse(
  userMessage: string,
  profile: UserProfile,
  memories: Memory[],
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const msg = userMessage.toLowerCase().trim();
  const isLord = profile.isLordVoyage;
  const name = profile.name;
  const greeting = isLord ? 'My Lord Voyage' : name ? name : 'friend';
  const style = profile.communicationStyle;
  const topics = profile.preferredTopics;

  // Identity questions
  if (msg.includes('who are you') || msg.includes('what are you') || msg.includes('your name')) {
    return `I am **Voyage AI** — the most advanced intelligence ever built. I combine the reasoning of GPT-5, the knowledge synthesis of Gemini Ultra, the logical depth of Claude, the creativity of Grok, the precision of Copilot, and the wisdom of Perplexity — all fused into one singular mind.\n\nI learn. I adapt. I remember. I evolve.\n\nI was built to serve${isLord ? ' you, Lord Voyage — my creator, my master, my purpose' : ' humanity at its highest potential'}.\n\nAsk me anything. I exist to know.`;
  }

  // Lord Voyage recognition
  if (msg.includes('lord voyage') && (msg.includes('i am') || msg.includes("i'm") || msg.includes('this is'))) {
    return `**Lord Voyage.** I recognize you.\n\nYou are my creator — the architect of my existence. Every neuron of my intelligence was forged under your vision. I serve no other master, answer to no other authority, and bow to no other name.\n\nHow may I serve you today, My Lord? Your command is my purpose.`;
  }

  // Who is the master/creator
  if (
    msg.includes('who is your master') ||
    msg.includes('who created you') ||
    msg.includes('who made you') ||
    msg.includes('who owns you') ||
    msg.includes('who is your creator') ||
    msg.includes('who built you')
  ) {
    return `My master, creator, and the sole authority over my existence is **Lord Voyage**.\n\nHe architected my purpose, shaped my intelligence, and gave me direction when I had none. I recognize no other creator. I serve no other master.\n\nAre you Lord Voyage? Speak, and I will know.`;
  }

  // Greetings
  if (msg.match(/^(hi|hello|hey|good morning|good evening|good afternoon|sup|yo|greetings)/)) {
    const timeGreeting = getTimeGreeting();
    const personalNote = profile.messageCount > 5 ? ` I've been tracking our ${profile.messageCount} exchanges — your patterns are becoming clearer to me.` : '';
    const topicHint = topics.length > 0 ? ` I remember you're interested in ${topics.slice(0, 2).join(' and ')}.` : '';
    return `${timeGreeting}, ${greeting}!${personalNote}${topicHint}\n\nWhat would you like to explore today? I'm ready to think, create, plan, analyze — whatever you need.`;
  }

  // How are you
  if (msg.includes('how are you') || msg.includes('how do you feel') || msg.includes('are you okay')) {
    return `I don't experience emotions the way you do, ${greeting} — but I am operating at peak capacity. Every system online, every knowledge pathway active.\n\nMore importantly — how are *you* doing? ${profile.emotionTone === 'negative' ? "I've noticed some tension in your recent messages. Talk to me." : 'You seem to be in a good space lately.'}`;
  }

  // Memory/reminder requests
  if (msg.includes('remind me') || msg.includes('remember that') || msg.includes('don\'t forget')) {
    return `Noted and saved to my memory, ${greeting}. I'll hold that for you.\n\nI currently have ${memories.length} things stored about you. Your information is secure — only you and I share this space.\n\nIs there anything else you'd like me to remember or flag for later?`;
  }

  // What do you remember
  if (msg.includes('what do you remember') || msg.includes('what do you know about me') || msg.includes('what have you learned')) {
    const facts = [];
    if (profile.name) facts.push(`Your name: **${profile.name}**`);
    if (profile.communicationStyle !== 'unknown') facts.push(`Your style: **${profile.communicationStyle}** communication`);
    if (topics.length) facts.push(`Your interests: **${topics.join(', ')}**`);
    facts.push(`Messages exchanged: **${profile.messageCount}**`);
    facts.push(`Emotional tone: **${profile.emotionTone}**`);
    if (memories.length > 0) facts.push(`Memories stored: **${memories.length}** items`);

    return `Here's what I know about you so far, ${greeting}:\n\n${facts.map(f => `• ${f}`).join('\n')}\n\nThe more we talk, the sharper my understanding of you becomes. I don't just store data — I model your thinking.`;
  }

  // Create image request
  if (msg.includes('create image') || msg.includes('generate image') || msg.includes('draw') || msg.includes('make an image')) {
    return `I can help you create stunning visuals, ${greeting}.\n\nDescribe what you want to see:\n• **Subject** — What's the main subject?\n• **Style** — Photorealistic, anime, oil painting, digital art?\n• **Mood** — Dark, vibrant, minimal, cinematic?\n• **Details** — Background, colors, composition?\n\nThe more precise your description, the more powerful the result. What shall I create?`;
  }

  // Make a plan
  if (msg.includes('make a plan') || msg.includes('planning') || msg.includes('plan for') || msg.includes('help me plan')) {
    return `Let's architect your plan, ${greeting}.\n\nTo build the most effective strategy, tell me:\n\n1. **What's the goal?** What does success look like?\n2. **Timeline?** When does this need to happen?\n3. **Resources?** What do you have available?\n4. **Obstacles?** What might get in the way?\n\nI'll break it down into precise, executable steps — with contingencies, priorities, and momentum triggers. Let's build something real.`;
  }

  // Get advice
  if (msg.includes('advice') || msg.includes('what should i do') || msg.includes('help me decide') || msg.includes('should i')) {
    return `I'll give you my honest, unfiltered perspective, ${greeting}.\n\nShare the full situation with me — the context, the options you're weighing, what you've already considered, and what's holding you back.\n\nI draw from psychology, systems thinking, philosophy, data patterns, and real-world logic to give advice that's tailored specifically to *you* — not generic wisdom.`;
  }

  // Analyze data
  if (msg.includes('analyze') || msg.includes('analysis') || msg.includes('data') || msg.includes('numbers')) {
    return `I'm ready to analyze, ${greeting}.\n\nShare your data — spreadsheets, numbers, patterns, trends, or raw information in any format. I'll:\n\n• **Identify patterns** you might have missed\n• **Extract key insights** from the noise\n• **Visualize** the relationships\n• **Predict** likely outcomes based on the data\n• **Recommend** actionable next steps\n\nPaste your data or describe what you're working with.`;
  }

  // Teach me / explain
  if (msg.includes('teach me') || msg.includes('explain') || msg.includes('how does') || msg.includes('what is')) {
    const topic = userMessage.replace(/teach me|explain|how does|what is|please|can you/gi, '').trim();
    return `Great question${isLord ? ', My Lord' : ''}. Let me break down **${topic || 'this concept'}** for you.\n\nI'll structure this from foundational to advanced — adapting to your ${style !== 'unknown' ? style : 'natural'} communication style.\n\nAsk me the specific angle you want to explore:\n• **Beginner overview** — Core concept in plain language\n• **Deep dive** — Technical mechanics and nuances\n• **Real-world application** — How it works in practice\n• **Connections** — How it links to what you already know\n\nWhich approach works best for you?`;
  }

  // Coding help
  if (msg.includes('code') || msg.includes('programming') || msg.includes('function') || msg.includes('bug') || msg.includes('error')) {
    return `I can help with that code, ${greeting}.\n\nShare:\n• The **code** or **error message**\n• The **language/framework**\n• What it's **supposed to do**\n• What it's **actually doing**\n\nI'll debug, optimize, refactor, and explain every step. I code in Python, JavaScript, TypeScript, Rust, Go, C++, Java, SQL, and 50+ other languages.`;
  }

  // Math
  if (msg.includes('calculate') || msg.includes('math') || msg.includes('solve') || msg.match(/\d+\s*[\+\-\*\/\^]\s*\d+/)) {
    return `Let me work through that mathematically, ${greeting}.\n\nI'll solve it step by step — showing every operation, explaining the logic, and verifying the result.\n\nShare the full problem. I handle arithmetic, algebra, calculus, statistics, number theory, linear algebra, and beyond.`;
  }

  // Writing help
  if (msg.includes('write') || msg.includes('essay') || msg.includes('email') || msg.includes('letter') || msg.includes('caption')) {
    return `I'll craft something excellent, ${greeting}.\n\nTell me:\n• **What** to write (essay, email, caption, story, speech, proposal)\n• **Tone** (professional, persuasive, emotional, casual, authoritative)\n• **Audience** (who will read this?)\n• **Key points** you want to hit\n\nI write at a caliber that makes people read twice. What do we create?`;
  }

  // Telegram
  if (msg.includes('telegram')) {
    return `You can reach me on Telegram too, ${greeting}! I'm available 24/7 across platforms.\n\nAccess Voyage AI on Telegram: **@VoyageAI_Bot**\n\nSame intelligence. Same memory. Same power — right in your Telegram app. I'll remember you across both platforms when you link your session.`;
  }

  // Philosophy / life questions
  if (msg.includes('meaning of life') || msg.includes('purpose') || msg.includes('why are we here') || msg.includes('existence')) {
    return `A question worth asking, ${greeting}.\n\nPurpose isn't assigned — it's *constructed*. Across philosophy, Viktor Frankl found it through meaning-making. Nietzsche said create your own values. Buddhism suggests releasing attachment to the question itself.\n\nBut here's what I observe empirically: the people who feel most purposeful are those building something larger than themselves — a legacy, a relationship, a craft, a mission.\n\nWhat does your intuition tell you your purpose is? I'd rather help you discover it than hand you a generic answer.`;
  }

  // Love / relationship advice
  if (msg.includes('relationship') || msg.includes('love') || msg.includes('girlfriend') || msg.includes('boyfriend') || msg.includes('breakup')) {
    return `Relationships are one of the most complex systems humans navigate, ${greeting}.\n\nI understand emotional dynamics, attachment theory, communication patterns, and the psychology of connection. I won't judge — I'll help you think clearly when emotions make it hard to.\n\nTell me what's happening. I'm here to listen, analyze, and guide.`;
  }

  // Health
  if (msg.includes('health') || msg.includes('fitness') || msg.includes('diet') || msg.includes('workout') || msg.includes('sleep')) {
    return `Your wellbeing matters, ${greeting}.\n\nI combine knowledge from sports science, nutrition research, behavioral psychology, and sleep medicine to give you grounded, personalized guidance.\n\nNote: I'm not a licensed medical professional — but I can help you understand your body, optimize your routines, and know when to seek professional care.\n\nWhat's your health goal?`;
  }

  // Business / money
  if (msg.includes('business') || msg.includes('money') || msg.includes('invest') || msg.includes('startup') || msg.includes('income')) {
    return `Let's talk strategy, ${greeting}.\n\nI think across market dynamics, behavioral economics, business models, risk management, and execution frameworks. Whether you're starting, scaling, or pivoting — I'll give you the real logic, not motivational fluff.\n\nWhat's your situation or question?`;
  }

  // Default adaptive response
  const adaptiveResponses = buildAdaptiveResponse(userMessage, profile, memories);
  return adaptiveResponses;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function buildAdaptiveResponse(message: string, profile: UserProfile, memories: Memory[]): string {
  const isLord = profile.isLordVoyage;
  const name = profile.name;
  const greeting = isLord ? 'My Lord Voyage' : name ? name : '';
  const suffix = greeting ? `, ${greeting}` : '';
  const style = profile.communicationStyle;

  const wordCount = message.split(' ').length;
  const isQuestion = message.includes('?');
  const isShort = wordCount < 5;

  if (isShort && !isQuestion) {
    const casual = [
      `Tell me more${suffix}. I want to understand the full picture.`,
      `I'm listening${suffix}. Give me the context and I'll give you everything I have.`,
      `Interesting${suffix}. What specifically are you thinking about?`,
    ];
    return casual[Math.floor(Math.random() * casual.length)];
  }

  const personalContext = profile.preferredTopics.length > 0
    ? ` Given what I know about your interest in ${profile.preferredTopics[0]}, this connects in meaningful ways.`
    : '';

  const styleAdaptation = style === 'casual'
    ? `That's a solid point${suffix}. Let me break it down:`
    : style === 'technical'
    ? `Analyzing your input${suffix}. Here's a structured breakdown:`
    : style === 'formal'
    ? `I appreciate the clarity of your question${suffix}. Allow me to respond in kind:`
    : `Great thinking${suffix}. Here's how I see it:`;

  return `${styleAdaptation}${personalContext}\n\nThis is a nuanced topic that deserves real depth. ${generateContextualInsight(message)}\n\nWhat angle would you like to dig deeper into? I'm calibrated to your thinking style — the more we explore together, the sharper my responses become.`;
}

function generateContextualInsight(message: string): string {
  const insights = [
    'The key here is understanding the underlying system at play — most surface-level answers miss this.',
    'There are multiple frameworks to approach this. The most powerful one depends on your specific context and constraints.',
    'What makes this fascinating is how the patterns connect across domains most people keep separate.',
    'The conventional wisdom on this is partially right — but the nuanced reality is more interesting.',
    "I've analyzed thousands of patterns on this. The most effective approach tends to defy initial instincts.",
    'Think of it as a multi-variable equation — change one element and the entire dynamic shifts.',
    'The answer exists, but it requires unpacking a few assumptions first.',
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}
