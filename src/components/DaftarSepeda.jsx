function DaftarSepeda({sepedaList, muatSepeda, page, totalPages, renderTombol}) {
    return(
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sepedaList.map((sepeda) => (
                    <div key={sepeda.id} className={`p-6 rounded-lg shadow-sm border-l-4 flex flex-col justify-between transition-all hover:shadow-md ${sepeda.status === 'dipinjam' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{sepeda.merk}</h3>
                            <p className={`text-sm font-semibold mt-1 uppercase tracking-wider ${sepeda.status === 'dipinjam' ? 'text-red-600' : 'text-green-600'}`}>
                                {sepeda.status}
                            </p>
                        </div>
                        {/* deretan tombol */}
                        <div className="mt-6 flex gap-2">
                            {renderTombol(sepeda)}
                        </div>
                    </div>
                ))}
            </div>
            {/* Kontrol Paginasi */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <button onClick={() => muatSepeda(page - 1)} disabled={page === 0} className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-gray-700">
                    Sebelumnya
                </button>
                <span className="font-semibold text-gray-700">
                    Halaman {page + 1} dari {totalPages}
                </span>
                <button onClick={() => muatSepeda(page + 1)} disabled={page + 1 >= totalPages} className="px-4 py-2 bg-gray-800 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-gray-700">
                    Selanjutnya
                </button>
            </div>
            </>
    );
}
export default DaftarSepeda;