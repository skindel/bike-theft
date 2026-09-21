'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  CommunityPost,
  HuntLeaderEntry,
  HuntListing,
  HuntListingInput,
  HuntSighting,
  HuntSightingInput,
  PostInput,
  SavedReport,
  TheftReport,
} from '@/contracts';
import {
  initialHuntListings,
  initialHuntSightings,
  initialPosts,
  seedLeaderboard,
} from '@/features/community/fixtures';

const DEMO_USER = {
  id: 'user-demo',
  name: 'You · demo',
  initials: 'YO',
} as const;

interface DemoStore {
  reports: SavedReport[];
  posts: CommunityPost[];
  huntListings: HuntListing[];
  huntSightings: HuntSighting[];
  huntLeaderboard: HuntLeaderEntry[];
  saveReport: (report: TheftReport) => SavedReport;
  deleteReport: (id: string) => void;
  addPost: (post: PostInput) => void;
  deletePost: (id: string) => void;
  addHuntListing: (listing: HuntListingInput) => HuntListing;
  addHuntSighting: (sighting: HuntSightingInput) => HuntSighting;
  confirmHuntSighting: (sightingId: string) => void;
  declineHuntSighting: (sightingId: string) => void;
}

const Context = createContext<DemoStore | null>(null);

// Deliberately in-memory: no personal report data persists on a shared hackathon laptop.
// Replace these operations with authenticated server calls when Supabase is connected.
export function DemoProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [posts, setPosts] = useState(initialPosts);
  const [huntListings, setHuntListings] = useState(initialHuntListings);
  const [huntSightings, setHuntSightings] = useState(initialHuntSightings);

  const huntLeaderboard = useMemo(() => {
    const confirmedByFinder = huntSightings.reduce<Record<string, number>>((acc, sighting) => {
      if (sighting.status !== 'confirmed') return acc;
      acc[sighting.finderId] = (acc[sighting.finderId] ?? 0) + 1;
      return acc;
    }, {});

    const byId = new Map<string, HuntLeaderEntry>();
    for (const entry of seedLeaderboard) {
      byId.set(entry.id, { ...entry });
    }

    for (const sighting of huntSightings) {
      if (!byId.has(sighting.finderId)) {
        byId.set(sighting.finderId, {
          id: sighting.finderId,
          name: sighting.finderName,
          initials: sighting.finderInitials,
          finds: 0,
          own: sighting.finderId === DEMO_USER.id,
        });
      }
    }

    return [...byId.values()]
      .map((entry) => ({
        ...entry,
        finds: entry.finds + (confirmedByFinder[entry.id] ?? 0),
      }))
      .sort((a, b) => b.finds - a.finds || a.name.localeCompare(b.name));
  }, [huntSightings]);

  function saveReport(input: TheftReport) {
    const report = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setReports((old) => [report, ...old]);
    return report;
  }

  function addPost(input: PostInput) {
    setPosts((old) => [
      {
        ...input,
        id: crypto.randomUUID(),
        author: DEMO_USER.name,
        initials: DEMO_USER.initials,
        date: 'Just now',
        own: true,
      },
      ...old,
    ]);
  }

  function addHuntListing(input: HuntListingInput) {
    const listing: HuntListing = {
      ...input,
      id: crypto.randomUUID(),
      ownerId: DEMO_USER.id,
      ownerName: DEMO_USER.name,
      ownerInitials: DEMO_USER.initials,
      status: 'searching',
      createdAt: new Date().toISOString(),
      dateLabel: 'Just now',
      own: true,
    };
    setHuntListings((old) => [listing, ...old]);
    return listing;
  }

  function addHuntSighting(input: HuntSightingInput) {
    const listing = huntListings.find((item) => item.id === input.listingId);
    if (!listing) throw new Error('Listing not found');
    if (listing.own) throw new Error('You cannot mark your own listing as found');
    if (listing.status === 'recovered') throw new Error('This bike is already recovered');

    const initials = input.finderName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'YO';

    const sighting: HuntSighting = {
      id: crypto.randomUUID(),
      listingId: input.listingId,
      finderId: DEMO_USER.id,
      finderName: input.finderName.trim(),
      finderInitials: initials,
      finderContact: input.finderContact.trim(),
      message: input.message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      dateLabel: 'Just now',
      ownFinder: true,
    };

    setHuntSightings((old) => [sighting, ...old]);
    setHuntListings((old) =>
      old.map((item) =>
        item.id === input.listingId && item.status === 'searching'
          ? { ...item, status: 'claimed' }
          : item,
      ),
    );
    return sighting;
  }

  function confirmHuntSighting(sightingId: string) {
    const sighting = huntSightings.find((item) => item.id === sightingId);
    if (!sighting || sighting.status !== 'pending') return;

    const listing = huntListings.find((item) => item.id === sighting.listingId);
    if (!listing?.own) return;

    setHuntSightings((old) =>
      old.map((item) => {
        if (item.id === sightingId) return { ...item, status: 'confirmed' };
        if (item.listingId === sighting.listingId && item.status === 'pending') {
          return { ...item, status: 'declined' };
        }
        return item;
      }),
    );
    setHuntListings((old) =>
      old.map((item) =>
        item.id === sighting.listingId ? { ...item, status: 'recovered' } : item,
      ),
    );
  }

  function declineHuntSighting(sightingId: string) {
    const sighting = huntSightings.find((item) => item.id === sightingId);
    if (!sighting || sighting.status !== 'pending') return;
    const listing = huntListings.find((item) => item.id === sighting.listingId);
    if (!listing?.own) return;

    setHuntSightings((old) => {
      const next = old.map((item) =>
        item.id === sightingId ? { ...item, status: 'declined' as const } : item,
      );
      const stillPending = next.some(
        (candidate) =>
          candidate.listingId === sighting.listingId && candidate.status === 'pending',
      );
      setHuntListings((listings) =>
        listings.map((item) =>
          item.id === sighting.listingId
            ? { ...item, status: stillPending ? 'claimed' : 'searching' }
            : item,
        ),
      );
      return next;
    });
  }

  return (
    <Context.Provider
      value={{
        reports,
        posts,
        huntListings,
        huntSightings,
        huntLeaderboard,
        saveReport,
        addPost,
        addHuntListing,
        addHuntSighting,
        confirmHuntSighting,
        declineHuntSighting,
        deleteReport: (id) => setReports((old) => old.filter((r) => r.id !== id)),
        deletePost: (id) => setPosts((old) => old.filter((p) => p.id !== id)),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useDemo() {
  const store = useContext(Context);
  if (!store) throw new Error('DemoProvider is missing');
  return store;
}
