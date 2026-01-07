import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MS Corp HRIS Portal',
  description: 'Employee Self-Service Portal for MS Corp',
  icons: {
    icon: 'https://mscorp.com.ph/MSC-logo-png-file.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://mscorp.com.ph/MSC-logo-png-file.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
