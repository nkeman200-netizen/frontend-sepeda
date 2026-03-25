import axios from 'axios';

// 1. Buat "Pabrik" Axios khusus untuk proyek kita
const api = axios.create({
    // Gunakan variabel lingkungan VITE_API_URL, jika tidak ada, gunakan localhost sebagai fallback
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});
    // 2. Pasang Mesin "Suntikan Otomatis" (Interceptor)
    // Mesin ini akan menyela (intercept) SETIAP request SEBELUM dikirim ke server
    api.interceptors.request.use(
    (config) => {
        // Ambil token dari ingatan browser
        const token = localStorage.getItem('TOKEN');
        
        // Kalau tokennya ada, suntikkan ke dalam Header Authorization!
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config; // Lanjutkan pengiriman paket!
    },
    (error) => {
        return Promise.reject(error);
    }
    );

export default api;
