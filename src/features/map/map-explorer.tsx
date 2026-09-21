'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Bike,
  ShieldCheck,
  Flame,
  Layers,
  Search,
  MapPin,
  Info,
  LockKeyhole,
  SquareParking,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parking as demoParking } from './fixtures';
import { loadTheftHeatPoints, type HeatSourceResult } from './heat-source';
import type { TheftHeatPoint } from './theft-heatmap';
import type { NeighbourhoodPick } from './neighbourhood-layer';
import { loadNeighbourhoods, type NeighbourhoodState } from './neighbourhood-source';
import { rampCss, type NeighbourhoodFeature } from './neighbourhoods';
import { loadParkings, type ParkingSourceResult } from './parking-source';
import styles from './map-layers.module.css';
const noPoints: TheftHeatPoint[] = [];
const noFeatures: NeighbourhoodFeature[] = [];
const CityMap = dynamic(() => import('./city-map').then((mod) => mod.CityMap), {
  ssr: false,
  loading: () => <div className="map-status">Loading map…</div>,
});
type Hovered = { name: string; count: number | null; rate: number | null; x: number; y: number };
function formatRate(value: number | null) {
  if (value === null) return 'no data';
  return value.toLocaleString('en-GB', { maximumFractionDigits: 2 });
}
/** The base comes from the source column, so an unknown base is never guessed. */
function perLabel(denominator: number | null) {
  return denominator === null ? 'per unit' : `per ${denominator.toLocaleString('en-GB')}`;
}
export function MapExplorer() {
  const [query, setQuery] = useState('');
  const [covered, setCovered] = useState(false);
  const [showNeighbourhoods, setShowNeighbourhoods] = useState(true);
<<<<<<< HEAD
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showParkings, setShowParkings] = useState(true);
=======
  const [showHeatmap, setShowHeatmap] = useState(false);
