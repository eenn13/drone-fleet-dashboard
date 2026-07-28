import React, { useEffect, useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import {
  Wrench,
  User,
  Clock,
  Calendar,
  Loader,
  Inbox,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type { Drone, MaintenanceLog } from "../../types";
import { useMaintenanceStore } from "../../store/maintenanceStore";
import { formatDate } from "../../utils/helpers";
import MaintenanceFormModal from "./MaintenanceFormModal";
import ConfirmDialog from "../common/ConfirmDialog";

interface MaintenanceLogsListProps {
  drones: Drone[];
}

const MaintenanceLogsList: React.FC<MaintenanceLogsListProps> = ({
  drones,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  const {
    logs,
    total,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchLogs,
    loadMore,
    addLog,
    updateLog,
    deleteLog,
  } = useMaintenanceStore();

  useEffect(() => {
    if (logs.length === 0) {
      fetchLogs({ page: 1, limit: 20 });
    }
  }, []);

  const getMaintenanceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ROUTINE_CHECK: "Rutin Kontrol",
      BATTERY_REPLACEMENT: "Batarya Değişimi",
      MOTOR_REPAIR: "Motor Tamiri",
      FIRMWARE_UPDATE: "Firmware Güncelleme",
      FULL_OVERHAUL: "Komple Bakım",
    };
    return labels[type] || type;
  };

  const getMaintenanceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ROUTINE_CHECK: "bg-blue-100 text-blue-700",
      BATTERY_REPLACEMENT: "bg-yellow-100 text-yellow-700",
      MOTOR_REPAIR: "bg-red-100 text-red-700",
      FIRMWARE_UPDATE: "bg-purple-100 text-purple-700",
      FULL_OVERHAUL: "bg-orange-100 text-orange-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const handleAddLog = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleEditLog = (log: MaintenanceLog, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDeleteLog = (log: MaintenanceLog, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingLog) {
        await updateLog(editingLog.id, data);
      } else {
        await addLog(data);
      }
      setIsModalOpen(false);
      fetchLogs({ page: 1, limit: 20 });
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedLog) {
      try {
        await deleteLog(selectedLog.id);
        setSelectedLog(null);
        setIsDeleteDialogOpen(false);
        fetchLogs({ page: 1, limit: 20 });
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const renderLogItem = (index: number, log: any) => {
    const drone = log.drone;

    return (
      <div
        key={log.id}
        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors mb-3"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-900">
                {drone ? drone.serialNumber : "Bilinmeyen Drone"}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceTypeColor(log.type)}`}
              >
                {getMaintenanceTypeLabel(log.type)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {log.notes || "Not girilmemiş"}
            </p>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <User size={14} />
                <span>{log.technicianName}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{log.flightHoursAtTime} saat uçuş</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <button
              onClick={(e) => handleEditLog(log, e)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => handleDeleteLog(log, e)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {formatDate(log.datePerformed)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Yükleme durumu
  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-500">Bakım kayıtları yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error && logs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-8">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchLogs({ page: 1, limit: 20 })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Footer component
  const Footer = () => {
    if (isLoadingMore) {
      return (
        <div className="py-4 text-center">
          <div className="inline-flex items-center space-x-2">
            <Loader className="animate-spin text-blue-600" size={20} />
            <span className="text-sm text-gray-500">
              Daha fazla bakım kaydı yükleniyor...
            </span>
          </div>
        </div>
      );
    }
    if (!hasMore && logs.length > 0) {
      return (
        <div className="py-4 text-center text-sm text-gray-400">
          ✅ Tüm bakım kayıtları gösteriliyor ({total} kayıt)
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Bakım Geçmişi</h2>
            <button
              onClick={handleAddLog}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Yeni Bakım</span>
            </button>
          </div>
          <div className="text-center py-12">
            <Inbox className="text-gray-400 mx-auto mb-3" size={48} />
            <p className="text-gray-500 text-lg">
              Henüz bakım kaydı bulunmuyor
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Yeni bakım kaydı eklemek için "Yeni Bakım" butonunu kullanın
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Bakım Geçmişi
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({logs.length} / {total})
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchLogs({ page: 1, limit: 20 })}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleAddLog}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Yeni Bakım</span>
            </button>
          </div>
        </div>
      )}

      <div className="h-[500px]">
        <Virtuoso
          style={{ height: "100%" }}
          totalCount={logs.length}
          itemContent={(index) => renderLogItem(index, logs[index])}
          overscan={10}
          endReached={() => {
            if (hasMore && !isLoadingMore) {
              loadMore();
            }
          }}
          components={{
            Footer: Footer,
          }}
        />
      </div>

      {/* Modals */}
      <MaintenanceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLog(null);
        }}
        onSubmit={handleSubmit}
        drones={drones}
        initialData={editingLog}
        title={editingLog ? "Bakım Kaydı Düzenle" : "Yeni Bakım Kaydı Ekle"}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Bakım Kaydı Sil"
        message={`Bu bakım kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Evet, Sil"
        cancelLabel="İptal"
        confirmColor="red"
      />
    </div>
  );
};

export default MaintenanceLogsList;
