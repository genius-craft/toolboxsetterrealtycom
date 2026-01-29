import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Database, Eye, Lock, UserCheck, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const PrivacyPolicy = () => {
  const sections = [
    { id: "introducao", title: "Introdução" },
    { id: "dados-coletados", title: "Dados Coletados" },
    { id: "finalidade", title: "Finalidade" },
    { id: "acesso-administrativo", title: "Acesso Administrativo" },
    { id: "compartilhamento", title: "Compartilhamento" },
    { id: "cookies", title: "Cookies" },
    { id: "direitos", title: "Seus Direitos" },
    { id: "seguranca", title: "Segurança" },
    { id: "contato", title: "Contato" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Política de Privacidade
                </h1>
                <p className="text-muted-foreground mt-1">
                  Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar Navigation */}
              <nav className="hidden lg:block">
                <div className="sticky top-32 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Nesta página
                  </p>
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-muted-foreground hover:text-accent transition-colors py-1"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </nav>

              {/* Content */}
              <div className="lg:col-span-3 space-y-12">
                {/* Introdução */}
                <section id="introducao">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Introdução
                  </h2>
                  <div className="prose prose-muted max-w-none space-y-4 text-muted-foreground">
                    <p>
                      A Setter Toolbox ("nós", "nosso" ou "Controlador") está comprometida em proteger a privacidade 
                      e os dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, 
                      usamos, armazenamos e protegemos suas informações pessoais em conformidade com a Lei Geral de 
                      Proteção de Dados (LGPD - Lei nº 13.709/2018).
                    </p>
                    <p>
                      Ao utilizar nossa plataforma, você declara ter lido, compreendido e concordado com os termos 
                      desta Política de Privacidade.
                    </p>
                  </div>
                </section>

                {/* Dados Coletados */}
                <section id="dados-coletados">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Database className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Dados Coletados
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>Coletamos os seguintes tipos de dados pessoais:</p>
                    
                    <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Dados de Cadastro</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Nome completo</li>
                          <li>Endereço de e-mail</li>
                          <li>Número de telefone (opcional)</li>
                          <li>Foto de perfil (opcional)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Dados de Uso</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Projetos e simulações criados na plataforma</li>
                          <li>Configurações e preferências de uso</li>
                          <li>Histórico de acesso e navegação</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Dados Técnicos</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Endereço IP</li>
                          <li>Tipo de navegador e dispositivo</li>
                          <li>Sistema operacional</li>
                          <li>Dados de cookies e tecnologias similares</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Finalidade */}
                <section id="finalidade">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Eye className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Finalidade do Tratamento
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Prestação de Serviços:</strong> Permitir o acesso e uso das ferramentas de análise imobiliária.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Gestão de Conta:</strong> Criar e gerenciar seu cadastro na plataforma.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Comunicação:</strong> Enviar notificações importantes sobre a plataforma e atualizações.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Melhoria dos Serviços:</strong> Analisar padrões de uso para aprimorar a experiência.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Segurança:</strong> Prevenir fraudes e garantir a integridade da plataforma.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Obrigações Legais:</strong> Cumprir requisitos legais e regulatórios aplicáveis.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Acesso Administrativo - NOVA SEÇÃO */}
                <section id="acesso-administrativo">
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                      <KeyRound className="w-6 h-6 text-primary" strokeWidth={1.5} />
                      Acesso Administrativo
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Para garantir a qualidade dos serviços e oferecer suporte personalizado, 
                        nossos administradores podem acessar:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span>Projetos e simulações criados na plataforma</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span>Dados inseridos nas análises</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span>Histórico de uso e navegação</span>
                        </li>
                      </ul>
                      <p className="mt-4">
                        <strong className="text-foreground">Este acesso é utilizado exclusivamente para:</strong>
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          <span>Suporte técnico personalizado</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          <span>Melhorias contínuas nos serviços</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-accent" />
                          <span>Oferecimento de consultoria especializada</span>
                        </li>
                      </ul>
                      <p className="text-sm mt-4 bg-muted/30 p-4 rounded-lg">
                        <strong className="text-foreground">Importante:</strong> Ao utilizar a plataforma, 
                        você consente que a equipe administrativa da Setter Toolbox poderá acessar seus 
                        projetos e análises salvos para os fins descritos acima.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Compartilhamento */}
                <section id="compartilhamento">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Compartilhamento de Dados
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Podemos compartilhar seus dados pessoais com terceiros nas seguintes situações:
                    </p>
                    <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Provedores de Serviços</h4>
                        <p className="text-sm">
                          Utilizamos serviços de terceiros para operação da plataforma, incluindo:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                          <li>Supabase (banco de dados e autenticação)</li>
                          <li>Serviços de hospedagem e infraestrutura em nuvem</li>
                          <li>Ferramentas de análise de uso (anonimizados)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Obrigações Legais</h4>
                        <p className="text-sm">
                          Podemos divulgar seus dados quando exigido por lei, ordem judicial ou autoridade competente.
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">
                      <strong className="text-foreground">Importante:</strong> Não vendemos, alugamos ou comercializamos 
                      seus dados pessoais a terceiros para fins de marketing.
                    </p>
                  </div>
                </section>

                {/* Cookies */}
                <section id="cookies">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Cookies e Tecnologias Similares
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Utilizamos cookies e tecnologias similares para melhorar sua experiência:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-muted/30 rounded-xl p-4">
                        <h4 className="font-medium text-foreground mb-2">Cookies Essenciais</h4>
                        <p className="text-sm">
                          Necessários para o funcionamento básico da plataforma, como autenticação e preferências.
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-4">
                        <h4 className="font-medium text-foreground mb-2">Cookies Analíticos</h4>
                        <p className="text-sm">
                          Coletam informações sobre como você usa a plataforma para melhorias.
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">
                      Você pode gerenciar suas preferências de cookies a qualquer momento através das configurações 
                      do seu navegador.
                    </p>
                  </div>
                </section>

                {/* Direitos */}
                <section id="direitos">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Seus Direitos (LGPD)
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Conforme a LGPD, você possui os seguintes direitos sobre seus dados pessoais:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "Confirmação da existência de tratamento",
                        "Acesso aos dados",
                        "Correção de dados incompletos ou desatualizados",
                        "Anonimização, bloqueio ou eliminação",
                        "Portabilidade dos dados",
                        "Eliminação dos dados tratados com consentimento",
                        "Informação sobre compartilhamento",
                        "Revogação do consentimento",
                      ].map((right, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 bg-muted/30 rounded-lg p-3"
                        >
                          <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-sm">{right}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Segurança */}
                <section id="seguranca">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Segurança dos Dados
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span>Criptografia de dados em trânsito e em repouso</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span>Controles de acesso baseados em função</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span>Monitoramento contínuo de segurança</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span>Backups regulares e recuperação de desastres</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Contato */}
                <section id="contato">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Mail className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Contato
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, 
                      entre em contato conosco:
                    </p>
                    <div className="bg-muted/30 rounded-xl p-6">
                      <p className="font-medium text-foreground mb-2">Setter Toolbox</p>
                      <p className="text-sm">E-mail: privacidade@settertoolbox.com</p>
                      <p className="text-sm mt-2">
                        Responderemos sua solicitação no prazo de 15 (quinze) dias, conforme previsto na LGPD.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Updates */}
                <section className="pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que você 
                    revise esta página regularmente. A data da última atualização é indicada no topo deste documento.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PrivacyPolicy;
