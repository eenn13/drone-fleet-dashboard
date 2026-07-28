Drone Fleet Management - Frontend
React + TypeScript ile geliştirilmiş Drone Filosu Yönetim Paneli.

📋 Özellikler
Dashboard: Filo genel bakış, istatistikler, bakım uyarıları

Drone Yönetimi: Drone ekleme, düzenleme, silme ve detay görüntüleme

Görev Yönetimi: Görev oluşturma, düzenleme, silme ve filtreleme

Bakım Yönetimi: Bakım kayıtları, bakım uyarıları

Infinite Scroll: Büyük veri listelerinde performanslı kaydırma

Filtreleme: Görevleri durum, drone ve tarih aralığına göre filtreleme

Responsive: Mobil ve masaüstü uyumlu tasarım

Tailwind CSS: Modern ve hızlı stil yönetimi

TypeScript: Tip güvenliği

🚀 Başlangıç
Gereksinimler
Node.js (v18 veya üzeri)

npm veya yarn

Kurulum

# 1. Projeyi klonlayın
git clone <repository-url>
cd drone-fleet-dashboard

# 2. Bağımlılıkları yükleyin
npm install

# 3. Çevresel değişkenleri ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin
VITE_API_BASE_URL=http://localhost:3000/api

# Geliştirme sunucusunu başlat
npm run dev

# Uygulama http://localhost:5173 adresinde çalışacaktır

frontend/
├── src/
│   ├── api/              # API client ve servisler
│   │   └── client.ts
│   ├── components/       # React bileşenleri
│   │   ├── common/       # Ortak bileşenler
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── Pagination.tsx
│   │   ├── dashboard/    # Dashboard bileşenleri
│   │   │   ├── StatsCard.tsx
│   │   │   ├── MaintenanceAlerts.tsx
│   │   │   └── MissionsView.tsx
│   │   ├── drones/       # Drone ile ilgili bileşenler
│   │   │   ├── DroneListInfiniteVirtualized.tsx
│   │   │   ├── DroneDetail.tsx
│   │   │   └── DroneFormModal.tsx
│   │   ├── missions/     # Görev ile ilgili bileşenler
│   │   │   ├── MissionFormModal.tsx
│   │   │   └── MissionFilters.tsx
│   │   ├── maintenance/  # Bakım ile ilgili bileşenler
│   │   │   ├── MaintenanceLogsList.tsx
│   │   │   └── MaintenanceFormModal.tsx
│   │   └── Layout.tsx    # Ana layout bileşeni
│   ├── data/             # Mock veriler (geliştirme için)
│   │   └── mockData.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── usePagination.ts
│   │   └── useInfiniteVirtualizedList.ts
│   ├── services/         # API servisleri
│   │   ├── drone.service.ts
│   │   ├── mission.service.ts
│   │   └── maintenance.service.ts
│   ├── store/            # Zustand store'lar
│   │   ├── droneStore.ts
│   │   ├── missionStore.ts
│   │   ├── maintenanceStore.ts
│   │   └── uiStore.ts
│   ├── types/            # TypeScript tipleri
│   │   └── index.ts
│   ├── utils/            # Yardımcı fonksiyonlar
│   │   └── helpers.ts
│   ├── App.tsx           # Ana uygulama bileşeni
│   ├── index.css         # Global stiller
│   └── main.tsx          # Uygulama giriş noktası
├── public/               # Statik dosyalar
├── .env.example          # Örnek çevresel değişkenler
├── index.html            # HTML şablonu
├── package.json          # Proje bağımlılıkları
├── tailwind.config.js    # Tailwind CSS konfigürasyonu
├── tsconfig.json         # TypeScript konfigürasyonu
└── vite.config.ts        # Vite konfigürasyonu


🛠 Kullanılan Teknolojiler
React	18.x	UI kütüphanesi
TypeScript	5.x	Tip güvenliği
Vite	5.x	Build aracı
Tailwind CSS	3.x	CSS framework
Zustand	4.x	State yönetimi
React Virtuoso	4.x	Sanal liste
React Select	5.x	Gelişmiş select
Lucide React	0.x	İkon seti
Axios	1.x	HTTP client
Date-fns	3.x	Tarih işlemleri

📦 Ana Bağımlılıklar
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-virtuoso": "^4.6.0",
  "react-select": "^5.8.0",
  "zustand": "^4.4.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.263.0",
  "date-fns": "^3.0.0"
}

🔧 Script'ler
Script
npm run dev - Geliştirme sunucusunu başlatır
npm run build	- Production build oluşturur
npm run preview	- Build'i önizler
npm run lint - ESLint ile kod kontrolü yapar


🎯 Özellik Detayları
Dashboard
Toplam drone sayısı ve durum dağılımı

Bakım uyarıları (7 gün içinde bakım gerekenler)

Yakın zamandaki görevler

Son eklenen dronelar

Drone Yönetimi
Drone listesi (infinite scroll)

Drone ekleme, düzenleme, silme (CRUD)

Drone detay sayfası

Görev geçmişi

Bakım geçmişi

Durum filtreleme

Görev Yönetimi
Görev listesi (infinite scroll)

Görev ekleme, düzenleme, silme (CRUD)

Gelişmiş filtreleme (durum, drone, tarih aralığı)

Görev durum akışı (PLANNED → PRE_FLIGHT_CHECK → IN_PROGRESS → COMPLETED/ABORTED)

Bakım Yönetimi
Bakım kayıtları listesi (infinite scroll)

Bakım kaydı ekleme, düzenleme, silme (CRUD)

Drone durumuna göre bakım uyarıları


🔌 API Entegrasyonu
Uygulama, backend API'sine bağlanır:

typescript
// API servis örneği
import apiClient from '../api/client';
import type { Drone } from '../types';

export const droneService = {
  async getAll(filters: DroneFilters) {
    const response = await apiClient.get('/drones', { params: filters });
    return response.data;
  },
  // ...
};

API Endpoint'leri
Endpoint	Açıklama
GET /api/drones	Drone listesi
POST /api/drones	Yeni drone
GET /api/missions	Görev listesi
POST /api/missions	Yeni görev
GET /api/maintenance	Bakım listesi
POST /api/maintenance	Yeni bakım kaydı
GET /api/dashboard/health	Filo sağlık durumu

🎨 UI/UX Özellikleri
Tailwind CSS: Utility-first CSS framework

Responsive Design: Tüm ekran boyutlarına uyumlu

Dark/Light Mode: Sistem tercihine göre (geliştirme aşamasında)

Loading States: Yükleme durumları

Error Handling: Kullanıcı dostu hata mesajları

Toast Notifications: İşlem bildirimleri (geliştirme aşamasında)

Infinite Scroll: Performanslı liste yükleme

🤝 Katkıda Bulunma
Projeyi fork edin

Feature branch oluşturun (git checkout -b feature/amazing-feature)

Değişikliklerinizi commit edin (git commit -m 'Add amazing feature')

Branch'inizi push edin (git push origin feature/amazing-feature)

Pull Request oluşturun

📞 İletişim
Proje sahibi: Eren Türkel