export type UserRole = 'presidente' | 'vocal' | 'equipo' | 'public'

export interface User {
    id: string
    correo: string
    nombre: string
    rol: UserRole
    equipo_id?: string // ID del equipo si el rol es 'equipo'
}

export interface Liga {
    id: string
    nombre: string
    presidente_id: string
    vocales: string[] // IDs de los vocales
}

export interface Temporada {
    id: string
    liga_id: string
    nombre: string
    fecha_inicio: string
    fecha_fin: string | null
    estado: 'preparacion' | 'en_curso' | 'finalizada'
    formato: FormatoTemporada
}

export interface FormatoTemporada {
    tipo: 'todos_contra_todos' | 'grupos' | 'eliminatoria'
    num_vueltas?: number
    num_grupos?: number
    equipos_por_grupo?: number
    equipos_clasifican?: number
}

export interface Equipo {
    id: string
    liga_id: string
    nombre: string
    representante_id: string
    aprobado: boolean
    representante?: {
        nombre: string
        correo: string
    }
}

export interface Jugador {
    id: string
    equipo_id: string
    cedula: string
    nombres: string
    apellidos: string
    fecha_nacimiento: string
    foto_url: string | null
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'
}

export interface Partido {
    id: string
    temporada_id: string
    fecha: string
    hora: string
    equipo_local_id: string
    equipo_visitante_id: string
    goles_local: number | null
    goles_visitante: number | null
    estado: 'programado' | 'jugado' | 'suspendido'
    fase: string
    arbitro?: string
    cancha?: string
}

export interface Sancion {
    id: string
    jugador_id: string
    partido_id: string
    tipo: 'amarilla' | 'roja'
    fecha: string
    duracion_partidos: number
    descripcion: string
}

export interface TablaPosicion {
    equipo_id: string
    temporada_id: string
    puntos: number
    partidos_jugados: number
    ganados: number
    empatados: number
    perdidos: number
    goles_favor: number
    goles_contra: number
    diferencia_goles: number
}

export interface Fixture {
    temporada_id: string
    fechas: {
        numero: number
        partidos: Partido[]
    }[]
}
