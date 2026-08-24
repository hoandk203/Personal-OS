import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal OS — Command Center',
  description: 'Precision Operational Layer & Daily Decision Support Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-custom-bg text-on-surface antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
