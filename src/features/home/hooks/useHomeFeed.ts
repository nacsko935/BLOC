import { useCallback, useRef, useState } from "react";
import { Post } from "../../../core/data/models";
import { HomeTabKey } from "../types";
import { fetchHomeFeed } from "../services/homeService";

const tabKeys: HomeTabKey[] = ["Abonne", "Campus", "Prof", "Amis", "Tendances"];

export function useHomeFeed() {
  const [activeTab, setActiveTab] = useState<HomeTabKey>("Abonne");
  const [postsByTab, setPostsByTab] = useState<Record<HomeTabKey, Post[]>>({
    Abonne: [],
    Campus: [],
    Prof: [],
    Amis: [],
    Tendances: [],
  });
  const [nextCursorByTab, setNextCursorByTab] = useState<Record<HomeTabKey, number | null>>({
    Abonne: 0,
    Campus: 0,
    Prof: 0,
    Amis: 0,
    Tendances: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollOffsetByTab = useRef<Record<HomeTabKey, number>>({
    Abonne: 0,
    Campus: 0,
    Prof: 0,
    Amis: 0,
    Tendances: 0,
  });

  const loadInitial = useCallback(async () => {
    setInitialLoading(true);
    const page = await fetchHomeFeed(activeTab, 0);
    setPostsByTab((prev) => ({ ...prev, [activeTab]: page.items }));
    setNextCursorByTab((prev) => ({ ...prev, [activeTab]: page.nextCursor }));
    setInitialLoading(false);
  }, [activeTab]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const page = await fetchHomeFeed(activeTab, 0);
    setPostsByTab((prev) => ({ ...prev, [activeTab]: page.items }));
    setNextCursorByTab((prev) => ({ ...prev, [activeTab]: page.nextCursor }));
    setRefreshing(false);
  }, [activeTab]);

  const loadMore = useCallback(async () => {
    const nextCursor = nextCursorByTab[activeTab];
    if (nextCursor == null || loadingMore) return;
    setLoadingMore(true);
    const page = await fetchHomeFeed(activeTab, nextCursor);
    setPostsByTab((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], ...page.items] }));
    setNextCursorByTab((prev) => ({ ...prev, [activeTab]: page.nextCursor }));
    setLoadingMore(false);
  }, [activeTab, loadingMore, nextCursorByTab]);

  const switchTab = useCallback(async (tab: HomeTabKey) => {
    setActiveTab(tab);
    if (postsByTab[tab].length === 0) {
      const page = await fetchHomeFeed(tab, 0);
      setPostsByTab((prev) => ({ ...prev, [tab]: page.items }));
      setNextCursorByTab((prev) => ({ ...prev, [tab]: page.nextCursor }));
    }
  }, [postsByTab]);

  return {
    tabs: tabKeys,
    activeTab,
    posts: postsByTab[activeTab],
    refreshing,
    loadingMore,
    initialLoading,
    loadInitial,
    refresh,
    loadMore,
    switchTab,
    scrollOffsetByTab,
  };
}
