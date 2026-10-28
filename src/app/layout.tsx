import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import { I18nProvider } from '@/lib/i18n';
import { languageBootScript } from '@/lib/i18n-boot';

export const metadata: Metadata = {
  title: {
    default: 'ChitFund Solutions — Digital Chit Fund Management Platform',
    template: '%s · ChitFund',
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
    // The boot script sets lang and a loading class before hydration
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageBootScript }} />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <I18nProvider>
          <AppProvider>{children}</AppProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
