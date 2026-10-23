import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: {
    default: 'RAKVIH Solutions — Digital Chit Fund Management Platform',
    template: '%s · RAKVIH',
  },
  description:
    'End-to-end digital chit fund management platform for customer registration, KYC verification, monthly contributions, live e-auctions, prize payouts, and financial ledgers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
