import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import Select from 'react-select';
import type { Mission, Drone } from '../../types';

interface MissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  drones: Drone[];
  initialData?: Mission | null;
  title?: string;
}

// Status akışı tanımı
const STATUS_FLOW = {
  PLANNED: {
    next: ['PRE_FLIGHT_CHECK', 'ABORTED'] as const,
    label: 'Planlandı',
    order: 1,
  },
  PRE_FLIGHT_CHECK: {
    next: ['IN_PROGRESS', 'ABORTED'] as const,
    label: 'Uçuş Öncesi Kontrol',
    order: 2,
  },
  IN_PROGRESS: {
    next: ['COMPLETED', 'ABORTED'] as const,
    label: 'Devam Ediyor',
    order: 3,
  },
  COMPLETED: {
    next: [] as const,
    label: 'Tamamlandı',
    order: 4,
  },
  ABORTED: {
    next: [] as const,
    label: 'Durduruldu',
    order: 5,
  },
} as const;

type MissionStatus = keyof typeof STATUS_FLOW;
type NextStatus = typeof STATUS_FLOW[MissionStatus]['next'][number];

const MissionFormModal: React.FC<MissionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  drones,
  initialData = null,
  title = 'Yeni Görev Ekle',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'WIND_TURBINE_INSPECTION',
    pilotName: '',
    siteLocation: '',
    plannedStart: '',
    plannedEnd: '',
    status: 'PLANNED' as MissionStatus,
    droneId: '',
    flightHoursLogged: '',
    abortReason: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sadece AVAILABLE durumunda olan droneları filtrele
  const availableDrones = useMemo(() => {
    return drones.filter(drone => drone.status === 'AVAILABLE');
  }, [drones]);

  // Select için opsiyonlar
  const droneOptions = useMemo(() => {
    const options = availableDrones.map(drone => ({
      value: drone.id,
      label: `${drone.serialNumber} - ${drone.model} (${drone.status}) - ${drone.totalFlightHours} saat`,
      drone: drone,
    }));

    if (initialData) {
      const currentDrone = drones.find(d => d.id === initialData.assignedDroneId);
      if (currentDrone && !availableDrones.find(d => d.id === currentDrone.id)) {
        options.push({
          value: currentDrone.id,
          label: `${currentDrone.serialNumber} - ${currentDrone.model} (${currentDrone.status}) - ⚠️ Mevcut drone`,
          drone: currentDrone,
        });
      }
    }
    return options;
  }, [availableDrones, initialData, drones]);

  const selectedDrone = useMemo(() => {
    return droneOptions.find(option => option.value === formData.droneId) || null;
  }, [formData.droneId, droneOptions]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        pilotName: initialData.pilotName,
        siteLocation: initialData.siteLocation,
        plannedStart: initialData.plannedStart.split('T')[0],
        plannedEnd: initialData.plannedEnd.split('T')[0],
        status: initialData.status as MissionStatus,
        droneId: initialData.assignedDroneId,
        flightHoursLogged: initialData.flightHoursLogged?.toString() || '',
        abortReason: initialData.abortReason || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'WIND_TURBINE_INSPECTION',
        pilotName: '',
        siteLocation: '',
        plannedStart: new Date().toISOString().split('T')[0],
        plannedEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PLANNED',
        droneId: '',
        flightHoursLogged: '',
        abortReason: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Mevcut status'e göre izin verilen sonraki status'leri al
  const getAvailableStatuses = (currentStatus: MissionStatus): MissionStatus[] => {
    if (currentStatus === 'COMPLETED' || currentStatus === 'ABORTED') {
      return [];
    }
    // 'as unknown as MissionStatus[]' ile tip dönüşümü yap
    return STATUS_FLOW[currentStatus].next as unknown as MissionStatus[];
  };

  // Final status'ler (değiştirilemez)
  const isFinalStatus = (status: MissionStatus): boolean => {
    return ['COMPLETED', 'ABORTED'].includes(status);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Görev adı gereklidir';
    }
    if (!formData.pilotName.trim()) {
      newErrors.pilotName = 'Pilot adı gereklidir';
    }
    if (!formData.siteLocation.trim()) {
      newErrors.siteLocation = 'Konum gereklidir';
    }
    if (!formData.droneId) {
      newErrors.droneId = 'Drone seçimi gereklidir';
    } else {
      const selectedDrone = drones.find(d => d.id === formData.droneId);
      if (!initialData && selectedDrone && selectedDrone.status !== 'AVAILABLE') {
        newErrors.droneId = 'Yeni görev için sadece AVAILABLE durumundaki dronelar seçilebilir';
      }
    }
    if (!formData.plannedStart) {
      newErrors.plannedStart = 'Başlangıç tarihi gereklidir';
    }
    if (!formData.plannedEnd) {
      newErrors.plannedEnd = 'Bitiş tarihi gereklidir';
    }

    const start = new Date(formData.plannedStart);
    const end = new Date(formData.plannedEnd);
    if (start >= end) {
      newErrors.plannedEnd = 'Bitiş tarihi, başlangıç tarihinden sonra olmalıdır';
    }

    // COMPLETED ise flight hours required
    if (formData.status === 'COMPLETED' && !formData.flightHoursLogged) {
      newErrors.flightHoursLogged = 'Tamamlanan görev için uçuş saati girilmelidir';
    }

    // ABORTED ise abort reason required
    if (formData.status === 'ABORTED' && !formData.abortReason.trim()) {
      newErrors.abortReason = 'Durdurulan görev için iptal nedeni girilmelidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        flightHoursLogged: formData.flightHoursLogged ? parseFloat(formData.flightHoursLogged) : undefined,
        abortReason: formData.abortReason || undefined,
        plannedStart: new Date(formData.plannedStart).toISOString(),
        plannedEnd: new Date(formData.plannedEnd).toISOString(),
      };
      onSubmit(submitData);
      onClose();
    }
  };

  const missionTypes = [
    { value: 'WIND_TURBINE_INSPECTION', label: 'Rüzgar Türbini İnceleme' },
    { value: 'SOLAR_PANEL_SURVEY', label: 'Güneş Paneli Survey' },
    { value: 'POWER_LINE_PATROL', label: 'Enerji Hattı Kontrolü' },
  ];

  const getStatusLabel = (status: MissionStatus): string => {
    return STATUS_FLOW[status].label;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Mission Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Görev Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Örn: Rüzgar Türbini İnceleme - Osmaniye"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Mission Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Görev Tipi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {missionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pilot Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilot Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pilotName}
                onChange={(e) => setFormData({ ...formData, pilotName: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.pilotName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Pilot adını girin"
              />
              {errors.pilotName && <p className="mt-1 text-sm text-red-600">{errors.pilotName}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konum <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.siteLocation}
                onChange={(e) => setFormData({ ...formData, siteLocation: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.siteLocation ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Görev konumunu girin"
              />
              {errors.siteLocation && <p className="mt-1 text-sm text-red-600">{errors.siteLocation}</p>}
            </div>

            {/* Drone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drone <span className="text-red-500">*</span>
              </label>
              <Select
                options={droneOptions}
                value={selectedDrone}
                onChange={(option) => {
                  setFormData({ ...formData, droneId: option?.value || '' });
                  if (errors.droneId) {
                    setErrors({ ...errors, droneId: '' });
                  }
                }}
                placeholder="Drone ara veya seç..."
                isClearable
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: errors.droneId ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                    '&:hover': {
                      borderColor: errors.droneId ? '#ef4444' : '#3b82f6',
                    },
                  }),
                }}
                noOptionsMessage={() => 'Uygun drone bulunamadı'}
              />
              {droneOptions.length === 0 && !initialData && (
                <p className="mt-1 text-sm text-yellow-600">
                  ⚠️ Uygun drone bulunmuyor. (Sadece AVAILABLE durumunda olan dronelar görevlere atanabilir)
                </p>
              )}
              {errors.droneId && <p className="mt-1 text-sm text-red-600">{errors.droneId}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum {initialData && <span className="text-red-500">*</span>}
              </label>
              {initialData ? (
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as MissionStatus;
                    setFormData({ ...formData, status: newStatus });
                    // Status değişince ilgili alanları temizle
                    if (newStatus !== 'COMPLETED') {
                      setFormData(prev => ({ ...prev, flightHoursLogged: '' }));
                    }
                    if (newStatus !== 'ABORTED') {
                      setFormData(prev => ({ ...prev, abortReason: '' }));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isFinalStatus(formData.status)}
                >
                  <option value={formData.status}>
                    {getStatusLabel(formData.status)} (Mevcut)
                  </option>
                  {getAvailableStatuses(formData.status).map((status) => (
                    <option key={status} value={status}>
                      → {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  📋 {getStatusLabel('PLANNED')} (PLANNED)
                </div>
              )}
              {!initialData && (
                <p className="mt-1 text-xs text-gray-400">
                  Yeni görevler her zaman "Planlandı" durumunda oluşturulur.
                </p>
              )}
              {initialData && !isFinalStatus(formData.status) && (
                <p className="mt-1 text-xs text-blue-500">
                  ℹ️ {getStatusLabel(formData.status)} → {getAvailableStatuses(formData.status).map(s => getStatusLabel(s)).join(' veya ')}
                </p>
              )}
              {initialData && formData.status === 'COMPLETED' && (
                <p className="mt-1 text-xs text-green-500">
                  ✅ Görev tamamlandı. Artık durumu değiştiremezsiniz.
                </p>
              )}
              {initialData && formData.status === 'ABORTED' && (
                <p className="mt-1 text-xs text-red-500">
                  ⛔ Görev durduruldu. Artık durumu değiştiremezsiniz.
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.plannedStart}
                  onChange={(e) => setFormData({ ...formData, plannedStart: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.plannedStart ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.plannedStart && <p className="mt-1 text-sm text-red-600">{errors.plannedStart}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.plannedEnd}
                  onChange={(e) => setFormData({ ...formData, plannedEnd: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.plannedEnd ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.plannedEnd && <p className="mt-1 text-sm text-red-600">{errors.plannedEnd}</p>}
              </div>
            </div>

            {/* Flight Hours (conditional - only for COMPLETED) */}
            {formData.status === 'COMPLETED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uçuş Saati <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.flightHoursLogged}
                  onChange={(e) => setFormData({ ...formData, flightHoursLogged: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.flightHoursLogged ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Örn: 2.5"
                />
                {errors.flightHoursLogged && <p className="mt-1 text-sm text-red-600">{errors.flightHoursLogged}</p>}
              </div>
            )}

            {/* Abort Reason (conditional - only for ABORTED) */}
            {formData.status === 'ABORTED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İptal Nedeni <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.abortReason}
                  onChange={(e) => setFormData({ ...formData, abortReason: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.abortReason ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Görev neden durduruldu?"
                />
                {errors.abortReason && <p className="mt-1 text-sm text-red-600">{errors.abortReason}</p>}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={droneOptions.length === 0 && !initialData}
              >
                {initialData ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MissionFormModal;