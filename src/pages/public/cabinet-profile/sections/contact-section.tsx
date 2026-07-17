import type { Cabinet, CabinetSection } from "@/api/cabinets/types";
import { ExternalLink, Facebook, Globe, Instagram, Mail, Phone, Twitter, Youtube, Video } from "lucide-react";

export function ContactSection({
  cabinet,
  section,
  accent,
}: {
  cabinet: Cabinet;
  section: CabinetSection;
  accent: string;
}) {
  const primaryChannels = [
    cabinet.whatsappUrl && {
      href: cabinet.whatsappUrl,
      icon: Phone,
      label: "WhatsApp",
      sublabel: "Fale com a equipe",
      external: true,
    },
    cabinet.email && {
      href: `mailto:${cabinet.email}`,
      icon: Mail,
      label: "E-mail",
      sublabel: cabinet.email,
      external: false,
    },
    cabinet.websiteUrl && {
      href: cabinet.websiteUrl,
      icon: Globe,
      label: "Site oficial",
      sublabel: "Portal do gabinete",
      external: true,
    },
  ].filter(Boolean) as { href: string; icon: typeof Mail; label: string; sublabel: string; external: boolean }[];

  const socialChannels = [
    cabinet.instagramUrl && { href: cabinet.instagramUrl, icon: Instagram, label: "Instagram" },
    cabinet.facebookUrl && { href: cabinet.facebookUrl, icon: Facebook, label: "Facebook" },
    cabinet.twitterUrl && { href: cabinet.twitterUrl, icon: Twitter, label: "X / Twitter" },
    cabinet.youtubeUrl && { href: cabinet.youtubeUrl, icon: Youtube, label: "YouTube" },
    cabinet.tiktokUrl && { href: cabinet.tiktokUrl, icon: Video, label: "TikTok" },
  ].filter(Boolean) as { href: string; icon: typeof Instagram; label: string }[];

  const hasAny = primaryChannels.length > 0 || socialChannels.length > 0;

  return (
    <section className="py-24 px-4 sm:px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* Header — split */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: accent }}>
              Canais oficiais
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground leading-[1.04] tracking-tight">
              {section.title || "Fale conosco"}
            </h2>
            {section.subtitle && (
              <p className="text-base text-muted-foreground mt-3 max-w-md leading-relaxed">
                {section.subtitle}
              </p>
            )}
          </div>
        </div>

        {!hasAny ? (
          <div className="rounded-lg border border-dashed border-border/60 p-12 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhum canal configurado</p>
            <p className="text-xs text-muted-foreground mt-1">Configure os canais nas configurações do gabinete.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* Primary channels — table-like horizontal rows */}
            {primaryChannels.length > 0 && (
              <div className="flex flex-col divide-y divide-border/50 border-t border-b border-border/50">
                {primaryChannels.map((channel) => (
                  <a
                    key={channel.href}
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noreferrer" : undefined}
                    className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-muted/40 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-lg"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${accent}12` }}
                      >
                        <channel.icon className="size-4" style={{ color: accent }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{channel.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">{channel.sublabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>
                      <span>Acessar</span>
                      <ExternalLink className="size-3" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Social — compact pill row */}
            {socialChannels.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Redes sociais
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialChannels.map((channel) => (
                    <a
                      key={channel.href}
                      href={channel.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md border border-border/60 bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:border-border hover:shadow-sm"
                    >
                      <channel.icon className="size-3.5 text-muted-foreground" />
                      {channel.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
