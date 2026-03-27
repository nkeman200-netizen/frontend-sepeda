import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 PASTIKAN INI ADA
import Swal from 'sweetalert2'
import api from '../api';
import { list } from 'postcss';

function Mahasiswa() {
  // 1. DEKLARASI STATE (Ingatan React)
  // Cara bacanya: variabel 'username', fungsi pengubahnya 'setUsername', nilai awalnya '' (kosong)
    
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [pesanError, setPesanError] = useState('');
    const [sepedaList, setSepedaList]= useState([]);
    const [riwayatList, setRiwayatList]= useState([]);
    const [idPinjamAktif,setIdPinjamAktif]= useState(null); //untuk memunculkan kembali
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const navigate= useNavigate();
    
    const muatSepeda=async (targetPage=0)=>{ //dafault value parameter, kalo ga diisi ya berati 0
        setPesanError('');
        try {
            const response= await api.get(`/sepeda?page=${targetPage}&size`);
            setSepedaList(response.data.content)
            setTotalPages(response.data.totalPages)
            setPage(targetPage)
        } catch (error) {
            const pesan= (error.response?.data?.pesan || "Server mati atau masalah jaringan")
            setPesanError(pesan);
        }
    }

    const prosesPinjam= async (idSepeda)=>{
        Swal.fire({
            title:'Masukan durasi',
            text:'Durasi peminjaman sepeda',
            input:'number',
            icon:'question',
            inputPlaceholder:'Durasi (jam)',
            inputAttributes: {min:1},
            showCancelButton:true,
            confirmButtonText:'Pinjam',
            cancelButtonText:'Batal'
        }).then(async (r)=>{
            if(r.isConfirmed){
                try {
                    await api.post("/pinjam/"+idSepeda, {durasi: parseInt(r.value)})
                    // setIdPinjamAktif(response.data.idPinjam);
                    // localStorage.setItem("PINJAM",response.data.idPinjam)
                    muatSepeda();
                    isPinjam()
                    muatRiwayat()
                    Swal.fire('Berhasil','Sepeda berhasil dipinjam','success')
                } catch (error) {
                    const pesan= (error.response?.data?.pesan || "Server mati atau masalah jaringan")
                    setPesanError(pesan);
                }
            }
        })
    }

    const prosesKembali= async (idPinjam)=>{
        setPesanError('');
        Swal.fire({
            title: 'Yakin kembalikan sepeda?',
            text:'Sepeda akan dikembalikan',
            icon:'question',
            showCancelButton:true,
            confirmButtonText:'Kembalikan',
            cancelButtonText:'Batal'
        }).then(async (r)=>{
            if (r.isConfirmed) {
                try {
                    await api.put('/pinjam/'+idPinjam+'/kembali');
                    setIdPinjamAktif(null);
                    Swal.fire('Berhasil','Sepeda berhasil dikembalikan','success')
                    muatSepeda()
                } catch (error) {
                    const pesan= (error.response?.data?.pesan || "Server mati atau masalah jaringan")
                    setPesanError(pesan);
                }
            }
        })
    }

    const isPinjam= async ()=>{ //cek apakah mahasiswa punya id pinjam yang belum dikekmbaliken
        setPesanError('')
        try {
            // Cukup panggil rute khusus ini
            const response = await api.get("/pinjam/aktif");
            
            // Kalau Backend membalas ada data (artinya dia sedang pinjam)
            if (response.data) {
                setIdPinjamAktif(response.data);
            }
        } catch (error) {
            const pesan= (error.response?.data?.pesan || "Server mati atau masalah jaringan")
            setPesanError(pesan);
        }
    }
    
    const muatRiwayat= async ()=>{
        setPesanError('')
        try {
            const response= await api.get("pinjam/riwayat");
            setRiwayatList(response.data)
        } catch (error) {
            setPesanError('server ga nyambung '+error)
        }
    }
    
    const handleLogout= async ()=>{
        Swal.fire({
            title: 'Yakin mau keluar?',
            text:"Sesi kamu akan diakhiri!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Logout!',
            cancelButtonText: 'Batal'
        }).then((result)=>{
            if (result.isConfirmed) {
                // 1. Bakar semua kartu akses (ingatan) di browser
            localStorage.removeItem('TOKEN');
            localStorage.removeItem('ROLE'); // 👈 Jangan lupa hapus role-nya juga
            
            // 2. Langsung terbang ke halaman login!
            navigate('/login');

            Swal.fire(
                'Berhasil!',
                'Kamu telah keluar',
                'success'
            )
            }
        })
    }

    // SIHIR TAHAN F5: Cek memori saat halaman pertama kali dibuka
    useEffect(() => {
        const token = localStorage.getItem('TOKEN');
        if (token) {
            setIsLoggedIn(true);
            isPinjam();
            muatRiwayat(); //kalo udh login
        }
    }, []); // Array kosong berarti HANYA JALAN SEKALI saat halaman pertama dimuat

    useEffect(()=>{
            if (isLoggedIn) {
            muatSepeda();
            }
        },[isLoggedIn])

    // 3. TAMPILAN (Jika sudah login, tampilkan layar sukses)
    if (isLoggedIn) {
        return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Peminjaman</h1>
                    <p className="text-gray-500 mt-1">Sistem Peminjaman Sepeda Kampus</p>
                </div>
                <button 
                    onClick={() => handleLogout()} 
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-semibold transition duration-200"
                >
                    Logout
                </button>
            </div>

            {/* Tabel Riwayat Global */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Transaksi {localStorage.getItem('USERNAME')}</h2>
                <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="py-3 px-4 rounded-tl-lg font-semibold">Sepeda</th>
                                    <th className="py-3 px-4 font-semibold">Peminjam</th>
                                    <th className="py-3 px-4 font-semibold">Waktu Pinjam</th>
                                    <th className="py-3 px-4 rounded-tr-lg font-semibold">Waktu Kembali</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {riwayatList.length==0?(
                                    <tr className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                        <td colSpan="4" className="py-3 px-4 text-center">Data Kosong</td>
                                    </tr>
                                ) : (                   
                                riwayatList.map((item) => (
                                <tr key={item.idPinjam} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                    <td className="py-3 px-4">{item.merkSepeda}</td>
                                    <td className="py-3 px-4">{item.username}</td>
                                    <td className="py-3 px-4">{new Date(item.waktuPinjam).toLocaleString('id-ID')}</td>
                                    <td className="py-3 px-4">{
                                        item.waktuKembali?(new Date(item.waktuKembali).toLocaleString('id-ID')) 
                                        : ("Belum dikembalikan")
                                        }</td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Notifikasi Sedang Meminjam */}
            {idPinjamAktif ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow-sm mb-8">
                    <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">
                        <span>🚲</span> Anda sedang meminjam sepeda!
                    </h3>
                    <button 
                        onClick={() => prosesKembali(idPinjamAktif)} 
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-md transition duration-200 shadow-sm"
                    >
                        Kembalikan Sepeda Sekarang
                    </button>
                </div>
            ) : null}
            
            {pesanError && (
            <p style={{ color: 'red', marginTop: '10px' }}>{pesanError}</p>
            )}
            {/* Grid Daftar Sepeda */}
            {sepedaList.length === 0 ? (
                <p className="text-gray-500 italic mb-8">Belum ada data sepeda.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {sepedaList.map((sepeda) => (
                            <div 
                                key={sepeda.id} 
                                // Sihir Kondisional Tailwind:
                                // Jika dipinjam (merah muda), jika tersedia (hijau muda). 
                                // Kita juga tambahkan garis tebal di kiri (border-l(left)-4) sebagai aksen.
                                className={`p-6 rounded-lg shadow-sm border-l-4 flex flex-col justify-between transition-all hover:shadow-md    
                                    ${sepeda.status === 'dipinjam' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}
                                `}
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{sepeda.merk}</h3>
                                    <p className={`text-sm font-semibold mt-1 uppercase tracking-wider
                                        ${sepeda.status === 'dipinjam' ? 'text-red-600' : 'text-green-600'}
                                    `}>
                                        {sepeda.status}
                                    </p>
                                </div>

                                {/* Deretan Tombol Aksi */}
                                <div className="mt-6 flex gap-2">
                                    
                                    {/* Tombol Lihat (Hanya muncul kalau dipinjam) */}
                                    {sepeda.status === "dipinjam" ? (
                                        <button 
                                            
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition"
                                        >
                                            Dipinjam
                                        </button>
                                    ) : (
                                        <button 
                                        onClick={() => prosesPinjam(sepeda.id)} 
                                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition"
                                    >
                                        Pinjam
                                    </button>
                                    )}
                                </div>
                            </div>
                            
                        ))}
                    </div>
                        {/* Kontrol Paginasi */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button 
                            onClick={() => muatSepeda(page - 1)}
                            disabled={page === 0}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-gray-700"
                        >
                            Sebelumnya
                        </button>
                        
                        <span className="font-semibold text-gray-700">
                            Halaman {page + 1} dari {totalPages}
                        </span>
                        
                        <button 
                            onClick={() => muatSepeda(page + 1)}
                            disabled={page + 1 >= totalPages}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-gray-700"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </>
            )}
        </div>
        );
    }
}
export default Mahasiswa;