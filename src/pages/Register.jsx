import {useState, } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nim, setNim]= useState('');
    const [pesanError, setPesanError] = useState('');
    const navigate= useNavigate();//cara akases metode navigasi
    
    // 2. FUNGSI LOGIKA (Fetch ke Spring Boot)
    const handleRegister = async (e) => {
        e.preventDefault(); // Mencegah halaman refresh saat tombol submit ditekan
        setPesanError(''); // Bersihkan error sebelumnya
        try {
            await api.post('/auth/register/mahasiswa',
                { username: username, password: password, nim: nim }
            );
            Swal.fire('Berhasil daftar','Silahkan login','success')
            navigate("/login")
        } catch (error) {
            const pesan= (error.response?.data?.pesan || "Server mati atau masalah jaringan")
            setPesanError(pesan);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sistem Peminjaman Sepeda</h2>

                {/* Letakkan logika {pesanError} di sini. Gunakan style bg-red-100 seperti di Admin */}
                {pesanError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                        <p>{pesanError}</p>
                    </div>
                )}
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nim</label>
                        <input 
                            type="text" 
                            value={nim} 
                            onChange={(e) => setNim(e.target.value)} 
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-4"
                    >
                        Daftar
                    </button>
                </form>
            </div>
        </div>
    );
    
}

export default Register