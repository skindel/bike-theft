'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, FileText, Users, ArrowUpRight, MapPin, Shield } from 'lucide-react';
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
            <Image
              src="/cycle-guard-logo.png"
              alt=""
              width={36}
              height={36}
              priority
              className="brand-logo"
            />
          </span>
          <span className="brand-wordmark">
            Cycle<span className="brand-accent">Guard</span>
          </span>
        </Link>
        <div className="city-label">
          <MapPin size={13} /> MADE FOR MAASTRICHT
        </div>
        <div className="nav-label">INTELLIGENCE</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname.startsWith(href) ? 'active' : ''}`}
              aria-current={pathname.startsWith(href) ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
              {pathname.startsWith(href) && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">
              <Shield size={18} />
            </span>
            <h3>
              Safer parking,
              <br />
              clearer risk.
            </h3>
            <p>Urban bike intelligence for Maastricht — precise, private, and built for riders.</p>
            <Link href="/community">
              Meet the community <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="app-profile">
            <span>CG</span>
            <div>
              <strong>CycleGuard</strong>
              <small>Maastricht, NL</small>
            </div>
            <Shield size={16} />
          </div>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar no-print">
          <span>
            <span className="live-dot" /> Maastricht, Netherlands
          </span>
        </header>
        <main id="main">{children}</main>
        <footer className="app-footer no-print">
          <span>CycleGuard · Mobility intelligence for Maastricht</span>
          <span>Demo data · Not a live safety assessment</span>
        </footer>
      </div>
    </>
  );
}
