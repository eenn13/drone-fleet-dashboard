import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor (token eklemek için)
apiClient.interceptors.request.use(
  (config) => {
    // Token varsa ekleyelim (ileride JWT ekleyeceğiz)
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (hata yönetimi)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Sunucu hatası
      console.error('API Error:', error.response.data);
      
      // 401 Unauthorized - token süresi dolmuş
      if (error.response.status === 401) {
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
      
      // 404 Not Found
      if (error.response.status === 404) {
        console.error('Kaynak bulunamadı');
      }
      
      // 500 Internal Server Error
      if (error.response.status === 500) {
        console.error('Sunucu hatası');
      }
    } else if (error.request) {
      // İstek yapıldı ama cevap alınamadı
      console.error('No response from server:', error.request);
    } else {
      // İstek oluşturulamadı
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;