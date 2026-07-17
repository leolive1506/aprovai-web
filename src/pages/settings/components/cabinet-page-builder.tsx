import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, ReactNode } from "react";
import {
  useGetCabinets,
  useGetCabinetSections,
  useGetCabinetMetrics,
  useUpdateCabinet,
  useUpdateCabinetSections,
} from "@/api/cabinets/hooks";
import type {
  Cabinet,
  CabinetSection,
  CabinetSectionType,
  FaqItem,
  GalleryImage,
  HeroSlide,
  PriorityItem,
  TestimonialItem,
  TimelineItem,
} from "@/api/cabinets/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SECTION_REGISTRY, DEFAULT_SECTION_ORDER } from "@/lib/cabinet-section-registry";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  ImageIcon,
  LayoutTemplate,
  Loader2,
  Mail,
  MessageSquarePlus,
  MoveVertical,
  Phone,
  Plus,
  Save,
  TrendingUp,
  Upload,
  Video,
  X,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CabinetContentDraft {
  biographyContent: string | null;
  bannerFile: File | null;
  photoFile: File | null;
  logoFile: File | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  accentColor: string | null;
  whatsappUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
}

const EMPTY_DRAFT: CabinetContentDraft = {
  biographyContent: null,
  bannerFile: null,
  photoFile: null,
  logoFile: null,
  heroTitle: null,
  heroSubtitle: null,
  accentColor: null,
  whatsappUrl: null,
  youtubeUrl: null,
  tiktokUrl: null,
};

const PRESET_COLORS = [
  { label: "Azul", value: "#2563EB" },
  { label: "Verde", value: "#16a34a" },
  { label: "Roxo", value: "#7c3aed" },
  { label: "Vermelho", value: "#dc2626" },
  { label: "Laranja", value: "#ea580c" },
  { label: "Rosa", value: "#db2777" },
  { label: "Ciano", value: "#0891b2" },
  { label: "Âmbar", value: "#d97706" },
];

