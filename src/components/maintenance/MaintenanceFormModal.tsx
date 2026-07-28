import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { MaintenanceLog, Drone } from '../../types';

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  drones: Drone[];
  initialData?: MaintenanceLog | null;
  title?: string;
}

const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  drones,
  initialData = null,
  title = 'Yeni Bakım Kaydı Ekle',
}) => {
  const [formData, setFormData] = useState({
    type: 'ROUTINE_CHECK',
    technicianName: '',
    notes: '',
    datePerformed: '',
    flightHoursAtTime: '',
    droneId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const drone = drones.find(d => d.id === initialData.droneId);
      setFormData({
        type: initialData.type,
        technicianName: initialData.technicianName,
        notes: initialData.notes || '',
        datePerformed: initialData.datePerformed,
        flightHoursAtTime: initialData.flightHoursAtTime.toString(),
        droneId: initialData.droneId,
      });
    } else {
      setFormData({
        type: 'ROUTINE_CHECK',
        technicianName: '',
        notes: '',
        datePerformed: new Date().toISOString().split('T')[0],
        flightHoursAtTime: '',
        droneId: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, drones]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.technicianName.trim()) {
      newErrors.technicianName = 'Teknisyen adı gereklidir';
    }
    if (!formData.droneId) {
      newErrors.droneId = 'Drone seçimi gereklidir';
    }
    if (!formData.datePerformed) {
      newErrors.datePerformed = 'Tarih gereklidir';
    }
    if (!formData.flightHoursAtTime) {
      newErrors.flightHoursAtTime = 'Uçuş saati gereklidir';
    } else if (parseFloat(formData.flightHoursAtTime) < 0) {
      newErrors.flightHoursAtTime = 'Uçuş saati 0\'dan küçük olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        flightHoursAtTime: parseFloat(formData.flightHoursAtTime),
      };
      onSubmit(submitData);
      onClose();
    }
  };

  const maintenanceTypes = [
    { value: 'ROUTINE_CHECK', label: 'Rutin Kontrol' },
    { value: 'BATTERY_REPLACEMENT', label: 'Batarya Değişimi' },
    { value: 'MOTOR_REPAIR', label: 'Motor Tamiri' },
    { value: 'FIRMWARE_UPDATE', label: 'Firmware Güncelleme' },
    { value: 'FULL_OVERHAUL', label: 'Komple Bakım' },
  ];

  // Sadece aktif droneları göster (RETIRED değil)
  const availableDrones = drones.filter(d => d.status !== 'RETIRED');

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
            {/* Drone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drone <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.droneId}
                onChange={(e) => {
                  setFormData({ ...formData, droneId: e.target.value });
                  if (errors.droneId) {
                    setErrors({ ...errors, droneId: '' });
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.droneId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Drone Seçin</option>
                {availableDrones.map((drone) => (
                  <option key={drone.id} value={drone.id}>
                    {drone.serialNumber} - {drone.model} ({drone.status}) - {drone.totalFlightHours} saat
                  </option>
                ))}
              </select>
              {availableDrones.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  ⚠️ Bakım yapılacak uygun drone bulunmuyor. (RETIRED olmayan dronelar)
                </p>
              )}
              {errors.droneId && <p className="mt-1 text-sm text-red-600">{errors.droneId}</p>}
            </div>

            {/* Maintenance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bakım Tipi <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {maintenanceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Technician Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teknisyen Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.technicianName}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.technicianName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Teknisyen adını girin"
              />
              {errors.technicianName && <p className="mt-1 text-sm text-red-600">{errors.technicianName}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bakım Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.datePerformed}
                onChange={(e) => setFormData({ ...formData, datePerformed: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.datePerformed ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.datePerformed && <p className="mt-1 text-sm text-red-600">{errors.datePerformed}</p>}
            </div>

            {/* Flight Hours at Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bakım Anındaki Uçuş Saati <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.flightHoursAtTime}
                onChange={(e) => setFormData({ ...formData, flightHoursAtTime: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.flightHoursAtTime ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Örn: 125.5"
              />
              {errors.flightHoursAtTime && <p className="mt-1 text-sm text-red-600">{errors.flightHoursAtTime}</p>}
              {formData.droneId && (
                <p className="mt-1 text-xs text-gray-500">
                  Seçili drone'un toplam uçuş saati: {drones.find(d => d.id === formData.droneId)?.totalFlightHours || 0}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Bakım hakkında ek notlar..."
              />
            </div>

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
                disabled={availableDrones.length === 0 && !initialData}
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

export default MaintenanceFormModal;