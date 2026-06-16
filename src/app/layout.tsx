import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Triage Inbox',
  description: 'B2B inbound lead triage',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
