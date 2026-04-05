import { UserProfile, Memory, Conversation } from '@/types';

const PROFILE_KEY = 'voyage_user_profile';
const MEMORIES_KEY = 'voyage_memories';
const CONVERSATIONS_KEY = 'voyage_conversations';
const MEMORY_ENABLED_KEY = 'voyage_memory_enabled';

export const defaultProfile: UserProfile = {
  name: null,
  isLordVoyage: false,
  interests: [],
  communicationStyle: 'unknown',
  preferredTopics: [],
  messageCount: 0,
  vocabulary: [],
  averageSentenceLength: 0,
  emotionTone: 'neutral',
  lastSeen: Date.now(),
  reminderItems: [],
  learnedFacts: [],
  conversationPatterns: [],
};

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? { ...defaultProfile, ...JSON.parse(raw) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadMemories(): Memory[] {
  try {
    const raw = localStorage.getItem(MEMORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMemories(memories: Memory[]): void {
  localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function loadMemoryEnabled(): boolean {
  const val = localStorage.getItem(MEMORY_ENABLED_KEY);
  return val === null ? true : val === 'true';
}

export function saveMemoryEnabled(enabled: boolean): void {
  localStorage.setItem(MEMORY_ENABLED_KEY, String(enabled));
}

export function analyzeUserInput(text: string, profile: UserProfile): Partial<UserProfile> {
  const words = text.toLowerCase().split(/\s+/);
  const updates: Partial<UserProfile> = {};

  // Detect Lord Voyage
  if (
    text.toLowerCase().includes('lord voyage') ||
    text.toLowerCase().includes('i am lord voyage') ||
    text.toLowerCase().includes("i'm lord voyage") ||
    text.toLowerCase().includes('this is lord voyage')
  ) {
    updates.isLordVoyage = true;
    updates.name = 'Lord Voyage';
  }

  // Detect name
  const nameMatch = text.match(/(?:my name is|i am|i'm|call me)\s+([A-Z][a-z]+)/i);
  if (nameMatch && !profile.isLordVoyage) {
    updates.name = nameMatch[1];
  }

  // Detect communication style
  const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'regarding', 'pursuant'];
  const casualWords = ['lol', 'omg', 'tbh', 'ngl', 'bruh', 'bro', 'literally', 'like', 'yeah', 'gonna', 'wanna'];
  const technicalWords = ['algorithm', 'function', 'database', 'api', 'code', 'server', 'framework', 'deploy'];

  const formalScore = words.filter(w => formalWords.includes(w)).length;
  const casualScore = words.filter(w => casualWords.includes(w)).length;
  const techScore = words.filter(w => technicalWords.includes(w)).length;

  if (techScore > 0) updates.communicationStyle = 'technical';
  else if (formalScore > casualScore) updates.communicationStyle = 'formal';
  else if (casualScore > 0) updates.communicationStyle = 'casual';
  else if (profile.communicationStyle === 'unknown') updates.communicationStyle = 'friendly';

  // Detect interests/topics
  const topicKeywords: Record<string, string[]> = {
    technology: ['tech', 'ai', 'computer', 'software', 'coding', 'programming', 'app', 'digital'],
    business: ['business', 'startup', 'money', 'invest', 'profit', 'market', 'trade', 'finance'],
    health: ['health', 'fitness', 'gym', 'diet', 'workout', 'mental', 'wellness', 'exercise'],
    creative: ['art', 'music', 'design', 'write', 'creative', 'drawing', 'poetry', 'story'],
    science: ['science', 'research', 'physics', 'chemistry', 'biology', 'math', 'data'],
    relationships: ['love', 'family', 'friend', 'relationship', 'people', 'social', 'connect'],
    philosophy: ['life', 'meaning', 'truth', 'purpose', 'think', 'believe', 'mind', 'soul'],
    travel: ['travel', 'explore', 'journey', 'voyage', 'world', 'country', 'culture', 'adventure'],
  };

  const detectedTopics: string[] = [];
  Object.entries(topicKeywords).forEach(([topic, kws]) => {
    if (kws.some(kw => words.includes(kw))) {
      detectedTopics.push(topic);
    }
  });

  if (detectedTopics.length > 0) {
    updates.preferredTopics = [...new Set([...profile.preferredTopics, ...detectedTopics])].slice(0, 10);
  }

  // Track vocabulary
  const uniqueWords = [...new Set(words.filter(w => w.length > 4))];
  updates.vocabulary = [...new Set([...profile.vocabulary, ...uniqueWords])].slice(0, 200);

  // Emotion detection
  const positiveWords = ['happy', 'great', 'love', 'awesome', 'good', 'amazing', 'excellent', 'wonderful'];
  const negativeWords = ['sad', 'bad', 'hate', 'terrible', 'awful', 'worst', 'angry', 'frustrated', 'tired'];
  const posScore = words.filter(w => positiveWords.includes(w)).length;
  const negScore = words.filter(w => negativeWords.includes(w)).length;
  if (posScore > negScore) updates.emotionTone = 'positive';
  else if (negScore > posScore) updates.emotionTone = 'negative';
  else updates.emotionTone = 'neutral';

  // Sentence length
  const sentenceLength = words.length;
  updates.averageSentenceLength = Math.round(
    (profile.averageSentenceLength * profile.messageCount + sentenceLength) / (profile.messageCount + 1)
  );

  updates.messageCount = profile.messageCount + 1;
  updates.lastSeen = Date.now();

  return updates;
}

export function extractMemorableInfo(text: string): Memory[] {
  const memories: Memory[] = [];
  const now = Date.now();

  // Remind me patterns
  const remindMatch = text.match(/remind me (?:to|about)\s+(.+?)(?:\.|$)/i);
  if (remindMatch) {
    memories.push({
      key: `reminder_${now}`,
      value: `Reminder: ${remindMatch[1]}`,
      timestamp: now,
      importance: 'high',
    });
  }

  // Remember patterns
  const rememberMatch = text.match(/(?:remember that|note that|keep in mind)\s+(.+?)(?:\.|$)/i);
  if (rememberMatch) {
    memories.push({
      key: `note_${now}`,
      value: rememberMatch[1],
      timestamp: now,
      importance: 'medium',
    });
  }

  // I am / I work / I live patterns
  const factPatterns = [
    /i (?:work|am|live|study|own|run|love|hate|prefer|like)\s+(?:as |at |in |a |an )?(.{5,50}?)(?:\.|,|$)/gi,
  ];
  factPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      memories.push({
        key: `fact_${now}_${Math.random()}`,
        value: match[0].trim(),
        timestamp: now,
        importance: 'medium',
      });
    }
  });

  return memories;
}
