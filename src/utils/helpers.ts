import type { DroneStatus, DroneModel, MissionStatus, MissionType, MaintenanceType } from '../types';

export const getDroneStatusLabel = (status: DroneStatus): string => {
  const labels: Record<DroneStatus, string> = {
    'AVAILABLE': 'Müsait',
    'IN_MISSION': 'Görevde',
    'MAINTENANCE': 'Bakımda',
    'RETIRED': 'Emekli'
  };
  return labels[status] || status;
};

export const getDroneStatusColor = (status: DroneStatus): string => {
  const colors: Record<DroneStatus, string> = {
    'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
    'IN_MISSION': 'bg-blue-100 text-blue-700 border-blue-200',
    'MAINTENANCE': 'bg-orange-100 text-orange-700 border-orange-200',
    'RETIRED': 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getDroneModelLabel = (model: DroneModel): string => {
  const labels: Record<DroneModel, string> = {
    'PHANTOM_4': 'Phantom 4',
    'MATRICE_300': 'Matrice 300 RTK',
    'MAVIC_3_ENTERPRISE': 'Mavic 3 Enterprise'
  };
  return labels[model] || model;
};

export const getMissionStatusLabel = (status: MissionStatus): string => {
  const labels: Record<MissionStatus, string> = {
    'SCHEDULED': 'Planlandı',
    'IN_PROGRESS': 'Devam Ediyor',
    'COMPLETED': 'Tamamlandı',
    'CANCELLED': 'İptal Edildi',
    'ABORTED': 'Durduruldu'
  };
  return labels[status] || status;
};

export const getMissionStatusColor = (status: MissionStatus): string => {
  const colors: Record<MissionStatus, string> = {
    'SCHEDULED': 'text-blue-600 bg-blue-50',
    'IN_PROGRESS': 'text-green-600 bg-green-50',
    'COMPLETED': 'text-gray-600 bg-gray-50',
    'CANCELLED': 'text-red-600 bg-red-50',
    'ABORTED': 'text-red-600 bg-red-50'
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};

export const getMissionTypeLabel = (type: MissionType): string => {
  const labels: Record<MissionType, string> = {
    'WIND_TURBINE_INSPECTION': 'Rüzgar Türbini İnceleme',
    'SOLAR_PANEL_SURVEY': 'Güneş Paneli Survey',
    'POWER_LINE_PATROL': 'Enerji Hattı Kontrolü'
  };
  return labels[type] || type;
};

export const getMaintenanceTypeLabel = (type: MaintenanceType): string => {
  const labels: Record<MaintenanceType, string> = {
    'ROUTINE_CHECK': 'Rutin Kontrol',
    'BATTERY_REPLACEMENT': 'Batarya Değişimi',
    'MOTOR_REPAIR': 'Motor Tamiri',
    'FIRMWARE_UPDATE': 'Firmware Güncelleme',
    'FULL_OVERHAUL': 'Komple Bakım'
  };
  return labels[type] || type;
};

export const getMaintenanceTypeColor = (type: MaintenanceType): string => {
  const colors: Record<MaintenanceType, string> = {
    'ROUTINE_CHECK': 'bg-blue-100 text-blue-700',
    'BATTERY_REPLACEMENT': 'bg-yellow-100 text-yellow-700',
    'MOTOR_REPAIR': 'bg-red-100 text-red-700',
    'FIRMWARE_UPDATE': 'bg-purple-100 text-purple-700',
    'FULL_OVERHAUL': 'bg-orange-100 text-orange-700'
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('tr-TR');
};