import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Analysis, Comparison, Stage, Tender, TenderSearchResult, TrackedTender } from './types';

const TRACKED_KEY = 'genbid.tracked.v1';
const FEED_KEY = 'genbid.feed.v1';

interface Store {
  ready: boolean;
  tracked: Record<string, TrackedTender>;
  feed?: TenderSearchResult;
  setFeed(feed: TenderSearchResult): void;
  track(tender: Tender): void;
  untrack(id: string): void;
  setStage(id: string, stage: Stage): void;
  setNotes(id: string, notes: string): void;
  saveAnalysis(id: string, analysis: Analysis): void;
  saveComparison(id: string, comparison: Comparison): void;
  findTender(id: string): Tender | undefined;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tracked, setTracked] = useState<Record<string, TrackedTender>>({});
  const [feed, setFeedState] = useState<TenderSearchResult>();

  useEffect(() => {
    (async () => {
      try {
        const [t, f] = await Promise.all([AsyncStorage.getItem(TRACKED_KEY), AsyncStorage.getItem(FEED_KEY)]);
        if (t) setTracked(JSON.parse(t));
        if (f) setFeedState(JSON.parse(f));
      } catch {
        // Corrupt or unavailable storage: start empty rather than crash.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(TRACKED_KEY, JSON.stringify(tracked)).catch(() => {});
  }, [tracked, ready]);

  const update = useCallback((id: string, patch: Partial<TrackedTender>) => {
    setTracked((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], ...patch, updatedAt: new Date().toISOString() } } : prev));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ready,
      tracked,
      feed,
      setFeed(next) {
        setFeedState(next);
        AsyncStorage.setItem(FEED_KEY, JSON.stringify(next)).catch(() => {});
        // Refresh stored copies of tracked tenders (e.g. a notice was amended).
        setTracked((prev) => {
          let changed = false;
          const out = { ...prev };
          for (const t of next.tenders) {
            if (out[t.id]) {
              out[t.id] = { ...out[t.id], tender: t };
              changed = true;
            }
          }
          return changed ? out : prev;
        });
      },
      track(tender) {
        setTracked((prev) => {
          if (prev[tender.id]) return prev;
          const now = new Date().toISOString();
          return { ...prev, [tender.id]: { tender, stage: 'new', notes: '', addedAt: now, updatedAt: now } };
        });
      },
      untrack(id) {
        setTracked((prev) => {
          const { [id]: _removed, ...rest } = prev;
          return rest;
        });
      },
      setStage: (id, stage) => update(id, { stage }),
      setNotes: (id, notes) => update(id, { notes }),
      saveAnalysis: (id, analysis) => update(id, { analysis, analyzedAt: new Date().toISOString() }),
      saveComparison: (id, comparison) => update(id, { comparison, comparedAt: new Date().toISOString() }),
      findTender: (id) => tracked[id]?.tender ?? feed?.tenders.find((t) => t.id === id),
    }),
    [ready, tracked, feed, update],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