const DEFAULT_TITLES: Record<CabinetSectionType, string> = {
  HERO: "Nome do gabinete",
  BIOGRAPHY: "Sobre o Gabinete",
  PRIORITIES: "Nossas prioridades",
  STATS: "Transparência em Números",
  RESULTS: "Resultados e Demandas",
  TESTIMONIALS: "O que a população diz",
  TIMELINE: "Linha do tempo",
  GALLERY: "Galeria de ações",
  FAQ: "Perguntas frequentes",
  DEMANDS_CTA: "Sua voz importa",
  CONTACT: "Fale Conosco",
  NEWS: "Notícias",
  ACTION_MAP: "Mapa de atuação",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDefaultSections(cabinetId: string): CabinetSection[] {
  return DEFAULT_SECTION_ORDER.map((type, index) => ({
    id: crypto.randomUUID(),
    cabinetId,
    type,
    title: null,
    subtitle: null,
    enabled: true,
    sortOrder: index,
    config: null,
  }));
}

function reorder(list: CabinetSection[]): CabinetSection[] {
  return list.map((s, i) => ({ ...s, sortOrder: i }));
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function CabinetPageBuilder() {
  const { data: cabinets, isLoading: isLoadingCabinets } = useGetCabinets();
  const cabinet = cabinets?.[0];

  const { data: remoteSections, isLoading: isLoadingSections } = useGetCabinetSections(cabinet?.slug);
  const { mutateAsync: updateSections, isPending: isUpdatingSections } = useUpdateCabinetSections();
  const { mutateAsync: updateCabinet, isPending: isUpdatingCabinet } = useUpdateCabinet();

  const [sections, setSections] = useState<CabinetSection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CabinetContentDraft>(EMPTY_DRAFT);

  const isSaving = isUpdatingSections || isUpdatingCabinet;

  useEffect(() => {
    if (!remoteSections || !cabinet) return;
    if (remoteSections.length > 0) {
      const sorted = [...remoteSections].sort((a, b) => a.sortOrder - b.sortOrder);
      setSections(sorted);
      setSelectedId((prev) => prev ?? sorted[0]?.id ?? null);
      setHasChanges(false);
    } else {
      const defaults = makeDefaultSections(cabinet.id);
      setSections(defaults);
      setSelectedId(defaults[0]?.id ?? null);
      setHasChanges(true);
    }
  }, [remoteSections, cabinet]);

  const selected = useMemo(
    () => sections.find((s) => s.id === selectedId) ?? null,
    [sections, selectedId],
  );

  const missingTypes = useMemo(() => {
    const present = new Set(sections.map((s) => s.type));
    return (Object.keys(SECTION_REGISTRY) as CabinetSectionType[]).filter(
      (type) => !present.has(type) && SECTION_REGISTRY[type].available,
    );
  }, [sections]);

  if (isLoadingCabinets || isLoadingSections) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 py-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!cabinet) return null;

  function updateSection(id: string, patch: Partial<CabinetSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setHasChanges(true);
  }

  function updateConfig(id: string, patch: Record<string, unknown>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, config: { ...(s.config ?? {}), ...patch } } : s)),
    );
    setHasChanges(true);
  }

  function updateDraft(patch: Partial<CabinetContentDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setHasChanges(true);
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    setSections((prev) => {
      const fromIndex = prev.findIndex((s) => s.id === draggingId);
      const toIndex = prev.findIndex((s) => s.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return reorder(next);
    });
    setHasChanges(true);
  }

  function handleMoveSection(id: string, direction: "up" | "down") {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index < 0) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return reorder(next);
    });
    setHasChanges(true);
  }

  function handleAddSection(type: CabinetSectionType) {
    const newSection: CabinetSection = {
      id: crypto.randomUUID(),
      cabinetId: cabinet!.id,
      type,
      title: null,
      subtitle: null,
      enabled: true,
      sortOrder: sections.length,
      config: null,
    };
    setSections((prev) => reorder([...prev, newSection]));
    setSelectedId(newSection.id);
    setHasChanges(true);
  }

  async function handleSave() {
    try {
      const cabinetData: Partial<Cabinet> = {};
      if (draft.biographyContent !== null) cabinetData.biographyContent = draft.biographyContent;
      if (draft.heroTitle !== null) cabinetData.heroTitle = draft.heroTitle;
      if (draft.heroSubtitle !== null) cabinetData.heroSubtitle = draft.heroSubtitle;
      if (draft.accentColor !== null) cabinetData.accentColor = draft.accentColor;
      if (draft.whatsappUrl !== null) cabinetData.whatsappUrl = draft.whatsappUrl;
      if (draft.youtubeUrl !== null) cabinetData.youtubeUrl = draft.youtubeUrl;
      if (draft.tiktokUrl !== null) cabinetData.tiktokUrl = draft.tiktokUrl;

      const hasCabinetChanges =
        Object.keys(cabinetData).length > 0 || draft.bannerFile || draft.photoFile || draft.logoFile;

      if (hasCabinetChanges) {
        await updateCabinet({
          slug: cabinet!.slug,
          data: cabinetData,
          bannerFile: draft.bannerFile ?? undefined,
          biographyPhotoFile: draft.photoFile ?? undefined,
          logoFile: draft.logoFile ?? undefined,
        });
      }

      await updateSections({
        slug: cabinet!.slug,
        sections: sections.map((s) => ({ ...s, config: s.config ?? null })),
      });

      toast.success("Página pública atualizada!");
      setDraft(EMPTY_DRAFT);
      setHasChanges(false);
    } catch {
      toast.error("Erro ao salvar página pública.");
    }
  }

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">Página pública</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-none truncate">
              {cabinet.name} · {sections.filter((s) => s.enabled).length} seções ativas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasChanges && (
            <span className="hidden sm:flex items-center gap-1 rounded-md border border-border/60 bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              <AlertCircle className="size-3" />
              Não salvo
            </span>
          )}

          {/* Accent color picker */}
          <AccentColorPicker
            value={draft.accentColor ?? cabinet.accentColor ?? "#2563EB"}
            onChange={(color) => updateDraft({ accentColor: color })}
          />

          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8">
            <a href={`/${cabinet.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Ver página</span>
            </a>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="sm"
            className="gap-1.5 h-8"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : hasChanges ? (
              <Save className="size-3.5" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            {isSaving ? "Salvando..." : hasChanges ? "Salvar" : "Salvo"}
          </Button>
        </div>
      </div>

      {/* Body: 2-column or 3-column */}
      <div className="flex flex-col lg:grid lg:grid-cols-[260px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border/60 min-h-[520px]">
        {/* LEFT: Section List */}
        <div className="flex flex-col bg-muted/10">
          <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
              Seções
            </p>
            {missingTypes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2 text-muted-foreground hover:text-foreground">
                    <Plus className="size-3" />
                    Adicionar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {missingTypes.map((type) => {
                    const meta = SECTION_REGISTRY[type];
                    const Icon = meta.icon;
                    return (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => handleAddSection(type)}
                        className="gap-2.5 py-2"
                      >
                        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none">{meta.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{meta.description}</p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex flex-col gap-0.5 p-2 flex-1">
            {sections.map((section, index) => {
              const meta = SECTION_REGISTRY[section.type];
              const Icon = meta.icon;
              const isSelected = section.id === selectedId;
              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e: DragEvent) => {
                    setDraggingId(section.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={(e: DragEvent) => e.preventDefault()}
                  onDrop={() => handleDrop(section.id)}
                  onClick={() => setSelectedId(section.id)}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-all select-none",
                    isSelected
                      ? "bg-primary/8 ring-1 ring-primary/20"
                      : "hover:bg-muted/60",
                    draggingId === section.id && "opacity-30",
                    !section.enabled && "opacity-50",
                  )}
                >
                  <GripVertical className="size-3.5 shrink-0 text-muted-foreground/30 cursor-grab group-hover:text-muted-foreground/60 transition-colors" />
                  <div className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                    isSelected ? "bg-primary/15" : "bg-muted/60 group-hover:bg-muted",
                  )}>
                    <Icon className={cn("size-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-none truncate", isSelected ? "font-semibold text-primary" : "font-medium text-foreground")}>
                      {meta.label}
                    </p>
                    {!section.enabled && (
                      <p className="text-2xs text-muted-foreground mt-0.5">Oculta</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, "up"); }}
                      disabled={index === 0}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveSection(section.id, "down"); }}
                      disabled={index === sections.length - 1}
                      className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateSection(section.id, { enabled: !section.enabled }); }}
                      className={cn("flex size-5 items-center justify-center rounded transition-colors", section.enabled ? "text-muted-foreground hover:text-foreground" : "text-amber-500 hover:text-amber-600")}
                      title={section.enabled ? "Ocultar seção" : "Mostrar seção"}
                    >
                      {section.enabled ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MoveVertical className="size-3 shrink-0" />
              Arraste para reordenar
            </div>
          </div>
        </div>

        {/* RIGHT: Editor */}
        <div className="flex flex-col min-h-0">
          {selected ? (
            <SectionEditor
              key={selected.id}
              section={selected}
              cabinet={cabinet}
              draft={draft}
              onUpdate={(patch) => updateSection(selected.id, patch)}
              onUpdateConfig={(patch) => updateConfig(selected.id, patch)}
              onUpdateDraft={updateDraft}
            />
          ) : (
            <EmptyEditorState />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyEditorState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center gap-3 text-muted-foreground">
      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
        <Eye className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Selecione uma seção</p>
        <p className="text-xs mt-1 max-w-xs mx-auto">
          Clique em qualquer seção à esquerda para editar seus conteúdos.
        </p>
      </div>
    </div>
  );
}

// ─── Section Editor (unified panel) ──────────────────────────────────────────

interface SectionEditorProps {
  section: CabinetSection;
  cabinet: Cabinet;
  draft: CabinetContentDraft;
  onUpdate: (patch: Partial<CabinetSection>) => void;
  onUpdateConfig: (patch: Record<string, unknown>) => void;
  onUpdateDraft: (patch: Partial<CabinetContentDraft>) => void;
}

function SectionEditor({
  section,
  cabinet,
  draft,
  onUpdate,
  onUpdateConfig,
  onUpdateDraft,
}: SectionEditorProps) {
  const meta = SECTION_REGISTRY[section.type];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Editor top bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60 bg-muted/5 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">{meta.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-none">{meta.description}</p>
          </div>
        </div>
        <label className="flex shrink-0 items-center gap-2 cursor-pointer group">
          <span className={cn("text-xs transition-colors", section.enabled ? "text-muted-foreground" : "text-amber-600 font-medium")}>
            {section.enabled ? "Visível" : "Oculta"}
          </span>
          <Switch
            checked={section.enabled}
            onCheckedChange={(enabled) => onUpdate({ enabled })}
          />
        </label>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Title / Subtitle - always shown */}
        <TitleSubtitleBlock
          section={section}
          cabinet={cabinet}
          draft={draft}
          onUpdate={onUpdate}
          onUpdateDraft={onUpdateDraft}
        />

        {/* Type-specific editor */}
        <SectionBody
          section={section}
          cabinet={cabinet}
          draft={draft}
          onUpdateConfig={onUpdateConfig}
          onUpdateDraft={onUpdateDraft}
        />
      </div>
    </div>
  );
}

// ─── Title / Subtitle block with inline preview chip ─────────────────────────

function TitleSubtitleBlock({
  section,
  cabinet,
  draft,
  onUpdate,
  onUpdateDraft,
}: {
  section: CabinetSection;
  cabinet: Cabinet;
  draft: CabinetContentDraft;
  onUpdate: (p: Partial<CabinetSection>) => void;
  onUpdateDraft: (p: Partial<CabinetContentDraft>) => void;
}) {
  const isHero = section.type === "HERO";

  if (isHero) {
    const titleValue = draft.heroTitle ?? cabinet.heroTitle ?? "";
    const subtitleValue = draft.heroSubtitle ?? cabinet.heroSubtitle ?? "";
    return (
      <EditorGroup label="Título e chamada da capa">
        <div className="flex flex-col gap-3">
          <Field>
            <Label className="text-xs">Título principal</Label>
            <Input
              value={titleValue}
              onChange={(e) => onUpdateDraft({ heroTitle: e.target.value || null })}
              placeholder={cabinet.name}
              className="text-base font-medium"
            />
          </Field>
          <Field>
            <Label className="text-xs">Frase de impacto</Label>
            <Input
              value={subtitleValue}
              onChange={(e) => onUpdateDraft({ heroSubtitle: e.target.value || null })}
              placeholder={cabinet.tagline ?? "Trabalhando por você, todos os dias."}
            />
          </Field>
        </div>
        {(titleValue || subtitleValue) && (
          <HeroPreviewChip title={titleValue || cabinet.name} subtitle={subtitleValue || cabinet.tagline || ""} accent={cabinet.accentColor || "#2563EB"} />
        )}
      </EditorGroup>
    );
  }

  const titlePlaceholder = DEFAULT_TITLES[section.type];

  return (
    <EditorGroup label="Cabeçalho da seção">
      <div className="flex flex-col gap-2.5">
        <Field>
          <Label className="text-xs">Título</Label>
          <Input
            value={section.title ?? ""}
            onChange={(e) => onUpdate({ title: e.target.value || null })}
            placeholder={titlePlaceholder}
          />
        </Field>
        <Field>
          <Label className="text-xs">Subtítulo <span className="text-muted-foreground/60 font-normal">(opcional)</span></Label>
          <Input
            value={section.subtitle ?? ""}
            onChange={(e) => onUpdate({ subtitle: e.target.value || null })}
            placeholder="Uma linha complementar ao título..."
          />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        Deixe em branco para usar o título padrão da seção.
      </p>
    </EditorGroup>
  );
}

function HeroPreviewChip({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/60 bg-muted/30">
      <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Pré-visualização da capa</span>
      </div>
      <div
        className="relative flex flex-col items-center justify-center text-center text-white px-6 py-8"
        style={{ background: `linear-gradient(160deg, ${accent}dd 0%, ${accent}88 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "repeating-linear-gradient(-55deg, #fff 0px, #fff 1px, transparent 1px, transparent 28px)",
          }}
        />
        <p className="relative text-xl font-black leading-tight mb-1.5 drop-shadow-sm line-clamp-2">{title}</p>
        {subtitle && <p className="relative text-xs opacity-75 line-clamp-1 mb-4">{subtitle}</p>}
        <div className="relative flex gap-2">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">Fazer solicitação</span>
          <span className="inline-flex items-center rounded-full border border-white/30 px-3 py-1 text-xs">Saiba mais</span>
        </div>
      </div>
    </div>
  );
}