>>>>>>> newMAP
  const [heat, setHeat] = useState<HeatSourceResult | null>(null);
  const [areas, setAreas] = useState<NeighbourhoodState>({ status: 'loading' });
  const [parkingSource, setParkingSource] = useState<ParkingSourceResult | null>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadTheftHeatPoints().then((result) => {
      if (active) setHeat(result);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    loadParkings().then((result) => {
      if (active) setParkingSource(result);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    loadNeighbourhoods(controller.signal)
      .then((data) => setAreas({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setAreas({
          status: 'error',
          message: error instanceof Error ? error.message : 'Could not load neighbourhoods.',
        });
      });
    return () => controller.abort();
  }, []);
  const onHoverNeighbourhood = useCallback((info: NeighbourhoodPick) => {
    if (!info.object) return setHovered(null);
    const { name, count, rate } = info.object.properties;
    setHovered({ name, count, rate, x: info.x, y: info.y });
  }, []);
  const heatPoints = heat?.points ?? noPoints;
  const ready = areas.status === 'ready' ? areas.data : null;
  const features = ready?.features ?? noFeatures;
  const ranked = useMemo(
    () =>
      features
        .filter((feature) => feature.properties.rate !== null)
        .sort((a, b) => (b.properties.rate ?? 0) - (a.properties.rate ?? 0))
        .slice(0, 6),
    [features],
  );
  const isLiveParking = Boolean(parkingSource?.connected && parkingSource.parkings.length > 0);
  const allParking = isLiveParking ? parkingSource!.parkings : demoParking;
  const filtered = useMemo(
    () =>
      allParking.filter(
        (p) =>
          `${p.name} ${p.area}`.toLowerCase().includes(query.toLowerCase()) &&
          (!covered || p.covered),
      ),
    [allParking, query, covered],
  );
  const visibleIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const selected = filtered.find((p) => p.id === selectedId) ?? null;
  return (
    <>
      <section className="page-heading">
        <div>
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
            <strong>{ready ? `${ready.features.length} neighbourhoods` : 'Neighbourhoods'}</strong>
            <span>
              {ready ? `${ready.matched} with recorded theft data` : 'Official CBS 2024 boundaries'}
            </span>
          </div>
        </div>
        <div className="overview-card">
          <span className="overview-icon lavender">
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>
              {allParking.length} parking {allParking.length === 1 ? 'location' : 'locations'}
            </strong>
            <span>{isLiveParking ? 'From the city dataset' : 'Illustrative examples'}</span>
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
            showNeighbourhoods={showNeighbourhoods}
            neighbourhoods={features}
            neighbourhoodMax={ready?.max ?? null}
            onHoverNeighbourhood={onHoverNeighbourhood}
            showHeatmap={showHeatmap}
            heatPoints={heatPoints}
            showParkings={showParkings}
            parkingLocations={allParking}
            visibleIds={visibleIds}
          />
          <div className="map-chip">
            <span className="live-dot" /> MAASTRICHT <span className="chip-divider" />
            {ready?.connected ? 'CBS 2024 boundaries' : 'Boundaries only'}
          </div>
          <div className={styles.stack}>
            <button
              className={`layer-toggle ${showNeighbourhoods ? 'enabled' : ''}`}
              aria-pressed={showNeighbourhoods}
              onClick={() => setShowNeighbourhoods(!showNeighbourhoods)}
            >
              <Layers size={16} /> Neighbourhoods{' '}
              <span className="toggle-track">
                <span />
              </span>
            </button>
            <button
              className={`layer-toggle ${showHeatmap ? 'enabled' : ''}`}
              aria-pressed={showHeatmap}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Flame size={16} /> Theft heatmap{' '}
              <span className="toggle-track">
                <span />
              </span>
            </button>
            <button
              className={`layer-toggle ${showParkings ? 'enabled' : ''}`}
              aria-pressed={showParkings}
              onClick={() => setShowParkings(!showParkings)}
            >
              <SquareParking size={16} /> Parking{' '}
              <span className="toggle-track">
                <span />
              </span>
            </button>
          </div>
          {hovered && (
            <div className={styles.tooltip} style={{ left: hovered.x + 14, top: hovered.y + 14 }}>
              <strong>{hovered.name}</strong>
              <span>
                {formatRate(hovered.rate)} {perLabel(ready?.denominator ?? null)}
              </span>
              {hovered.count !== null && <span>{hovered.count} recorded</span>}
            </div>
          )}
          <div className="map-legend">
            <strong>
              {ready?.denominator
                ? `Thefts ${perLabel(ready.denominator)}`
                : 'Recorded theft activity'}{' '}
              · 2024 <Info size={13} />
            </strong>
            {ready && ready.max !== null ? (
              <>
                <div
                  className={styles.scale}
                  style={{ background: `linear-gradient(90deg, ${rampCss().join(', ')})` }}
                  aria-hidden
                />
                <div className={styles.scaleLabels}>
                  <span>0</span>
                  <span>{formatRate(ready.max)}</span>
                </div>
                <div className={styles.noDataKey}>
                  <i />
                  No data
                </div>
              </>
            ) : (
              <div>
                <span>
                  {areas.status === 'loading'
                    ? 'Loading neighbourhoods…'
                    : areas.status === 'error'
                      ? areas.message
                      : ready?.reason === 'missing_credentials'
                        ? 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart npm run dev.'
                        : 'No theft statistics connected yet'}
                </span>
              </div>
            )}
            <small>Recorded activity, not a probability of theft</small>
            <small>
              {heat === null
                ? 'Heatmap · loading'
                : heat.connected
                  ? `Heatmap · ${heatPoints.length} aggregated points`
                  : 'Heatmap · no data source connected yet'}
            </small>
            <small>
              {parkingSource === null
                ? 'Parking · loading'
                : isLiveParking
                  ? `Parking · ${allParking.length} locations from the city dataset`
                  : 'Parking · showing illustrative examples'}
            </small>
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
              <span className="eyebrow">{isLiveParking ? 'PARKING' : 'PARKING EXAMPLE'}</span>
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
            Boundaries are the official CBS 2024 neighbourhoods. Parking details are illustrative,
            and shading shows recorded activity, not live safety advice.
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
                    {place.covered ? 'Covered' : 'Open air'} <span>·</span>{' '}
                    {isLiveParking ? 'Verified' : 'Demo'}
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
            Darker shading means a higher recorded theft rate in that neighbourhood, compared across
            one period and the same official boundaries. Reporting rates and how many bikes pass
            through differ by area, so a lighter neighbourhood never guarantees a bike’s safety.
          </p>
        </div>
        <div className="zone-summaries">
          {ranked.map((feature) => (
            <div key={feature.properties.code}>
              <strong>{feature.properties.name}</strong>
              <span>
                {formatRate(feature.properties.rate)} {perLabel(ready?.denominator ?? null)}
              </span>
            </div>
          ))}
          {ranked.length === 0 && (
            <div className="empty-state">
              {areas.status === 'error'
                ? areas.message
                : 'Neighbourhood statistics are not connected yet.'}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
