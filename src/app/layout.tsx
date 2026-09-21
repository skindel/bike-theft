import type { Metadata } from 'next';
import './globals.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AppShell } from '@/components/layout/app-shell';
import { DemoProvider } from '@/lib/demo-provider';
export const metadata: Metadata = {
  title: 'BikeWatch · A better ride through Maastricht',
  description: 'A community-first bike parking and theft reporting prototype for Maastricht.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <DemoProvider>
          <AppShell>{children}</AppShell>
        </DemoProvider>
      </body>
    </html>
  );
}
