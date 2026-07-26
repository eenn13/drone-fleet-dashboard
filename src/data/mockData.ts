import type { Drone, Mission, MaintenanceLog } from '../types';

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// Drone verileri
export const mockDrones: Drone[] = [
  {
    id: 'DRN-001',
    serialNumber: 'SKY-A7B3-9C2D',
    model: 'MATRICE_300',
    status: 'AVAILABLE',
    totalFlightHours: 245.5,
    lastMaintenanceDate: '2026-07-10',
    nextMaintenanceDueDate: '2026-08-10',
    registrationTimestamp: '2025-01-15T10:30:00Z'
  },
  {
    id: 'DRN-002',
    serialNumber: 'SKY-F4E1-8D3A',
    model: 'MAVIC_3_ENTERPRISE',
    status: 'IN_MISSION',
    totalFlightHours: 189.3,
    lastMaintenanceDate: '2026-07-15',
    nextMaintenanceDueDate: '2026-07-22',
    registrationTimestamp: '2025-03-20T14:15:00Z'
  },
  {
    id: 'DRN-003',
    serialNumber: 'SKY-C2D4-7F8E',
    model: 'PHANTOM_4',
    status: 'MAINTENANCE',
    totalFlightHours: 120.7,
    lastMaintenanceDate: '2026-07-05',
    nextMaintenanceDueDate: '2026-08-05',
    registrationTimestamp: '2025-06-10T09:00:00Z'
  },
  {
    id: 'DRN-004',
    serialNumber: 'SKY-E5F7-6G9H',
    model: 'MAVIC_3_ENTERPRISE',
    status: 'AVAILABLE',
    totalFlightHours: 98.2,
    lastMaintenanceDate: '2026-06-20',
    nextMaintenanceDueDate: '2026-07-20',
    registrationTimestamp: '2025-08-05T16:45:00Z'
  },
  {
    id: 'DRN-005',
    serialNumber: 'SKY-B8C2-3A1D',
    model: 'PHANTOM_4',
    status: 'RETIRED',
    totalFlightHours: 67.9,
    lastMaintenanceDate: '2026-06-25',
    nextMaintenanceDueDate: '2026-07-25',
    registrationTimestamp: '2024-11-01T11:20:00Z'
  }
];

// Mission verileri
export const mockMissions: Mission[] = [
  {
    id: 'MIS-001',
    name: 'Rüzgar Türbini İnceleme - Osmaniye',
    type: 'WIND_TURBINE_INSPECTION',
    assignedDroneId: 'DRN-001',
    pilotName: 'Ahmet Yılmaz',
    siteLocation: 'Osmaniye Rüzgar Enerji Santrali',
    plannedStart: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    plannedEnd: new Date(today.getTime() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED'
  },
  {
    id: 'MIS-002',
    name: 'Güneş Paneli Survey - Konya',
    type: 'SOLAR_PANEL_SURVEY',
    assignedDroneId: 'DRN-002',
    pilotName: 'Mehmet Demir',
    siteLocation: 'Konya Güneş Enerji Santrali',
    plannedStart: new Date(today.getTime() - 30 * 60 * 1000).toISOString(),
    plannedEnd: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    actualStart: new Date(today.getTime() - 25 * 60 * 1000).toISOString(),
    status: 'IN_PROGRESS'
  },
  {
    id: 'MIS-003',
    name: 'Enerji Hattı Kontrolü - İzmir',
    type: 'POWER_LINE_PATROL',
    assignedDroneId: 'DRN-003',
    pilotName: 'Ayşe Kaya',
    siteLocation: 'İzmir - Manisa Enerji Hattı',
    plannedStart: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    plannedEnd: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    actualStart: new Date(today.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    actualEnd: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    flightHoursLogged: 2.5
  },
  {
    id: 'MIS-004',
    name: 'Rüzgar Türbini İnceleme - Çanakkale',
    type: 'WIND_TURBINE_INSPECTION',
    assignedDroneId: 'DRN-004',
    pilotName: 'Ali Öztürk',
    siteLocation: 'Çanakkale Rüzgar Enerji Santrali',
    plannedStart: new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString(),
    plannedEnd: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED'
  },
  {
    id: 'MIS-005',
    name: 'Güneş Paneli Survey - Antalya',
    type: 'SOLAR_PANEL_SURVEY',
    assignedDroneId: 'DRN-001',
    pilotName: 'Serkan Yılmaz',
    siteLocation: 'Antalya GES',
    plannedStart: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    plannedEnd: new Date(today.getTime() + 27 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED'
  },
  {
    id: 'MIS-006',
    name: 'Enerji Hattı Kontrolü - Bursa',
    type: 'POWER_LINE_PATROL',
    assignedDroneId: 'DRN-002',
    pilotName: 'Fatma Demir',
    siteLocation: 'Bursa - Eskişehir Enerji Hattı',
    plannedStart: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    plannedEnd: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    actualStart: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'ABORTED',
    abortReason: 'Hava koşulları uygun değil'
  }
];

// Maintenance Log verileri
export const mockMaintenanceLogs: MaintenanceLog[] = [
  {
    id: 'MAIN-001',
    droneId: 'DRN-001',
    type: 'ROUTINE_CHECK',
    technicianName: 'Hasan Usta',
    notes: 'Motor kontrolü, yazılım güncelleme yapıldı. Tüm sistemler çalışıyor.',
    datePerformed: '2026-07-10',
    flightHoursAtTime: 235.0
  },
  {
    id: 'MAIN-002',
    droneId: 'DRN-002',
    type: 'BATTERY_REPLACEMENT',
    technicianName: 'Fatma Tekin',
    notes: 'Eski batarya değiştirildi, yeni batarya takıldı.',
    datePerformed: '2026-07-15',
    flightHoursAtTime: 180.5
  },
  {
    id: 'MAIN-003',
    droneId: 'DRN-003',
    type: 'FIRMWARE_UPDATE',
    technicianName: 'Mehmet Usta',
    notes: 'Üretici firmware güncellemesi yapıldı.',
    datePerformed: '2026-07-05',
    flightHoursAtTime: 115.2
  },
  {
    id: 'MAIN-004',
    droneId: 'DRN-001',
    type: 'MOTOR_REPAIR',
    technicianName: 'Hasan Usta',
    notes: 'Sağ ön motor arızalıydı, değiştirildi.',
    datePerformed: '2026-06-28',
    flightHoursAtTime: 210.3
  },
  {
    id: 'MAIN-005',
    droneId: 'DRN-004',
    type: 'ROUTINE_CHECK',
    technicianName: 'Ali Usta',
    notes: 'Yıllık bakım yapıldı. Tüm sistemler kontrol edildi.',
    datePerformed: '2026-06-20',
    flightHoursAtTime: 92.0
  },
  {
    id: 'MAIN-006',
    droneId: 'DRN-005',
    type: 'FULL_OVERHAUL',
    technicianName: 'Mehmet Usta',
    notes: 'Komple bakım yapıldı. Drone emekliye ayrılmadan önce son kontrol.',
    datePerformed: '2026-06-25',
    flightHoursAtTime: 65.4
  }
];