export type TranslationDictionary = {
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
};

export const dictionaries: Record<'vi' | 'en', TranslationDictionary> = {
  vi: {
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
        note: 'Dịch thuật toàn ứng dụng đang được phát triển. Tiếng Anh hiện chỉ áp dụng cho trang Cài đặt này.',
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
  },
  en: {
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
        note: 'Full-app translation is in progress. English currently applies only to this Settings page.',
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
  },
};
