export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string; // derived from picsum convention using encodeURIComponent(name)
}

export interface ContactAdminPayload {
  subject: string;
  message: string;
  replyEmail: string;
}
