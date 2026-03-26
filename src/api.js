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

    // 3. Mesin "Satpam Pintu Keluar" (Response Interceptor) - BARU!
    api.interceptors.response.use(
        (response) => {
            // Kalau responnya sukses (200 OK), biarkan lewat
            return response;
        },
        (error) => {
            // Cek apakah server membalas error 401 atau 403 (Token mati/ditolak)
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.warn("Token sudah kadaluarsa atau tidak valid. Auto-logout berjalan...");
                
                // 1. Bersihkan semua ingatan browser
                localStorage.clear();
                
                // 2. Tendang paksa ke halaman login
                // (Catatan: Kita pakai window.location karena hook 'useNavigate' dari React Router 
                // TIDAK BISA dipakai di dalam file JavaScript biasa / di luar komponen React)
                window.location.href = '/login';
            }
            
            // Tetap lempar errornya agar bisa ditangkap oleh blok 'catch' di file jsx kamu
            return Promise.reject(error);
        }
    );

export default api;
