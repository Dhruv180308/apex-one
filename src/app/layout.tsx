import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'APEX-ONE // Koenigsegg One:1 Digital Showroom & Configurator',
  description:
    'Experience the world’s first production megacar in photorealistic 3D. 1,360 HP, 1 KG/HP power-to-weight ratio. WebGL hypercar configurator atelier.',
  keywords: [
    'Koenigsegg',
    'One:1',
    'Hypercar',
    'Configurator',
    '3D Showroom',
    'Three.js',
    'WebGL',
  ],
  authors: [{ name: 'APEX Atelier' }],
  openGraph: {
    title: 'APEX-ONE // Koenigsegg One:1 Digital Showroom',
    description:
      'Photorealistic 3D Megacar Experience. Custom paint finishes, wheel choices, engine audio synthesis, and chassis reservation.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E0D0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#EAE6DF] text-[#1F1E1C] overflow-hidden select-none`}
      >
        {children}
      </body>
    </html>
  );
}