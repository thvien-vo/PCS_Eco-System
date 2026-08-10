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
// Module 3 — Feed Vouchers (attached to feed posts, saved via "Lưu mã")
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

// ---------------------------------------------------------------------------
// Module 6 — Green Marketplace Redemption Catalog
// DISTINCT from Module 3 Voucher and Module 4 SavedVoucherDetail.
// These are items in a spend-points redemption catalog, not feed-attached vouchers.
// ---------------------------------------------------------------------------
export type CatalogCategory = 'voucher' | 'gift' | 'cashback';

export interface MarketplaceCatalogItem {
  /** Unique catalog item ID */
  id: string;
  /** Category for filtering and badge display */
  category: CatalogCategory;
  /** Partner/brand name */
  partnerName: string;
  /** Short display title */
  title: string;
  /** Longer Vietnamese description (1–2 sentences) */
  description: string;
  /** Points required to redeem — REQUIRED field, unlike feed Voucher */
  pointsCost: number;
  /** picsum.photos URL */
  imageUrl: string;
  /** If true, show a flash-sale badge */
  isFlashSale: boolean;
  /** Absolute ISO expiry — only when isFlashSale is true */
  expiresAt?: string;
  /** Tag shown on the card (e.g. "Mã giảm giá", "Quà tặng", "Hoàn tiền") */
  tag: string;
}

export interface FeedPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  likes: number;
  comments: number;
  gifts: number;
  imageUrl: string;
  hashtags: string[];
  hyperLocalTag?: string;
  attachedVoucherId?: string;
  isLikedByCurrentUser: boolean;
  isSavedByCurrentUser: boolean;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Module 3 — Green Feed specific types
// ---------------------------------------------------------------------------
export interface GreenStory {
  id: string;
  authorName: string;
  authorAvatar: string;
  stationName: string;
  isViewed: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
}

export type MemberTier = 'Green Member' | 'Green Hero';

export interface MemberTierInfo {
  current: MemberTier;
  next: MemberTier | null;
  currentPoints: number;
  pointsForNext: number;
  color: string;
}

export interface FriendForGifting {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}

export interface SavedVoucherDetail {
  id: string;
  title: string;
  sponsorName: string;
  code: string;
  savedAt: string;
  imageUrl: string;
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
