export interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  points: number;
  badges: string[];
  level: number;
}

export const levelNames = [
  "Level 1 - Safety Explorer",
  "Level 2 - Scam Spotter",
  "Level 3 - Community Guardian",
  "Level 4 - Fraud Hunter",
  "Level 5 - Digital Protector",
  "Level 6 - Second Thought Champion",
];

export const leaderboardSeed: LeaderboardUser[] = [
  { id: "u1", username: "MiaTran", avatar: "MT", points: 2380, badges: ["Top Contributor", "Expert Reviewer"], level: 5 },
  { id: "u2", username: "NgocHanh", avatar: "NH", points: 2150, badges: ["First Report", "100 Upvotes"], level: 5 },
  { id: "u3", username: "AnKhang", avatar: "AK", points: 1935, badges: ["Family Protector", "Expert Reviewer"], level: 4 },
  { id: "u4", username: "PhuocLee", avatar: "PL", points: 1810, badges: ["Top Contributor"], level: 4 },
  { id: "u5", username: "LanVy", avatar: "LV", points: 1760, badges: ["First Report"], level: 4 },
  { id: "u6", username: "MinhToan", avatar: "MT", points: 1640, badges: ["Expert Reviewer"], level: 3 },
  { id: "u7", username: "Treasure", avatar: "TR", points: 1510, badges: ["Family Protector"], level: 3 },
  { id: "u8", username: "BuiYen", avatar: "BY", points: 1380, badges: ["100 Upvotes"], level: 3 },
  { id: "u9", username: "NhatNam", avatar: "NN", points: 1245, badges: ["First Report"], level: 2 },
  { id: "u10", username: "AnhTuyet", avatar: "AT", points: 1160, badges: ["Expert Reviewer"], level: 2 },
];
