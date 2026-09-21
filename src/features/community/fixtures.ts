import type { CommunityPost } from '@/contracts';
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
