import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 PASTIKAN INI ADA
import Swal from 'sweetalert2'
import api from '../api';
import { list } from 'postcss';
import TabelRiwayat from '../components/TabelRiwayat';
import DaftarSepeda from '../components/DaftarSepeda';
import Header from '../components/Header';

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
    // Tambahkan state ini
    const [isLoadingSepeda, setIsLoadingSepeda] = useState(false);
    // Nilai awalnya adalah 'sepeda'
    const [activeTab, setActiveTab] = useState('sepeda');
    const navigate= useNavigate();
    
    const muatSepeda=async (targetPage=0)=>{ //dafault value parameter, kalo ga diisi ya berati 0
        setIsLoadingSepeda(true)
        setPesanError('');
        try {
            const response= await api.get(`/sepeda?page=${targetPage}&size`);
            setSepedaList(response.data.content)
            setTotalPages(response.data.totalPages)
            setPage(targetPage)
        } catch (error) {
            const pesan= (error.response?.data?.pesan || "Server mati atau masalah jaringan")
            setPesanError(pesan);
        }finally{
            setIsLoadingSepeda(false)
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
                    muatSepeda()
                    muatRiwayat()
                    Swal.fire('Berhasil','Sepeda berhasil dikembalikan','success')
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
            {/* HEADER */}
            <Header 
                activeTab={activeTab}
                section={"Daftar sepeda"}
                handleLogout={handleLogout}
                setActiveTab={setActiveTab}
            />

            
            {/* Notifikasi KEMBALIKAN*/}
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
            {/* EROR PESAN */}
            {pesanError && (
                <p style={{ color: 'red', marginTop: '10px' }}>{pesanError}</p>
            )}

            {/* TAB 1: AREA GRID SEPEDA */}
            {isLoadingSepeda ? ( //kalo lagi loading
                    // Tampilan saat Loading
                    <div className="flex flex-col justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-800"></div>
                        <p className="mt-4 text-lg font-semibold text-gray-600">Sedang mengambil data sepeda...</p>
                    </div>
                ) : ( //kalo ga loading
                    <>
                        {activeTab === "sepeda" ? ( //TAB SEPEDA
                            /* TAB 1: AREA GRID SEPEDA */
                            sepedaList.length === 0 ? ( //KALO KOSONG
                                <p className="text-gray-500 italic mb-8">Belum ada data sepeda.</p>
                            ) : ( //KALO ISI
                                <> 
                                    <DaftarSepeda 
                                        sepedaList={sepedaList}
                                        muatSepeda={muatSepeda}
                                        page={page}
                                        totalPages={totalPages}
                                        renderTombol={(sepeda)=>( //biasanya kan pake ()=>{return()} nah ini membedakan, dia langsung return
                                            <>
                                                {sepeda.status === "dipinjam" ? (
                                                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition">
                                                        Dipinjam
                                                    </button>
                                                ) : (
                                                    <button onClick={() => prosesPinjam(sepeda.id)} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition">
                                                        Pinjam
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    />
                                </>
                            )
                        ) : ( //TAB RIWAYAT
                            /* TAB 2: AREA TABEL RIWAYAT */
                            <TabelRiwayat riwayatList={riwayatList}/>
                        )}
                    </>
            )}
            {/* ==== SELESAI SIHIR TAB ==== */}
        </div>
        );
    }
}
export default Mahasiswa;