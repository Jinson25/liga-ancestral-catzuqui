// Definir interface para los datos
interface Equipo {
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
  }