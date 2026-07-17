import { useEffect, useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  Loader2,
  UploadIcon,
  XCircleIcon,
} from "lucide-react";
import { useGetCategories } from "@/api/categories/hooks";
import { useCreateDemandImport, useDemandImportStatus } from "@/api/demand-imports/hooks";
import { DemandImportsApi } from "@/api/demand-imports";
import type { DemandVisibility } from "@/api/demand-imports/types";
import { queryClient } from "@/api/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CsvDropzone } from "@/components/ui/csv-dropzone";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const PRIORITY_VALUES = ["baixa", "media", "alta", "urgente"];
const MAX_SAMPLES_SHOWN = 200;
const TERMINAL_STATUSES = ["COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"];

interface DemandImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemandImportModal({ open, onOpenChange }: DemandImportModalProps) {
  const { cabinet } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<DemandVisibility>("CABINET_ONLY");
  const [jobId, setJobId] = useState<string | null>(null);

  const { data: categoriesPage } = useGetCategories({ limit: 100, enabled: open });
  const { mutate: createImport, isPending: isUploading } = useCreateDemandImport();
  const { data: job } = useDemandImportStatus(cabinet?.slug, jobId ?? undefined);

  useEffect(() => {
    if (job && TERMINAL_STATUSES.includes(job.status) && job.successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      queryClient.invalidateQueries({ queryKey: ["demands-infinite"] });
    }
  }, [job]);

  function handleSubmit() {
    if (!cabinet || !file) return;

    createImport(
      { slug: cabinet.slug, visibility, file },
      { onSuccess: (created) => setJobId(created.id) },
    );
  }

  const isProcessing = job ? TERMINAL_STATUSES.includes(job.status) === false : false;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isUploading || isProcessing) return;
        if (!next) {
          setFile(null);
          setVisibility("CABINET_ONLY");
          setJobId(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar demandas via CSV</DialogTitle>
        </DialogHeader>

        {!jobId && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg border border-input bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Instruções de preenchimento</span>
                <a
                  href={cabinet ? DemandImportsApi.downloadTemplateUrl(cabinet.slug) : "#"}
                  download
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <DownloadIcon className="size-3.5" />
                  Baixar modelo
                </a>
              </div>
              <ul className="list-disc space-y-1 pl-4">
                <li>Até 5&nbsp;MB e 5.000 linhas por arquivo</li>
                <li>Campos obrigatórios: título, descrição, categoria, endereço, cidade e estado</li>
                <li>Coordenadas são sempre calculadas por nós a partir do endereço — não inclua latitude/longitude</li>
                <li>
                  Prioridade aceita: {PRIORITY_VALUES.join(", ")} (opcional, padrão "média")
                </li>
              </ul>
              {categoriesPage && categoriesPage.items.length > 0 && (
                <div>
                  <span className="font-medium text-foreground">Categorias válidas: </span>
                  {categoriesPage.items.map((c) => c.name).join(", ")}
                </div>
              )}
            </div>

            <CsvDropzone value={file} onChange={setFile} disabled={isUploading} />

            <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Visível apenas ao gabinete</span>
                <span className="text-xs text-muted-foreground">
                  Demandas importadas não aparecem em telas públicas
                </span>
              </div>
              <div className="flex items-center gap-2">
                {visibility === "CABINET_ONLY" && (
                  <Badge variant="secondary" className="text-[10px]">Recomendado</Badge>
                )}
                <Switch
                  checked={visibility === "CABINET_ONLY"}
                  onCheckedChange={(checked) => setVisibility(checked ? "CABINET_ONLY" : "PUBLIC")}
                  disabled={isUploading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!file || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 size-4" />
                    Iniciar importação
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {jobId && job && <ImportProgress job={job} onClose={() => onOpenChange(false)} />}
        {jobId && !job && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Iniciando importação...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ImportProgressProps {
  job: NonNullable<ReturnType<typeof useDemandImportStatus>["data"]>;
  onClose: () => void;
}

function ImportProgress({ job, onClose }: ImportProgressProps) {
  const isTerminal = TERMINAL_STATUSES.includes(job.status);
  const progressPct = job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0;
  const totalIssues = job.errorCount + job.warningCount;
  const sampledIssues = [...(job.errorSamples ?? []), ...(job.warningSamples ?? [])];

  if (!isTerminal) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="size-10 animate-spin text-primary" />
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium">Processando importação...</p>
          <p className="text-xs text-muted-foreground">
            {job.processedRows} de {job.totalRows || "?"} linhas
          </p>
        </div>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    );
  }

  const StatusIcon =
    job.status === "COMPLETED" ? CheckCircle2Icon : job.status === "FAILED" ? XCircleIcon : AlertTriangleIcon;
  const statusColor =
    job.status === "COMPLETED"
      ? "text-emerald-600"
      : job.status === "FAILED"
        ? "text-destructive"
        : "text-amber-600";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <StatusIcon className={cn("size-10", statusColor)} />
        <p className="text-sm font-medium">
          {job.successCount} de {job.totalRows} demanda(s) importada(s) com sucesso
          {job.errorCount > 0 && ` · ${job.errorCount} com erro`}
        </p>
      </div>

      {totalIssues > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-input p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Detalhes {totalIssues > sampledIssues.length && `(mostrando os primeiros ${MAX_SAMPLES_SHOWN} de ${totalIssues})`}
          </p>
          <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto text-xs">
            {sampledIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                <span className="shrink-0 font-medium text-foreground">Linha {issue.line}:</span>
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <DialogFooter>
        <Button onClick={onClose}>Concluir</Button>
      </DialogFooter>
    </div>
  );
}
