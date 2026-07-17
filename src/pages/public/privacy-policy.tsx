import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/use-seo";
import { getPageSeo } from "@/seo.config";

export function PrivacyPolicyPage() {
  useSeo(getPageSeo("privacyPolicy"));

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade (LGPD)</h1>
          <p className="text-muted-foreground text-sm">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="border rounded-lg bg-card p-6 md:p-10 shadow-sm">
          <div className="h-[500px] overflow-y-auto pr-4 space-y-8 text-sm leading-relaxed text-zinc-600">
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Introdução</h2>
              <p>
                Esta Política de Privacidade descreve como o Gabinete coleta, usa e protege suas informações 
                em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Dados Coletados</h2>
              <p>
                Coletamos apenas os dados necessários para a prestação do serviço, incluindo:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li><strong>Dados de Identificação:</strong> Nome, e-mail e telefone.</li>
                <li><strong>Dados de Localização:</strong> Endereço e coordenadas geográficas vinculadas às demandas registradas.</li>
                <li><strong>Dados de Acesso:</strong> Endereço IP, tipo de navegador e registros de atividade.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Finalidade do Tratamento</h2>
              <p>Seus dados são utilizados para:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Identificar a autoria de demandas públicas;</li>
                <li>Permitir que gabinetes entrem em contato para atualizações sobre sua solicitação;</li>
                <li>Gerar métricas agregadas e anônimas sobre problemas urbanos;</li>
                <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Compartilhamento de Dados</h2>
              <p>
                Ao registrar uma demanda em um gabinete específico, seus dados de contato e a descrição da demanda 
                serão compartilhados com os membros autorizados daquele gabinete para processamento. 
                Não vendemos ou alugamos seus dados pessoais para terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Seus Direitos</h2>
              <p>De acordo com a LGPD, você tem direito a:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Confirmar a existência de tratamento de seus dados;</li>
                <li>Acessar seus dados pessoais;</li>
                <li>Corrigir dados incompletos ou inexatos;</li>
                <li>Solicitar a anonimização ou eliminação de dados desnecessários;</li>
                <li>Revogar o consentimento a qualquer momento.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Segurança</h2>
              <p>
                Implementamos medidas técnicas e organizativas para proteger seus dados contra acessos não autorizados 
                e situações acidentais ou ilícitas de destruição, perda, alteração ou difusão.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Cookies</h2>
              <p>
                Utilizamos cookies essenciais para manter sua sessão ativa e garantir o funcionamento técnico da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Contato do Encarregado (DPO)</h2>
              <p>
                Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato com nosso 
                DPO pelo e-mail <a href="mailto:privacidade@gabinete.app" className="text-primary hover:underline">privacidade@gabinete.app</a>.
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
