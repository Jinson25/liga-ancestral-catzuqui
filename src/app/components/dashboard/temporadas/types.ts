export interface Temporada {
    id: string
    nombre: string
    liga_id: string
    fecha_inicio: string
    fecha_fin: string
}

export interface Partido {
    id: string
    temporada_id: string
    fecha: string
    equipo_local_id: string
    equipo_visitante_id: string
    goles_local: number
    goles_visitante: number
}

export interface TablaPosicion {
    equipo_id: string
    puntos: number
    ganados: number
    empatados: number
    perdidos: number
    goles_a_favor: number
    goles_en_contra: number
}

export interface EquipoEnTabla extends TablaPosicion {
    nombre_equipo: string
    partidos_jugados: number
    diferencia_goles: number
    posicion: number
}
