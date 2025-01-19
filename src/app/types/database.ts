export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database  {
  public: {
    Tables: {
      equipos: {
        Row: {
          aprobado: boolean | null
          created_at: string
          dt: string | null
          id: string
          logo: string | null
          nombre: string | null
          presidente: string | null
          stats: string | null
        }
        Insert: {
          aprobado?: boolean | null
          created_at?: string
          dt?: string | null
          id?: string
          logo?: string | null
          nombre?: string | null
          presidente?: string | null
          stats?: string | null
        }
        Update: {
          aprobado?: boolean | null
          created_at?: string
          dt?: string | null
          id?: string
          logo?: string | null
          nombre?: string | null
          presidente?: string | null
          stats?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipos_stats_fkey"
            columns: ["stats"]
            isOneToOne: false
            referencedRelation: "estaditicas-equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      "estaditicas-equipos": {
        Row: {
          created_at: string
          derrotas: number | null
          empates: number | null
          goles_a_favor: number | null
          goles_encontra: number | null
          id: string
          partidos_jugados: number | null
          puntos: number | null
          temporada: string | null
          victorias: number | null
        }
        Insert: {
          created_at?: string
          derrotas?: number | null
          empates?: number | null
          goles_a_favor?: number | null
          goles_encontra?: number | null
          id?: string
          partidos_jugados?: number | null
          puntos?: number | null
          temporada?: string | null
          victorias?: number | null
        }
        Update: {
          created_at?: string
          derrotas?: number | null
          empates?: number | null
          goles_a_favor?: number | null
          goles_encontra?: number | null
          id?: string
          partidos_jugados?: number | null
          puntos?: number | null
          temporada?: string | null
          victorias?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estaditicas-equipos_temporada_fkey"
            columns: ["temporada"]
            isOneToOne: false
            referencedRelation: "temporada"
            referencedColumns: ["id"]
          },
        ]
      }
      temporada: {
        Row: {
          created_at: string
          fecha_final: string | null
          fecha_inicio: string | null
          id: string
          nombre: string | null
        }
        Insert: {
          created_at?: string
          fecha_final?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string | null
        }
        Update: {
          created_at?: string
          fecha_final?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
