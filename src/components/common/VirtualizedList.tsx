import React from 'react';
import { Virtuoso } from 'react-virtuoso';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: number | string;
  className?: string;
  overscan?: number;
  itemHeight?: number; // Virtuoso için opsiyonel
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

function VirtualizedList<T>({
  items,
  renderItem,
  height = 600,
  className = '',
  overscan = 5,
  loadingComponent,
  emptyComponent,
}: VirtualizedListProps<T>) {
  if (items.length === 0) {
    return emptyComponent || (
      <div className="text-center py-8 text-gray-500">
        <p>Gösterilecek veri yok</p>
      </div>
    );
  }

  return (
    <div 
      className={`w-full ${className}`} 
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <Virtuoso
        style={{ height: '100%' }}
        totalCount={items.length}
        itemContent={(index) => renderItem(items[index], index)}
        overscan={overscan}
        components={{
          Footer: () => loadingComponent || null
        }}
      />
    </div>
  );
}

export default VirtualizedList;