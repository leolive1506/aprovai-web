export type ResultType = "INFRASTRUCTURE" | "SOCIAL" | "LEGISLATIVE" | "OTHER"

export interface ResultImage {
  id: string
  url: string
  storageKey: string
  resultId: string
}

export interface Result {
  id: string
  title: string
  description: string
  type: ResultType
  cabinetId: string
  demandId: string | null
  protocolFileUrl: string | null
  protocolFileName: string | null
  protocolFileSize: number | null
  createdAt: string
  images: ResultImage[]
}

export interface CreateResultRequest {
  title: string
  description: string
  type: ResultType
  cabinetSlug: string
  demandId?: string
  images?: File[]
  protocol?: File
}

export interface ListResultsParams {
  demandId?: string
  page?: number
  limit?: number
}

export interface PaginatedResults {
  items: Result[]
  meta: {
    total: number
    page: number
    limit: number
  }
}
