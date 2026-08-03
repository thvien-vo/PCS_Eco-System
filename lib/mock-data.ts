import type {
  Station,
  Voucher,
  FeedPost,
  LeaderboardEntry,
  ChallengeCard,
  GreenStory,
  MemberTierInfo,
  FriendForGifting,
} from '@/types';

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
// Flash sale `expiresAt` is set ~48 hours from a reference point so the
// countdown is always meaningful in demo mode.
// ---------------------------------------------------------------------------

/** Returns ISO string N hours from now, anchored to call time. */
function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString();
}

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    sponsorName: 'Đối Tác Cà Phê A',
    title: 'Giảm 20% Thức Uống',
    pointsCost: 150,
    imageUrl: 'https://picsum.photos/seed/voucher-coffee/400/200',
    isFlashSale: false,
  },
  {
    id: 'v2',
    sponsorName: 'Đối Tác Đồ Uống B',
    title: 'Mua 1 Tặng 1 (Flash Sale)',
    pointsCost: 200,
    imageUrl: 'https://picsum.photos/seed/voucher-drink/400/200',
    isFlashSale: true,
    expiresAt: hoursFromNow(3.5), // Flash sale ends in 3h30m from page load
  },
  {
    id: 'v3',
    sponsorName: 'Cửa hàng Xanh',
    title: 'Túi Tote Sinh Thái',
    pointsCost: 500,
    imageUrl: 'https://picsum.photos/seed/voucher-tote/400/200',
    isFlashSale: false,
  },
  {
    id: 'v4',
    sponsorName: 'Đối Tác Chuỗi Tiện Lợi C',
    title: 'Giảm 10.000đ Đơn hàng',
    pointsCost: 80,
    imageUrl: 'https://picsum.photos/seed/voucher-store/400/200',
    isFlashSale: false,
  },
  {
    id: 'v5',
    sponsorName: 'Siêu thị Sinh Thái D',
    title: 'Giảm 15% Thực phẩm Hữu cơ',
    pointsCost: 300,
    imageUrl: 'https://picsum.photos/seed/voucher-organic/400/200',
    isFlashSale: true,
    expiresAt: hoursFromNow(1.25), // Flash sale ends in 1h15m from page load
  },
  {
    id: 'v6',
    sponsorName: 'Thương Hiệu Xanh E',
    title: 'Ưu đãi Tái chế 30%',
    pointsCost: 400,
    imageUrl: 'https://picsum.photos/seed/voucher-green/400/200',
    isFlashSale: false,
  },
];

// ---------------------------------------------------------------------------
// Module 3 — Flash Sale anchor (independent of MOCK_VOUCHERS so the bar
// always shows a live countdown even if vouchers change).
// Stored as a fixed epoch ms so it doesn't drift across re-renders.
// ---------------------------------------------------------------------------
export const FLASH_SALE_ENDS_AT: number = Date.now() + 3.5 * 3_600_000;

// ---------------------------------------------------------------------------
// Module 3 — Green Stories (6 mock stories)
// ---------------------------------------------------------------------------
export const MOCK_STORIES: GreenStory[] = [
  {
    id: 'story-1',
    authorName: 'Minh Anh',
    authorAvatar: 'https://picsum.photos/seed/avatar-1/80/80',
    stationName: 'Trạm Quận 1',
    isViewed: false,
  },
  {
    id: 'story-2',
    authorName: 'Thu Hà',
    authorAvatar: 'https://picsum.photos/seed/avatar-2/80/80',
    stationName: 'Trạm Bình Thạnh',
    isViewed: false,
  },
  {
    id: 'story-3',
    authorName: 'Đức Anh',
    authorAvatar: 'https://picsum.photos/seed/avatar-3/80/80',
    stationName: 'Trạm Phú Nhuận',
    isViewed: false,
  },
  {
    id: 'story-4',
    authorName: 'Lan Hương',
    authorAvatar: 'https://picsum.photos/seed/avatar-4/80/80',
    stationName: 'Trạm Tân Bình',
    isViewed: true,
  },
  {
    id: 'story-5',
    authorName: 'Quốc Bảo',
    authorAvatar: 'https://picsum.photos/seed/avatar-5/80/80',
    stationName: 'Trạm Gò Vấp',
    isViewed: false,
  },
  {
    id: 'story-6',
    authorName: 'Ngọc Mai',
    authorAvatar: 'https://picsum.photos/seed/avatar-6/80/80',
    stationName: 'Trạm Quận 7',
    isViewed: true,
  },
];

