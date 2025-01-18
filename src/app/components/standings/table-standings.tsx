export const TableStandings = () => {
    return (
        <>
            <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Tabla de Posiciones</h2>
                    <button className="text-sm text-teal-600 hover:text-teal-700">Ver completa</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500">
                                <th className="pb-4">Pos</th>
                                <th className="pb-4">Equipo</th>
                                <th className="pb-4">PJ</th>
                                <th className="pb-4">PTS</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { pos: 1, team: "Liga", played: 11, points: 25 },
                                { pos: 2, team: "Aucas", played: 11, points: 23 },
                                { pos: 3, team: "Nacional", played: 11, points: 21 },
                                { pos: 4, team: "Barcelona", played: 11, points: 20 },
                            ].map((team) => (
                                <tr key={team.pos} className="border-t">
                                    <td className="py-3">{team.pos}</td>
                                    <td className="py-3 font-medium">{team.team}</td>
                                    <td className="py-3">{team.played}</td>
                                    <td className="py-3 font-bold">{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div></>
    )
}