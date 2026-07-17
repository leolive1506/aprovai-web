import { cn } from "@/lib/utils"
import { useInView } from "../hooks/use-in-view"

const STEPS = [
  {
    step: "01",
    title: "Cadastre o gabinete em 15 minutos",
    description: "Crie a conta, adicione a equipe e ative o portal público com o link do seu gabinete. Sem TI, sem instalação.",
  },
  {
    step: "02",
    title: "Cidadãos abrem demandas pelo portal",
    description: "Cada solicitação chega organizada, com categoria e endereço. A equipe atribui um responsável direto no kanban.",
  },
  {
    step: "03",
    title: "Resolva e prove com dados",
    description: "Cada resolução vira registro. O relatório mensal é gerado automaticamente. Pronto para a assessoria de imprensa.",
  },
]

export function StatsSection() {
  const { ref, visible } = useInView()

  return (
    <section className="py-24 sm:py-32 bg-background border-t border-border" id="como-funciona-steps">
      <div ref={ref} className="max-w-5xl mx-auto px-5 sm:px-8">
        <div
          className={cn(
            "mb-16 transition-all duration-500",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">Como funciona</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.07] max-w-sm">
            Três passos. Nenhum mistério.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {STEPS.map(({ step, title, description }, i) => (
            <div
              key={step}
              className={cn(
                "flex flex-col gap-6 transition-all duration-500",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              )}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <span
                className="font-black leading-none select-none tabular-nums text-foreground"
                style={{ fontSize: "5rem", opacity: 0.06 }}
              >
                {step}
              </span>
              <div className="flex flex-col gap-2 -mt-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="size-2 rounded-full bg-primary shrink-0" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
