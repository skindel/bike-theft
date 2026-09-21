'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SavedReport, TheftReport, CommunityPost, PostInput, PostPhoto } from '@/contracts';
import { initialPosts } from '@/features/community/fixtures';
interface DemoStore {
  reports: SavedReport[];
  posts: CommunityPost[];
  saveReport: (
    report: TheftReport,
    persisted?: Pick<SavedReport, 'id' | 'createdAt' | 'location' | 'neighbourhood'>,
  ) => SavedReport;
  deleteReport: (id: string) => void;
  addPost: (post: PostInput, photo?: PostPhoto) => void;
  deletePost: (id: string) => void;
}
const Context = createContext<DemoStore | null>(null);
// Deliberately in-memory: no personal report data persists on a shared hackathon laptop.
// Replace these operations with authenticated server calls when Supabase is connected.
export function DemoProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [posts, setPosts] = useState(initialPosts);
  function saveReport(
    input: TheftReport,
    persisted?: Pick<SavedReport, 'id' | 'createdAt' | 'location' | 'neighbourhood'>,
  ) {
    const report = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...persisted,
    };
    setReports((old) => [report, ...old]);
    return report;
  }
  function addPost(input: PostInput, photo?: PostPhoto) {
    setPosts((old) => [
      {
        ...input,
        photo,
        id: crypto.randomUUID(),
        author: 'You · demo',
        initials: 'YO',
        date: 'Just now',
        own: true,
      },
      ...old,
    ]);
  }
  return (
    <Context.Provider
      value={{
        reports,
        posts,
        saveReport,
        addPost,
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
