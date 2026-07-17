import { useState } from "react";
import type { CabinetSection, GallerySectionConfig } from "@/api/cabinets/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function GallerySection({
  section,
  accent,
}: {
  section: CabinetSection;
  accent: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const config = (section.config ?? {}) as GallerySectionConfig;
  const images = (config.images ?? []).filter((img) => img.url?.trim());

  if (images.length === 0) return null;

  const lightboxImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  function prev() {
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }

  function next() {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));
  }

  return (
    <section id="gallery" className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
              Na prática
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.04] tracking-tight">
              {section.title || "Galeria"}
            </h2>
          </div>
          {section.subtitle && (
            <p className="text-sm text-muted-foreground sm:max-w-xs sm:text-right leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Grid — uniform height rows, not masonry, cleaner */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map((image, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative block overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aspect-4/3"
            >
              <img
                src={image.url}
                alt={image.caption || `Foto ${i + 1}`}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
              {image.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-left text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Próxima"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          <figure
            className="flex flex-col items-center gap-3 max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption || "Foto ampliada"}
              className="max-h-[80vh] w-auto mx-auto rounded-lg object-contain"
            />
            <div className="flex items-center gap-4">
              {lightboxImage.caption && (
                <figcaption className="text-xs text-white/60">
                  {lightboxImage.caption}
                </figcaption>
              )}
              {images.length > 1 && (
                <span className="text-xs text-white/30 font-mono">
                  {(lightboxIndex ?? 0) + 1} / {images.length}
                </span>
              )}
            </div>
          </figure>
        </div>
      )}
    </section>
  );
}