// ─── Section Body (type-specific) ────────────────────────────────────────────

function SectionBody({
  section,
  cabinet,
  draft,
  onUpdateConfig,
  onUpdateDraft,
}: {
  section: CabinetSection;
  cabinet: Cabinet;
  draft: CabinetContentDraft;
  onUpdateConfig: (p: Record<string, unknown>) => void;
  onUpdateDraft: (p: Partial<CabinetContentDraft>) => void;
}) {
  const config = section.config ?? {};

  switch (section.type) {
    case "HERO": {
      const heroSlides = (config.slides as HeroSlide[]) ?? [];
      return (
        <>
          <EditorGroup label="Logo do gabinete">
            <ImagePicker
              aspect="logo"
              currentUrl={cabinet.logoUrl}
              file={draft.logoFile}
              hint="Substitui o logo padrão no cabeçalho do perfil público · recomendado 320×120 px (horizontal), fundo transparente (PNG) · máx 5 MB"
              onSelect={(file) => onUpdateDraft({ logoFile: file })}
            />
          </EditorGroup>
          <EditorGroup label="Imagem principal da capa">
            <ImagePicker
              aspect="banner"
              currentUrl={cabinet.bannerUrl}
              file={draft.bannerFile}
              hint="1920×800 px recomendado · JPG ou PNG · máx 5 MB"
              onSelect={(file) => onUpdateDraft({ bannerFile: file })}
            />
          </EditorGroup>
          <HeroSlidesRepeater
            slides={heroSlides}
            onChange={(next) => onUpdateConfig({ slides: next })}
          />
          <EditorGroup label="Botões de ação">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <Label className="text-xs">Botão principal</Label>
                <Input
                  value={(config.primaryCtaLabel as string) ?? ""}
                  onChange={(e) => onUpdateConfig({ primaryCtaLabel: e.target.value })}
                  placeholder="Fazer uma solicitação"
                />
              </Field>
              <Field>
                <Label className="text-xs">Botão secundário</Label>
                <Input
                  value={(config.secondaryCtaLabel as string) ?? ""}
                  onChange={(e) => onUpdateConfig({ secondaryCtaLabel: e.target.value })}
                  placeholder="Conheça o Gabinete"
                />
              </Field>
            </div>
          </EditorGroup>
        </>
      );
    }

    case "BIOGRAPHY":
      return (
        <>
          <EditorGroup label="Foto do mandato">
            <ImagePicker
              aspect="square"
              currentUrl={cabinet.biographyPhotoUrl || cabinet.avatarUrl}
              file={draft.photoFile}
              hint="Foto quadrada do parlamentar ou equipe · máx 5 MB"
              onSelect={(file) => onUpdateDraft({ photoFile: file })}
            />
          </EditorGroup>
          <EditorGroup label="Texto de apresentação">
            <Textarea
              value={draft.biographyContent ?? cabinet.biographyContent ?? ""}
              onChange={(e) => onUpdateDraft({ biographyContent: e.target.value })}
              placeholder="Conte a trajetória do mandato, causas defendidas e conquistas para a comunidade..."
              rows={6}
              className="resize-none text-sm leading-relaxed"
            />
            <CharCount value={draft.biographyContent ?? cabinet.biographyContent ?? ""} max={800} />
          </EditorGroup>
          <BiographyPreview
            name={cabinet.name}
            accent={cabinet.accentColor || "#2563EB"}
            photoUrl={draft.photoFile ? URL.createObjectURL(draft.photoFile) : cabinet.biographyPhotoUrl || cabinet.avatarUrl}
            text={draft.biographyContent ?? cabinet.biographyContent ?? ""}
          />
        </>
      );

    case "PRIORITIES": {
      const items = (config.items as PriorityItem[]) ?? [];
      return (
        <>
          <PrioritiesRepeater items={items} onChange={(next) => onUpdateConfig({ items: next })} />
          {items.length > 0 && <PrioritiesPreview items={items} accent={cabinet.accentColor || "#2563EB"} />}
        </>
      );
    }

    case "TIMELINE": {
      const items = (config.items as TimelineItem[]) ?? [];
      return (
        <>
          <TimelineRepeater items={items} onChange={(next) => onUpdateConfig({ items: next })} />
          {items.length > 0 && <TimelinePreview items={items} accent={cabinet.accentColor || "#2563EB"} />}
        </>
      );
    }

    case "FAQ": {
      const items = (config.items as FaqItem[]) ?? [];
      return (
        <>
          <FaqRepeater items={items} onChange={(next) => onUpdateConfig({ items: next })} />
          {items.length > 0 && <FaqPreview items={items} />}
        </>
      );
    }

    case "GALLERY": {
      const images = (config.images as GalleryImage[]) ?? [];
      return <GalleryEditor images={images} onChange={(next) => onUpdateConfig({ images: next })} />;
    }

    case "TESTIMONIALS": {
      const items = (config.items as TestimonialItem[]) ?? [];
      return (
        <>
          <TestimonialsRepeater items={items} onChange={(next) => onUpdateConfig({ items: next })} />
          {items.length > 0 && <TestimonialsPreview items={items} accent={cabinet.accentColor || "#2563EB"} />}
        </>
      );
    }

    case "STATS":
      return <StatsPanel slug={cabinet.slug} />;

    case "CONTACT":
      return <ContactPanel cabinet={cabinet} draft={draft} onUpdateDraft={onUpdateDraft} />;

    case "DEMANDS_CTA":
      return (
        <AutoSectionPanel
          icon={<MessageSquarePlus className="size-4 text-primary" />}
          title="Seção automática"
          description="Mostra um bloco de destaque com botão para o cidadão registrar uma demanda. O botão abre o formulário de solicitação automaticamente."
          tip="Personalize o título e subtítulo acima para dar o seu toque."
        />
      );

    case "RESULTS":
      return (
        <AutoSectionPanel
          icon={<Award className="size-4 text-primary" />}
          title="Seção automática"
          description="Exibe automaticamente as demandas resolvidas mais recentes, com fotos e resultados registrados pela equipe."
          tip="Quanto mais demandas finalizadas com resultado, mais forte essa vitrine fica."
        />
      );

    default:
      return (
        <AutoSectionPanel
          icon={<LayoutTemplate className="size-4 text-muted-foreground" />}
          title="Seção automática"
          description="Esta seção usa os dados do gabinete automaticamente."
          tip="Personalize o título e subtítulo acima."
        />
      );
  }
}

