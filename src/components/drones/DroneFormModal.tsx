import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Drone, DroneModel, DroneStatus } from '../../types';

interface DroneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Drone | null;
  title?: string;
}

const DroneFormModal: React.FC<DroneFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Yeni Drone Ekle',
}) => {
  const [formData, setFormData] = useState({
    serialNumber: '',
    model: 'MATRICE_300' as DroneModel,
    status: 'AVAILABLE' as DroneStatus,
    totalFlightHours: 0,
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
    nextMaintenanceDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    registrationTimestamp: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        serialNumber: initialData.serialNumber,
        model: initialData.model,
        status: initialData.status,
        totalFlightHours: initialData.totalFlightHours,
        lastMaintenanceDate: initialData.lastMaintenanceDate,
        nextMaintenanceDueDate: initialData.nextMaintenanceDueDate,
        registrationTimestamp: initialData.registrationTimestamp,
      });
    } else {
      // Reset form
      setFormData({
        serialNumber: '',
        model: 'MATRICE_300',
        status: 'AVAILABLE',
        totalFlightHours: 0,
        lastMaintenanceDate: new Date().toISOString().split('T')[0],
        nextMaintenanceDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        registrationTimestamp: new Date().toISOString(),
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Serial Number validation (SKY-XXXX-XXXX)
    const serialRegex = /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!serialRegex.test(formData.serialNumber)) {
      newErrors.serialNumber = 'Seri numarası SKY-XXXX-XXXX formatında olmalı (örn: SKY-A7B3-9C2D)';
    }

    if (formData.totalFlightHours < 0) {
      newErrors.totalFlightHours = 'Uçuş saati 0\'dan küçük olamaz';
    }

    const lastMaintenance = new Date(formData.lastMaintenanceDate);
    const nextMaintenance = new Date(formData.nextMaintenanceDueDate);
    if (nextMaintenance <= lastMaintenance) {
      newErrors.nextMaintenanceDueDate = 'Sonraki bakım tarihi, son bakım tarihinden sonra olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const modelOptions: DroneModel[] = ['PHANTOM_4', 'MATRICE_300', 'MAVIC_3_ENTERPRISE'];
  const statusOptions: DroneStatus[] = ['AVAILABLE', 'IN_MISSION', 'MAINTENANCE', 'RETIRED'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
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
            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seri Numarası <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value.toUpperCase() })}
                placeholder="SKY-XXXX-XXXX"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.serialNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.serialNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.serialNumber}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Format: SKY-XXXX-XXXX (X: Harf veya Rakam)</p>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value as DroneModel })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DroneStatus })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Flight Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Toplam Uçuş Saati <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.totalFlightHours}
                onChange={(e) => setFormData({ ...formData, totalFlightHours: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.totalFlightHours ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.totalFlightHours && (
                <p className="mt-1 text-sm text-red-600">{errors.totalFlightHours}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Bakım Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.lastMaintenanceDate}
                  onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sonraki Bakım Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.nextMaintenanceDueDate}
                  onChange={(e) => setFormData({ ...formData, nextMaintenanceDueDate: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nextMaintenanceDueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nextMaintenanceDueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.nextMaintenanceDueDate}</p>
                )}
              </div>
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
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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

export default DroneFormModal;