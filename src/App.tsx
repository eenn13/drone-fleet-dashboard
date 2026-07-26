import { useState } from "react";
import Layout from "./components/Layout";
import StatsCard from "./components/dashboard/StatsCard";
import MaintenanceAlerts from "./components/dashboard/MaintenanceAlerts";
import MissionsView from "./components/dashboard/MissionsView";
import DroneListInfiniteVirtualized from "./components/drones/DroneListInfiniteVirtualized";
import DroneDetail from "./components/drones/DroneDetail";
import { Drone, Activity, Wrench, Calendar, XCircle } from "lucide-react";
import { mockDronesLarge as mockDrones } from "./data/mockDataLarge";
import { mockMissions, mockMaintenanceLogs } from "./data/mockData";
import type { Drone as DroneType } from "./types";

function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedDrone, setSelectedDrone] = useState<DroneType | null>(null);
  const [showDroneDetail, setShowDroneDetail] = useState<boolean>(false);

  // İstatistikleri hesapla
  const stats = {
    totalDrones: mockDrones.length,
    availableDrones: mockDrones.filter((d) => d.status === "AVAILABLE").length,
    inMissionDrones: mockDrones.filter((d) => d.status === "IN_MISSION").length,
    maintenanceDrones: mockDrones.filter((d) => d.status === "MAINTENANCE")
      .length,
    retiredDrones: mockDrones.filter((d) => d.status === "RETIRED").length,
    activeMissions: mockMissions.filter((m) => m.status === "IN_PROGRESS")
      .length,
    maintenanceDue: mockDrones.filter((d) => {
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

  const renderContent = () => {
    if (showDroneDetail && selectedDrone) {
      return (
        <DroneDetail
          drone={selectedDrone}
          missions={mockMissions}
          maintenanceLogs={mockMaintenanceLogs}
          onBack={handleBack}
        />
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
                <MaintenanceAlerts drones={mockDrones} />
              </div>
              <div className="h-[500px]">
                <MissionsView missions={mockMissions} drones={mockDrones} />
              </div>
            </div>

            {/* Recent Drones - Virtualized ile */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Drone Filosu
              </h3>
              <DroneListInfiniteVirtualized
                drones={mockDrones}
                onSelectDrone={handleSelectDrone}
              />
            </div>
          </div>
        );

      case "drones":
        return (
          <DroneListInfiniteVirtualized
            drones={mockDrones}
            onSelectDrone={handleSelectDrone}
          />
        );

      case "missions":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Tüm Görevler
            </h2>
            <MissionsView missions={mockMissions} drones={mockDrones} />
          </div>
        );

      case "maintenance":
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Bakım Yönetimi
            </h2>
            <MaintenanceAlerts drones={mockDrones} />
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bakım Geçmişi
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {mockMaintenanceLogs.map((record) => {
                  const drone = mockDrones.find((d) => d.id === record.droneId);
                  return (
                    <div
                      key={record.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {drone ? drone.serialNumber : "Bilinmeyen Drone"}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {record.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {record.notes || "Not girilmemiş"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Teknisyen: {record.technicianName} | Uçuş saati:{" "}
                            {record.flightHoursAtTime}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(record.datePerformed).toLocaleDateString(
                              "tr-TR",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Sayfa bulunamadı</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