// ─── Previews ─────────────────────────────────────────────────────────────────

function BiographyPreview({ name, accent, photoUrl, text }: { name: string; accent: string; photoUrl?: string | null; text: string }) {
  if (!text && !photoUrl) return null;
  return (
    <EditorGroup label="Pré-visualização">
      <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Sobre o mandato</span>
        </div>
        <div className="flex items-start gap-4 p-4">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-14 aspect-[3/4] rounded-xl object-cover shrink-0 shadow-sm border border-border/40" />
          ) : (
            <div
              className="w-14 aspect-[3/4] rounded-xl shrink-0 flex items-center justify-center text-2xl font-black text-white"
              style={{ backgroundColor: accent }}
            >
              {name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 pt-0.5">
            <p className="text-xs font-bold text-foreground leading-none">{name}</p>
            {text && (
              <p className="text-2xs text-muted-foreground mt-2 line-clamp-5 leading-relaxed">{text}</p>
            )}
          </div>
        </div>
      </div>
    </EditorGroup>
  );
}

function PrioritiesPreview({ items, accent }: { items: PriorityItem[]; accent: string }) {
  return (
    <EditorGroup label="Pré-visualização">
      <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Prioridades</span>
          <span className="text-2xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="divide-y divide-border/40">
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="text-xl font-black tabular-nums leading-none mt-0.5 opacity-20" style={{ color: accent }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-1">{item.title}</p>
                {item.description && (
                  <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {items.length > 3 && (
          <p className="text-2xs text-muted-foreground text-center py-2 border-t border-border/40">
            + {items.length - 3} prioridades
          </p>
        )}
      </div>
    </EditorGroup>
  );
}

function TimelinePreview({ items, accent }: { items: TimelineItem[]; accent: string }) {
  return (
    <EditorGroup label="Pré-visualização">
      <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Linha do tempo</span>
          <span className="text-2xs text-muted-foreground">{items.length} marco{items.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="relative flex flex-col gap-0 pl-8 pr-4 py-3">
          <div className="absolute left-5 top-4 bottom-4 w-px" style={{ backgroundColor: `${accent}30` }} />
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="relative flex gap-3 pb-3.5 last:pb-0">
              <div
                className="absolute -left-3 mt-0.5 size-2 rounded-full shrink-0"
                style={{ backgroundColor: accent }}
              />
              <div>
                {item.date && <span className="text-2xs font-bold uppercase tracking-widest" style={{ color: accent }}>{item.date}</span>}
                <p className="text-xs font-semibold text-foreground leading-snug">{item.title}</p>
              </div>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-2xs text-muted-foreground">+ {items.length - 3} marcos</p>
          )}
        </div>
      </div>
    </EditorGroup>
  );
}

function FaqPreview({ items }: { items: FaqItem[] }) {
  return (
    <EditorGroup label="Pré-visualização">
      <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Perguntas frequentes</span>
          <span className="text-2xs text-muted-foreground">{items.length} pergunta{items.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="divide-y divide-border/40">
          {items.slice(0, 3).map((item, i) => (
            <div key={i} className="px-4 py-2.5">
              <p className="text-xs font-semibold text-foreground line-clamp-1">{item.question}</p>
              <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-1">{item.answer}</p>
            </div>
          ))}
        </div>
        {items.length > 3 && (
          <p className="text-2xs text-muted-foreground text-center py-2 border-t border-border/40">
            + {items.length - 3} perguntas
          </p>
        )}
      </div>
    </EditorGroup>
  );
}

// ─── Auto section panel ───────────────────────────────────────────────────────

function AutoSectionPanel({ icon, title, description, tip }: { icon: ReactNode; title: string; description: string; tip?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 mt-0.5 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        {tip && (
          <p className="text-xs text-primary mt-2 font-medium">{tip}</p>
        )}
      </div>
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────

function StatsPanel({ slug }: { slug: string }) {
  const { data: metrics, isLoading } = useGetCabinetMetrics(slug);
  return (
    <>
      <AutoSectionPanel
        icon={<TrendingUp className="size-4 text-primary" />}
        title="Contadores em tempo real"
        description="Os números são calculados automaticamente a partir das demandas reais — sem edição manual, garantindo transparência."
      />
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : metrics ? (
        <EditorGroup label="Dados atuais">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Recebidas", value: metrics.total },
              { label: "Resolvidas", value: metrics.resolved },
              { label: "Em andamento", value: metrics.statusCounts.IN_PROGRESS },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-3 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-2xs uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </EditorGroup>
      ) : null}
    </>
  );
}

// ─── Contact panel ────────────────────────────────────────────────────────────

function ContactPanel({ cabinet, draft, onUpdateDraft }: { cabinet: Cabinet; draft: CabinetContentDraft; onUpdateDraft: (p: Partial<CabinetContentDraft>) => void }) {
  return (
    <>
      <AutoSectionPanel
        icon={<Mail className="size-4 text-primary" />}
        title="Canais de contato"
        description="Configure abaixo os canais que aparecerão na seção de contato da sua página pública."
      />
      <EditorGroup label="Redes sociais e contato">
        <div className="flex flex-col gap-2.5">
          <Field>
            <Label className="text-xs flex items-center gap-1.5">
              <Phone className="size-3 text-muted-foreground" /> WhatsApp
            </Label>
            <Input
              value={draft.whatsappUrl ?? cabinet.whatsappUrl ?? ""}
              onChange={(e) => onUpdateDraft({ whatsappUrl: e.target.value || null })}
              placeholder="https://wa.me/5511999999999"
            />
          </Field>
          <Field>
            <Label className="text-xs flex items-center gap-1.5">
              <Youtube className="size-3 text-muted-foreground" /> YouTube
            </Label>
            <Input
              value={draft.youtubeUrl ?? cabinet.youtubeUrl ?? ""}
              onChange={(e) => onUpdateDraft({ youtubeUrl: e.target.value || null })}
              placeholder="https://youtube.com/@seugabinete"
            />
          </Field>
          <Field>
            <Label className="text-xs flex items-center gap-1.5">
              <Video className="size-3 text-muted-foreground" /> TikTok
            </Label>
            <Input
              value={draft.tiktokUrl ?? cabinet.tiktokUrl ?? ""}
              onChange={(e) => onUpdateDraft({ tiktokUrl: e.target.value || null })}
              placeholder="https://tiktok.com/@seugabinete"
            />
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">
          Instagram, Facebook, Twitter e Site são gerenciados nas{" "}
          <Link to="/settings" className="text-primary underline">configurações gerais</Link>.
        </p>
      </EditorGroup>
    </>
  );
}

// ─── Hero Slides Repeater ─────────────────────────────────────────────────────

function HeroSlidesRepeater({ slides, onChange }: { slides: HeroSlide[]; onChange: (next: HeroSlide[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Build preview URLs for slides that already have a URL (persisted)
  // and for newly added local files (tracked in previews state)
  useEffect(() => {
    return () => { previews.forEach((p) => { if (p.startsWith("blob:")) URL.revokeObjectURL(p); }); };
  }, [previews]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 5 - slides.length;
    const valid = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);
    if (!valid.length) return;

    const oversized = valid.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length) { toast.error(`${oversized.length} imagem(ns) maior que 5 MB ignorada(s).`); }

    const ok = valid.filter((f) => f.size <= 5 * 1024 * 1024);
    if (!ok.length) return;

    const newSlides = ok.map((f) => ({ url: URL.createObjectURL(f), caption: "" }));
    setPreviews((prev) => [...prev, ...newSlides.map((s) => s.url)]);
    onChange([...slides, ...newSlides]);
  }

  const isCarousel = slides.length > 1;

  return (
    <EditorGroup label="Imagens adicionais da capa">
      {/* Mode indicator */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {slides.length === 0
              ? "Apenas a imagem principal"
              : isCarousel
              ? `Carrossel — ${slides.length + 1} imagens`
              : "Imagem adicional ativa"}
          </p>
          <p className="text-2xs text-muted-foreground mt-0.5">
            {slides.length === 0
              ? "Adicione imagens abaixo para ativar o carrossel automático."
              : "As imagens rodam automaticamente com a principal acima."}
          </p>
        </div>
        {slides.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="shrink-0 text-2xs text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            Remover carrossel
          </button>
        )}
      </div>

      {/* Slide list */}
      {slides.length > 0 && (
        <div className="flex flex-col gap-2">
          {slides.map((slide, index) => (
            <div key={index} className="group flex items-center gap-2.5 rounded-xl border border-border bg-card p-2">
              {slide.url && (
                <img
                  src={slide.url}
                  alt=""
                  className="size-11 rounded-lg object-cover shrink-0 border border-border/50"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <Input
                  value={slide.caption ?? ""}
                  onChange={(e) => onChange(slides.map((s, i) => i === index ? { ...s, caption: e.target.value } : s))}
                  placeholder="Legenda (opcional)..."
                  className="h-7 text-xs border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...slides];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    onChange(next);
                  }}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors"
                >
                  <ChevronLeft className="size-3" />
                </button>
                <button
                  type="button"
                  disabled={index === slides.length - 1}
                  onClick={() => {
                    const next = [...slides];
                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                    onChange(next);
                  }}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors"
                >
                  <ChevronRight className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(slides.filter((_, i) => i !== index))}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground/50 hover:text-destructive transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload trigger */}
      {slides.length < 5 && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-xs font-medium transition-all",
              "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/20",
            )}
          >
            <ImageIcon className="size-3.5" />
            {slides.length === 0 ? "Adicionar imagens ao carrossel" : `Adicionar mais (${5 - slides.length} restante${5 - slides.length !== 1 ? "s" : ""})`}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
          />
        </>
      )}
    </EditorGroup>
  );
}

// ─── Priorities Repeater ──────────────────────────────────────────────────────

function PrioritiesRepeater({ items, onChange }: { items: PriorityItem[]; onChange: (next: PriorityItem[]) => void }) {
  return (
    <EditorGroup label={`Prioridades do mandato (${items.length}/9)`}>
      {items.length === 0 && (
        <EmptyRepeaterHint text="Adicione as principais bandeiras do mandato. Elas aparecem em cards visuais na página." />
      )}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="group relative rounded-xl border border-border bg-card p-3.5 transition-shadow hover:shadow-sm">
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute top-2.5 right-2.5 size-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              <X className="size-3.5" />
            </button>
            <div className="flex flex-col gap-2 pr-6">
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-2xs font-bold text-muted-foreground">{index + 1}</span>
                <Input
                  value={item.title}
                  onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, title: e.target.value } : it))}
                  placeholder="Ex: Saúde nos bairros"
                  className="h-7 text-sm font-medium border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 flex-1"
                />
              </div>
              <Textarea
                value={item.description ?? ""}
                onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, description: e.target.value } : it))}
                placeholder="Descreva o compromisso em uma ou duas frases..."
                rows={2}
                className="resize-none text-xs leading-relaxed bg-muted/30 border-border/50"
              />
            </div>
          </div>
        ))}
      </div>
      {items.length < 9 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-1.5 border-dashed"
          onClick={() => onChange([...items, { title: "", description: "" }])}
        >
          <Plus className="size-3.5" />
          Adicionar prioridade
        </Button>
      )}
    </EditorGroup>
  );
}

