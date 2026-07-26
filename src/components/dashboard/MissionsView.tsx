import React from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, Loader, XCircle, AlertCircle } from 'lucide-react';
import type { Mission, Drone } from '../../types';
import { 
  getMissionStatusLabel, 
  getMissionStatusColor, 
  getMissionTypeLabel,
  formatDate,
  formatDateTime 
} from '../../utils/helpers';

interface MissionsViewProps {
  missions: Mission[];
  drones: Drone[];
}

const MissionsView: React.FC<MissionsViewProps> = ({ missions, drones }) => {
  const now = new Date();
  
  const upcomingMissions = missions
    .filter(m => m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime())
    .slice(0, 5);

  const activeMissions = missions.filter(m => m.status === 'IN_PROGRESS');

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'SCHEDULED': return <Calendar size={16} />;
      case 'IN_PROGRESS': return <Loader className="animate-spin" size={16} />;
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'CANCELLED': return <XCircle size={16} />;
      case 'ABORTED': return <AlertCircle size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getDroneSerial = (droneId: string) => {
    const drone = drones.find(d => d.id === droneId);
    return drone ? drone.serialNumber : 'Bilinmeyen Drone';
  };

  if (upcomingMissions.length === 0 && activeMissions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="text-blue-500 mr-2" size={20} />
          Görev Görünümü
        </h3>
        <div className="text-center py-8">
          <Calendar className="text-gray-400 mx-auto mb-3" size={48} />
          <p className="text-gray-600">Planlanmış veya aktif görev bulunmuyor</p>
          <p className="text-sm text-gray-500">Yeni görev oluşturmak için sağ üstteki butonu kullanın</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="text-blue-500 mr-2" size={20} />
          Görev Görünümü
        </h3>
        {activeMissions.length > 0 && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {activeMissions.length} aktif görev
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4 pr-1">
          {activeMissions.map((mission) => (
            <div key={mission.id} className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">{mission.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMissionStatusColor(mission.status)}`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(mission.status)}
                        <span>{getMissionStatusLabel(mission.status)}</span>
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Tip:</span>
                      <span>{getMissionTypeLabel(mission.type)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{mission.pilotName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Drone:</span>
                      <span>{getDroneSerial(mission.assignedDroneId)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{mission.siteLocation}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-right flex-shrink-0 ml-4">
                  <p>{formatDate(mission.plannedStart)}</p>
                  <p>{new Date(mission.plannedStart).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          ))}

          {upcomingMissions.map((mission) => (
            <div key={mission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">{mission.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMissionStatusColor(mission.status)}`}>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(mission.status)}
                        <span>{getMissionStatusLabel(mission.status)}</span>
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Tip:</span>
                      <span>{getMissionTypeLabel(mission.type)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{mission.pilotName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Drone:</span>
                      <span>{getDroneSerial(mission.assignedDroneId)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{mission.siteLocation}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-right flex-shrink-0 ml-4">
                  <p>{formatDate(mission.plannedStart)}</p>
                  <p>{new Date(mission.plannedStart).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionsView;