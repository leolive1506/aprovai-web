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
                Ao acessar e usar a plataforma Aprovai, você concorda em cumprir e estar vinculado a estes Termos de Uso.
                Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Descrição do Serviço</h2>
              <p>
                O Aprovai é uma plataforma SaaS de automação de fluxos de aprovação de compras e controle de orçamento.
                O serviço permite que empresas centralizem pedidos de compra, automatizem rotas de aprovação, gerem relatórios
                e mantenham controle total sobre gastos departamentais.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Cadastro, Autenticação e Segurança</h2>
              <p>
                Para utilizar a plataforma, você deve criar uma conta corporativa. Você é responsável por manter a confidencialidade
                de sua senha, chaves de API e por todas as atividades que ocorrem em sua conta. Notifique-nos imediatamente de
                qualquer acesso não autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Uso Adequado</h2>
              <p>Você concorda em não usar a plataforma para:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Enviar informações falsas ou enganosas sobre pedidos e fornecedores;</li>
                <li>Interferir na segurança, integridade ou disponibilidade da plataforma;</li>
                <li>Violar qualquer lei ou regulamentação fiscal/contábil aplicável;</li>
                <li>Comercializar, revender ou oferecer acesso a terceiros sem consentimento.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo, software, algoritmos e metodologias associados à plataforma Aprovai são propriedade exclusiva
                de seus proprietários. O uso da plataforma não concede a você direitos de propriedade intelectual sobre o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Limitação de Responsabilidade</h2>
              <p>
                O Aprovai fornece a infraestrutura e ferramentas para automação de aprovação de compras. Você é responsável
                pela configuração correta de regras, hierarquias de aprovação e cumprimento de suas políticas internas. Não
                nos responsabilizamos por decisões de negócio ou conformidade resultantes do uso da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Alterações nos Termos e Serviço</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos ou os recursos da plataforma a qualquer momento.
                Notificaremos sobre alterações significativas com antecedência através da plataforma ou por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Contato</h2>
              <p>
                Dúvidas sobre estes termos podem ser enviadas para <a href="mailto:suporte@aprovai.com.br" className="text-primary hover:underline">suporte@aprovai.com.br</a>.
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
