export interface CommunityReport {
  id: string;
  title: string;
  category: string;
  description: string;
  platform: string;
  dangerLevel: string;
  convincingScore: number;
  evidence: string[];
  createdAt: string;
}

export const COMMUNITY_STORAGE_KEYS = {
  savedScams: "community_saved_scams",
  collections: "community_collections",
  comments: "community_comments",
  helpfulVotes: "community_helpful_votes",
  points: "community_points",
  reports: "community_reports",
};

export function readStorageJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCurrentPoints(): number {
  if (typeof window === "undefined") return 0;
  const value = Number(window.localStorage.getItem(COMMUNITY_STORAGE_KEYS.points) ?? "0");
  return Number.isFinite(value) ? value : 0;
}

export function setCurrentPoints(value: number) {
  writeStorageJSON(COMMUNITY_STORAGE_KEYS.points, value);
}

export function getSavedScamIds(): string[] {
  return readStorageJSON<string[]>(COMMUNITY_STORAGE_KEYS.savedScams, []);
}

export function setSavedScamIds(value: string[]) {
  writeStorageJSON(COMMUNITY_STORAGE_KEYS.savedScams, value);
}

export function getHelpfulVotes(): Record<string, boolean> {
  return readStorageJSON<Record<string, boolean>>(COMMUNITY_STORAGE_KEYS.helpfulVotes, {});
}

export function setHelpfulVotes(value: Record<string, boolean>) {
  writeStorageJSON(COMMUNITY_STORAGE_KEYS.helpfulVotes, value);
}

export function getCommunityComments(): Record<string, { user: string; text: string; date: string }[]> {
  return readStorageJSON<Record<string, { user: string; text: string; date: string }[]>>(
    COMMUNITY_STORAGE_KEYS.comments,
    {},
  );
}

export function setCommunityComments(value: Record<string, { user: string; text: string; date: string }[]>) {
  writeStorageJSON(COMMUNITY_STORAGE_KEYS.comments, value);
}

export function getCollections(): Array<{ id: string; name: string; scamIds: string[]; updatedAt: string }> {
  return readStorageJSON<Array<{ id: string; name: string; scamIds: string[]; updatedAt: string }>>(
    COMMUNITY_STORAGE_KEYS.collections,
    [
      { id: "family", name: "Family Scams", scamIds: [], updatedAt: new Date().toISOString() },
      { id: "banking", name: "Banking Scams", scamIds: [], updatedAt: new Date().toISOString() },
      { id: "investment", name: "Investment Scams", scamIds: [], updatedAt: new Date().toISOString() },
      { id: "recent", name: "Recent Threats", scamIds: [], updatedAt: new Date().toISOString() },
    ],
  );
}

export function setCollections(value: Array<{ id: string; name: string; scamIds: string[]; updatedAt: string }>) {
  writeStorageJSON(COMMUNITY_STORAGE_KEYS.collections, value);
}

export function getCommunityReports(): CommunityReport[] {
  return readStorageJSON<CommunityReport[]>(COMMUNITY_STORAGE_KEYS.reports, []);
}

export function setCommunityReports(value: CommunityReport[]) {
  writeStorageJSON(COMMUNITY_STORAGE_KEYS.reports, value);
}
