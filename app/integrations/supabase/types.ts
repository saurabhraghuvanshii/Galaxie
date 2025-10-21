export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            videos: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    youtube_url: string
                    thumbnail_url: string | null
                    sol_price: number
                    is_paid: boolean
                    is_live: boolean
                    wallet_address: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    youtube_url: string
                    thumbnail_url?: string | null
                    sol_price?: number
                    is_paid?: boolean
                    is_live?: boolean
                    wallet_address: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    youtube_url?: string
                    thumbnail_url?: string | null
                    sol_price?: number
                    is_paid?: boolean
                    is_live?: boolean
                    wallet_address?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            users: {
                Row: {
                    id: string
                    wallet_address: string
                    username: string | null
                    email: string | null
                    avatar: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    wallet_address: string
                    username?: string | null
                    email?: string | null
                    avatar?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    wallet_address?: string
                    username?: string | null
                    email?: string | null
                    avatar?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            purchases: {
                Row: {
                    id: string
                    sol_amount: number
                    transaction_hash: string | null
                    is_completed: boolean
                    created_at: string
                    completed_at: string | null
                    video_id: string
                    buyer_id: string
                }
                Insert: {
                    id?: string
                    sol_amount: number
                    transaction_hash?: string | null
                    is_completed?: boolean
                    created_at?: string
                    completed_at?: string | null
                    video_id: string
                    buyer_id: string
                }
                Update: {
                    id?: string
                    sol_amount?: number
                    transaction_hash?: string | null
                    is_completed?: boolean
                    created_at?: string
                    completed_at?: string | null
                    video_id?: string
                    buyer_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "purchases_video_id_fkey"
                        columns: ["video_id"]
                        isOneToOne: false
                        referencedRelation: "videos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "purchases_buyer_id_fkey"
                        columns: ["buyer_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            payments: {
                Row: {
                    id: string
                    from_address: string
                    to_address: string
                    sol_amount: number
                    transaction_hash: string
                    status: string
                    block_number: number | null
                    created_at: string
                    confirmed_at: string | null
                }
                Insert: {
                    id?: string
                    from_address: string
                    to_address: string
                    sol_amount: number
                    transaction_hash: string
                    status?: string
                    block_number?: number | null
                    created_at?: string
                    confirmed_at?: string | null
                }
                Update: {
                    id?: string
                    from_address?: string
                    to_address?: string
                    sol_amount?: number
                    transaction_hash?: string
                    status?: string
                    block_number?: number | null
                    created_at?: string
                    confirmed_at?: string | null
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
