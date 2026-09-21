'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Bike,
  ShieldCheck,
  Layers,
  Search,
  MapPin,
  Info,
  LockKeyhole,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parking, zones } from './fixtures';
import { activityBand, bandLabels } from './risk';
const CityMap = dynamic(() => import('./city-map').then((mod) => mod.CityMap), {
  ssr: false,
  loading: () => <div className="map-status">Loading map…</div>,
});
export function MapExplorer() {
  const [query, setQuery] = useState('');
  const [covered, setCovered] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      parking.filter(
        (p) =>
          `${p.name} ${p.area}`.toLowerCase().includes(query.toLowerCase()) &&
          (!covered || p.covered),
      ),
    [query, covered],
  );
  const visibleIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const selected = filtered.find((p) => p.id === selectedId) ?? null;
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">A LITTLE LOCAL KNOWLEDGE</div>
          <h1>
            Your city. Your bike.
            <br className="mobile-break" /> A safer spot.
          </h1>
          <p>Explore your neighbourhood and find a better place to park.</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/reports">
            <span>Report a theft</span>
            <ArrowUpRight size={17} />
          </Link>
        </Button>
      </section>
      <div className="overview-grid">
        <div className="overview-card">
          <span className="overview-icon mint">
            <MapPin size={22} />
          </span>
          <div>
            <strong>Maastricht</strong>
            <span>One city. A shared responsibility.</span>
          </div>
        </div>
        <div className="overview-card">
          <span className="overview-icon peach">
            <Layers size={22} />
          </span>
          <div>
            <strong>3 example zones</strong>
            <span>Explore the activity layer</span>
          </div>
        </div>
        <div className="overview-card">
          <span className="overview-icon lavender">
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>3 parking examples</strong>
            <span>Find them on the map below</span>
          </div>
        </div>
      </div>
      <section className="explorer">
        <div className="map-toolbar">
          <div className="section-title">
            <span className="live-dot" />
            <h2>Explore Maastricht</h2>
          </div>
          <div className="map-tools">
            <label className="search-box">
              <Search size={17} />
              <input
                aria-label="Search parking"
                placeholder="Search a place or neighbourhood"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              className={`filter-button ${covered ? 'enabled' : ''}`}
              aria-pressed={covered}
              onClick={() => setCovered(!covered)}
            >
              <LockKeyhole size={15} /> Covered only
            </button>
          </div>
        </div>
        <div className="map-area">
          <CityMap
            selected={selected}
            onSelect={setSelectedId}
            showZones={showZones}
            visibleIds={visibleIds}
          />
          <div className="map-chip">
            <span className="live-dot" /> MAASTRICHT <span className="chip-divider" /> Illustrative
            data
          </div>
          <button
            className={`layer-toggle ${showZones ? 'enabled' : ''}`}
            aria-pressed={showZones}
            onClick={() => setShowZones(!showZones)}
          >
            <Layers size={16} /> Activity zones{' '}
            <span className="toggle-track">
              <span />
            </span>
          </button>
          <div className="map-legend">
            <strong>
              Recorded theft activity <Info size={13} />
            </strong>
            <div>
              <span>
                <i className="dot low" />
                Lower
              </span>
              <span>
                <i className="dot medium" />
                Moderate
              </span>
              <span>
                <i className="dot high" />
                Higher
              </span>
            </div>
            <small>Synthetic examples · not a prediction</small>
          </div>
          {selected && (
            <div className="map-detail">
              <button
                className="close-button"
                aria-label="Close parking details"
                onClick={() => setSelectedId(null)}
              >
                <X size={17} />
              </button>
              <span className="eyebrow">PARKING EXAMPLE</span>
              <h3>{selected.name}</h3>
              <p>{selected.note}</p>
              <a
                href="https://www.gemeentemaastricht.nl/parkeren-en-verkeer/fiets-parkeren"
                target="_blank"
                rel="noreferrer"
              >
                Check official information <ArrowUpRight size={15} />
              </a>
            </div>
          )}
        </div>
        <div className="map-disclaimer">
          <Info size={15} />
          <span>
            A preview of what’s possible. Zones, counts and parking details are illustrative, not
            live safety advice.
          </span>
          <a href="#activity">
            How to read the map <ArrowRight size={14} />
          </a>
        </div>
      </section>
      <div className="below-map">
        <section className="panel parking-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">A LITTLE MORE PEACE OF MIND</div>
              <h2>Places to park</h2>
            </div>
            <span className="count-pill">{filtered.length} places</span>
          </div>
          <div className="parking-list">
            {filtered.map((place) => (
              <button
                className={`parking-row ${selected?.id === place.id ? 'is-selected' : ''}`}
                key={place.id}
                onClick={() => setSelectedId(place.id)}
              >
                <span className="parking-symbol">P</span>
                <span className="parking-copy">
                  <strong>{place.name}</strong>
                  <small>
                    <MapPin size={12} /> {place.area} <span>·</span>{' '}
                    {place.covered ? 'Covered' : 'Open air'} <span>·</span> Demo
                  </small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                No parking matches. Try another place or turn off the covered filter.
              </div>
            )}
          </div>
        </section>
        <section className="riding-card">
          <span className="riding-icon">
            <Bike size={30} />
          </span>
          <div className="eyebrow">GOOD THINGS GO AROUND</div>
          <h2>
            More than a place
            <br />
            to park.
          </h2>
          <p>Local tips, weekend rides and people who love two wheels as much as you do.</p>
          <Link href="/community">
            Find your community <ArrowUpRight size={18} />
          </Link>
          <div className="decorative-wheel" />
        </section>
      </div>
      <section id="activity" className="activity-section">
        <div>
          <div className="eyebrow">UNDERSTAND THE LAYER</div>
          <h2>Activity isn’t probability.</h2>
          <p>
            These fictional counts demonstrate the interface. Real data needs matching time periods
            and verified boundaries. A green zone never guarantees a bike’s safety.
          </p>
        </div>
        <div className="zone-summaries">
          {zones.map((zone) => (
            <div key={zone.id}>
              <span className={`dot ${activityBand(zone.count)}`} />
              <strong>{zone.name}</strong>
              <span>{bandLabels[activityBand(zone.count)]}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