// ─── Timeline Repeater ────────────────────────────────────────────────────────

function TimelineRepeater({ items, onChange }: { items: TimelineItem[]; onChange: (next: TimelineItem[]) => void }) {
  return (
    <EditorGroup label={`Linha do tempo (${items.length}/12 marcos)`}>
      {items.length === 0 && (
        <EmptyRepeaterHint text="Registre os marcos históricos do mandato em ordem cronológica." />
      )}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="group relative rounded-xl border border-border bg-card p-3.5">
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute top-2.5 right-2.5 size-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              <X className="size-3.5" />
            </button>
            <div className="flex flex-col gap-2 pr-6">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <Input
                  value={item.date}
                  onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, date: e.target.value } : it))}
                  placeholder="2024"
                  className="h-8 text-xs font-mono"
                />
                <Input
                  value={item.title}
                  onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, title: e.target.value } : it))}
                  placeholder="Título do marco"
                  className="h-8 text-xs"
                />
              </div>
              <Textarea
                value={item.description ?? ""}
                onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, description: e.target.value } : it))}
                placeholder="Detalhe o que aconteceu (opcional)..."
                rows={2}
                className="resize-none text-xs leading-relaxed bg-muted/30 border-border/50"
              />
            </div>
          </div>
        ))}
      </div>
      {items.length < 12 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-1.5 border-dashed"
          onClick={() => onChange([...items, { date: "", title: "", description: "" }])}
        >
          <Plus className="size-3.5" />
          Adicionar marco
        </Button>
      )}
    </EditorGroup>
  );
}

