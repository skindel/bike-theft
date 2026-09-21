import { reportSchema } from '@/contracts';

const PDOK_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

type PdokAddress = {
  type?: string;
  gemeentenaam?: string;
  woonplaatsnaam?: string;
  buurtnaam?: string;
  weergavenaam?: string;
  straatnaam?: string;
  huisnummer?: number;
  centroide_ll?: string;
};

type PdokResponse = { response?: { docs?: PdokAddress[] } };

function apiError(status: number, code: string, message: string, fieldErrors?: object) {
  return Response.json({ error: { code, message, fieldErrors } }, { status });
}

function coordinates(point?: string) {
  const match = point?.match(/^POINT\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)$/);
  if (!match) return null;
  return { longitude: Number(match[1]), latitude: Number(match[2]) };
}

async function validateAddress(location: string) {
  const params = new URLSearchParams({ q: `${location}, Maastricht`, rows: '5' });
  params.append('fq', 'gemeentenaam:Maastricht');
  params.append('fq', 'type:adres');

  const response = await fetch(`${PDOK_URL}?${params}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`PDOK returned ${response.status}`);

  const data = (await response.json()) as PdokResponse;
  const address = data.response?.docs?.find(
    (item) =>
      item.type === 'adres' &&
      item.gemeentenaam === 'Maastricht' &&
      item.woonplaatsnaam === 'Maastricht' &&
      item.straatnaam &&
      item.huisnummer &&
      item.buurtnaam,
  );
  const point = coordinates(address?.centroide_ll);
  if (!address || !point) return null;

  return {
    location: address.weergavenaam ?? `${address.straatnaam} ${address.huisnummer}, Maastricht`,
    neighbourhood: address.buurtnaam!,
    ...point,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'The request body must be valid JSON.');
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      400,
      'VALIDATION_ERROR',
      'Check the report details and try again.',
      parsed.error.flatten().fieldErrors,
    );
  }

  let address: Awaited<ReturnType<typeof validateAddress>>;
  try {
    address = await validateAddress(parsed.data.location);
  } catch {
    return apiError(
      503,
      'ADDRESS_SERVICE_UNAVAILABLE',
      'Address validation is temporarily unavailable. Please try again.',
    );
  }
  if (!address) {
    return apiError(
      400,
      'INVALID_LOCATION',
      'Enter a complete Maastricht street address, including a house number.',
      {
        location: ['Enter a valid Maastricht street and house number.'],
      },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return apiError(503, 'SERVICE_NOT_CONFIGURED', 'Report storage is not configured.');
  }

  let databaseResponse: Response;
  try {
    databaseResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_reported_incident`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_serial_number: parsed.data.serial,
        p_brand: parsed.data.brand,
        p_type: parsed.data.type,
        p_color: parsed.data.color,
        p_location: address.location,
        p_last_seen: new Date(parsed.data.lastSeen).toISOString(),
        p_discovered_missing: new Date(parsed.data.discovered).toISOString(),
        p_neighbourhood: address.neighbourhood,
        p_details: parsed.data.details,
        p_share_aggregate: parsed.data.shareAggregate,
        p_longitude: address.longitude,
        p_latitude: address.latitude,
      }),
      cache: 'no-store',
    });
  } catch {
    return apiError(503, 'STORAGE_ERROR', 'Report storage is temporarily unavailable.');
  }

  if (!databaseResponse.ok) {
    return apiError(
      503,
      'STORAGE_ERROR',
      'We could not save the report. Your form has not been cleared.',
    );
  }

  const [saved] = (await databaseResponse.json()) as Array<{ id: number; created_at: string }>;
  return Response.json(
    {
      report: {
        id: String(saved.id),
        createdAt: saved.created_at,
        location: address.location,
        neighbourhood: address.neighbourhood,
      },
    },
    { status: 201 },
  );
}
