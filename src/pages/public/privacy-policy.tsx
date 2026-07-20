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
                Esta Política de Privacidade descreve como o AprovIA coleta, usa e protege suas informações
                em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Dados Coletados</h2>
              <p>
                Coletamos apenas os dados necessários para a prestação do serviço SaaS de aprovação de compras:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li><strong>Dados de Identificação:</strong> Nome, e-mail, telefone e cargo/departamento.</li>
                <li><strong>Dados Empresariais:</strong> Informações da empresa, departamentos e estrutura organizacional.</li>
                <li><strong>Dados de Acesso:</strong> Endereço IP, tipo de navegador, registros de atividade e logs de aprovação.</li>
                <li><strong>Dados de Pedidos:</strong> Informações sobre pedidos de compra, valores, fornecedores e histórico de aprovações.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Finalidade do Tratamento</h2>
              <p>Seus dados são utilizados para:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Identificar usuários e autenticar acesso à plataforma;</li>
                <li>Processar e rastrear pedidos de compra e seus fluxos de aprovação;</li>
                <li>Enviar notificações sobre pendências e aprovações;</li>
                <li>Gerar relatórios e análises de orçamento para sua empresa;</li>
                <li>Garantir a segurança da plataforma e prevenir fraudes e acessos não autorizados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Compartilhamento de Dados</h2>
              <p>
                Seus dados são compartilhados exclusivamente com membros autorizados de sua empresa (aprovadores, gestores,
                financeiro) conforme as permissões de acesso que você define. Não vendemos ou alugamos seus dados pessoais para terceiros.
                Integrações externas (Slack, Google Workspace) ocorrem apenas com seu consentimento explícito.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Seus Direitos</h2>
              <p>De acordo com a LGPD, você tem direito a:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>Confirmar a existência de tratamento de seus dados;</li>
                <li>Acessar seus dados pessoais e histórico de atividades;</li>
                <li>Corrigir dados incompletos ou inexatos;</li>
                <li>Solicitar a exclusão de dados quando não for mais necessária a retenção;</li>
                <li>Revogar consentimentos a qualquer momento;</li>
                <li>Solicitar a portabilidade de seus dados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Segurança</h2>
              <p>
                Implementamos medidas técnicas e organizativas de segurança, incluindo criptografia em trânsito (TLS),
                autenticação de dois fatores opcional, logs de auditoria imutáveis, e retenção de dados conforme regulamentações de compliance.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Cookies e Rastreamento</h2>
              <p>
                Utilizamos cookies essenciais para manter sua sessão ativa e garantir funcionalidade da plataforma.
                Usamos analytics anônimo para melhorar nossos serviços, sem identificação pessoal.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Contato do Encarregado (DPO)</h2>
              <p>
                Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato com nosso
                DPO pelo e-mail <a href="mailto:privacidade@aprovai.com.br" className="text-primary hover:underline">privacidade@aprovai.com.br</a>.
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
