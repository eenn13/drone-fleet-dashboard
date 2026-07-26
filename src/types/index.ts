// Drone Modelleri
export type DroneModel = 'PHANTOM_4' | 'MATRICE_300' | 'MAVIC_3_ENTERPRISE';

// Drone Durumları
export type DroneStatus = 'AVAILABLE' | 'IN_MISSION' | 'MAINTENANCE' | 'RETIRED';

// Görev Tipleri
export type MissionType = 'WIND_TURBINE_INSPECTION' | 'SOLAR_PANEL_SURVEY' | 'POWER_LINE_PATROL';

// Görev Durumları
export type MissionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ABORTED';

// Bakım Tipleri
export type MaintenanceType = 'ROUTINE_CHECK' | 'BATTERY_REPLACEMENT' | 'MOTOR_REPAIR' | 'FIRMWARE_UPDATE' | 'FULL_OVERHAUL';

// Drone Interface
export interface Drone {
  id: string; // Unique identifier
  serialNumber: string; // Format: SKY-XXXX-XXXX
  model: DroneModel;
  status: DroneStatus;
  totalFlightHours: number;
  lastMaintenanceDate: string;
  nextMaintenanceDueDate: string;
  registrationTimestamp: string;
}

// Mission Interface
export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  assignedDroneId: string;
  pilotName: string;
  siteLocation: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: MissionStatus;
  flightHoursLogged?: number;
  abortReason?: string;
}

// Maintenance Log Interface
export interface MaintenanceLog {
  id: string;
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes?: string;
  datePerformed: string;
  flightHoursAtTime: number;
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalDrones: number;
  availableDrones: number;
  inMissionDrones: number;
  maintenanceDrones: number;
  retiredDrones: number;
  activeMissions: number;
  maintenanceDue: number;
}