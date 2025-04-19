export interface Equipo {
    id: string
    nombre: string
    descripcion: string
    estado: 'pendiente' | 'aprobado' | 'rechazado'
    liga_id: string
    created_at?: string
}

export interface NuevoEquipo {
    nombre: string
    descripcion: string
    estado: 'pendiente'
    liga_id: string
}
