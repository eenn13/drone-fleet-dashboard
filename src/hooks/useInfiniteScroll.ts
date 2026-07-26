import { useState, useEffect, useCallback, useRef } from 'react';
import type { RefObject } from 'react';

interface UseInfiniteScrollProps<T> {
  data: T[];
  itemsPerPage?: number;
  threshold?: number;
}

interface UseInfiniteScrollReturn<T> {
  displayedItems: T[];
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  reset: () => void;
  observerRef: RefObject <HTMLDivElement | null>; // Tipi değiştirdik
}

export function useInfiniteScroll<T>({
  data,
  itemsPerPage = 20,
  threshold = 100,
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> {
  const [displayedCount, setDisplayedCount] = useState<number>(itemsPerPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null); // null olabilir

  const displayedItems = data.slice(0, displayedCount);
  const hasMore = displayedCount < data.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    // Simüle edilmiş yükleme gecikmesi
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + itemsPerPage, data.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, itemsPerPage, data.length]);

  const reset = useCallback(() => {
    setDisplayedCount(itemsPerPage);
  }, [itemsPerPage]);

  useEffect(() => {
    const currentObserver = observerRef.current;
    if (!currentObserver || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: `${threshold}px` }
    );

    observer.observe(currentObserver);

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [hasMore, isLoading, loadMore, threshold]);

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
    observerRef,
  };
}