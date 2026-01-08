import type { Metadata } from 'next';
import './globals.css';

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="https://mscorp.com.ph/MSC-logo-png-file.png" />
      </head>
      <body className="font-sans bg-gray-50">{children}</body>
    </html>
  );
}