// ─── FAQ Repeater ─────────────────────────────────────────────────────────────

function FaqRepeater({ items, onChange }: { items: FaqItem[]; onChange: (next: FaqItem[]) => void }) {
  return (
    <EditorGroup label={`Perguntas frequentes (${items.length}/12)`}>
      {items.length === 0 && (
        <EmptyRepeaterHint text="Responda as dúvidas mais comuns dos cidadãos em formato de sanfona interativa." />
      )}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="group relative rounded-xl border border-border bg-card p-3.5">
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute top-2.5 right-2.5 size-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              <X className="size-3.5" />
            </button>
            <div className="flex flex-col gap-2 pr-6">
              <Input
                value={item.question}
                onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, question: e.target.value } : it))}
                placeholder="Ex: Como acompanho minha demanda?"
                className="h-8 text-xs font-medium"
              />
              <Textarea
                value={item.answer}
                onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, answer: e.target.value } : it))}
                placeholder="Escreva a resposta completa..."
                rows={3}
                className="resize-none text-xs leading-relaxed bg-muted/30 border-border/50"
              />
            </div>
          </div>
        ))}
      </div>
      {items.length < 12 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-1.5 border-dashed"
          onClick={() => onChange([...items, { question: "", answer: "" }])}
        >
          <Plus className="size-3.5" />
          Adicionar pergunta
        </Button>
      )}
    </EditorGroup>
  );
}

