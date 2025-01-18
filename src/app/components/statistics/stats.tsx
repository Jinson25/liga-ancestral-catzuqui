export const Stats = () => {
    return (
        <>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
                <div className="space-y-4">
                    {[
                        { label: "Victorias", value: 8 },
                        { label: "Empates", value: 2 },
                        { label: "Derrotas", value: 1 },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                            <span className="text-gray-600">{stat.label}</span>
                            <span className="font-bold">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}