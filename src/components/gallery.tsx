import { type Evidence } from "@/api/demands/types";
import { cn } from "@/lib/utils";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface GalleryProps {
  images: Evidence[];
  className?: string;
}

export function Gallery({ images, className }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOpen = lightboxIndex !== null;

  if (!images || images.length === 0) return null;

  const close = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") close();
  };

  return (
    <>
      <GalleryGrid images={images} onOpen={setLightboxIndex} className={className} />

      <DialogPrimitive.Root open={isOpen} onOpenChange={(v) => { if (!v) close(); }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 bg-black/90 z-9998" />
          <DialogPrimitive.Content
            className="fixed inset-0 z-9999 flex items-center justify-center outline-none"
            onInteractOutside={(e) => e.preventDefault()}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onKeyDown={handleKeyDown}
          >
            <DialogPrimitive.Title className="sr-only">Galeria de fotos</DialogPrimitive.Title>

            {images.length > 1 && lightboxIndex !== null  && (
              <>
                <button
                  onClick={close}
                  className="absolute top-4 right-4 z-10 flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  aria-label="Fechar"
                >
                  <XIcon className="size-5" />
                </button>

                {images.length > 1 && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm select-none pointer-events-none">
                    {lightboxIndex + 1} / {images.length}
                  </span>
                )}

                {images.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-4 flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    aria-label="Anterior"
                  >
                    <ChevronLeftIcon className="size-5" />
                  </button>
                )}

                {lightboxIndex !== null && (
                  <img
                    key={lightboxIndex}
                    src={images[lightboxIndex].url}
                    alt={`Evidência ${lightboxIndex + 1}`}
                    className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain select-none shadow-2xl"
                    draggable={false}
                  />
                )}

                {images.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-4 flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    aria-label="Próxima"
                  >
                    <ChevronRightIcon className="size-5" />
                  </button>
                )}

                {images.length > 1 && lightboxIndex !== null && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                        className={cn(
                          "shrink-0 size-12 rounded-md overflow-hidden border-2 transition-all",
                          i === lightboxIndex
                            ? "border-white scale-110"
                            : "border-white/30 opacity-60 hover:opacity-90"
                        )}
                      >
                        <img
                          src={img.url}
                          alt={`Miniatura ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

const MAX_VISIBLE = 5;

interface GridImageProps {
  index: number;
  className?: string;
  images: Evidence[];
  onOpen: (index: number) => void;
  remaining: number;
}

function GridImage({ index, className: imgClassName, images, onOpen, remaining }: GridImageProps) {
  const isLast = index === MAX_VISIBLE - 1 && remaining > 0;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onOpen(index);
      }}
      className={cn(
        "relative overflow-hidden bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        imgClassName
      )}
      aria-label={`Ver imagem ${index + 1}`}
    >
      <img
        src={images[index].url}
        alt={`Evidência ${index + 1}`}
        className="w-full h-full object-cover cursor-pointer"
      />
      {isLast && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white text-xl font-bold">+{remaining + 1}</span>
        </div>
      )}
    </button>
  );
}

interface GalleryGridProps {
  images: Evidence[];
  onOpen: (index: number) => void;
  className?: string;
}

function GalleryGrid({ images, onOpen, className }: GalleryGridProps) {
  const count = images.length;
  const remaining = count - MAX_VISIBLE;
  const shared = { images, onOpen, remaining };

  if (count === 1) {
    return (
      <div className={cn("w-full max-h-80 overflow-hidden", className)}>
        <GridImage {...shared} index={0} className="w-full max-h-80 aspect-video sm:aspect-auto sm:h-80" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-40 sm:h-56", className)}>
        <GridImage {...shared} index={0} className="h-full" />
        <GridImage {...shared} index={1} className="h-full" />
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-40 sm:h-56", className)}>
        <GridImage {...shared} index={0} className="h-full" />
        <div className="grid grid-rows-2 gap-1 h-full">
          <GridImage {...shared} index={1} className="h-full" />
          <GridImage {...shared} index={2} className="h-full" />
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-40 sm:h-56", className)}>
        <div className="grid grid-rows-2 gap-1 h-full">
          <GridImage {...shared} index={0} className="h-full" />
          <GridImage {...shared} index={1} className="h-full" />
        </div>
        <div className="grid grid-rows-2 gap-1 h-full">
          <GridImage {...shared} index={2} className="h-full" />
          <GridImage {...shared} index={3} className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-48 sm:h-[228px]", className)}>
      <div className="grid grid-rows-2 gap-1 h-full">
        <GridImage {...shared} index={0} className="h-full" />
        <GridImage {...shared} index={1} className="h-full" />
      </div>
      <div className="grid grid-rows-3 gap-1 h-full">
        <GridImage {...shared} index={2} className="h-full" />
        <GridImage {...shared} index={3} className="h-full" />
        <GridImage {...shared} index={4} className="h-full" />
      </div>
    </div>
  );
}
