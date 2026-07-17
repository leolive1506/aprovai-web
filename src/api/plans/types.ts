export const FEATURES = {
  HEATMAP: 'heatmap',
  CSV_EXPORT: 'csv_export',
  WIDGET: 'widget',
} as const

export type FeatureSlug = (typeof FEATURES)[keyof typeof FEATURES]

export type OverrideType = 'GRANT' | 'BLOCK'
export type OverrideSource = 'ADD_ON' | 'CUSTOM_CONTRACT' | 'TRIAL' | 'GIFT' | 'ADMIN'
export type PlanTier = 'ESSENCIAL' | 'PROFISSIONAL' | 'CAPITAL'
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'EXPIRED'

export interface FeatureItem {
  slug: string
  name: string
  description: string | null
}

export interface PlanFeatureItem {
  featureSlug: string
  effectiveFrom: string | null
  feature: FeatureItem
}

export interface Plan {
  id: string
  tier: PlanTier
  name: string
  priceInCents: number
  maxMembers: number | null
  maxDemands: number | null
  maxStorageBytes: number | null
  isActive: boolean
  features: PlanFeatureItem[]
}

export interface CabinetSubscription {
  id: string
  cabinetId: string
  planId: string
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string | null
  canceledAt: string | null
  createdAt: string
  plan: Plan
  priceInCents: number | null
  maxMembers: number | null
  maxDemands: number | null
  maxStorageBytes: number | null
}

export interface CabinetOverride {
  id: string
  cabinetId: string
  featureSlug: string
  type: OverrideType
  source: OverrideSource
  expiresAt: string | null
  notes: string | null
  createdAt: string
  feature: FeatureItem
}

export interface CabinetSubscriptionStatus {
  hasActiveSubscription: boolean
  currentPeriodEnd: string | null
}

export interface CabinetEntitlements {
  features: string[]
  limits: {
    maxMembers: number | null
    maxDemands: number | null
    maxStorageBytes: number | null
  }
  subscription: CabinetSubscriptionStatus
}

export interface CabinetUsage {
  memberCount: number
  demandCount: number
  storageUsedBytes: number
}

export interface AddOverrideRequest {
  featureSlug: string
  type: OverrideType
  source: OverrideSource
  expiresAt?: string | null
  notes?: string | null
}
