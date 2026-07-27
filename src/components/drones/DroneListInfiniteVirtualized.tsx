import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Activity, Clock, Wrench, ChevronRight,
  Plus, Edit, Trash2, RefreshCw 
} from 'lucide-react';
import type { Drone, DroneStatus } from '../../types';
import { 
  getDroneStatusLabel, 
  getDroneStatusColor, 
  getDroneModelLabel,
  formatDate 
} from '../../utils/helpers';
import { useInfiniteVirtualizedList } from '../../hooks/useInfiniteVirtualizedList';
import InfiniteScrollVirtualizedList from '../common/InfiniteScrollVirtualizedList';
import DroneFormModal from './DroneFormModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { useDroneStore } from '../../store/droneStore';

interface DroneListInfiniteVirtualizedProps {
  drones: Drone[];
  onSelectDrone: (drone: Drone) => void;
}

const DroneListInfiniteVirtualized: React.FC<DroneListInfiniteVirtualizedProps> = ({ 
  drones: initialDrones, 
  onSelectDrone 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<DroneStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);

  const { drones, addDrone, updateDrone, deleteDrone, loadDrones } = useDroneStore();

  // İlk yükleme
  React.useEffect(() => {
    if (drones.length === 0 && initialDrones.length > 0) {
      loadDrones(initialDrones.length);
    }
  }, []);

  const filteredDrones = useMemo(() => {
    const dataToFilter = drones.length > 0 ? drones : initialDrones;
    return dataToFilter.filter(drone => {
      const matchesSearch = 
        drone.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || drone.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drones, initialDrones, searchTerm, statusFilter]);

  // Infinite scroll hook
  const {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    totalItems,
  } = useInfiniteVirtualizedList({
    data: filteredDrones,
    initialItemsPerPage: 50,
    loadMoreItemsPerPage: 20,
  });

  const getStatusDotColor = (status: DroneStatus) => {
    switch(status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'IN_MISSION': return 'bg-blue-500';
      case 'MAINTENANCE': return 'bg-orange-500';
      case 'RETIRED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const statusOptions: { value: DroneStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'Tümü' },
    { value: 'AVAILABLE', label: 'Müsait' },
    { value: 'IN_MISSION', label: 'Görevde' },
    { value: 'MAINTENANCE', label: 'Bakımda' },
    { value: 'RETIRED', label: 'Emekli' }
  ];

  const handleAddDrone = () => {
    setEditingDrone(null);
    setIsModalOpen(true);
  };

  const handleEditDrone = (drone: Drone, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDrone(drone);
    setIsModalOpen(true);
  };

  const handleDeleteDrone = (drone: Drone, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDrone(drone);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingDrone) {
      updateDrone(editingDrone.id, data);
    } else {
      addDrone(data);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedDrone) {
      deleteDrone(selectedDrone.id);
      setSelectedDrone(null);
    }
    setIsDeleteDialogOpen(false);
  };

  // Her bir drone için render fonksiyonu
  const renderDroneItem = (drone: Drone) => {
    return (
      <div
        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group border-b border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1" onClick={() => onSelectDrone(drone)}>
            <div className="flex items-center space-x-3">
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(drone.status)}`} />
              <h3 className="font-semibold text-gray-900">{drone.serialNumber}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDroneStatusColor(drone.status)}`}>
                {getDroneStatusLabel(drone.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{getDroneModelLabel(drone.model)}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Activity size={14} />
                <span>{drone.totalFlightHours} saat</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>Son bakım: {formatDate(drone.lastMaintenanceDate)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wrench size={14} />
                <span>Sonraki: {formatDate(drone.nextMaintenanceDueDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 md:mt-0 flex items-center space-x-2">
            <button
              onClick={(e) => handleEditDrone(drone, e)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => handleDeleteDrone(drone, e)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
            <div onClick={() => onSelectDrone(drone)}>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Drone Filosu
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalItems} drone)
            </span>
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddDrone}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Yeni Drone</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Drone ara (Seri No, Model)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DroneStatus | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Infinite Scroll + Virtualized List */}
      <InfiniteScrollVirtualizedList
        items={displayedItems}
        renderItem={renderDroneItem}
        hasMore={hasMore}
        isLoading={isLoading}
        loadMore={loadMore}
        height={600}
        overscan={10}
      />

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
        <span>
          Gösterilen: {displayedItems.length} / {totalItems} drone
        </span>
        {isLoading && (
          <span className="text-blue-600 flex items-center space-x-1">
            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
            <span>Yükleniyor...</span>
          </span>
        )}
        {!hasMore && displayedItems.length > 0 && (
          <span className="text-green-600">✅ Tüm dronelar yüklendi</span>
        )}
      </div>

      {/* Modals */}
      <DroneFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingDrone}
        title={editingDrone ? 'Drone Düzenle' : 'Yeni Drone Ekle'}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Drone Sil"
        message={`"${selectedDrone?.serialNumber}" adlı drone'u silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Evet, Sil"
        cancelLabel="İptal"
        confirmColor="red"
      />
    </div>
  );
};

export default DroneListInfiniteVirtualized;