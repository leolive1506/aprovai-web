import type { Demand } from "@/api/demands/types"

export interface UserNeighborhood {
  id: string
  neighborhood: string
  city: string
  state: string
  label: string | null
  isPrimary: boolean
  createdAt: string
}

export interface CreateNeighborhoodPayload {
  neighborhood: string
  city: string
  state: string
  label?: string
  isPrimary?: boolean
}

export interface NeighborhoodStats {
  active: number
  resolved: number
  total: number
  resolutionRate: number
}

export interface NeighborhoodCategory {
  id: string
  name: string
  count: number
  percentage: number
}

export interface NeighborhoodCabinet {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  resolvedCount: number
  totalCount: number
}

export interface NeighborhoodDashboard {
  neighborhood: string
  city: string
  state: string
  stats: NeighborhoodStats
  topCategories: NeighborhoodCategory[]
  servingCabinets: NeighborhoodCabinet[]
  recentDemands: Demand[]
}
