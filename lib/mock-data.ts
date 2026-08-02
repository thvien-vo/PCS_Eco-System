import type { Station, Voucher, FeedPost, LeaderboardEntry, ChallengeCard } from '@/types';

// ---------------------------------------------------------------------------
// Module 2 — PCS Station Map
// ---------------------------------------------------------------------------
export const MOCK_STATIONS: Station[] = [
  {
    id: 'st-01',
    name: 'Trạm PCS Quận 1 – Bến Nghé',
    coordinates: [106.7009, 10.7769],
    status: 'green',
    distanceKm: 0.25,
    rewardsRemaining: 18,
    address: '15 Lê Thánh Tôn, Quận 1, TP.HCM',
  },
  {
    id: 'st-02',
    name: 'Trạm PCS Phú Nhuận – Phan Xích Long',
    coordinates: [106.68, 10.8],
    status: 'yellow',
    distanceKm: 2.1,
    rewardsRemaining: 4,
    address: '72 Phan Xích Long, Phú Nhuận, TP.HCM',
  },
  {
    id: 'st-03',
    name: 'Trạm PCS Quận 7 – Phú Mỹ Hưng',
    coordinates: [106.72, 10.7296],
    status: 'red',
    distanceKm: 5.4,
    rewardsRemaining: 0,
    address: '8 Nguyễn Đức Cảnh, Quận 7, TP.HCM',
  },
  {
    id: 'st-04',
    name: 'Trạm PCS Bình Thạnh – Ung Văn Khiêm',
    coordinates: [106.7116, 10.8122],
    status: 'green',
    distanceKm: 1.6,
    rewardsRemaining: 25,
    address: '9 Ung Văn Khiêm, Bình Thạnh, TP.HCM',
  },
  {
    id: 'st-05',
    name: 'Trạm PCS Tân Bình – Cộng Hòa',
    coordinates: [106.6574, 10.8016],
    status: 'yellow',
    distanceKm: 3.8,
    rewardsRemaining: 7,
    address: '155 Cộng Hòa, Tân Bình, TP.HCM',
  },
  {
    id: 'st-06',
    name: 'Trạm PCS Gò Vấp – Quang Trung',
    coordinates: [106.6789, 10.8366],
    status: 'green',
    distanceKm: 4.2,
    rewardsRemaining: 12,
    address: '42 Quang Trung, Gò Vấp, TP.HCM',
  },
  {
    id: 'st-07',
    name: 'Trạm PCS Quận 3 – Võ Văn Tần',
    coordinates: [106.6875, 10.7764],
    status: 'red',
    distanceKm: 1.1,
    rewardsRemaining: 0,
    address: '30 Võ Văn Tần, Quận 3, TP.HCM',
  },
];

// ---------------------------------------------------------------------------
// Module 3 & 6 — Vouchers
// ---------------------------------------------------------------------------
export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    sponsorName: 'The Coffee House',
    title: 'Giảm 20% Thức Uống',
    pointsCost: 150,
    imageUrl: 'https://picsum.photos/seed/tch/400/200',
    isFlashSale: false,
  },
  {
    id: 'v2',
    sponsorName: 'Highlands Coffee',
    title: 'Mua 1 Tặng 1',
    pointsCost: 200,
    imageUrl: 'https://picsum.photos/seed/highlands/400/200',
    isFlashSale: true,
    expiresAt: '2026-08-05T00:00:00Z',
  },
  {
    id: 'v3',
    sponsorName: 'Cửa hàng Xanh',
    title: 'Túi Tote Sinh Thái',
    pointsCost: 500,
    imageUrl: 'https://picsum.photos/seed/tote/400/200',
    isFlashSale: false,
  },
  {
    id: 'v4',
    sponsorName: 'Circle K',
    title: 'Giảm 10k Đơn hàng',
    pointsCost: 80,
    imageUrl: 'https://picsum.photos/seed/circlek/400/200',
    isFlashSale: false,
  },
  {
    id: 'v5',
    sponsorName: 'Bách Hóa Xanh',
    title: 'Giảm 15% Thực phẩm',
    pointsCost: 300,
    imageUrl: 'https://picsum.photos/seed/bhx/400/200',
    isFlashSale: true,
    expiresAt: '2026-08-06T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Module 3 — Feed Posts
// ---------------------------------------------------------------------------
export const MOCK_POSTS: FeedPost[] = [
  {
    id: 'p1',
    author: 'Nguyễn Văn An',
    content:
      'Vừa tái chế 5 chai nhựa PET thành công tại trạm Quận 1! Cảm giác thật tuyệt vời khi đóng góp cho môi trường. 🌿',
    likes: 12,
    comments: 2,
    imageUrl: 'https://picsum.photos/seed/post1/400/300',
    hashtags: ['#TáiChế', '#SốngXanh'],
    hyperLocalTag: 'Quận 1, TP.HCM',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p2',
    author: 'Trần Thị Bình',
    content:
      'Wow, mình vừa đổi được voucher The Coffee House từ điểm thưởng. Mọi người mau thu gom nhựa nhé! ☕',
    likes: 25,
    comments: 5,
    imageUrl: 'https://picsum.photos/seed/post2/400/300',
    hashtags: ['#Voucher', '#PhầnThưởng'],
    attachedVoucherId: 'v1',
    isLikedByCurrentUser: true,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p3',
    author: 'Lê Minh Châu',
    content:
      'Mỗi tuần tui tích lũy được khoảng 200 điểm xanh từ việc tái chế. Thử thách tuần này: 10 chai nhựa! 💪',
    likes: 18,
    comments: 3,
    imageUrl: 'https://picsum.photos/seed/post3/400/300',
    hashtags: ['#ĐiểmXanh', '#ThửThách'],
    hyperLocalTag: 'Bình Thạnh, TP.HCM',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
];

// ---------------------------------------------------------------------------
// Module 5 — Challenge Leaderboard & Cards
// ---------------------------------------------------------------------------
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'Lan Hương', points: 4500 },
  { rank: 2, username: 'Minh Tuấn', points: 4200 },
  { rank: 3, username: 'Bạn', points: 3100, isCurrentUser: true },
  { rank: 4, username: 'Đức Anh', points: 2800 },
  { rank: 5, username: 'Thu Hà', points: 2400 },
];

export const MOCK_CHALLENGES: ChallengeCard[] = [
  {
    id: 'c1',
    name: 'Chiến Binh Rác Thải',
    imageUrl: 'https://picsum.photos/seed/challenge1/300/400',
    deadline: '3 ngày',
    rewardPoints: 500,
  },
  {
    id: 'c2',
    name: 'Đổi Sắc Xanh',
    imageUrl: 'https://picsum.photos/seed/challenge2/300/400',
    deadline: '5 ngày',
    rewardPoints: 800,
  },
  {
    id: 'c3',
    name: 'Nhà Vô Địch Tái Chế',
    imageUrl: 'https://picsum.photos/seed/challenge3/300/400',
    deadline: '7 ngày',
    rewardPoints: 1200,
  },
];
