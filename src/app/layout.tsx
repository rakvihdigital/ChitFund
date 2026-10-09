import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: 'RAKVIH Solutions — Digital Chit Fund Management Platform',
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
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
