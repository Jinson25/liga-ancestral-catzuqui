import Image from "next/image"

export const TableStandings = ({ equipos }: {
    equipos: {
        nombre: string | null;
        logo: string | null;
        stats: {
            partidos_jugados: number;
            victorias: number;
            empates: number;
            derrotas: number;
            goles_a_favor: number;
            goles_encontra: number;
            puntos: number;
        };
    }[]
}) => {
    return (
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Tabla de Posiciones</h2>
                <button className="text-sm text-teal-600 hover:text-teal-700">
                    Ver completa
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-sm text-gray-500">
                            <th className="pb-4">Pos</th>
                            <th className="pb-4">Equipo</th>
                            <th className="pb-4"></th>
                            <th className="pb-4">PJ</th>
                            <th className="pb-4 px-1">G</th>
                            <th className="pb-4 px-1">E</th>
                            <th className="pb-4 px-1">P</th>
                            <th className="pb-4">GF</th>
                            <th className="pb-4">GC</th>
                            <th className="pb-4">DG</th>
                            <th className="pb-4">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {equipos
                            .sort((a, b) => b.stats.puntos - a.stats.puntos) // Ordena por puntos
                            .map((equipo, index) => {
                                const { partidos_jugados, victorias, empates, derrotas, goles_a_favor, goles_encontra, puntos } =
                                    equipo.stats;
                                const diferencia_goles = goles_a_favor - goles_encontra;

                                return (
                                    <tr key={index} className="border-t">
                                        <td className="py-3">{index + 1}</td>
                                        <td className="py-3">
                                            <Image
                                                src={equipo.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(equipo.nombre || 'Team')}+FC&background=0D8ABC&color=fff&size=128`}
                                                alt={equipo.nombre || "Equipo"}
                                                width={30}
                                                height={30}
                                                className="size-9 rounded-full"
                                                unoptimized
                                            />
                                        </td>
                                        <td className="py-3 font-medium">{equipo.nombre}</td>
                                        <td className="py-3">{partidos_jugados}</td>
                                        <td className="py-3">{victorias}</td>
                                        <td className="py-3">{empates}</td>
                                        <td className="py-3">{derrotas}</td>
                                        <td className="py-3">{goles_a_favor}</td>
                                        <td className="py-3">{goles_encontra}</td>
                                        <td className="py-3">{diferencia_goles}</td>
                                        <td className="py-3 font-bold">{puntos}</td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
