
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      claims: {
        Row: {
          address: Json
          claimType: Json
          claimantName: Json
          created_at: string
          date: Json
          district: Json
          documentType: string
          documentUrl: string
          extentOfForestLandOccupied: Json
          geoLinkConfidence: number | null
          gramPanchayat: Json
          id: string
          linkedVillage: string | null
          location: Json
          pattaNumber: Json
          state: Json
          status: string
          tehsilTaluka: Json
          village: Json
        }
        Insert: {
          address: Json
          claimType: Json
          claimantName: Json
          created_at?: string
          date: Json
          district: Json
          documentType: string
          documentUrl: string
          extentOfForestLandOccupied: Json
          geoLinkConfidence?: number | null
          gramPanchayat: Json
          id?: string
          linkedVillage?: string | null
          location: Json
          pattaNumber: Json
          state: Json
          status: string
          tehsilTaluka: Json
          village: Json
        }
        Update: {
          address?: Json
          claimType?: Json
          claimantName?: Json
          created_at?: string
          date?: Json
          district?: Json
          documentType?: string
          documentUrl?: string
          extentOfForestLandOccupied?: Json
          geoLinkConfidence?: number | null
          gramPanchayat?: Json
          id?: string
          linkedVillage?: string | null
          location?: Json
          pattaNumber?: Json
          state?: Json
          status?: string
          tehsilTaluka?: Json
          village?: Json
        }
        Relationships: []
      }
      community_assets: {
        Row: {
          assetType: string
          created_at: string
          description: string
          documentType: string
          documentUrl: string
          geometry: Json | null
          id: string
          villageId: string
        }
        Insert: {
          assetType: string
          created_at?: string
          description: string
          documentType: string
          documentUrl: string
          geometry?: Json | null
          id?: string
          villageId: string
        }
        Update: {
          assetType?: string
          created_at?: string
          description?: string
          documentType?: string
          documentUrl?: string
          geometry?: Json | null
          id?: string
          villageId?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_assets_villageId_fkey"
            columns: ["villageId"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          }
        ]
      }
      pattas: {
        Row: {
          created_at: string
          geometry: Json
          holderName: string
          id: string
          villageName: string
        }
        Insert: {
          created_at?: string
          geometry: Json
          holderName: string
          id?: string
          villageName: string
        }
        Update: {
          created_at?: string
          geometry?: Json
          holderName?: string
          id?: string
          villageName?: string
        }
        Relationships: []
      }
      villages: {
        Row: {
          assetCoverage: Json
          assetGeometries: Json | null
          bounds: Json
          center: Json
          created_at: string
          id: string
          name: string
          ndwi: number
          timeSeriesData: Json | null
        }
        Insert: {
          assetCoverage: Json
          assetGeometries?: Json | null
          bounds: Json
          center: Json
          created_at?: string
          id?: string
          name: string
          ndwi: number
          timeSeriesData?: Json | null
        }
        Update: {
          assetCoverage?: Json
          assetGeometries?: Json | null
          bounds?: Json
          center?: Json
          created_at?: string
          id?: string
          name?: string
          ndwi?: number
          timeSeriesData?: Json | null
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
