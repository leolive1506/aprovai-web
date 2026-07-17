import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { FileTextIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CsvDropzoneProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function CsvDropzone({
  value,
  onChange,
  maxSize = 5 * 1024 * 1024, // 5MB — mesmo limite validado no backend
  className,
  disabled = false,
}: CsvDropzoneProps) {
  const [file, setFile] = useState<File | null>(value ?? null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0];
      if (!selected) return;
      setFile(selected);
      onChange?.(selected);
    },
    [onChange],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    rejections.forEach(({ file: rejectedFile, errors }) => {
      const reason = errors.map((e) => e.message).join(", ");
      toast.error(`${rejectedFile.name}: ${reason}`);
    });
  }, []);

  const removeFile = () => {
    setFile(null);
    onChange?.(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "text/csv": [".csv"] },
    maxSize,
    maxFiles: 1,
    disabled: disabled || !!file,
  });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {!file && (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
            "border-input text-muted-foreground hover:border-ring hover:bg-accent/40",
            isDragActive && "border-ring bg-accent/40",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        >
          <input {...getInputProps()} />
          <UploadCloudIcon className="size-8 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm font-medium">Solte o arquivo aqui...</p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Arraste o CSV ou clique para selecionar
              </p>
              <p className="text-xs">
                Arquivo .csv de até {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </>
          )}
        </div>
      )}

      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-input px-3 py-2.5">
          <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={removeFile}
            disabled={disabled}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
