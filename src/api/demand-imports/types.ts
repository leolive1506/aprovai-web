export type DemandVisibility = "PUBLIC" | "CABINET_ONLY";

export type ImportJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "COMPLETED_WITH_ERRORS"
  | "FAILED";

export interface ImportRowIssue {
  line: number;
  field?: string;
  message: string;
}

export interface DemandImportJob {
  id: string;
  cabinetId: string;
  requestedById: string;
  status: ImportJobStatus;
  visibility: DemandVisibility;
  fileStorageKey: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  errorSamples: ImportRowIssue[] | null;
  warningSamples: ImportRowIssue[] | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDemandImportParams {
  slug: string;
  visibility: DemandVisibility;
  file: File;
}

export interface ListDemandImportsParams {
  slug: string;
  page?: number;
  limit?: number;
}
