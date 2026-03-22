import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { searchAllSources, SearchResult, SearchResultType } from "../services/searchService";

const RECENT_KEY = "bloc.search.recent.v1";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

export type SearchFilter = "all" | SearchResultType;

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [skeleton, setSkeleton] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTyped = useRef(false);

  // Load recent searches on mount
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then(raw => {
        if (raw) setRecentSearches(JSON.parse(raw));
      })
      .catch(() => null);
  }, []);

  const saveRecent = useCallback(async (term: string) => {
    setRecentSearches(prev => {
      const next = [term, ...prev.filter(s => s !== term)].slice(0, MAX_RECENT);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => null);
      return next;
    });
  }, []);

  const deleteRecent = useCallback((term: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(s => s !== term);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => null);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem(RECENT_KEY).catch(() => null);
  }, []);

  // Skeleton on first keystroke
  useEffect(() => {
    if (query.length === 1 && !hasTyped.current) {
      hasTyped.current = true;
      setSkeleton(true);
    }
    if (query.length === 0) {
      hasTyped.current = false;
      setSkeleton(false);
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSkeleton(false);
      setResults([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSkeleton(false);
      setLoading(true);
      try {
        const res = await searchAllSources(query);
        setResults(res);
        if (query.trim()) saveRecent(query.trim());
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, saveRecent]);

  const filteredResults = filter === "all"
    ? results
    : results.filter(r => r.type === filter);

  const countByType = {
    all: results.length,
    user: results.filter(r => r.type === "user").length,
    course: results.filter(r => r.type === "course").length,
    post: results.filter(r => r.type === "post").length,
    note: results.filter(r => r.type === "note").length,
  };

  return {
    query,
    setQuery,
    results: filteredResults,
    allResults: results,
    loading,
    skeleton,
    filter,
    setFilter,
    recentSearches,
    deleteRecent,
    clearRecent,
    countByType,
  };
}
