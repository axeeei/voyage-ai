export interface AttachmentMeta {
  name: string;
  type: 'image' | 'file';
  previewUrl?: string;
  mimeType?: string;
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  attachments?: AttachmentMeta[];
  generatedImage?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Memory {
  key: string;
  value: string;
  timestamp: number;
  importance: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  name: string | null;
  isLordVoyage: boolean;
  interests: string[];
  communicationStyle: 'unknown' | 'casual' | 'formal' | 'technical' | 'friendly';
  preferredTopics: string[];
  messageCount: number;
  vocabulary: string[];
  averageSentenceLength: number;
  emotionTone: 'neutral' | 'positive' | 'negative';
  lastSeen: number;
  reminderItems: string[];
  learnedFacts: string[];
  conversationPatterns: string[];
}
