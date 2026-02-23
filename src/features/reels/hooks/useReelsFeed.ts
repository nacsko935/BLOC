import { useCallback, useEffect, useState } from "react";
import { ReelItem, fetchReels } from "../services/reelsService";

export function useReelsFeed() {
  const [items, setItems] = useState<ReelItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const load = useCallback(async () => {
    const page = await fetchReels(0);
    setItems(page.items);
    setNextCursor(page.nextCursor);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (nextCursor == null) return;
    const page = await fetchReels(nextCursor);
    setItems((prev) => [...prev, ...page.items]);
    setNextCursor(page.nextCursor);
  }, [nextCursor]);

  return { items, activeIndex, setActiveIndex, loadMore };
}
