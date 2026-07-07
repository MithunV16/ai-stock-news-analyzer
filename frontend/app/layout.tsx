import type { Metadata } from 'next';
import { QueryProvider } from '@/lib/queryClient';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Stock News Analyzer',
  description: 'Real-time Indian stock market corporate event intelligence dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
