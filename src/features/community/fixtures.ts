import type { CommunityPost } from '@/contracts';
const sampleIllustration = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 170" role="img">
    <rect width="320" height="170" fill="#151c27"/>
    <g fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round">
      <circle cx="92" cy="112" r="30"/><circle cx="228" cy="112" r="30"/>
      <path d="M92 112 148 62h44l36 50M148 62l24 50H92M192 62h22"/>
    </g>
    <text x="160" y="157" fill="#64748b" font-family="sans-serif" font-size="11"
      text-anchor="middle">Illustration — sample post</text>
  </svg>`,
)}`;
export const initialPosts: CommunityPost[] = [
  {
    id: 'sample-4',
    kind: 'stolen',
    author: 'Jonas M.',
    initials: 'JM',
    date: 'Sample alert',
    title: 'Dark green Gazelle taken near Wyck',
    area: 'Wyck, near the station',
    lastSeenOn: '2025-03-14',
    body: 'Green city bike with a wooden crate on the back and a bell shaped like a ladybird. If you spot something similar parked for days, a quick message here would mean a lot. Thank you!',
    photo: { src: sampleIllustration, alt: 'Line drawing of a city bike' },
  },
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
