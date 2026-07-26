import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { Drone } from '../../types';
import { formatDate } from '../../utils/helpers';

interface MaintenanceAlertsProps {
  drones: Drone[];
}

const MaintenanceAlerts: React.FC<MaintenanceAlertsProps> = ({ drones }) => {
  const today = new Date();
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dueDrones = drones.filter(drone => {
    const nextMaintenance = new Date(drone.nextMaintenanceDueDate);
    return nextMaintenance <= sevenDaysLater;
  });

  const overdueDrones = dueDrones.filter(drone => {
    const nextMaintenance = new Date(drone.nextMaintenanceDueDate);
    return nextMaintenance < today;
  });

  const upcomingDrones = dueDrones.filter(drone => {
    const nextMaintenance = new Date(drone.nextMaintenanceDueDate);
    return nextMaintenance >= today;
  });

  const getStatusColor = (drone: Drone) => {
    const nextMaintenance = new Date(drone.nextMaintenanceDueDate);
    if (nextMaintenance < today) return 'text-red-600 bg-red-50 border-red-200';
    if (nextMaintenance <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getStatusIcon = (drone: Drone) => {
    const nextMaintenance = new Date(drone.nextMaintenanceDueDate);
    if (nextMaintenance < today) return <AlertTriangle className="text-red-500" size={18} />;
    if (nextMaintenance <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)) return <Clock className="text-orange-500" size={18} />;
    return <Clock className="text-yellow-500" size={18} />;
  };

  if (dueDrones.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="text-green-500 mr-2" size={20} />
          Bakım Uyarıları
        </h3>
        <div className="text-center py-8">
          <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
          <p className="text-gray-600">Tüm droneların bakım durumu iyi</p>
          <p className="text-sm text-gray-500">Önümüzdeki 7 gün içinde bakım gerektiren drone yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <AlertTriangle className="text-orange-500 mr-2" size={20} />
          Bakım Uyarıları
        </h3>
        <div className="flex space-x-3">
          <span className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full">
            Gecikmiş: {overdueDrones.length}
          </span>
          <span className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            Yakında: {upcomingDrones.length}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {dueDrones.sort((a, b) => {
          return new Date(a.nextMaintenanceDueDate).getTime() - new Date(b.nextMaintenanceDueDate).getTime();
        }).map((drone) => (
          <div
            key={drone.id}
            className={`border rounded-lg p-4 ${getStatusColor(drone)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(drone)}
                <div>
                  <p className="font-semibold text-gray-900">{drone.serialNumber}</p>
                  <p className="text-sm text-gray-600">{drone.model}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${new Date(drone.nextMaintenanceDueDate) < today ? 'text-red-600' : 'text-orange-600'}`}>
                  {new Date(drone.nextMaintenanceDueDate) < today ? 'GECİKMİŞ' : 'Bakım Zamanı'}
                </p>
                <p className="text-sm text-gray-600">
                  Tarih: {formatDate(drone.nextMaintenanceDueDate)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceAlerts;