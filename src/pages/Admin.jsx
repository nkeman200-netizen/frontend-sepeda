import { useState, useEffect } from 'react';
import { resolvePath, useNavigate } from 'react-router-dom'; // 👈 PASTIKAN INI ADA
import Swal from 'sweetalert2';
import api from '../api';

function Admin() {
  // 1. DEKLARASI STATE (Ingatan React)
  // Cara bacanya: variabel 'username', fungsi pengubahnya 'setUsername', nilai awalnya '' (kosong)
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pesanError, setPesanError] = useState('');
    const [sepedaList, setSepedaList]= useState([]);
    const [merkInput, setMerkInput]= useState('');
    const [riwayatList, setRiwayatList]= useState([]);
    const [activeTab, setActiveTab] = useState('sepeda');
    const navigate= useNavigate();

    const muatSepeda=async ()=>{   
        setPesanError('');
        try {
        const response= await api.get('/sepeda');
        setSepedaList(response.data.content) //response bosy disimpen di response.data.content (kalo data nya array/banyak)
        } catch (error) {
        setPesanError("gagal menghubungi server");
        }
    }

    const tambahSepeda= async (e)=>{
        e.preventDefault(); //biar setiap perubahan di event, selalu terupdate
        setPesanError('');
        try {
            await api.post('/sepeda',{ merk: merkInput }); //body request
            Swal.fire('Berhasil', 'Sepeda berhasil ditambahkan','info') //swal dulu baru muat sepeda
            setMerkInput('');
            muatSepeda();
        } catch (error) {
            setPesanError('eror di fetch')
        }
        
    }
    
    const hapusSepeda= async (idSepeda)=>{
        Swal.fire({
            title:'Hapus sepeda?',
            text:'Sepeda akan dihapus',
            icon:'warning',
            showCancelButton:true,
            cancelButtonText:'Batal',
            confirmButtonText:'Hapus'
        }).then(async(r)=>{ //r mewakili parameter respon dari fire 
            if (r.isConfirmed) {
                setPesanError('')
                try {
                    const response=  await api.delete('/sepeda/'+idSepeda);
                    Swal.fire(response.data.status, response.data.pesan ,response.data.icon)
                    if (response.data.icon=="success") {
                        muatSepeda();
                    }
                } catch (error) {
                    setPesanError('eror ga bisa fetch hapus '+error)
                }
            }
        })
    }

    const editSepeda = async (sepeda) => { //ambil obejk utuh sepeda    
        Swal.fire({
            title: 'Edit Sepeda',
            html: `
                <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="width: 40%; font-weight: bold; font-size: 25px; padding: 5px 0;">Sepeda:</td>
                        <td><input id="swal-merk" class="swal2-input" autocomplete="off" value="${sepeda.merk}"></td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; font-size: 25px; padding: 5px 0;">Status:</td>
                        <td><input id="swal-status" autocomplete="off" class="swal2-input" value="${sepeda.status}"></td>
                    </tr>
                </table>
            `, //pake html biar fleksibel, plush biar bisa hapus auto-complete nyebelin
            showCancelButton: true,
            confirmButtonText: 'Simpan Perubahan',
            cancelButtonText: 'Batal',
            // preConfirm: Mengambil data dari input HTML murni sebelum dikirim
            preConfirm: () => { 
                const merk = document.getElementById('swal-merk').value;
                const status = document.getElementById('swal-status').value;
                if (!merk || !status) {
                    Swal.showValidationMessage('Semua data harus diisi!');
                    return false;
                }
                return { merk, status }; //rerturn akan langsung masuk ke r.value. nama variabel harus sama dengan paramete reqrest body
            }
        }).then(async (r)=>{
            if(r.isConfirmed){
                try {
                    await api.put('/sepeda/'+sepeda.id, r.value); //karna variabelnya udh disamakan, bisa langsung panggil ajah
                    muatSepeda();
                    Swal.fire('Berhasil', 'Sepeda berhasil diedit','info')
                } catch (error) {
                    setPesanError('eror gagal menghubungi server '+error)
                }
            }
        })
    }

    const lihatPinjam= async (idSepeda)=>{
        setPesanError('')
        try {
            const response = await api.get('/pinjam/riwayat/'+idSepeda);
            Swal.fire({
                title:'🚴 INFORMASI PEMINJAMAN',
                html:`
                    <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="width: 40%; font-weight: bold; padding: 5px 0;">Sepeda</td> 
                            <td>: ${response.data.merkSepeda}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; padding: 5px 0;">Peminjam</td>
                            <td>: ${response.data.username}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; padding: 5px 0;">Durasi</td>
                            <td>: ${response.data.durasi}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; padding: 5px 0;">Waktu Pinjam</td>
                            <td>: ${new Date(response.data.waktuPinjam).toLocaleString('id-ID')}</td>
                        </tr>
                    </table>
                `,
                icon:'info'
            })
        } catch (error) {
            setPesanError('eror server')
        }
    }

    const muatRiwayat= async ()=>{
        setPesanError('')
        try {
            const response=  await api.get("/pinjam/semua");
            setRiwayatList(response.data);
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
                    'Kamu telah keluar dari sistem.',
                    'success'
                );
            }
        })
    }
    
    // SIHIR TAHAN F5: Cek memori saat halaman pertama kali dibuka
    useEffect(() => {
        const token = localStorage.getItem('TOKEN');// Ambil ingatan pinjam
        if (token) { //kalo dia punya token aja
            setIsLoggedIn(true);
            muatRiwayat();
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
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
                <div>       
                    <h1 className="text-3xl font-extrabold text-gray-800">Sepeda Kampus</h1>
                </div>

                {/* Bagian Menu Tengah */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('sepeda')}
                        className={`px-4 py-2 font-bold rounded-md transition ${activeTab === 'sepeda' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        🚲 Kelola Sepeda
                    </button>
                    <button 
                        onClick={() => setActiveTab('riwayat')}
                        className={`px-4 py-2 font-bold rounded-md transition ${activeTab === 'riwayat' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        📜 Riwayat
                    </button>
                </div>

                <button onClick={() => handleLogout()} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-semibold transition">
                    Logout
                </button>
            </div>

            
            {activeTab === "sepeda" ? (
                <>
                    {/* Section Kelola Sepeda (Form) */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Manajemen Sepeda</h2>
                        {/* Pesan eror cetak */}
                        {pesanError && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                                <p>{pesanError}</p>
                            </div>
                        )}

                        {/* FORM TAMBAH SEPEDA */}
                        <form onSubmit={tambahSepeda} className="flex flex-col sm:flex-row gap-4">
                            <input 
                                type="text" 
                                placeholder="Masukkan merk sepeda baru..." 
                                value={merkInput} 
                                onChange={(e) => setMerkInput(e.target.value)} 
                                required
                                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            /> 
                            <button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition duration-200"
                            >
                                + Tambah Sepeda
                            </button>
                        </form>
                    </div>

                    {/* Grid Daftar Sepeda */}
                    {sepedaList.length === 0 ? (
                        <p className="text-gray-500 italic mb-8">Belum ada data sepeda.</p>
                    ) : (
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
                                        <button 
                                            onClick={() => editSepeda(sepeda)} 
                                            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => hapusSepeda(sepeda.id)} 
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition"
                                        >
                                            Hapus
                                        </button>
                                        
                                        {/* Tombol Lihat (Hanya muncul kalau dipinjam) */}
                                        {sepeda.status === "dipinjam" && (
                                            <button 
                                                onClick={() => lihatPinjam(sepeda.id)} 
                                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-bold shadow-sm transition"
                                            >
                                                Lihat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ):(
                <>
                    {/* Tabel Riwayat Global */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Transaksi Global</h2>
                        <div className="overflow-x-auto">
                                <table className="min-w-full text-left border-collapse">
                                    <thead className="bg-gray-800 text-white">
                                        <tr>
                                            <th className="py-3 px-4 rounded-tl-lg font-semibold">Sepeda</th>
                                            <th className="py-3 px-4 font-semibold">Peminjam</th>
                                            <th className="py-3 px-4 font-semibold">Durasi</th>
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
                                            <td className="py-3 px-4">{item.durasi}</td>
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
                </>
            )}
        </div>
        );
    }
}
export default Admin;