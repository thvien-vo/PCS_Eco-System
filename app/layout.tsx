import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { StoreHydrationProvider } from '@/components/store-hydration-provider';
import { AuthProvider } from '@/components/shared/auth-provider';
import { SyncManagerProvider } from '@/components/shared/sync-manager-provider';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'PCS Eco-System | Plastic Circularity Station',
  description:
    'Hệ sinh thái số kết nối trạm thu gom nhựa thông minh với ví xanh, mạng xã hội voucher, thách thức gamification và dữ liệu phân tích cho doanh nghiệp.',
  keywords: ['PCS', 'tái chế nhựa', 'kinh tế tuần hoàn', 'Dow', 'green rewards'],
  authors: [{ name: 'PCS Team' }],
  openGraph: {
    title: 'PCS Eco-System | Plastic Circularity Station',
    description: 'Hệ sinh thái số tái chế nhựa thông minh',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the server-side Supabase session so AuthProvider can hydrate
  // the initial auth state without a client-side fetch on first load.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider initialUser={user} initialSession={session}>
            <SyncManagerProvider>
              <StoreHydrationProvider />
              <ThemeToggle />
              {children}
            </SyncManagerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
