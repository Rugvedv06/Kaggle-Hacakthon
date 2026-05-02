import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// ── Types ──────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  inputType: 'text' | 'voice' | 'image';
  timestamp: number;
}

export interface Session {
  id: string;
  subject: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
  lang: string;
}

export interface TopicStat {
  subject: string;
  topic: string;
  correctCount: number;
  wrongCount: number;
  avgTimeMs: number;
  lastSeen: number;
}

export interface StudentProfile {
  id: 'profile';           // singleton key
  name: string;
  lang: string;
  classNum: number;
  streakDays: number;
  lastActiveDate: string;  // YYYY-MM-DD
  totalQuestions: number;
  topicStats: TopicStat[];
  badges: string[];
}

export interface OfflineQueueItem {
  id: string;
  type: 'sync_profile' | 'sync_session';
  payload: unknown;
  createdAt: number;
  retryCount: number;
}

// ── DB Schema ──────────────────────────────────────────────────────────
interface GemmaGuruDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: { 'by-subject': string };
  };
  messages: {
    key: string;
    value: Message;
    indexes: { 'by-session': string; 'by-timestamp': number };
  };
  studentProfile: {
    key: 'profile';
    value: StudentProfile;
  };
  offlineQueue: {
    key: string;
    value: OfflineQueueItem;
    indexes: { 'by-created': number };
  };
}

// ── DB Init ────────────────────────────────────────────────────────────
let dbPromise: Promise<IDBPDatabase<GemmaGuruDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GemmaGuruDB>('gemmaguru', 1, {
      upgrade(db) {
        // sessions
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by-subject', 'subject');

        // messages
        const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
        msgStore.createIndex('by-session', 'sessionId');
        msgStore.createIndex('by-timestamp', 'timestamp');

        // profile (singleton)
        db.createObjectStore('studentProfile', { keyPath: 'id' });

        // offline queue
        const qStore = db.createObjectStore('offlineQueue', { keyPath: 'id' });
        qStore.createIndex('by-created', 'createdAt');
      },
    });
  }
  return dbPromise;
}

// ── Message helpers ────────────────────────────────────────────────────
export async function saveMessage(msg: Omit<Message, 'id'>): Promise<Message> {
  const db = await getDB();
  const full: Message = { ...msg, id: crypto.randomUUID() };
  await db.put('messages', full);
  return full;
}

export async function getHistory(sessionId: string): Promise<Message[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('messages', 'by-session', sessionId);
  return all.sort((a, b) => a.timestamp - b.timestamp);
}

export async function deleteMessage(id: string) {
  const db = await getDB();
  await db.delete('messages', id);
}

// ── Session helpers ────────────────────────────────────────────────────
export async function createSession(subject: string, lang: string): Promise<Session> {
  const db = await getDB();
  const session: Session = {
    id: crypto.randomUUID(),
    subject,
    startedAt: Date.now(),
    messageCount: 0,
    lang,
  };
  await db.put('sessions', session);
  return session;
}

export async function endSession(id: string) {
  const db = await getDB();
  const session = await db.get('sessions', id);
  if (session) {
    session.endedAt = Date.now();
    await db.put('sessions', session);
  }
}

export async function getSessions(): Promise<Session[]> {
  const db = await getDB();
  return db.getAll('sessions');
}

// ── Profile helpers ────────────────────────────────────────────────────
const DEFAULT_PROFILE: StudentProfile = {
  id: 'profile',
  name: 'Student',
  lang: 'mr',
  classNum: 8,
  streakDays: 0,
  lastActiveDate: '',
  totalQuestions: 0,
  topicStats: [],
  badges: [],
};

export async function getProfile(): Promise<StudentProfile> {
  const db = await getDB();
  return (await db.get('studentProfile', 'profile')) ?? DEFAULT_PROFILE;
}

export async function updateProfile(updates: Partial<StudentProfile>) {
  const db = await getDB();
  const current = await getProfile();
  const updated = { ...current, ...updates, id: 'profile' as const };
  await db.put('studentProfile', updated);
  return updated;
}

export async function updateTopicStat(subject: string, topic: string, correct: boolean, timeMs: number) {
  const db = await getDB();
  const profile = await getProfile();
  const idx = profile.topicStats.findIndex(t => t.subject === subject && t.topic === topic);

  const stat: TopicStat = idx >= 0
    ? profile.topicStats[idx]
    : { subject, topic, correctCount: 0, wrongCount: 0, avgTimeMs: 0, lastSeen: 0 };

  if (correct) stat.correctCount++; else stat.wrongCount++;
  const totalAnswers = stat.correctCount + stat.wrongCount;
  stat.avgTimeMs = Math.round((stat.avgTimeMs * (totalAnswers - 1) + timeMs) / totalAnswers);
  stat.lastSeen = Date.now();

  if (idx >= 0) profile.topicStats[idx] = stat;
  else profile.topicStats.push(stat);

  profile.totalQuestions++;
  await db.put('studentProfile', { ...profile, id: 'profile' });
}

export function getProficiencyScore(stat: TopicStat): number {
  const total = stat.correctCount + stat.wrongCount;
  if (total === 0) return 0;
  return Math.round((stat.correctCount / total) * 100);
}

// ── Streak helper ──────────────────────────────────────────────────────
export async function updateStreak() {
  const profile = await getProfile();
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastActiveDate === today) return profile.streakDays;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = profile.lastActiveDate === yesterday
    ? profile.streakDays + 1
    : 1;

  await updateProfile({ streakDays: newStreak, lastActiveDate: today });
  return newStreak;
}

// ── Offline queue helpers ──────────────────────────────────────────────
export async function enqueueOffline(type: OfflineQueueItem['type'], payload: unknown) {
  const db = await getDB();
  const item: OfflineQueueItem = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
  };
  await db.put('offlineQueue', item);
}

export async function flushOfflineQueue(
  handler: (item: OfflineQueueItem) => Promise<void>
) {
  const db = await getDB();
  const items = await db.getAllFromIndex('offlineQueue', 'by-created');
  for (const item of items) {
    try {
      await handler(item);
      await db.delete('offlineQueue', item.id);
    } catch {
      item.retryCount++;
      await db.put('offlineQueue', item);
    }
  }
}
