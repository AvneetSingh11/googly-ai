import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Googly AI — Outsmart the Machine',
  description:
    'Think of an IPL legend. Googly AI will guess who in 15 questions. An AI-powered Akinator for cricket fans.',
  keywords: ['IPL', 'cricket', 'AI', 'game', 'akinator', 'Googly AI'],
  openGraph: {
    title: 'Googly AI — Outsmart the Machine',
    description: 'Think of an IPL legend. I\'ll guess who. 15 questions.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-primary text-text-primary font-inter antialiased overflow-x-hidden min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
