import logo from "@/assets/logo-new.png"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">

          <div className="flex flex-col gap-3">
            <img src={logo} alt="Gabinete App" className="h-10 w-auto object-contain object-left" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Gestão de demandas para gabinetes políticos.
            </p>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs text-muted-foreground">Beta em andamento</span>
            </div>
          </div>

          <div className="flex gap-10 sm:gap-14">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">Produto</p>
              <div className="flex flex-col gap-2.5">
                <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
                <a href="#como-funciona-steps" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</a>
                <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">Legal</p>
              <div className="flex flex-col gap-2.5">
                <a href="/termos-de-uso" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Termos de Uso</a>
                <a href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidade</a>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} Gabinete App. Todos os direitos reservados.</span>
          <span className="text-xs text-muted-foreground/60">Feito no Brasil.</span>
        </div>
      </div>
    </footer>
  )
}
