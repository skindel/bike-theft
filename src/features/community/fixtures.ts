import type { CommunityPost, HuntLeaderEntry, HuntListing, HuntSighting } from '@/contracts';

export const initialPosts: CommunityPost[] = [
  {
    id: 'sample-1',
    kind: 'meetup',
    author: 'Lotte V.',
    initials: 'LV',
    date: 'Sample event',
    title: 'Sunday miles & good coffee',
    body: 'An easy loop along the Maas, followed by a coffee stop in Wyck. All bikes, all paces. Meet outside the station at 10:00 on Sunday. Who’s in?',
  },
  {
    id: 'sample-2',
    kind: 'post',
    author: 'Sam D.',
    initials: 'SD',
    date: 'Sample post',
    title: 'A small habit that makes a difference',
    body: 'I started taking a photo of my frame number and keeping it somewhere safe. Takes a minute, but makes identifying your bike so much easier if it goes missing.',
  },
  {
    id: 'sample-3',
    kind: 'meetup',
    author: 'Noor K.',
    initials: 'NK',
    date: 'Sample event',
    title: 'Let’s fix that squeaky brake',
    body: 'Thinking of a little community repair afternoon. Bring your bike, share a few tools, and learn from each other. Leave a post if you’d like to help organise it.',
  },
];

/** Demo listings — photos are illustrative stock, not real Maastricht thefts. */
export const initialHuntListings: HuntListing[] = [
  {
    id: 'hunt-1',
    title: 'Matte black city bike · silver rack',
    description:
      'Stolen overnight from the covered shed at Maastricht Centraal (Wyck side). Matte black frame, silver rear rack, black mudguards, and a faded “Mestreech” sticker on the downtube. Front light still attached. Frame number starts with VM-8841.',
    lastSeenArea: 'Station shed · Wyck',
    contactEmail: 'lotte.vermeer@demo.cycleguard.nl',
    imageDataUrl: '/hunt/vanmoof-style.jpg',
    ownerId: 'user-lotte',
    ownerName: 'Lotte Vermeer',
    ownerInitials: 'LV',
    status: 'searching',
    createdAt: '2026-03-18T09:00:00.000Z',
    dateLabel: '2 days ago',
  },
  {
    id: 'hunt-2',
    title: 'Cream Batavus omafiets · wicker basket',
    description:
      'Taken from the UM Library racks in Randwyck around lunchtime. Cream Batavus city frame, brown leather-style grips, full chain cover, and a natural wicker front basket with a blue scarf still tied to the handle. Pedal reflectors are orange.',
    lastSeenArea: 'UM Library racks · Randwyck',
    contactEmail: 'sam.dekker@demo.cycleguard.nl',
    imageDataUrl: '/hunt/batavus-cream.jpg',
    ownerId: 'user-sam',
    ownerName: 'Sam Dekker',
    ownerInitials: 'SD',
    status: 'searching',
    createdAt: '2026-03-17T14:30:00.000Z',
    dateLabel: '3 days ago',
  },
  {
    id: 'hunt-3',
    title: 'Racing green road bike · white bar tape',
    description:
      'Disappeared during a café stop on Maasboulevard. Deep green road frame, white bar tape, black bottle cages (left cage empty), and a long scratch on the top tube from a previous fall. Shimano 105 groupset. Reward for verified return.',
    lastSeenArea: 'Maasboulevard · café racks',
    contactEmail: 'noor.karim@demo.cycleguard.nl',
    imageDataUrl: '/hunt/cannondale-road.jpg',
    ownerId: 'user-noor',
    ownerName: 'Noor Karim',
    ownerInitials: 'NK',
    status: 'searching',
    createdAt: '2026-03-16T11:15:00.000Z',
    dateLabel: '4 days ago',
  },
  {
    id: 'hunt-4',
    title: 'Slate grey Trek hybrid · your demo listing',
    description:
      'Your demo listing so the jury can confirm a find. Slate grey Trek hybrid, flat handlebars, black mudguards, and a small red reflector on the seat post. Last locked at Vrijthof. Someone already believes they spotted it near Onze Lieve Vrouweplein.',
    lastSeenArea: 'Vrijthof · west side racks',
    contactEmail: 'you@demo.cycleguard.nl',
    imageDataUrl: '/hunt/cube-hybrid.jpg',
    ownerId: 'user-demo',
    ownerName: 'You · demo',
    ownerInitials: 'YO',
    status: 'claimed',
    createdAt: '2026-03-19T07:00:00.000Z',
    dateLabel: 'Today',
    own: true,
  },
  {
    id: 'hunt-5',
    title: 'White Gazelle city bike · black background photo',
    description:
      'Taken from a rack behind the Markt. Clean white Gazelle city bike, black saddle, chrome bell on the left, and a blue ABUS lock normally looped on the rear rack (lock also missing). Owner photo was taken at home against a dark wall.',
    lastSeenArea: 'Markt · rear alley racks',
    contactEmail: 'mira.santos@demo.cycleguard.nl',
    imageDataUrl: '/hunt/gazelle-blue.jpg',
    ownerId: 'user-mira',
    ownerName: 'Mira Santos',
    ownerInitials: 'MS',
    status: 'searching',
    createdAt: '2026-03-15T18:40:00.000Z',
    dateLabel: '5 days ago',
  },
];

export const initialHuntSightings: HuntSighting[] = [
  {
    id: 'sight-1',
    listingId: 'hunt-4',
    finderId: 'user-elise',
    finderName: 'Elise Meijer',
    finderInitials: 'EM',
    finderContact: 'elise.meijer@demo.cycleguard.nl',
    message:
      'Spotted locked to a railing on Onze Lieve Vrouweplein around 08:05 — slate grey hybrid, flat bars, red seat-post reflector matches your photo. I can wait nearby for 20 minutes.',
    status: 'pending',
    createdAt: '2026-03-19T08:20:00.000Z',
    dateLabel: 'This morning',
  },
];

export const seedLeaderboard: HuntLeaderEntry[] = [
  { id: 'user-elise', name: 'Elise Meijer', initials: 'EM', finds: 4 },
  { id: 'user-jonas', name: 'Jonas Ruiter', initials: 'JR', finds: 3 },
  { id: 'user-mira', name: 'Mira Santos', initials: 'MS', finds: 2 },
  { id: 'user-demo', name: 'You · demo', initials: 'YO', finds: 0, own: true },
];
