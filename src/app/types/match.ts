export interface MatchData {
  id: string;
  fecha: string | null;
  equipo_local: {
    id: string;
    nombre: string | null;
  };
  equipo_visitante: {
    id: string;
    nombre: string | null;
  };
  goles_local?: number | null;
  goles_visitante?: number | null;
  temporada_id: string;
}

export interface NextMatchData {
  id: string;
  fecha: string | null;
  equipo_local: {
    id: string;
    nombre: string | null;
  };
  equipo_visitante: {
    id: string;
    nombre: string | null;
  };
}

export interface MatchStatsData {
  equipo_id: string;
  partidos_jugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  goles_a_favor: number;
  goles_encontra: number;
  puntos: number;
}

export interface MatchUpdateData {
  goles_local?: number | null;
  goles_visitante?: number | null;
}
