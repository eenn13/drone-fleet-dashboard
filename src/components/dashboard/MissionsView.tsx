import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  Loader,
  XCircle,
  AlertCircle,
  Inbox,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import type { Drone, Mission } from "../../types";
import {
  getMissionStatusLabel,
  getMissionStatusColor,
  getMissionTypeLabel,
  formatDate,
  formatDateTime,
} from "../../utils/helpers";
import { useMissionStore } from "../../store/missionStore";
import MissionFormModal from "../missions/MissionFormModal";
import ConfirmDialog from "../common/ConfirmDialog";

interface MissionsViewProps {
  drones: Drone[];
}

const MissionsView: React.FC<MissionsViewProps> = ({ drones }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  const {
    missions,
    total,
    isLoading,
    error,
    fetchMissions,
    loadMore,
    hasMore,
    isLoadingMore,
    addMission,
    updateMission,
    deleteMission,
  } = useMissionStore();

  // Sadece ilk yüklemede fetch yap
  useEffect(() => {
    if (!initialLoadDone) {
      fetchMissions({ page: 1, limit: 20 });
      setInitialLoadDone(true);
    }
  }, [initialLoadDone]);

  // Tüm mission'ları tarihe göre sırala (önce aktif, sonra planlanmış)
  const sortedMissions = useMemo(() => {
    const active = missions.filter((m) => m.status === "IN_PROGRESS");
    const scheduled = missions
      .filter((m) => m.status === "SCHEDULED")
      .sort(
        (a, b) =>
          new Date(a.plannedStart).getTime() -
          new Date(b.plannedStart).getTime(),
      );
    const others = missions
      .filter((m) => m.status !== "IN_PROGRESS" && m.status !== "SCHEDULED")
      .sort(
        (a, b) =>
          new Date(a.plannedStart).getTime() -
          new Date(b.plannedStart).getTime(),
      );

    return [...active, ...scheduled, ...others];
  }, [missions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Calendar size={16} />;
      case "IN_PROGRESS":
        return <Loader className="animate-spin" size={16} />;
      case "COMPLETED":
        return <CheckCircle size={16} />;
      case "CANCELLED":
        return <XCircle size={16} />;
      case "ABORTED":
        return <AlertCircle size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const getDroneSerial = (droneId: string) => {
    const drone = drones.find((d) => d.id === droneId);
    return drone ? drone.serialNumber : "Bilinmeyen Drone";
  };

  const handleAddMission = () => {
    setEditingMission(null);
    setIsModalOpen(true);
  };

  const handleEditMission = (mission: Mission, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMission(mission);
    setIsModalOpen(true);
  };

  const handleDeleteMission = (mission: Mission, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMission(mission);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingMission) {
        await updateMission(editingMission.id, data);
      } else {
        await addMission(data);
      }
      setIsModalOpen(false);
      setEditingMission(null);
      // Listeyi yenile
      fetchMissions({ page: 1, limit: 20 });
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedMission) {
      try {
        await deleteMission(selectedMission.id);
        setSelectedMission(null);
        setIsDeleteDialogOpen(false);
        fetchMissions({ page: 1, limit: 20 });
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const renderMissionItem = (index: number, mission: any) => {
    const isActive = mission.status === "IN_PROGRESS";

    return (
      <div
        key={mission.id}
        className={
          isActive
            ? "border-l-4 border-green-500 bg-green-50 rounded-r-lg p-4 mb-3"
            : "border rounded-lg p-4 hover:bg-gray-50 transition-colors mb-3"
        }
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
              <span className="font-semibold text-gray-900">
                {mission.name}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getMissionStatusColor(mission.status)}`}
              >
                <span className="flex items-center space-x-1">
                  {getStatusIcon(mission.status)}
                  <span>{getMissionStatusLabel(mission.status)}</span>
                </span>
              </span>
              {isActive && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 animate-pulse">
                  🔴 CANLI
                </span>
              )}
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
            {mission.flightHoursLogged && (
              <div className="mt-1 text-sm text-gray-500">
                Uçuş saati: {mission.flightHoursLogged} saat
              </div>
            )}
            {mission.abortReason && (
              <div className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>İptal: {mission.abortReason}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <button
              onClick={(e) => handleEditMission(mission, e)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => handleDeleteMission(mission, e)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
            <div className="text-sm text-gray-500 text-right">
              <p>{formatDate(mission.plannedStart)}</p>
              <p>
                {new Date(mission.plannedStart).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {mission.actualStart && (
                <p className="text-xs text-gray-400 mt-1">
                  Başlangıç: {formatDateTime(mission.actualStart)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Yükleme durumu - Sadece ilk yüklemede göster
  if (isLoading && !initialLoadDone) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-500">Görevler yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error && missions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="text-blue-500 mr-2" size={20} />
          Görev Görünümü
        </h3>
        <div className="text-center py-8">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              setInitialLoadDone(false);
              fetchMissions({ page: 1, limit: 20 });
            }}
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
              Daha fazla görev yükleniyor...
            </span>
          </div>
        </div>
      );
    }
    if (!hasMore && missions.length > 0) {
      return (
        <div className="py-4 text-center text-sm text-gray-400">
          ✅ Tüm görevler gösteriliyor ({total} görev)
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col">
      {missions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="text-blue-500 mr-2" size={20} />
              Görev Görünümü
            </h3>
            <button
              onClick={handleAddMission}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Yeni Görev</span>
            </button>
          </div>
          <div className="text-center py-8">
            <Inbox className="text-gray-400 mx-auto mb-3" size={48} />
            <p className="text-gray-600">Henüz görev bulunmuyor</p>
            <p className="text-sm text-gray-500">
              Yeni görev oluşturmak için "Yeni Görev" butonunu kullanın
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="text-blue-500 mr-2" size={20} />
            Görev Görünümü
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({missions.length} / {total})
            </span>
          </h3>
          <div className="flex items-center space-x-2">
            {missions.filter((m) => m.status === "IN_PROGRESS").length > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium animate-pulse">
                {missions.filter((m) => m.status === "IN_PROGRESS").length}{" "}
                aktif
              </span>
            )}
            <button
              onClick={() => fetchMissions({ page: 1, limit: 20 })}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleAddMission}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Yeni Görev</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <Virtuoso
          style={{ height: "100%" }}
          totalCount={sortedMissions.length}
          itemContent={(index) =>
            renderMissionItem(index, sortedMissions[index])
          }
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
      <MissionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMission(null);
        }}
        onSubmit={handleSubmit}
        drones={drones}
        initialData={editingMission}
        title={editingMission ? "Görev Düzenle" : "Yeni Görev Ekle"}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Görev Sil"
        message={`"${selectedMission?.name}" adlı görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Evet, Sil"
        cancelLabel="İptal"
        confirmColor="red"
      />
    </div>
  );
};

export default MissionsView;
