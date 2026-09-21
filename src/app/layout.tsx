import type { Metadata } from 'next';
import { Instrument_Serif, Outfit } from 'next/font/google';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AppShell } from '@/components/layout/app-shell';
import { DemoProvider } from '@/lib/demo-provider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CycleGuard · Bike intelligence for Maastricht',
  description:
    'Premium bike parking guidance, theft risk insight, Bike Hunt recoveries, and private reporting for Maastricht.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${outfit.variable} ${instrument.variable}`}>
      <body>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