// ─── Testimonials Repeater ────────────────────────────────────────────────────

function TestimonialsRepeater({ items, onChange }: { items: TestimonialItem[]; onChange: (next: TestimonialItem[]) => void }) {
  return (
    <EditorGroup label={`Depoimentos (${items.length}/12)`}>
      {items.length === 0 && (
        <EmptyRepeaterHint text="Adicione depoimentos de cidadãos, parceiros ou apoiadores. Eles aparecem em cards com avatar gerado automaticamente." />
      )}
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="group relative rounded-xl border border-border bg-card p-3.5">
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="absolute top-2.5 right-2.5 size-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive transition-colors"
            >
              <X className="size-3.5" />
            </button>
            <div className="flex flex-col gap-2 pr-6">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={item.authorName}
                  onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, authorName: e.target.value } : it))}
                  placeholder="Nome do autor"
                  className="h-8 text-xs font-medium"
                />
                <Input
                  value={item.authorRole ?? ""}
                  onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, authorRole: e.target.value } : it))}
                  placeholder="Contexto (ex: Morador do Centro)"
                  className="h-8 text-xs"
                />
              </div>
              <Textarea
                value={item.text}
                onChange={(e) => onChange(items.map((it, i) => i === index ? { ...it, text: e.target.value } : it))}
                placeholder="Escreva o depoimento..."
                rows={2}
                className="resize-none text-xs leading-relaxed bg-muted/30 border-border/50"
              />
            </div>
          </div>
        ))}
      </div>
      {items.length < 12 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit gap-1.5 border-dashed"
          onClick={() => onChange([...items, { authorName: "", authorRole: "", text: "", rating: 5 }])}
        >
          <Plus className="size-3.5" />
          Adicionar depoimento
        </Button>
      )}
    </EditorGroup>
  );
}

function TestimonialsPreview({ items, accent }: { items: TestimonialItem[]; accent: string }) {
  return (
    <EditorGroup label="Pré-visualização">
      <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Depoimentos</span>
          <span className="text-2xs text-muted-foreground">{items.length} depoimento{items.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="divide-y divide-border/40">
          {items.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div
                className="size-7 shrink-0 rounded-full flex items-center justify-center text-white text-2xs font-bold mt-0.5"
                style={{ backgroundColor: accent }}
              >
                {item.authorName ? item.authorName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground leading-none truncate mb-0.5">{item.authorName || "—"}</p>
                {item.text && <p className="text-2xs text-muted-foreground line-clamp-2">"{item.text}"</p>}
              </div>
            </div>
          ))}
        </div>
        {items.length > 2 && (
          <p className="text-2xs text-muted-foreground text-center py-2 border-t border-border/40">
            + {items.length - 2} depoimentos
          </p>
        )}
      </div>
    </EditorGroup>
  );
}

