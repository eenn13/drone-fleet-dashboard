import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseInfiniteVirtualizedListProps<T> {
  data: T[];
  initialItemsPerPage?: number;
  loadMoreItemsPerPage?: number;
  threshold?: number;
}

interface UseInfiniteVirtualizedListReturn<T> {
  displayedItems: T[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  reset: () => void;
  totalItems: number;
}

export function useInfiniteVirtualizedList<T>({
  data,
  initialItemsPerPage = 50,
  loadMoreItemsPerPage = 20,
  threshold = 100,
}: UseInfiniteVirtualizedListProps<T>): UseInfiniteVirtualizedListReturn<T> {
  const [displayedCount, setDisplayedCount] = useState<number>(initialItemsPerPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const displayedItems = useMemo(() => {
    return data.slice(0, displayedCount);
  }, [data, displayedCount]);

  // Yükleme durumunu kontrol et
  useEffect(() => {
    setHasMore(displayedCount < data.length);
  }, [displayedCount, data.length]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Simüle edilmiş yükleme gecikmesi
    setTimeout(() => {
      const newCount = Math.min(displayedCount + loadMoreItemsPerPage, data.length);
      setDisplayedCount(newCount);
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, displayedCount, loadMoreItemsPerPage, data.length]);

  const reset = useCallback(() => {
    setDisplayedCount(initialItemsPerPage);
    setIsLoading(false);
    setHasMore(true);
  }, [initialItemsPerPage]);

  // Veri değiştiğinde resetle
  useEffect(() => {
    reset();
  }, [data, reset]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    reset,
    totalItems: data.length,
  };
}