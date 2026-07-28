import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, Search } from 'lucide-react';
import type { Drone } from '../../types';

interface MissionFiltersProps {
  drones: Drone[];
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

const MissionFilters: React.FC<MissionFiltersProps> = ({
  drones,
  onFilterChange,
  initialFilters = {},
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    droneId: initialFilters.droneId || '',
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
  });

  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    setFilters(initialFilters);
    setTempFilters(initialFilters);
  }, [initialFilters]);

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'PLANNED', label: 'Planlandı' },
    { value: 'PRE_FLIGHT_CHECK', label: 'Uçuş Öncesi Kontrol' },
    { value: 'IN_PROGRESS', label: 'Devam Ediyor' },
    { value: 'COMPLETED', label: 'Tamamlandı' },
    { value: 'ABORTED', label: 'Durduruldu' },
  ];

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    onFilterChange(tempFilters);
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      status: '',
      droneId: '',
      startDate: '',
      endDate: '',
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsExpanded(false);
  };

  const hasActiveFilters = filters.status || filters.droneId || filters.startDate || filters.endDate;

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter size={18} />
        <span>Filtrele</span>
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {Object.values(filters).filter(v => v).length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-30"
            onClick={() => setIsExpanded(false)}
          />

          {/* Filter Panel */}
          <div className="absolute right-0 top-12 z-50 w-[500px] bg-white rounded-xl shadow-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Gelişmiş Filtreleme</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  value={tempFilters.status}
                  onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drone Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drone
                </label>
                <select
                  value={tempFilters.droneId}
                  onChange={(e) => setTempFilters({ ...tempFilters, droneId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tüm Dronelar</option>
                  {drones.map((drone) => (
                    <option key={drone.id} value={drone.id}>
                      {drone.serialNumber} - {drone.model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={tempFilters.startDate}
                    onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={tempFilters.endDate}
                    onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Active Filters Summary */}
              {Object.values(tempFilters).some(v => v) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tempFilters.status && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center">
                      Durum: {statusOptions.find(s => s.value === tempFilters.status)?.label}
                      <button
                        onClick={() => setTempFilters({ ...tempFilters, status: '' })}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {tempFilters.droneId && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center">
                      Drone: {drones.find(d => d.id === tempFilters.droneId)?.serialNumber}
                      <button
                        onClick={() => setTempFilters({ ...tempFilters, droneId: '' })}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {tempFilters.startDate && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center">
                      Başlangıç: {new Date(tempFilters.startDate).toLocaleDateString('tr-TR')}
                      <button
                        onClick={() => setTempFilters({ ...tempFilters, startDate: '' })}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {tempFilters.endDate && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center">
                      Bitiş: {new Date(tempFilters.endDate).toLocaleDateString('tr-TR')}
                      <button
                        onClick={() => setTempFilters({ ...tempFilters, endDate: '' })}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Temizle
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MissionFilters;