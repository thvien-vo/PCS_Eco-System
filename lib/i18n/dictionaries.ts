export type TranslationDictionary = {
  common: {
    navigation: {
      map: string;
      feed: string;
      /** Full display label (page headers, cards). Avoid using in BottomNav — use walletShort instead. */
      wallet: string;
      /** Shortened nav-context label for the BottomNav tab where space is tight. */
      walletShort: string;
      challenge: string;
      marketplace: string;
      home: string;
      backHome: string;
      settings: string;
    };
    imageAlt: {
      avatarOf: string; // "{{name}}"
    };
    aria: {
      linkedInOf: string; // "{{name}}"
    };
  };
  landing: {
    hero: {
      badge: string;
      titlePre: string;
      titleHighlight: string;
      desc: string;
      findStationBtn: string;
      teamBtn: string;
    };
    stats: {
      title: string;
      subtitle: string;
      labels: {
        plastic: string;
        stations: string;
        users: string;
      };
    };
    features: {
      title: string;
      subtitle: string;
      items: {
        map: { title: string; desc: string; };
        wallet: { title: string; desc: string; };
        challenge: { title: string; desc: string; };
        carbon: { title: string; desc: string; };
      };
    };
    cta: {
      title: string;
      desc: string;
      btn: string;
    };
    footer: {
      copyright: string;
      b2b: string;
    };
  };
  team: {
    header: {
      title: string;
    };
    hero: {
      title: string;
      desc: string;
    };
    roles: {
      advisor: string;
      uiLead: string;
    };
    sections: {
      advisor: string;
      members: string;
    };
    bios: {
      advisor01: { title: string; bio: string; };
      member01: { title: string; bio: string; };
      member02: { title: string; bio: string; };
      member03: { title: string; bio: string; };
      member04: { title: string; bio: string; };
    };
  };
  settings: {
    title: string;
    subtitle: string;
    sections: {
      account: string;
      app: string;
      support: string;
    };
    rows: {
      personalInfo: string;
      language: string;
      contactAdmin: string;
    };
    personalInfo: {
      title: string;
      nameLabel: string;
      namePlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      saveButton: string;
      savedToast: string;
      validation: {
        required: string;
        invalidPhone: string;
        invalidEmail: string;
      };
    };
    language: {
      title: string;
      note: string;
    };
    contact: {
      title: string;
      subjectLabel: string;
      subjectPlaceholder: string;
      replyEmailLabel: string;
      replyEmailPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      submitButton: string;
      validation: {
        required: string;
        invalidEmail: string;
      };
      successToast: {
        title: string;
        description: string;
      };
    };
  };
  b2b: {
    nav: {
      backHome: string;
      title: string;
      /** Short badge shown beside the header title */
      sampleDataBadge: string;
    };
    valueStatement: {
      eyebrow: string;
      headlinePart1: string;
      headlinePart2: string;
      headlinePart3pre: string;
      headlinePart3highlight: string;
      body: string;
      pipeline: {
        ftir: string;
        ml: string;
        feedstock: string;
      };
    };
    kpi: {
      totalScans: { label: string; unit: string; };
      passRate: { label: string; unit: string; };
      totalPlastic: { label: string; unit: string; };
      activeStations: { label: string; unit: string; };
    };
    charts: {
      weeklyPlastic: {
        title: string;
        badge: string;
        tooltipSeries: string;
        /** prefix before the week number: e.g. "Tuần" in VI, "Week" in EN */
        tooltipWeekPrefix: string;
      };
      passReject: {
        title: string;
        legendPass: string;
        legendReject: string;
        tooltipPass: string;
        tooltipReject: string;
      };
    };
    heatmap: {
      title: string;
      badge: string;
      /** suffix after scan count number: e.g. "lượt quét" / "scans" */
      scanSuffix: string;
      footnote: string;
    };
    footer: string;
  };
  map: {
    page: {
      title: string;
      /** "{N} stations in Ho Chi Minh City" — N is interpolated in code */
      stationCountSubtitle: string;
      filterAriaLabel: string;
      searchPlaceholder: string;
      overlayCount: string;
      noResultsTitle: string;
      noResultsHint: string;
    };
    filters: {
      all: string;
      active: string;
      almostFull: string;
      suspended: string;
    };
    legend: {
      active: string;
      almostFull: string;
      suspended: string;
    };
    popup: {
      status: {
        active: string;
        almostFull: string;
        suspended: string;
      };
      /** "{distance} from you" — distance string is prepended in code */
      distanceSuffix: string;
      rewardsRemaining: string;
      noRewards: string;
      directionsCta: string;
    };
    fallback: {
      title: string;
      body: string;
      stationListHeading: string;
    };
  };
};

