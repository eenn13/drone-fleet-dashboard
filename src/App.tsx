import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import StatsCard from "./components/dashboard/StatsCard";
import MaintenanceAlerts from "./components/dashboard/MaintenanceAlerts";
import MissionsView from "./components/dashboard/MissionsView";
import DroneListInfiniteVirtualized from "./components/drones/DroneListInfiniteVirtualized";
import DroneDetail from "./components/drones/DroneDetail";
import DroneFormModal from "./components/drones/DroneFormModal";
import { Drone, Activity, Wrench, XCircle, Loader2, Inbox } from "lucide-react";
import { useDroneStore } from "./store/droneStore";
import { useUIStore } from "./store/uiStore";
import { useMissionStore } from "./store/missionStore";
import { useMaintenanceStore } from "./store/maintenanceStore";
import type { Drone as DroneType } from "./types";
import MaintenanceLogsList from "./components/maintenance/MaintenanceLogsList";

function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedDrone, setSelectedDrone] = useState<DroneType | null>(null);
  const [showDroneDetail, setShowDroneDetail] = useState<boolean>(false);
  const [editingDrone, setEditingDrone] = useState<DroneType | null>(null);

  const {
    drones,
    total,
    isLoading,
    error,
    fetchDrones,
    addDrone,
    updateDrone,
  } = useDroneStore();
  const { missions, fetchMissions } = useMissionStore();
  const { logs, fetchLogs } = useMaintenanceStore();
  const { isAddDroneModalOpen, openAddDroneModal, closeAddDroneModal } =
    useUIStore();

  // İlk yükleme
  useEffect(() => {
    fetchDrones({ page: 1, limit: 20 });
    fetchMissions({ page: 1, limit: 20 });
    fetchLogs({ page: 1, limit: 50 });
  }, []);

  const handleAddDrone = () => {
    setEditingDrone(null);
    openAddDroneModal();
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingDrone) {
        await updateDrone(editingDrone.id, data);
      } else {
        await addDrone(data);
      }
      closeAddDroneModal();
      fetchDrones({ page: 1, limit: 20 });
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  // İstatistikleri hesapla
  const stats = {
    totalDrones: total,
    availableDrones: drones.filter((d) => d.status === "AVAILABLE").length,
    inMissionDrones: drones.filter((d) => d.status === "IN_MISSION").length,
    maintenanceDrones: drones.filter((d) => d.status === "MAINTENANCE").length,
    retiredDrones: drones.filter((d) => d.status === "RETIRED").length,
    activeMissions: missions.filter((m) => m.status === "IN_PROGRESS").length,
    maintenanceDue: drones.filter((d) => {
      const nextMaintenance = new Date(d.nextMaintenanceDueDate);
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      return nextMaintenance <= sevenDaysLater && d.status !== "RETIRED";
    }).length,
  };

  const handleSelectDrone = (drone: DroneType) => {
    setSelectedDrone(drone);
    setShowDroneDetail(true);
  };

  const handleBack = () => {
    setShowDroneDetail(false);
    setSelectedDrone(null);
  };

  // Loading State
  if (isLoading && drones.length === 0) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="text-gray-600 text-lg">Veriler yükleniyor...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Error State
  if (error && drones.length === 0) {
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => fetchDrones({ page: 1, limit: 20 })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    if (showDroneDetail && selectedDrone) {
      return (
        <DroneDetail
          drone={selectedDrone}
          missions={missions}
          maintenanceLogs={logs}
          onBack={handleBack}
        />
      );
    }

    // Boş durum kontrolü - Dashboard
    if (activeTab === "dashboard" && drones.length === 0 && !isLoading) {
      return (
        <div className="space-y-6">
          {/* Stats Cards - 0 ile göster */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Toplam Drone"
              value={0}
              icon={Drone}
              color="bg-blue-500"
              subtitle="0 müsait"
            />
            <StatsCard
              title="Görevdeki Drone"
              value={0}
              icon={Activity}
              color="bg-green-500"
              subtitle="0 aktif görev"
            />
            <StatsCard
              title="Bakımda"
              value={0}
              icon={Wrench}
              color="bg-orange-500"
              subtitle="0 bakım gecikmiş"
            />
            <StatsCard
              title="Emekli"
              value={0}
              icon={XCircle}
              color="bg-gray-500"
              subtitle="0 aktif drone"
            />
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center">
              <Inbox size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Henüz Drone Eklenmemiş
              </h3>
              <p className="text-gray-500 mb-6">
                Sisteme ilk drone'u eklemek için "Yeni Drone" butonunu kullanın.
              </p>
              <button
                onClick={handleAddDrone}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Drone size={20} />
                <span>İlk Drone'u Ekle</span>
              </button>
            </div>
          </div>

          {/* Maintenance and Missions - Boş */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[500px]">
              <MaintenanceAlerts drones={[]} />
            </div>
            <div className="h-[500px]">
              <MissionsView drones={[]} />
            </div>
          </div>
        </div>
      );
    }

    // Boş durum kontrolü - Drones sayfası
    if (activeTab === "drones" && drones.length === 0 && !isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center">
            <Inbox size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Drone Bulunamadı
            </h3>
            <p className="text-gray-500 mb-6">
              Sistemde henüz hiç drone kaydı bulunmuyor.
            </p>
            <button
              onClick={handleAddDrone}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Drone size={20} />
              <span>Yeni Drone Ekle</span>
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Toplam Drone"
                value={stats.totalDrones}
                icon={Drone}
                color="bg-blue-500"
                subtitle={`${stats.availableDrones} müsait`}
              />
              <StatsCard
                title="Görevdeki Drone"
                value={stats.inMissionDrones}
                icon={Activity}
                color="bg-green-500"
                subtitle={`${stats.activeMissions} aktif görev`}
              />
              <StatsCard
                title="Bakımda"
                value={stats.maintenanceDrones}
                icon={Wrench}
                color="bg-orange-500"
                subtitle={`${stats.maintenanceDue} bakım gecikmiş`}
              />
              <StatsCard
                title="Emekli"
                value={stats.retiredDrones}
                icon={XCircle}
                color="bg-gray-500"
                subtitle={`${stats.totalDrones - stats.retiredDrones} aktif drone`}
              />
            </div>

            {/* Maintenance Alerts and Missions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-[500px]">
                <MaintenanceAlerts drones={drones} />
              </div>
              <div className="h-[500px]">
                <MissionsView drones={drones} />
              </div>
            </div>

            {/* Drone List */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Drone Filosu
              </h3>
              <DroneListInfiniteVirtualized
                onSelectDrone={handleSelectDrone}
                onAddDrone={handleAddDrone}
              />
            </div>
          </div>
        );

      case "drones":
        return (
          <DroneListInfiniteVirtualized
            onSelectDrone={handleSelectDrone}
            onAddDrone={handleAddDrone}
          />
        );

      case "missions":
        return (
          <div className="h-[calc(100vh-120px)]">
            <MissionsView drones={drones} />
          </div>
        );

      case "maintenance":
        return (
          <div className="h-[calc(100vh-120px)]">
            <MaintenanceLogsList drones={drones} />
          </div>
        );

      default:
        return <div>Sayfa bulunamadı</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}

      {/* Drone Form Modal - Global */}
      <DroneFormModal
        isOpen={isAddDroneModalOpen}
        onClose={closeAddDroneModal}
        onSubmit={handleSubmit}
        initialData={editingDrone}
        title={editingDrone ? "Drone Düzenle" : "Yeni Drone Ekle"}
      />
    </Layout>
  );
}

export default App;
