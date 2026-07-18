import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TxLINE Prediction Markets',
  description: 'On-chain sports prediction market settlement powered by TxLINE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
