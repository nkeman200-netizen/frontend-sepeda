function Header({activeTab, section, handleLogout, setActiveTab}) {
    return(
        <>
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
                        🚲 {section}
                    </button>
                    <button 
                        onClick={() => setActiveTab('riwayat')}
                        className={`px-4 py-2 font-bold rounded-md transition ${activeTab === 'riwayat' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        📜 Riwayatku
                    </button>
                </div>

                <button onClick={() => handleLogout()} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-semibold transition">
                    Logout
                </button>
            </div>
        </>
    )
}

export default Header