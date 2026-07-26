import type { Drone, Mission, MaintenanceLog } from '../types';

// ============ DRONE ÜRETİMİ ============
const generateSerialNumber = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SKY-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const droneModels = ['PHANTOM_4', 'MATRICE_300', 'MAVIC_3_ENTERPRISE'] as const;
const droneStatuses = ['AVAILABLE', 'IN_MISSION', 'MAINTENANCE', 'RETIRED'] as const;

export const generateMockDrones = (count: number): Drone[] => {
  const drones: Drone[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const lastMaintenance = new Date(now);
    lastMaintenance.setDate(lastMaintenance.getDate() - Math.floor(Math.random() * 90));
    
    const nextMaintenance = new Date(lastMaintenance);
    nextMaintenance.setDate(nextMaintenance.getDate() + 30 + Math.floor(Math.random() * 30));
    
    const registration = new Date(now);
    registration.setDate(registration.getDate() - Math.floor(Math.random() * 365));
    
    drones.push({
      id: `DRN-${String(i + 1).padStart(3, '0')}`,
      serialNumber: generateSerialNumber(),
      model: droneModels[Math.floor(Math.random() * droneModels.length)],
      status: droneStatuses[Math.floor(Math.random() * droneStatuses.length)],
      totalFlightHours: Math.round((Math.random() * 500 + 10) * 10) / 10,
      lastMaintenanceDate: lastMaintenance.toISOString().split('T')[0],
      nextMaintenanceDueDate: nextMaintenance.toISOString().split('T')[0],
      registrationTimestamp: registration.toISOString(),
    });
  }
  
  return drones;
};

// ============ MISSION ÜRETİMİ ============
const missionTypes = ['WIND_TURBINE_INSPECTION', 'SOLAR_PANEL_SURVEY', 'POWER_LINE_PATROL'] as const;
const missionStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ABORTED'] as const;
const pilotNames = [
  'Ahmet Yılmaz', 'Mehmet Demir', 'Ayşe Kaya', 'Ali Öztürk', 
  'Serkan Yılmaz', 'Fatma Demir', 'Hasan Usta', 'Zeynep Çelik',
  'Murat Aydın', 'Elif Yıldız', 'Can Özkan', 'Selin Korkmaz'
];
const locations = [
  'İstanbul Merkez', 'Ankara OSB', 'İzmir Alsancak', 'Bursa Nilüfer',
  'Antalya GES', 'Konya Ovası', 'Çanakkale Rüzgar Enerji', 'Osmaniye RES',
  'Manisa Organize Sanayi', 'Eskişehir Teknopark', 'Adana Çimento', 'Mersin Liman'
];

export const generateMockMissions = (droneIds: string[], count: number): Mission[] => {
  const missions: Mission[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const plannedStart = new Date(now);
    plannedStart.setHours(plannedStart.getHours() + Math.floor(Math.random() * 72) - 24);
    
    const plannedEnd = new Date(plannedStart);
    plannedEnd.setHours(plannedEnd.getHours() + 2 + Math.floor(Math.random() * 4));
    
    const status = missionStatuses[Math.floor(Math.random() * missionStatuses.length)];
    const droneId = droneIds[Math.floor(Math.random() * droneIds.length)];
    
    const mission: Mission = {
      id: `MIS-${String(i + 1).padStart(3, '0')}`,
      name: `${missionTypes[Math.floor(Math.random() * missionTypes.length)].replace(/_/g, ' ')} - ${locations[Math.floor(Math.random() * locations.length)]}`,
      type: missionTypes[Math.floor(Math.random() * missionTypes.length)],
      assignedDroneId: droneId,
      pilotName: pilotNames[Math.floor(Math.random() * pilotNames.length)],
      siteLocation: locations[Math.floor(Math.random() * locations.length)],
      plannedStart: plannedStart.toISOString(),
      plannedEnd: plannedEnd.toISOString(),
      status: status,
    };

    // COMPLETED veya ABORTED ise actual dates ekle
    if (status === 'COMPLETED' || status === 'ABORTED') {
      const actualStart = new Date(plannedStart);
      actualStart.setHours(actualStart.getHours() + Math.floor(Math.random() * 2));
      mission.actualStart = actualStart.toISOString();
      
      const actualEnd = new Date(actualStart);
      actualEnd.setHours(actualEnd.getHours() + 1 + Math.floor(Math.random() * 3));
      mission.actualEnd = actualEnd.toISOString();
      
      if (status === 'COMPLETED') {
        mission.flightHoursLogged = Math.round((Math.random() * 5 + 0.5) * 10) / 10;
      }
      
      if (status === 'ABORTED') {
        const abortReasons = [
          'Hava koşulları uygun değil',
          'Teknik arıza',
          'Pilot müdahalesi',
          'Güvenlik ihlali',
          'Batarya yetersiz'
        ];
        mission.abortReason = abortReasons[Math.floor(Math.random() * abortReasons.length)];
      }
    }
    
    missions.push(mission);
  }
  
  return missions;
};

// ============ MAINTENANCE LOG ÜRETİMİ ============
const maintenanceTypes = ['ROUTINE_CHECK', 'BATTERY_REPLACEMENT', 'MOTOR_REPAIR', 'FIRMWARE_UPDATE', 'FULL_OVERHAUL'] as const;
const technicianNames = [
  'Hasan Usta', 'Fatma Tekin', 'Mehmet Usta', 'Ali Usta',
  'Zeynep Mühendis', 'Can Teknisyen', 'Ece Bakım', 'Murat Usta'
];

export const generateMockMaintenanceLogs = (drones: Drone[], count: number): MaintenanceLog[] => {
  const logs: MaintenanceLog[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const drone = drones[Math.floor(Math.random() * drones.length)];
    const datePerformed = new Date(now);
    datePerformed.setDate(datePerformed.getDate() - Math.floor(Math.random() * 90));
    
    logs.push({
      id: `MAIN-${String(i + 1).padStart(3, '0')}`,
      droneId: drone.id,
      type: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
      technicianName: technicianNames[Math.floor(Math.random() * technicianNames.length)],
      notes: `${maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)]} işlemi gerçekleştirildi. ${Math.random() > 0.5 ? 'Ek not: Tüm sistemler kontrol edildi.' : ''}`,
      datePerformed: datePerformed.toISOString().split('T')[0],
      flightHoursAtTime: Math.round((Math.random() * drone.totalFlightHours) * 10) / 10,
    });
  }
  
  return logs;
};

// ============ BÜYÜK VERİ ÜRETİMİ ============
export const mockDronesLarge = generateMockDrones(1000);
export const mockMissionsLarge = generateMockMissions(
  mockDronesLarge.map(d => d.id), 
  250 // 250 mission oluşturalım
);
export const mockMaintenanceLogsLarge = generateMockMaintenanceLogs(
  mockDronesLarge,
  500 // 500 maintenance log oluşturalım
);