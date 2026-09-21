import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AppShell } from '@/components/layout/app-shell';
import { DemoProvider } from '@/lib/demo-provider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CycleGuard · Bike intelligence for Maastricht',
  description:
    'Premium bike parking guidance, theft risk insight, and private reporting for Maastricht.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={outfit.variable}>
      <body>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
