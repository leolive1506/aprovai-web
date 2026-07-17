import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import logo from "@/assets/logo-new.png"
import { WHATSAPP_URL } from "../constants"
import { trackWhatsappClick } from "@/lib/analytics"

const NAV_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Como funciona", href: "#como-funciona-steps" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
]

export function LandingHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  function scrollToWaitlist() {
    document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth" })
    setOpen(false)
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm transition-all duration-200",
        scrolled ? "shadow-sm border-b border-border" : "border-b border-transparent",
      )}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-6">
        <img src={logo} alt="Gabinete App" className="h-12 w-auto shrink-0" />

        <nav className="hidden lg:flex items-center gap-5 flex-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsappClick("header")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted whitespace-nowrap"
          >
            Falar com o CEO
          </a>
          <button
            type="button"
            onClick={scrollToWaitlist}
            className="h-9 rounded-lg px-4 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Lista de espera
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-5 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-3 border-b border-border/40 last:border-0 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-4 pb-2">
              <button
                type="button"
                onClick={scrollToWaitlist}
                className="w-full h-10 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
              >
                Entrar na lista de espera
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
