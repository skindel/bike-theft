import type { ParkingLocation } from '@/contracts';

export type ParkingSourceResult = { parkings: ParkingLocation[]; connected: boolean };

type ParkingRow = {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  capacity: string | null;
  type: string | null;
  hours: string | null;
};

const DIACRITICS = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'g',
);

function slugify(name: string) {
  const withoutDiacritics = name.normalize('NFD').replace(DIACRITICS, '');
  const slug = withoutDiacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'parking';
}

/** Only the raw source text says "guarded" vs "unguarded" — there's no dedicated roof/cover column. */
function isGuarded(type: string | null) {
  return /guarded/i.test(type ?? '') && !/unguarded/i.test(type ?? '');
}

function noteFor(row: ParkingRow) {
  return [row.type, row.capacity, row.hours && `Hours: ${row.hours}`].filter(Boolean).join(' · ');
}

/** Pulls the public bicycle-parking directory from the `Parkings` table (name, address,
 * lat/lng, capacity, type, hours — no personal data, readable directly with the anon key). */
export async function loadParkings(): Promise<ParkingSourceResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) return { parkings: [], connected: false };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/Parkings?select=*`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      cache: 'no-store',
    });
    if (!response.ok) return { parkings: [], connected: false };

    const rows = (await response.json()) as ParkingRow[];
    const seenIds = new Set<string>();
    const parkings: ParkingLocation[] = [];
    for (const row of rows) {
      if (row.longitude === null || row.latitude === null) continue;
      const base = slugify(row.name);
      let id = base;
      let suffix = 2;
      while (seenIds.has(id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
      }
      seenIds.add(id);
      const guarded = isGuarded(row.type);
      parkings.push({
        id,
        name: row.name,
        area: row.address,
        coordinates: [row.longitude, row.latitude],
        covered: guarded,
        guarded,
        note: noteFor(row),
      });
    }
    return { parkings, connected: true };
  } catch {
    return { parkings: [], connected: false };
  }
}
