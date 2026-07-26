import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Activity, Clock, Wrench, 
  ChevronRight, ChevronDown, ChevronUp
} from 'lucide-react';
import type { Drone, DroneStatus } from '../../types';
import { 
  getDroneStatusLabel, 
  getDroneStatusColor, 
  getDroneModelLabel,
  formatDate 
} from '../../utils/helpers';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../common/Pagination';

interface DroneListProps {
  drones: Drone[];
  onSelectDrone: (drone: Drone) => void;
  itemsPerPage?: number;
}

const DroneList: React.FC<DroneListProps> = ({ 
  drones, 
  onSelectDrone,
  itemsPerPage = 10 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<DroneStatus | 'ALL'>('ALL');

  const filteredDrones = useMemo(() => {
    return drones.filter(drone => {
      const matchesSearch = 
        drone.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || drone.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drones, searchTerm, statusFilter]);

  const {
    currentPage,
    totalPages,
    totalItems,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
    paginationRange,
  } = usePagination({
    data: filteredDrones,
    itemsPerPage,
    initialPage: 1,
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

      {/* Drone List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {currentItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Drone bulunamadı</p>
          </div>
        ) : (
          currentItems.map((drone) => (
            <div
              key={drone.id}
              onClick={() => onSelectDrone(drone)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
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
                
                <div className="mt-3 md:mt-0 flex items-center">
                  <ChevronRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          paginationRange={paginationRange}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default DroneList;