// ---------------------------------------------------------------------------
// Module 3 — Member tier info
// ---------------------------------------------------------------------------
export const MEMBER_TIER_INFO: MemberTierInfo = {
  current: 'Green Member',
  next: 'Green Star',
  currentPoints: 500,
  pointsForNext: 1000,
  color: '#10B981',
};

// ---------------------------------------------------------------------------
// Module 3 — Friends for gifting
// ---------------------------------------------------------------------------
export const MOCK_FRIENDS: FriendForGifting[] = [
  {
    id: 'friend-1',
    name: 'Minh Tuấn',
    avatarUrl: 'https://picsum.photos/seed/friend-1/60/60',
    isOnline: true,
  },
  {
    id: 'friend-2',
    name: 'Thu Hà',
    avatarUrl: 'https://picsum.photos/seed/friend-2/60/60',
    isOnline: true,
  },
  {
    id: 'friend-3',
    name: 'Đức Anh',
    avatarUrl: 'https://picsum.photos/seed/friend-3/60/60',
    isOnline: false,
  },
  {
    id: 'friend-4',
    name: 'Lan Hương',
    avatarUrl: 'https://picsum.photos/seed/friend-4/60/60',
    isOnline: true,
  },
  {
    id: 'friend-5',
    name: 'Ngọc Mai',
    avatarUrl: 'https://picsum.photos/seed/friend-5/60/60',
    isOnline: false,
  },
  {
    id: 'friend-6',
    name: 'Quốc Bảo',
    avatarUrl: 'https://picsum.photos/seed/friend-6/60/60',
    isOnline: true,
  },
];

