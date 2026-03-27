function TabelRiwayat({riwayatList}) {
    return(
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Transaksi {localStorage.getItem('USERNAME')}</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="py-3 px-4 rounded-tl-lg font-semibold">Sepeda</th>
                        <th className="py-3 px-4 font-semibold">Durasi (jam)</th>
                        <th className="py-3 px-4 font-semibold">Waktu Pinjam</th>
                        <th className="py-3 px-4 rounded-tr-lg font-semibold">Waktu Kembali</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {riwayatList.length === 0 ? (
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                            <td colSpan="3" className="py-3 px-4 text-center">Data Kosong</td>
                        </tr>
                    ) : (                   
                        riwayatList.map((item) => (
                            <tr key={item.idPinjam} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                <td className="py-3 px-4">{item.merkSepeda}</td>
                                <td className="py-3 px-4">{item.durasi}</td>
                                <td className="py-3 px-4">{new Date(item.waktuPinjam).toLocaleString('id-ID')}</td>
                                <td className="py-3 px-4">
                                    {item.waktuKembali ? new Date(item.waktuKembali).toLocaleString('id-ID') : "Belum dikembalikan"}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
    );

}

export default TabelRiwayat;