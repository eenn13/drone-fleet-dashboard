import type { Drone } from '../types';

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

const models = ['PHANTOM_4', 'MATRICE_300', 'MAVIC_3_ENTERPRISE'] as const;
const statuses = ['AVAILABLE', 'IN_MISSION', 'MAINTENANCE', 'RETIRED'] as const;

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
      model: models[Math.floor(Math.random() * models.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalFlightHours: Math.round((Math.random() * 500 + 10) * 10) / 10,
      lastMaintenanceDate: lastMaintenance.toISOString().split('T')[0],
      nextMaintenanceDueDate: nextMaintenance.toISOString().split('T')[0],
      registrationTimestamp: registration.toISOString(),
    });
  }
  
  return drones;
};

// 1000 drone oluşturalım
export const mockDronesLarge = generateMockDrones(1000);