// ---------------------------------------------------------------------------
// Module 3 — Feed Posts (8 posts)
// ---------------------------------------------------------------------------
export const MOCK_POSTS: FeedPost[] = [
  {
    id: 'p1',
    author: 'Nguyễn Văn An',
    authorAvatar: 'https://picsum.photos/seed/user-an/60/60',
    content:
      'Vừa tái chế 5 chai nhựa PET thành công tại trạm Quận 1! Cảm giác thật tuyệt vời khi đóng góp cho môi trường xanh sạch. Mỗi chai nhựa là một bước tiến nhỏ, cộng lại sẽ thành cuộc cách mạng xanh! 🌿♻️',
    likes: 24,
    comments: 5,
    gifts: 2,
    imageUrl: 'https://picsum.photos/seed/feed-pet-recycle/400/300',
    hashtags: ['#TáiChế', '#SốngXanh', '#PCS'],
    hyperLocalTag: 'Katinat – 200m',
    timestamp: '5 phút trước',
    attachedVoucherId: 'v1',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p2',
    author: 'Trần Thị Bình',
    authorAvatar: 'https://picsum.photos/seed/user-binh/60/60',
    content:
      'Wow, mình vừa đổi được voucher giảm giá đồ uống từ điểm thưởng sau 2 tuần tích lũy. Mọi người mau thu gom nhựa nhé! Cách đổi thưởng siêu đơn giản, chỉ cần quét mã QR tại trạm PCS gần nhất ☕✨',
    likes: 47,
    comments: 12,
    gifts: 6,
    imageUrl: 'https://picsum.photos/seed/feed-voucher-redeem/400/300',
    hashtags: ['#Voucher', '#PhầnThưởng', '#XanhHơnMỗiNgày'],
    hyperLocalTag: 'Highlands – 350m',
    attachedVoucherId: 'v2',
    timestamp: '12 phút trước',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p3',
    author: 'Lê Minh Châu',
    authorAvatar: 'https://picsum.photos/seed/user-chau/60/60',
    content:
      'Mỗi tuần tui tích lũy được khoảng 200 điểm xanh từ việc tái chế nhựa. Thử thách tuần này: 10 chai nhựa mỗi ngày! Ai cùng thử không? 💪🏆',
    likes: 35,
    comments: 8,
    gifts: 1,
    imageUrl: 'https://picsum.photos/seed/feed-challenge/400/300',
    hashtags: ['#ĐiểmXanh', '#ThửThách', '#GreenHero'],
    hyperLocalTag: 'The Coffee House – 150m',
    timestamp: '28 phút trước',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p4',
    author: 'Phạm Quốc Bảo',
    authorAvatar: 'https://picsum.photos/seed/user-bao/60/60',
    content:
      'Trạm PCS Bình Thạnh vừa ra mắt tính năng nhận diện nhựa siêu nhanh! Chỉ 3 giây là biết ngay chai của bạn có phải PET không. Công nghệ FTIR thật sự ấn tượng 🔬🌱',
    likes: 89,
    comments: 23,
    gifts: 11,
    imageUrl: 'https://picsum.photos/seed/feed-kiosk-scan/400/300',
    hashtags: ['#CôngNghệXanh', '#FTIR', '#TươngLaiTáiChế'],
    hyperLocalTag: 'Trạm PCS Bình Thạnh – 80m',
    timestamp: '1 giờ trước',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p5',
    author: 'Nguyễn Thị Lan',
    authorAvatar: 'https://picsum.photos/seed/user-lan/60/60',
    content:
      'Hôm nay cả gia đình mình cùng đến trạm PCS tái chế! Con bé nhà mình 7 tuổi mà đã biết phân loại nhựa rồi. Giáo dục xanh từ nhỏ là điều tuyệt vời nhất ba mẹ có thể làm 👨‍👩‍👧💚',
    likes: 156,
    comments: 34,
    gifts: 18,
    imageUrl: 'https://picsum.photos/seed/feed-family-recycle/400/300',
    hashtags: ['#GiaDìnhXanh', '#TươngLaiXanh', '#GiáoDụcMôiTrường'],
    hyperLocalTag: 'Cộng Cà Phê – 400m',
    timestamp: '2 giờ trước',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p6',
    author: 'Trần Đức Anh',
    authorAvatar: 'https://picsum.photos/seed/user-duc-anh/60/60',
    content:
      'Flash Sale hôm nay quá hời! Mình vừa lưu được voucher giảm 15% thực phẩm hữu cơ chỉ với 300 điểm thôi. Deal này chỉ có hôm nay thôi nhé mọi người! ⚡🛒',
    likes: 203,
    comments: 56,
    gifts: 24,
    imageUrl: 'https://picsum.photos/seed/feed-flash-sale/400/300',
    hashtags: ['#FlashSale', '#ThựcPhẩmXanh', '#ĐiểmThưởng'],
    hyperLocalTag: 'GS25 – 120m',
    attachedVoucherId: 'v5',
    timestamp: '3 giờ trước',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p7',
    author: 'Võ Ngọc Mai',
    authorAvatar: 'https://picsum.photos/seed/user-mai/60/60',
    content:
      'Tháng này mình đã giảm được 2.4 kg CO₂ nhờ tái chế nhựa qua PCS! Nhìn vào báo cáo carbon trong ví xanh thấy tự hào lắm. Cùng nhau làm cho Sài Gòn xanh hơn nha mọi người 🌍💨',
    likes: 78,
    comments: 19,
    gifts: 7,
    imageUrl: 'https://picsum.photos/seed/feed-carbon-report/400/300',
    hashtags: ['#CO2', '#BáoCáoXanh', '#SàiGònXanh'],
    hyperLocalTag: 'Phúc Long – 250m',
    timestamp: '5 giờ trước',
    isLikedByCurrentUser: false,
    isSavedByCurrentUser: false,
  },
  {
    id: 'p8',
    author: 'Hoàng Minh Tuấn',
    authorAvatar: 'https://picsum.photos/seed/user-tuan/60/60',
    content:
      'Dùng túi tote sinh thái đã được 3 tháng, giảm được khoảng 90 túi nilon rồi! Đổi từ điểm Green Hero, cảm thấy rất xứng đáng. Ai muốn tham gia cộng đồng xanh thì ping mình nhé 🌿👜',
    likes: 112,
    comments: 41,
    gifts: 15,
    imageUrl: 'https://picsum.photos/seed/feed-eco-bag/400/300',
    hashtags: ['#TúiTote', '#KhôngTúiNilon', '#GreenHero'],
    hyperLocalTag: 'Nhà sách Fahasa – 300m',
    attachedVoucherId: 'v3',
    timestamp: '8 giờ trước',
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