export const dictionaries: Record<'vi' | 'en', TranslationDictionary> = {
  vi: {
    common: {
      navigation: {
        map: 'Bản đồ',
        feed: 'Cộng đồng',
        wallet: 'Ví Xanh',
        walletShort: 'Ví Xanh',
        challenge: 'Thử thách',
        marketplace: 'Đổi quà',
        home: 'Trang chủ',
        backHome: 'Quay lại trang chủ',
        settings: 'Cài đặt',
      },
      imageAlt: {
        avatarOf: 'Ảnh đại diện của {{name}}',
      },
      aria: {
        linkedInOf: 'LinkedIn của {{name}}',
      },
    },
    landing: {
      hero: {
        badge: 'Dow Circular Economy Innovation Challenge 2026',
        titlePre: 'Hệ sinh thái số cho ',
        titleHighlight: 'kinh tế tuần hoàn nhựa',
        desc: 'PCS kết nối người dùng với trạm thu gom nhựa thông minh, thưởng điểm xanh và cung cấp dữ liệu giá trị cho doanh nghiệp — tất cả trong một ứng dụng.',
        findStationBtn: 'Tìm trạm gần đây',
        teamBtn: 'Đội ngũ chúng tôi',
      },
      stats: {
        title: 'Tác động thực tế',
        subtitle: 'Cùng nhau, chúng ta đang tạo ra sự khác biệt thực sự cho hành tinh',
        labels: {
          plastic: 'Tổng nhựa tái chế',
          stations: 'Trạm hoạt động',
          users: 'Người dùng tích cực',
        },
      },
      features: {
        title: 'Tính năng nổi bật',
        subtitle: 'Từ trạm kiosk đến mạng xã hội — mọi thứ bạn cần để tái chế hiệu quả',
        items: {
          map: {
            title: 'Bản đồ trạm thông minh',
            desc: 'Tìm trạm PCS gần nhất với trạng thái thời gian thực.',
          },
          wallet: {
            title: 'Ví Điểm Xanh',
            desc: 'Tích điểm mỗi lần tái chế, đổi quà từ thương hiệu đối tác.',
          },
          challenge: {
            title: 'Thử thách & Bảng xếp hạng',
            desc: 'Cạnh tranh lành mạnh, cùng nhau bảo vệ hành tinh.',
          },
          carbon: {
            title: 'Báo cáo CO₂ cá nhân',
            desc: 'Theo dõi lượng khí thải bạn đã giảm thiểu thực sự.',
          },
        },
      },
      cta: {
        title: 'Bắt đầu hành trình xanh ngay hôm nay',
        desc: 'Mỗi chai nhựa bạn tái chế là một bước nhỏ tạo ra sự thay đổi lớn cho thế hệ tương lai.',
        btn: 'Tìm trạm PCS gần bạn',
      },
      footer: {
        copyright: '© 2026 Plastic Circularity Station · Dow Circular Economy Innovation Challenge',
        b2b: 'Xem góc nhìn B2B',
      },
    },
    team: {
      header: {
        title: 'Đội ngũ PCS',
      },
      hero: {
        title: 'Đội ngũ PCS',
        desc: 'Những con người đam mê, tận tâm xây dựng hệ sinh thái tái chế nhựa thông minh cho thế hệ tương lai.',
      },
      roles: {
        advisor: 'Cố vấn',
        uiLead: 'UI Design Lead',
      },
      sections: {
        advisor: 'Cố vấn',
        members: 'Thành viên đội ngũ',
      },
      bios: {
        advisor01: {
          title: 'Cố vấn học thuật',
          bio: 'Chuyên gia hàng đầu về hóa học polyme và kinh tế tuần hoàn tại Đại học Bách Khoa TP.HCM. Hơn 20 năm kinh nghiệm nghiên cứu về tái chế vật liệu nhựa.',
        },
        member01: {
          title: 'Trưởng nhóm · Kỹ thuật AI & Phân tích dữ liệu',
          bio: 'Phụ trách kiến trúc hệ thống và mô hình phân loại nhựa FTIR. Đam mê ứng dụng AI vào bài toán môi trường thực tế.',
        },
        member02: {
          title: 'UI/UX Design · Phát triển ứng dụng',
          bio: 'Thiết kế toàn bộ giao diện và trải nghiệm người dùng PCS Eco-System. Chuyên về design system, motion design và mobile-first interface.',
        },
        member03: {
          title: 'Kỹ thuật phần cứng · IoT Sensor',
          bio: 'Phát triển phần cứng trạm kiosk PCS và tích hợp cảm biến FTIR. Nghiên cứu giải pháp nhận diện nhựa chi phí thấp cho thị trường Việt Nam.',
        },
        member04: {
          title: 'Chiến lược kinh doanh · Quan hệ đối tác',
          bio: 'Xây dựng mô hình kinh doanh B2B và phát triển quan hệ đối tác với các thương hiệu tài trợ. Nghiên cứu thị trường kinh tế tuần hoàn tại Đông Nam Á.',
        },
      },
    },
    settings: {
      title: 'Cài đặt',
      subtitle: 'Tài khoản & tuỳ chọn ứng dụng',
      sections: {
        account: 'Tài khoản',
        app: 'Ứng dụng',
        support: 'Hỗ trợ',
      },
      rows: {
        personalInfo: 'Thông tin cá nhân',
        language: 'Ngôn ngữ',
        contactAdmin: 'Liên hệ Admin',
      },
      personalInfo: {
        title: 'Thông tin cá nhân',
        nameLabel: 'Họ và tên',
        namePlaceholder: 'Nhập tên của bạn...',
        phoneLabel: 'Số điện thoại',
        phonePlaceholder: '09xxxxxxxx',
        emailLabel: 'Gmail',
        emailPlaceholder: 'email@gmail.com',
        saveButton: 'Lưu thay đổi',
        savedToast: 'Đã lưu thông tin',
        validation: {
          required: 'Trường này là bắt buộc',
          invalidPhone: 'Số điện thoại không hợp lệ (vd: 09xxxxxxxx)',
          invalidEmail: 'Địa chỉ email không hợp lệ',
        },
      },
      language: {
        title: 'Ngôn ngữ',
        note: 'Dịch thuật toàn ứng dụng đang được triển khai (Hoàn tất: Settings, Landing, Team, B2B Insight, Map). Các trang khác sẽ tạm hiển thị Tiếng Việt.',
      },
      contact: {
        title: 'Liên hệ Admin',
        subjectLabel: 'Chủ đề',
        subjectPlaceholder: 'Vấn đề của bạn là gì?',
        replyEmailLabel: 'Email liên hệ',
        replyEmailPlaceholder: 'email@example.com',
        messageLabel: 'Nội dung',
        messagePlaceholder: 'Mô tả chi tiết vấn đề...',
        submitButton: 'Gửi yêu cầu',
        validation: {
          required: 'Trường này là bắt buộc',
          invalidEmail: 'Email không hợp lệ',
        },
        successToast: {
          title: 'Đã gửi thành công',
          description: 'Yêu cầu của bạn đã được ghi nhận. Chúng tôi sẽ phản hồi sớm nhất.',
        },
      },
    },
    b2b: {
      nav: {
        backHome: 'Trang chủ',
        title: 'Góc nhìn Doanh nghiệp',
        sampleDataBadge: 'Dữ liệu thử nghiệm',
      },
      valueStatement: {
        eyebrow: 'Mệnh đề giá trị cốt lõi cho Dow',
        headlinePart1: 'Càng nhiều dữ liệu →',
        headlinePart2: 'độ chính xác phân loại càng cao',
        headlinePart3pre: '→ nguyên liệu đầu vào sạch hơn cho',
        headlinePart3highlight: 'Tái chế Cơ học',
        body: 'Mỗi lượt quét FTIR tại trạm PCS mở rộng bộ dữ liệu phân tích dòng chất thải địa phương. Dữ liệu tích lũy giúp mô hình phân loại nhận diện “dấu vân tay hóa học” của từng loại polyme chính xác hơn — đảm bảo nguồn nhựa đầu vào thuần hơn cho các cơ sở Tái chế Cơ học (MRF) của Dow.',
        pipeline: {
          ftir: 'Phổ FTIR phản xã khuếch tán',
          ml: 'Mô hình ML (Random Forest / MobileNet-1D)',
          feedstock: 'Nguyên liệu sạch cho MRF',
        },
      },
      kpi: {
        totalScans: { label: 'Tổng lượt quét (8 tuần)', unit: 'quét' },
        passRate: { label: 'Tỉ lệ Đạt chuẩn', unit: '%' },
        totalPlastic: { label: 'Tổng nhựa phân loại (8 tuần)', unit: 'kg' },
        activeStations: { label: 'Trạm hoạt động', unit: 'trạm' },
      },
      charts: {
        weeklyPlastic: {
          title: 'Nhựa phân loại theo tuần',
          badge: '8 tuần gần nhất',
          tooltipSeries: 'Nhựa đã phân loại',
          tooltipWeekPrefix: 'Tuần',
        },
        passReject: {
          title: 'Tỉ lệ Đạt / Từ chối theo loại nhựa',
          legendPass: 'Đạt',
          legendReject: 'Từ chối',
          tooltipPass: '✅ Đạt',
          tooltipReject: '❌ Từ chối',
        },
      },
      heatmap: {
        title: 'Bản đồ nhiệt trạm hoạt động',
        badge: 'Tuần hiện tại',
        scanSuffix: 'lượt quét',
        footnote: 'Độ đậm màu phản ánh cường độ hoạt động tương đối. Mỗi lượt quét = một giao dịch nhựa được FTIR xử lý. Dữ liệu được làm mới theo thời gian thực khi triển khai hệ thống sản xuất.',
      },
      footer: 'Dữ liệu hiển thị là minh họa cho mục đích demo cạnh tranh Dow 2026. Các con số không phản ánh kết quả thực tế đã được kiểm chứng.',
    },
    map: {
      page: {
        title: 'Bản đồ trạm PCS',
        stationCountSubtitle: 'trạm tại TP. Hồ Chí Minh',
        filterAriaLabel: 'Lọc bản đồ',
        searchPlaceholder: 'Tìm trạm theo tên hoặc địa chỉ...',
        overlayCount: 'trạm hiển thị',
        noResultsTitle: 'Không tìm thấy trạm',
        noResultsHint: 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm',
      },
      filters: {
        all: 'Tất cả',
        active: 'Hoạt động',
        almostFull: 'Sắp đầy',
        suspended: 'Tạm ngưng',
      },
      legend: {
        active: 'Hoạt động tốt',
        almostFull: 'Sắp đầy',
        suspended: 'Tạm ngưng',
      },
      popup: {
        status: {
          active: 'Hoạt động tốt',
          almostFull: 'Sắp đầy / Ít phần thưởng',
          suspended: 'Tạm ngưng hoạt động',
        },
        distanceSuffix: 'từ bạn',
        rewardsRemaining: 'phần thưởng còn lại',
        noRewards: 'Hết phần thưởng',
        directionsCta: '🧭 Chỉ đường',
      },
      fallback: {
        title: 'Bản đồ cần cấu hình',
        body: 'Thêm NEXT_PUBLIC_MAPBOX_TOKEN vào .env.local để xem bản đồ tương tác.',
        stationListHeading: 'Vị trí trạm (demo):',
      },
    },
  },
  en: {
    common: {
      navigation: {
        map: 'Map',
        feed: 'Community',
        wallet: 'Green Wallet',
        walletShort: 'Wallet',
        challenge: 'Challenge',
        marketplace: 'Rewards',
        home: 'Home',
        backHome: 'Back to Home',
        settings: 'Settings',
      },
      imageAlt: {
        avatarOf: 'Avatar of {{name}}',
      },
      aria: {
        linkedInOf: 'LinkedIn for {{name}}',
      },
    },
    landing: {
      hero: {
        badge: 'Dow Circular Economy Innovation Challenge 2026',
        titlePre: 'Digital Ecosystem for ',
        titleHighlight: 'Plastic Circular Economy',
        desc: 'PCS connects users with smart plastic collection stations, rewards green points, and provides valuable data to enterprises — all in one app.',
        findStationBtn: 'Find nearby station',
        teamBtn: 'Our Team',
      },
      stats: {
        title: 'Real Impact',
        subtitle: 'Together, we are making a real difference for the planet',
        labels: {
          plastic: 'Total Recycled Plastic',
          stations: 'Active Stations',
          users: 'Active Users',
        },
      },
      features: {
        title: 'Key Features',
        subtitle: 'From kiosk stations to social networking — everything you need to recycle effectively',
        items: {
          map: {
            title: 'Smart Station Map',
            desc: 'Find the nearest PCS station with real-time status.',
          },
          wallet: {
            title: 'Green Point Wallet',
            desc: 'Earn points every time you recycle, redeem gifts from partner brands.',
          },
          challenge: {
            title: 'Challenges & Leaderboard',
            desc: 'Compete healthily, protect the planet together.',
          },
          carbon: {
            title: 'Personal CO₂ Report',
            desc: 'Track the actual emissions you have reduced.',
          },
        },
      },
      cta: {
        title: 'Start your green journey today',
        desc: 'Every plastic bottle you recycle is a small step making a big change for the future generation.',
        btn: 'Find a PCS station near you',
      },
      footer: {
        copyright: '© 2026 Plastic Circularity Station · Dow Circular Economy Innovation Challenge',
        b2b: 'View B2B Perspective',
      },
    },
    team: {
      header: {
        title: 'PCS Team',
      },
      hero: {
        title: 'PCS Team',
        desc: 'Passionate people dedicated to building a smart plastic recycling ecosystem for future generations.',
      },
      roles: {
        advisor: 'Advisor',
        uiLead: 'UI Design Lead',
      },
      sections: {
        advisor: 'Advisor',
        members: 'Team Members',
      },
      bios: {
        advisor01: {
          title: 'Academic Advisor',
          bio: 'Leading expert in polymer chemistry and circular economy at Ho Chi Minh City University of Technology. Over 20 years of experience in plastic material recycling research.',
        },
        member01: {
          title: 'Team Leader · AI & Data Analytics',
          bio: 'In charge of system architecture and FTIR plastic classification models. Passionate about applying AI to real-world environmental problems.',
        },
        member02: {
          title: 'UI/UX Design · App Development',
          bio: 'Designed the entire interface and user experience of PCS Eco-System. Specializes in design systems, motion design, and mobile-first interfaces.',
        },
        member03: {
          title: 'Hardware Engineering · IoT Sensor',
          bio: 'Developing the PCS kiosk hardware and integrating FTIR sensors. Researching low-cost plastic recognition solutions for the Vietnamese market.',
        },
        member04: {
          title: 'Business Strategy · Partnerships',
          bio: 'Building the B2B business model and developing partnerships with sponsoring brands. Researching the circular economy market in Southeast Asia.',
        },
      },
    },
    settings: {
      title: 'Settings',
      subtitle: 'Account & app preferences',
      sections: {
        account: 'Account',
        app: 'App',
        support: 'Support',
      },
      rows: {
        personalInfo: 'Personal Info',
        language: 'Language',
        contactAdmin: 'Contact Admin',
      },
      personalInfo: {
        title: 'Personal Info',
        nameLabel: 'Full Name',
        namePlaceholder: 'Enter your name...',
        phoneLabel: 'Phone Number',
        phonePlaceholder: '09xxxxxxxx',
        emailLabel: 'Email',
        emailPlaceholder: 'email@gmail.com',
        saveButton: 'Save Changes',
        savedToast: 'Info saved',
        validation: {
          required: 'This field is required',
          invalidPhone: 'Invalid phone number (e.g. 09xxxxxxxx)',
          invalidEmail: 'Invalid email address',
        },
      },
      language: {
        title: 'Language',
        note: 'Full-app translation is in progress (Done: Settings, Landing, Team, B2B Insight, Map). Other pages will temporarily display in Vietnamese.',
      },
      contact: {
        title: 'Contact Admin',
        subjectLabel: 'Subject',
        subjectPlaceholder: 'What is your issue?',
        replyEmailLabel: 'Contact Email',
        replyEmailPlaceholder: 'email@example.com',
        messageLabel: 'Message',
        messagePlaceholder: 'Describe the issue in detail...',
        submitButton: 'Send Request',
        validation: {
          required: 'This field is required',
          invalidEmail: 'Invalid email format',
        },
        successToast: {
          title: 'Sent Successfully',
          description: 'Your request has been recorded. We will respond shortly.',
        },
      },
    },
    b2b: {
      nav: {
        backHome: 'Home',
        title: 'Enterprise Insights',
        sampleDataBadge: 'Sample Data',
      },
      valueStatement: {
        eyebrow: 'Core Value Proposition for Dow',
        headlinePart1: 'More Data →',
        headlinePart2: 'higher classification accuracy',
        headlinePart3pre: '→ cleaner feedstock for',
        headlinePart3highlight: 'Mechanical Recycling',
        body: 'Every FTIR scan at a PCS station expands the local waste stream analytics dataset. Accumulated data enables the classification model to identify the "chemical fingerprint" of each polymer type more accurately — ensuring purer plastic inputs for Dow\'s Mechanical Recycling facilities (MRFs).',
        pipeline: {
          ftir: 'Diffuse Reflectance FTIR',
          ml: 'ML Model (Random Forest / MobileNet-1D)',
          feedstock: 'Clean Feedstock for MRF',
        },
      },
      kpi: {
        totalScans: { label: 'Total Scans (8 Weeks)', unit: 'scans' },
        passRate: { label: 'Pass Rate', unit: '%' },
        /** Shorter label to prevent KPI chip overflow in EN */
        totalPlastic: { label: 'Plastic Sorted (8 Wks)', unit: 'kg' },
        /** Unit dropped in EN: label already says "Active Stations", number alone is clear */
        activeStations: { label: 'Active Stations', unit: '' },
      },
      charts: {
        weeklyPlastic: {
          title: 'Plastic Sorted by Week',
          badge: 'Last 8 Weeks',
          tooltipSeries: 'Plastic Sorted',
          tooltipWeekPrefix: 'Week',
        },
        passReject: {
          title: 'Pass / Reject by Plastic Type',
          legendPass: 'Pass',
          legendReject: 'Reject',
          tooltipPass: '✅ Pass',
          tooltipReject: '❌ Reject',
        },
      },
      heatmap: {
        title: 'Active Station Heatmap',
        badge: 'Current Week',
        scanSuffix: 'scans',
        footnote: 'Colour intensity reflects relative activity levels. Each scan = one plastic transaction processed by FTIR. Data refreshes in real time when the production system is deployed.',
      },
      footer: 'Data shown is illustrative for the Dow 2026 competition demo. Figures do not reflect verified real-world results.',
    },
    map: {
      page: {
        title: 'PCS Station Map',
        stationCountSubtitle: 'stations in Ho Chi Minh City',
        filterAriaLabel: 'Filter map',
        searchPlaceholder: 'Search by station name or address...',
        overlayCount: 'stations shown',
        noResultsTitle: 'No stations found',
        noResultsHint: 'Try adjusting filters or search terms',
      },
      filters: {
        all: 'All',
        active: 'Active',
        almostFull: 'Almost Full',
        suspended: 'Suspended',
      },
      legend: {
        active: 'Active',
        almostFull: 'Almost Full',
        suspended: 'Suspended',
      },
      popup: {
        status: {
          active: 'Active',
          almostFull: 'Low Stock',
          suspended: 'Temporarily Closed',
        },
        distanceSuffix: 'from you',
        rewardsRemaining: 'rewards left',
        noRewards: 'No rewards',
        directionsCta: '🧭 Directions',
      },
      fallback: {
        title: 'Map configuration needed',
        body: 'Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local to view the interactive map.',
        stationListHeading: 'Station locations (demo):',
      },
    },
  },
};
