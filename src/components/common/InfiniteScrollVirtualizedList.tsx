import React, { useRef, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { VirtuosoHandle } from 'react-virtuoso';

interface InfiniteScrollVirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  height?: number | string;
  className?: string;
  overscan?: number;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
}

function InfiniteScrollVirtualizedList<T>({
  items,
  renderItem,
  hasMore,
  isLoading,
  loadMore,
  height = 600,
  className = '',
  overscan = 10,
  loadingComponent,
  emptyComponent,
  endComponent,
}: InfiniteScrollVirtualizedListProps<T>) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Yükleme durumu component'i
  const LoadingComponent = () => (
    loadingComponent || (
      <div className="py-6 text-center">
        <div className="inline-flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <span className="text-gray-500">Daha fazla veri yükleniyor...</span>
        </div>
      </div>
    )
  );

  // Tüm veriler yüklendi component'i
  const EndComponent = () => (
    endComponent || (
      <div className="py-6 text-center">
        <span className="text-gray-400">Tüm veriler yüklendi ({items.length} kayıt)</span>
      </div>
    )
  );

  // Boş durum component'i
  const EmptyComponent = () => (
    emptyComponent || (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📭</div>
        <p className="text-gray-500 text-lg">Gösterilecek veri yok</p>
        <p className="text-sm text-gray-400 mt-1">Arama kriterlerinize uygun kayıt bulunamadı</p>
      </div>
    )
  );

  if (items.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <div 
      className={`w-full ${className}`} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: '100%' }}
        totalCount={items.length}
        itemContent={(index) => renderItem(items[index], index)}
        overscan={overscan}
        endReached={() => {
          if (hasMore && !isLoading) {
            loadMore();
          }
        }}
        components={{
          Footer: () => {
            if (isLoading) {
              return <LoadingComponent />;
            }
            if (!hasMore && items.length > 0) {
              return <EndComponent />;
            }
            return null;
          }
        }}
      />
    </div>
  );
}

export default InfiniteScrollVirtualizedList;