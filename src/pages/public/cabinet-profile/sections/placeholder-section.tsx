import type { CabinetSection } from "@/api/cabinets/types";

export function PlaceholderSection({ section }: { section: CabinetSection }) {
  return (
    <section className="py-20 px-4 sm:px-6 bg-muted/10 border-y border-border/20 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">{section.title || section.type}</h2>
        <p className="text-muted-foreground">{section.subtitle || "Esta seção será implementada em breve."}</p>
        <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
          {section.type}
        </div>
      </div>
    </section>
  );
}
