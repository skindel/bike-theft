'use client';

import { useState } from 'react';
import { Crosshair, Trophy } from 'lucide-react';
import { BikeHunt, HuntLeaderboard } from '@/features/community/bike-hunt';

type HuntView = 'hunt' | 'board';

export function HuntHub() {
  const [view, setView] = useState<HuntView>('hunt');

  return (
    <>
      <div className="hunt-switcher" role="tablist" aria-label="Bike Hunt sections">
        {(
          [
            ['hunt', 'Bike Hunt', Crosshair],
            ['board', 'Leaderboard', Trophy],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            className={view === id ? 'selected' : ''}
            onClick={() => setView(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
      {view === 'hunt' && <BikeHunt />}
      {view === 'board' && <HuntLeaderboard />}
    </>
  );
}