// ─── Gallery Editor ───────────────────────────────────────────────────────────

function GalleryEditor({ images, onChange }: { images: GalleryImage[]; onChange: (next: GalleryImage[]) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFileDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length) { toast.error(`${oversized.length} imagem(ns) maior que 5 MB ignorada(s).`); }
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (!valid.length) return;
    toast.info("Para a galeria, cole a URL pública das imagens.");
  }

  return (
    <EditorGroup label={`Galeria de fotos (${images.length}/12)`}>
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-4 transition-colors",
          isDragOver ? "border-primary/40 bg-primary/5" : "border-border/60 bg-muted/10",
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleFileDrop}
      >
        {images.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <ImageIcon className="size-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Cole URLs de imagens para exibir na galeria</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                {img.url ? (
                  <img src={img.url} alt={img.caption ?? ""} className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <ImageIcon className="size-5 text-muted-foreground/30" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 size-5 flex items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {images.length < 12 && (
        <div className="flex flex-col gap-2.5">
          <AddGalleryUrlRow onAdd={(url, caption) => onChange([...images, { url, caption }])} />
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">Legendas</p>
          {images.map((img, index) => (
            <div key={index} className="flex items-center gap-2">
              {img.url ? (
                <img src={img.url} alt="" className="size-8 rounded-md object-cover shrink-0 border border-border" />
              ) : (
                <div className="size-8 rounded-md bg-muted shrink-0" />
              )}
              <Input
                value={img.caption ?? ""}
                onChange={(e) => onChange(images.map((it, i) => i === index ? { ...it, caption: e.target.value } : it))}
                placeholder="Legenda opcional..."
                className="h-7 text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </EditorGroup>
  );
}

function AddGalleryUrlRow({ onAdd }: { onAdd: (url: string, caption: string) => void }) {
  const [url, setUrl] = useState("");

  function handleAdd() {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http")) { toast.error("Cole uma URL pública válida (https://...)."); return; }
    onAdd(trimmed, "");
    setUrl("");
  }

  return (
    <div className="flex gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://exemplo.com/foto.jpg"
        className="text-xs flex-1"
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
      />
      <Button type="button" size="sm" variant="outline" onClick={handleAdd} className="shrink-0 gap-1.5 px-3">
        <Plus className="size-3.5" />
        Adicionar
      </Button>
    </div>
  );
}

// ─── Image Picker ─────────────────────────────────────────────────────────────

function ImagePicker({
  aspect,
  currentUrl,
  file,
  hint,
  onSelect,
}: {
  aspect: "banner" | "square" | "logo";
  currentUrl?: string | null;
  file: File | null;
  hint: string;
  onSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const displayUrl = previewUrl ?? currentUrl;

  const handleFile = useCallback((selected: File | undefined) => {
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo 5 MB."); return; }
    onSelect(selected);
  }, [onSelect]);

  function handleDrop(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all hover:border-primary/40 hover:bg-muted/40",
          displayUrl ? "border-border/60 bg-muted/10" : "border-border/50 bg-muted/20",
          aspect === "banner" ? "aspect-[3/1] w-full" : aspect === "logo" ? "size-20" : "size-32",
        )}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt=""
              className={cn("absolute inset-0 size-full", aspect === "logo" ? "object-contain p-2" : "object-cover")}
            />
            <span className="relative z-10 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <Upload className="size-3" />
              Trocar imagem
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
            <ImageIcon className="size-5" />
            <span className="text-xs font-medium">Clique ou arraste para enviar</span>
          </span>
        )}
      </button>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{hint}</p>
        {file && (
          <span className="flex items-center gap-1 text-xs font-medium text-primary">
            <CheckCircle2 className="size-3" />
            Nova imagem selecionada
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Accent Color Picker ──────────────────────────────────────────────────────

function AccentColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Cor de destaque da página"
        className="flex items-center gap-1.5 h-8 rounded-lg border border-border/60 bg-card px-2.5 shadow-sm hover:bg-muted transition-colors text-xs font-medium text-foreground"
      >
        <span
          className="size-4 rounded-md border border-border/40 shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="hidden sm:inline text-xs font-mono">{value}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1.5 z-20 rounded-xl border border-border bg-card shadow-xl p-3 w-52 flex flex-col gap-3">
            <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cor de destaque
            </p>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.label}
                  onClick={() => { onChange(preset.value); setOpen(false); }}
                  className={cn(
                    "size-9 rounded-lg border-2 transition-all hover:scale-110",
                    value === preset.value ? "border-foreground scale-110" : "border-transparent",
                  )}
                  style={{ backgroundColor: preset.value }}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-2xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* Custom color */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="size-9 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/40 transition-colors shrink-0"
                style={{ backgroundColor: value }}
                title="Cor personalizada"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
                }}
                className="flex-1 h-8 rounded-lg border border-border bg-muted/30 px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/40"
                placeholder="#2563EB"
                maxLength={7}
              />
              <input
                ref={inputRef}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />
            </div>

            {/* Preview */}
            <div
              className="rounded-lg px-3 py-2 text-xs font-semibold text-white text-center"
              style={{ backgroundColor: value }}
            >
              Pré-visualização
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function EditorGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  return (
    <p className={cn("text-xs text-right tabular-nums", len > max * 0.9 ? "text-amber-600" : "text-muted-foreground")}>
      {len} / {max}
    </p>
  );
}

function EmptyRepeaterHint({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-3">
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
