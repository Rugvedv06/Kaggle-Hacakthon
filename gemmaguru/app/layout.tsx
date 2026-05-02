import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'GemmaGuru',
  description: 'Offline AI STEM tutor in Marathi, Hindi & Hinglish',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GemmaGuru',
  },
};

export const viewport: Viewport = {
  themeColor: '#1D9E75',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 pb-16">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
