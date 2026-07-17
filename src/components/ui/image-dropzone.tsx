import { useCallback, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ImageIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImagePreview {
  file: File;
  url: string;
}

export interface ImageDropzoneProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageDropzone({
  value,
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  disabled = false,
}: ImageDropzoneProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>(() =>
    (value ?? []).map((file) => ({ file, url: URL.createObjectURL(file) })),
  );

  const previewsRef = useRef<HTMLUListElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const remaining = maxFiles - previews.length;
      const filesToAdd = acceptedFiles.slice(0, remaining);

      const newPreviews = filesToAdd.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      const updated = [...previews, ...newPreviews];
      setPreviews(updated);
      onChange?.(updated.map((p) => p.file));

      if (filesToAdd.length > 0) {
        toast.success(
          filesToAdd.length === 1
            ? "Imagem adicionada com sucesso!"
            : `${filesToAdd.length} imagens adicionadas com sucesso!`,
        );
        previewsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    [previews, maxFiles, onChange],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    rejections.forEach(({ file, errors }) => {
      const reason = errors.map((e) => e.message).join(", ");
      toast.error(`${file.name}: ${reason}`);
    });
  }, []);

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange?.(updated.map((p) => p.file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/*": [] },
    maxSize,
    maxFiles: maxFiles - previews.length,
    disabled: disabled || previews.length >= maxFiles,
  });

  const isAtLimit = previews.length >= maxFiles;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          "border-input text-muted-foreground hover:border-ring hover:bg-accent/40",
          isDragActive && "border-ring bg-accent/40",
          (disabled || isAtLimit) &&
            "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloudIcon className="size-8 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm font-medium">Solte as imagens aqui...</p>
        ) : isAtLimit ? (
          <p className="text-sm">Limite de {maxFiles} imagens atingido</p>
        ) : (
          <>
            <p className="text-sm font-medium">
              Arraste imagens ou clique para selecionar
            </p>
            <p className="text-xs">
              PNG, JPG, WEBP até {Math.round(maxSize / (1024 * 1024))}MB
              {maxFiles > 1 && ` · máx. ${maxFiles} arquivos`}
            </p>
          </>
        )}
      </div>

      {previews.length > 0 && (
        <ul ref={previewsRef} className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((preview, index) => (
            <li key={preview.url} className="group relative">
              <div className="aspect-square overflow-hidden rounded-md border border-input bg-muted">
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 transition-colors group-hover:bg-black/40">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {preview.file.name}
              </p>
            </li>
          ))}
        </ul>
      )}

      {previews.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="size-4 shrink-0" />
          <span>Nenhuma imagem selecionada</span>
        </div>
      )}
    </div>
  );
}
