import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/use-seo";
import { getPageSeo } from "@/seo.config";

export function TermsOfUsePage() {
  useSeo(getPageSeo("termsOfUse"));

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
          <p className="text-muted-foreground text-sm">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="border rounded-lg bg-card p-6 md:p-10 shadow-sm">
          <div className="h-[500px] overflow-y-auto pr-4 space-y-8 text-sm leading-relaxed text-zinc-600">
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar a plataforma Gabinete, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Descrição do Serviço</h2>
              <p>
                O Gabinete é uma plataforma de gestão de demandas públicas e transparência. O serviço permite que cidadãos 
                registrem solicitações, acompanhem o progresso e visualizem resultados oficiais postados pelos gabinetes parceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Cadastro e Segurança</h2>
              <p>
                Para utilizar certas funcionalidades, você pode ser solicitado a criar uma conta. Você é responsável por 
                manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Uso Adequado</h2>
              <p>Você concorda em não usar a plataforma para:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Postar conteúdo ilegal, ofensivo ou difamatório;</li>
                <li>Enviar informações falsas ou enganosas;</li>
                <li>Interferir na segurança ou integridade da plataforma;</li>
                <li>Praticar spam ou assédio contra membros de gabinetes ou outros usuários.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo e software associados à plataforma são de propriedade exclusiva do Gabinete ou de seus licenciadores. 
                O uso da plataforma não concede a você nenhum direito de propriedade intelectual sobre o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Limitação de Responsabilidade</h2>
              <p>
                O Gabinete atua como facilitador de comunicação. Não nos responsabilizamos pela execução física das demandas 
                registradas, que permanecem sob responsabilidade legal dos respectivos órgãos e gabinetes públicos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Alterações nos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre 
                alterações significativas através da plataforma ou por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Contato</h2>
              <p>
                Dúvidas sobre estes termos podem ser enviadas para <a href="mailto:suporte@gabinete.app" className="text-primary hover:underline">suporte@gabinete.app</a>.
              </p>
            </section>
          </div>
        </div>

        <div className="flex justify-center">
          <Link to="/sign-up" className="text-sm text-zinc-500 hover:text-primary underline-offset-4 hover:underline">
            Voltar para o cadastro
          </Link>
        </div>
      </div>
    </div>
  );
}
