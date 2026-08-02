// =============================================================================
// PCS Eco-System — Shared TypeScript Interfaces
// All types are in English (code convention); Vietnamese appears in UI text only.
// =============================================================================

// ---------------------------------------------------------------------------
// Module 2 — PCS Station Map
// ---------------------------------------------------------------------------
export interface Station {
  id: string;
  name: string;
  /** [longitude, latitude] — Mapbox convention */
  coordinates: [number, number];
  /**
   * 3-level operational status.
   * green  = fully operational, rewards available
   * yellow = operational but low rewards / minor issue
   * red    = offline or out of rewards
   */
  status: 'green' | 'yellow' | 'red';
  /** Distance from the simulated "current user" location in km */
  distanceKm: number;
  /** Number of reward slots currently available */
  rewardsRemaining: number;
  /** Human-readable Vietnamese address string */
  address: string;
}

// ---------------------------------------------------------------------------
// Module 3 & 6 — Vouchers / Marketplace
// ---------------------------------------------------------------------------
export interface Voucher {
  id: string;
  sponsorName: string;
  title: string;
  pointsCost: number;
  imageUrl: string;
  isFlashSale: boolean;
  /** ISO 8601 datetime string — present only when isFlashSale is true */
  expiresAt?: string;
}

export interface FeedPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  imageUrl: string;
  hashtags: string[];
  hyperLocalTag?: string;
  attachedVoucherId?: string;
  isLikedByCurrentUser: boolean;
  isSavedByCurrentUser: boolean;
}

// ---------------------------------------------------------------------------
// Module 4 — Green Wallet & Carbon Report
// ---------------------------------------------------------------------------
export interface Transaction {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  date: string;
  description: string;
}

export interface CarbonReport {
  co2ReducedKg: number;
  treesPlanted: number;
  weeklyTrend: { day: string; points: number }[];
}

// ---------------------------------------------------------------------------
// Module 5 — Swipe Challenge & Gamification
// ---------------------------------------------------------------------------
export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  isCurrentUser?: boolean;
}

export interface ChallengeCard {
  id: string;
  name: string;
  imageUrl: string;
  deadline: string;
  rewardPoints: number;
}

// ---------------------------------------------------------------------------
// Module 7 — Kiosk Simulation
// ---------------------------------------------------------------------------
export interface ScanResult {
  status: 'PASS' | 'REJECT';
  confidenceScore: number;
  materialDetected?: 'PET' | 'PE' | 'PP' | 'PS' | 'PVC' | 'OOD';
  rejectReason?: 'Low Confidence' | 'OOD Material' | 'Dirty/Wet' | 'Mixed/Composite' | 'Too Small';
  pointsAwarded: number;
}

// ---------------------------------------------------------------------------
// Module 1 — Team Profile
// ---------------------------------------------------------------------------
export type TeamRole = 'advisor' | 'member';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  title: string;
  bio: string;
  avatarUrl: string;
  isUiDesigner?: boolean;
}
