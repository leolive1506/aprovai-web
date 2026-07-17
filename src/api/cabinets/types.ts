export interface Cabinet {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  accentColor?: string | null;
  tagline?: string | null;
  postDemandMessage?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  whatsappUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  email?: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroVideoUrl?: string | null;
  biographyContent?: string | null;
  biographyPhotoUrl?: string | null;
  score: number;
  demand_count: number;
  in_progress_count: number;
  resolved_count: number;
  transparencyScore: number;
  resolution_rate: number;
  disabledAt?: string | null;
}

export interface CabinetMember {
  id: string;
  userId: string;
  cabinetId: string;
  role: "OWNER" | "STAFF";
  userName: string;
  userAvatarUrl: string | null;
  userEmail: string | null;
}

export interface CabinetStatusCounts {
  SUBMITTED: number;
  IN_ANALYSIS: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  REJECTED: number;
  CANCELED: number;
}

export interface CabinetMetrics {
  new: number;
  urgent: number;
  total: number;
  resolved: number;
  statusCounts: CabinetStatusCounts;
}

export interface CabinetTrendPoint {
  date: string;
  count: number;
}

export interface CabinetTrendDetailedPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface CabinetInvitation {
  id: string;
  email: string;
  cabinetId: string;
  role: "OWNER" | "STAFF";
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface CabinetInvitationDetails {
  email: string;
  role: "OWNER" | "STAFF";
  cabinetName: string;
  expiresAt: string;
}

export type CabinetSectionType =
  | 'HERO'
  | 'BIOGRAPHY'
  | 'PRIORITIES'
  | 'STATS'
  | 'RESULTS'
  | 'TESTIMONIALS'
  | 'NEWS'
  | 'GALLERY'
  | 'FAQ'
  | 'ACTION_MAP'
  | 'TIMELINE'
  | 'DEMANDS_CTA'
  | 'CONTACT';

export interface CabinetSection {
  id: string;
  cabinetId: string;
  type: CabinetSectionType;
  title: string | null;
  subtitle: string | null;
  enabled: boolean;
  sortOrder: number;
  config: Record<string, any> | null;
}

export interface HeroSlide {
  url: string;
  caption?: string;
}

export interface HeroSectionConfig {
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  showStats?: boolean;
  slides?: HeroSlide[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionConfig {
  items: FaqItem[];
}

export interface TimelineItem {
  date: string;
  title: string;
  description?: string;
}

export interface TimelineSectionConfig {
  items: TimelineItem[];
}

export interface PriorityItem {
  title: string;
  description?: string;
}

export interface PrioritiesSectionConfig {
  items: PriorityItem[];
}

export interface GalleryImage {
  url: string;
  caption?: string;
}

export interface GallerySectionConfig {
  images: GalleryImage[];
}

export interface TestimonialItem {
  authorName: string;
  authorRole?: string;
  text: string;
  rating: number;
}

export interface TestimonialsSectionConfig {
  items: TestimonialItem[];
}
