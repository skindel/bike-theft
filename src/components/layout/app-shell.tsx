'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bike,
  Map,
  FileText,
  Users,
  ArrowUpRight,
  MapPin,
  FlaskConical,
  Heart,
} from 'lucide-react';
const navigation = [
  { href: '/map', label: 'Explore map', icon: Map },
  { href: '/reports', label: 'Report a theft', icon: FileText },
  { href: '/community', label: 'Community', icon: Users },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar no-print">
        <Link className="brand" href="/map">
          <span className="brand-mark">
            <Bike size={27} />
          </span>
          BikeWatch<span className="brand-dot">.</span>
        </Link>
        <div className="city-label">
          <MapPin size={13} /> MADE FOR MAASTRICHT
        </div>
        <div className="nav-label">YOUR NEIGHBOURHOOD</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname.startsWith(href) ? 'active' : ''}`}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {pathname.startsWith(href) && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">
              <Heart size={19} />
            </span>
            <h3>
              A better ride,
              <br />
              together.
            </h3>
            <p>A little local knowledge goes a long way. Look out for your bike. And each other.</p>
            <Link href="/community">
              Meet the community <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="demo-profile">
            <span>BW</span>
            <div>
              <strong>Hackathon edition</strong>
              <small>Built for our city</small>
            </div>
            <FlaskConical size={16} />
          </div>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar no-print">
          <span>
            <span className="live-dot" /> Maastricht, Netherlands
          </span>
          <span className="demo-badge">
            <FlaskConical size={13} /> Interactive demo
          </span>
        </header>
        <main id="main">{children}</main>
        <footer className="app-footer no-print">
          <span>Made for two wheels. Built for Maastricht.</span>
          <span>Demo data · Not a live safety assessment</span>
        </footer>
      </div>
    </>
  );
}
