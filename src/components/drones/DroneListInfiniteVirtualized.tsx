import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Activity,
  Clock,
  Wrench,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { Drone, DroneStatus } from "../../types";
import {
  getDroneStatusLabel,
  getDroneStatusColor,
  getDroneModelLabel,
  formatDate,
} from "../../utils/helpers";

import DroneFormModal from "./DroneFormModal";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDroneStore } from "../../store/droneStore";

interface DroneListInfiniteVirtualizedProps {
  onSelectDrone: (drone: Drone) => void;
  onAddDrone: () => void; // Bu prop'u ekleyelim
}
const DroneListInfiniteVirtualized: React.FC<
  DroneListInfiniteVirtualizedProps
> = ({ onSelectDrone, onAddDrone }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<DroneStatus | "ALL">("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);

  const {
    drones,
    total,
    isLoading,
    error,
    fetchDrones,
    addDrone,
    updateDrone,
    deleteDrone,
    updateMaintenance,
    clearError,
  } = useDroneStore();

  // İlk yükleme
  useEffect(() => {
    fetchDrones({ page: 1, limit: 50 });
  }, []);

  // Arama ve filtre değiştiğinde
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrones({
        search: searchTerm || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        page: 1,
        limit: 50,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const getStatusDotColor = (status: DroneStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500";
      case "IN_MISSION":
        return "bg-blue-500";
      case "MAINTENANCE":
        return "bg-orange-500";
      case "RETIRED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const statusOptions: { value: DroneStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "Tümü" },
    { value: "AVAILABLE", label: "Müsait" },
    { value: "IN_MISSION", label: "Görevde" },
    { value: "MAINTENANCE", label: "Bakımda" },
    { value: "RETIRED", label: "Emekli" },
  ];

  const handleAddDrone = () => {
    setEditingDrone(null);
    setIsModalOpen(true);
  };

  const handleEditDrone = (drone: Drone, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDrone(drone);
    setIsModalOpen(true);
  };

  const handleDeleteDrone = (drone: Drone, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDrone(drone);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingDrone) {
        await updateDrone(editingDrone.id, data);
      } else {
        await addDrone(data);
      }
      setIsModalOpen(false);
      fetchDrones({
        search: searchTerm || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedDrone) {
      try {
        await deleteDrone(selectedDrone.id);
        setSelectedDrone(null);
        setIsDeleteDialogOpen(false);
        fetchDrones({
          search: searchTerm || undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
        });
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // Her bir drone için render fonksiyonu
  const renderDroneItem = (drone: Drone) => {
    return (
      <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex-1" onClick={() => onSelectDrone(drone)}>
            <div className="flex items-center space-x-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(drone.status)}`}
              />
              <h3 className="font-semibold text-gray-900">
                {drone.serialNumber}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDroneStatusColor(drone.status)}`}
              >
                {getDroneStatusLabel(drone.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {getDroneModelLabel(drone.model)}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Activity size={14} />
                <span>{drone.totalFlightHours} saat</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>Son bakım: {formatDate(drone.lastMaintenanceDate)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wrench size={14} />
                <span>Sonraki: {formatDate(drone.nextMaintenanceDueDate)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 md:mt-0 flex items-center space-x-2">
            <button
              onClick={(e) => handleEditDrone(drone, e)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => handleDeleteDrone(drone, e)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sil"
            >
              <Trash2 size={18} />
            </button>
            <div onClick={() => onSelectDrone(drone)}>
              <ChevronRight
                className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                size={20}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Yükleme durumu
  if (isLoading && drones.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-600">Dronelar yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              fetchDrones({ page: 1, limit: 50 });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Drone Filosu
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({total} drone)
            </span>
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                fetchDrones({
                  page: 1,
                  limit: 50,
                  search: searchTerm || undefined,
                  status: statusFilter !== "ALL" ? statusFilter : undefined,
                })
              }
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={onAddDrone} // Direkt prop'u kullanalım
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Yeni Drone</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Drone ara (Seri No, Model)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as DroneStatus | "ALL")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Drone List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {drones.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Drone bulunamadı</p>
          </div>
        ) : (
          drones.map((drone) => renderDroneItem(drone))
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
        <span>Toplam {total} drone gösteriliyor</span>
        {isLoading && (
          <span className="text-blue-600 flex items-center space-x-1">
            <Loader2 className="animate-spin" size={14} />
            <span>Yükleniyor...</span>
          </span>
        )}
      </div>

      {/* Modals */}
      <DroneFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingDrone}
        title={editingDrone ? "Drone Düzenle" : "Yeni Drone Ekle"}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Drone Sil"
        message={`"${selectedDrone?.serialNumber}" adlı drone'u silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmLabel="Evet, Sil"
        cancelLabel="İptal"
        confirmColor="red"
      />
    </div>
  );
};

export default DroneListInfiniteVirtualized;
