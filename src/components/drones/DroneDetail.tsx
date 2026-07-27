import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Battery, Wrench, Calendar, Clock, 
  Activity, User, MapPin, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, XCircle, Loader,
  Info, Hash, Tag, Calendar as CalendarIcon
} from 'lucide-react';
import type { Drone, Mission, MaintenanceLog } from '../../types';
import { 
  getDroneStatusLabel, 
  getDroneStatusColor, 
  getDroneModelLabel,
  getMissionStatusLabel, 
  getMissionStatusColor, 
  getMissionTypeLabel,
  getMaintenanceTypeLabel,
  getMaintenanceTypeColor,
  formatDate,
  formatDateTime 
} from '../../utils/helpers';
import { useMissionStore } from '../../store/missionStore';
import { useMaintenanceStore } from '../../store/maintenanceStore';

interface DroneDetailProps {
  drone: Drone;
  missions: Mission[];
  maintenanceLogs: MaintenanceLog[];
  onBack: () => void;
}

const DroneDetail: React.FC<DroneDetailProps> = ({ 
  drone,
  onBack 
}) => {
  const [showMissions, setShowMissions] = useState<boolean>(true);
  const [showMaintenance, setShowMaintenance] = useState<boolean>(true);

  const { missions, fetchMissions } = useMissionStore();
  const { logs, fetchLogs } = useMaintenanceStore();

  useEffect(() => {
    fetchMissions({ droneId: drone.id, limit: 50 });
    fetchLogs({ droneId: drone.id, limit: 50 });
  }, [drone.id]);

  const droneMissions = missions.filter((m) => m.assignedDroneId === drone.id);
  const droneMaintenance = logs.filter((m) => m.droneId === drone.id);

  const getStatusDotColor = (status: string) => {
    switch(status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'IN_MISSION': return 'bg-blue-500';
      case 'MAINTENANCE': return 'bg-orange-500';
      case 'RETIRED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMissionStatusIcon = (status: string) => {
    switch(status) {
      case 'SCHEDULED': return <Calendar size={16} className="text-blue-500" />;
      case 'IN_PROGRESS': return <Loader size={16} className="text-green-500 animate-spin" />;
      case 'COMPLETED': return <CheckCircle size={16} className="text-green-500" />;
      case 'CANCELLED': return <XCircle size={16} className="text-red-500" />;
      case 'ABORTED': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Calendar size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="ml-2 font-medium">Geri Dön</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusDotColor(drone.status)}`} />
              <h2 className="text-2xl font-bold text-gray-900">{drone.serialNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDroneStatusColor(drone.status)}`}>
                {getDroneStatusLabel(drone.status)}
              </span>
            </div>
            <p className="text-gray-500 mt-1">{getDroneModelLabel(drone.model)}</p>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Hash size={14} />
                <span>ID: {drone.id}</span>
              </span>
              <span className="flex items-center space-x-1">
                <CalendarIcon size={14} />
                <span>Kayıt: {formatDate(drone.registrationTimestamp)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Uçuş Saati</span>
            <Activity size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{drone.totalFlightHours}</p>
          <p className="text-xs text-gray-400">Toplam saat</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Son Bakım</span>
            <Wrench size={16} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(drone.lastMaintenanceDate)}
          </p>
          <p className="text-xs text-gray-400">
            Sonraki: {formatDate(drone.nextMaintenanceDueDate)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Toplam Görev</span>
            <Calendar size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{droneMissions.length}</p>
          <p className="text-xs text-gray-400">Tamamlanan: {droneMissions.filter(m => m.status === 'COMPLETED').length}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Bakım Kaydı</span>
            <Info size={16} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{droneMaintenance.length}</p>
          <p className="text-xs text-gray-400">Toplam bakım</p>
        </div>
      </div>

      {/* Görev Geçmişi */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={() => setShowMissions(!showMissions)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20} />
            Görev Geçmişi
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({droneMissions.length} görev)
            </span>
          </h3>
          {showMissions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showMissions && (
          <div className="mt-4 space-y-3">
            {droneMissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Bu drone için görev bulunmuyor</p>
            ) : (
              droneMissions.map((mission: Mission) => (
                <div key={mission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{mission.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMissionStatusColor(mission.status)}`}>
                          <span className="flex items-center space-x-1">
                            {getMissionStatusIcon(mission.status)}
                            <span>{getMissionStatusLabel(mission.status)}</span>
                          </span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Tip:</span>
                          <span>{getMissionTypeLabel(mission.type)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span>{mission.pilotName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{mission.siteLocation}</span>
                        </div>
                        {mission.flightHoursLogged && (
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{mission.flightHoursLogged} saat uçuş</span>
                          </div>
                        )}
                        {mission.abortReason && (
                          <div className="flex items-center space-x-1 col-span-2 text-red-600">
                            <AlertCircle size={14} />
                            <span>İptal nedeni: {mission.abortReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <p>Planlanan: {formatDate(mission.plannedStart)}</p>
                      {mission.actualStart && (
                        <p className="text-xs">Başlangıç: {formatDateTime(mission.actualStart)}</p>
                      )}
                      {mission.actualEnd && (
                        <p className="text-xs">Bitiş: {formatDateTime(mission.actualEnd)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bakım Geçmişi */}
      <div className="p-6">
        <button
          onClick={() => setShowMaintenance(!showMaintenance)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Wrench className="mr-2 text-orange-500" size={20} />
            Bakım Geçmişi
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({droneMaintenance.length} kayıt)
            </span>
          </h3>
          {showMaintenance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {showMaintenance && (
          <div className="mt-4 space-y-3">
            {droneMaintenance.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Bu drone için bakım kaydı bulunmuyor</p>
            ) : (
              droneMaintenance.map((record: MaintenanceLog) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceTypeColor(record.type)}`}>
                          {getMaintenanceTypeLabel(record.type)}
                        </span>
                        <span className="text-sm text-gray-500">#{record.id}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{record.notes || 'Not girilmemiş'}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-500 flex items-center">
                          <User size={14} className="mr-1" />
                          {record.technicianName}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock size={14} className="mr-1" />
                          {record.flightHoursAtTime} saat uçuş
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <p>{formatDate(record.datePerformed)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DroneDetail;