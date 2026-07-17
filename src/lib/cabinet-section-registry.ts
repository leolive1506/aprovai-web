import type { CabinetSectionType } from "@/api/cabinets/types";
import {
  Award,
  Building2,
  HelpCircle,
  Images,
  LayoutTemplate,
  ListChecks,
  Mail,
  Map,
  MessageSquarePlus,
  Newspaper,
  Quote,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface SectionMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  configurable: boolean;
}

export const SECTION_REGISTRY: Record<CabinetSectionType, SectionMeta> = {
  HERO: {
    label: "Capa",
    description: "Primeira dobra com título, chamada e botões de ação.",
    icon: LayoutTemplate,
    available: true,
    configurable: true,
  },
  BIOGRAPHY: {
    label: "Sobre",
    description: "História, missão e foto do mandato.",
    icon: UserRound,
    available: true,
    configurable: false,
  },
  PRIORITIES: {
    label: "Prioridades",
    description: "Bandeiras e áreas de atuação do mandato.",
    icon: ListChecks,
    available: true,
    configurable: true,
  },
  STATS: {
    label: "Números",
    description: "Métricas de atendimento com contadores.",
    icon: TrendingUp,
    available: true,
    configurable: false,
  },
  RESULTS: {
    label: "Resultados",
    description: "Demandas resolvidas recentemente.",
    icon: Award,
    available: true,
    configurable: false,
  },
  TESTIMONIALS: {
    label: "Depoimentos",
    description: "Avaliações reais de cidadãos atendidos.",
    icon: Quote,
    available: true,
    configurable: false,
  },
  TIMELINE: {
    label: "Linha do tempo",
    description: "Marcos e conquistas em ordem cronológica.",
    icon: Building2,
    available: true,
    configurable: true,
  },
  GALLERY: {
    label: "Galeria",
    description: "Fotos de ações, eventos e entregas.",
    icon: Images,
    available: true,
    configurable: true,
  },
  FAQ: {
    label: "Perguntas frequentes",
    description: "Dúvidas comuns dos cidadãos em formato sanfona.",
    icon: HelpCircle,
    available: true,
    configurable: true,
  },
  DEMANDS_CTA: {
    label: "Chamada para demanda",
    description: "Convite destacado para o cidadão registrar uma demanda.",
    icon: MessageSquarePlus,
    available: true,
    configurable: false,
  },
  CONTACT: {
    label: "Contato",
    description: "Canais oficiais, redes sociais e e-mail.",
    icon: Mail,
    available: true,
    configurable: false,
  },
  NEWS: {
    label: "Notícias",
    description: "Publicações e comunicados do gabinete. (em breve)",
    icon: Newspaper,
    available: false,
    configurable: false,
  },
  ACTION_MAP: {
    label: "Mapa de atuação",
    description: "Mapa com as regiões atendidas. (em breve)",
    icon: Map,
    available: false,
    configurable: false,
  },
};

export const DEFAULT_SECTION_ORDER: CabinetSectionType[] = [
  "HERO",
  "BIOGRAPHY",
  "STATS",
  "DEMANDS_CTA",
  "RESULTS",
  "TESTIMONIALS",
  "CONTACT",
];
