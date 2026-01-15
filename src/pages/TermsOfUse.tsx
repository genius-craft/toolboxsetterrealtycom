import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, AlertTriangle, Copyright, Gavel, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfUse = () => {
  const sections = [
    { id: "aceitacao", title: "Aceitação dos Termos" },
    { id: "servicos", title: "Descrição dos Serviços" },
    { id: "cadastro", title: "Cadastro e Conta" },
    { id: "uso", title: "Uso Permitido" },
    { id: "propriedade", title: "Propriedade Intelectual" },
    { id: "disclaimer", title: "Isenção de Responsabilidade" },
    { id: "investimentos", title: "Disclaimer de Investimentos" },
    { id: "limitacao", title: "Limitação de Responsabilidade" },
    { id: "modificacoes", title: "Modificações" },
    { id: "lei", title: "Lei Aplicável" },
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
                <FileText className="w-7 h-7 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Termos de Uso
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
                {/* Aceitação */}
                <section id="aceitacao">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Scale className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Aceitação dos Termos
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Ao acessar e utilizar a plataforma Setter Toolbox ("Plataforma"), você ("Usuário") 
                      concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar 
                      com qualquer parte destes termos, não deverá utilizar a Plataforma.
                    </p>
                    <p>
                      Estes Termos de Uso constituem um acordo legal entre você e a Setter Toolbox 
                      e regem seu acesso e uso de nossos serviços.
                    </p>
                  </div>
                </section>

                {/* Serviços */}
                <section id="servicos">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Descrição dos Serviços
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      A Setter Toolbox oferece ferramentas digitais para análise e simulação de 
                      investimentos imobiliários, incluindo:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Simulador de Viabilidade:</strong> Análise de viabilidade econômica de empreendimentos.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Calculadora de Permuta:</strong> Cálculos para operações de permuta imobiliária.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Highest & Best Use:</strong> Análise de melhor uso para terrenos.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span><strong className="text-foreground">Decisor Go/No-Go:</strong> Ferramenta de apoio à decisão de investimento.</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Cadastro */}
                <section id="cadastro">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Cadastro e Conta de Usuário
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>Para utilizar determinadas funcionalidades, você deverá criar uma conta:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <span>Fornecer informações verdadeiras, precisas e atualizadas</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <span>Manter a confidencialidade de suas credenciais de acesso</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <span>Notificar imediatamente sobre uso não autorizado de sua conta</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <span>Ser responsável por todas as atividades realizadas em sua conta</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Uso */}
                <section id="uso">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Uso Permitido e Proibido
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-6">
                      <h4 className="font-medium text-success mb-3">Uso Permitido</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Utilizar as ferramentas para análise pessoal e profissional</li>
                        <li>• Salvar e exportar seus projetos e simulações</li>
                        <li>• Compartilhar resultados com clientes e parceiros</li>
                      </ul>
                    </div>
                    
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
                      <h4 className="font-medium text-destructive mb-3">Uso Proibido</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Revender, sublicenciar ou redistribuir a Plataforma</li>
                        <li>• Utilizar para fins ilegais ou fraudulentos</li>
                        <li>• Tentar acessar áreas restritas ou comprometer a segurança</li>
                        <li>• Fazer engenharia reversa ou copiar o código-fonte</li>
                        <li>• Usar bots, scrapers ou automação não autorizada</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Propriedade */}
                <section id="propriedade">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Copyright className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Propriedade Intelectual
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Todos os direitos de propriedade intelectual relacionados à Plataforma, incluindo 
                      mas não limitado a software, design, marcas, logotipos, textos e funcionalidades, 
                      são de propriedade exclusiva da Setter Toolbox ou de seus licenciadores.
                    </p>
                    <p>
                      O uso da Plataforma não confere a você qualquer direito de propriedade sobre o 
                      conteúdo ou tecnologia utilizada.
                    </p>
                  </div>
                </section>

                {/* Disclaimer Geral */}
                <section id="disclaimer">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Isenção de Responsabilidade
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      A Plataforma é fornecida "como está" e "conforme disponível". Não garantimos que 
                      os serviços serão ininterruptos, livres de erros ou completamente seguros.
                    </p>
                    <p>
                      Os cálculos e análises gerados pelas ferramentas são baseados nas informações 
                      fornecidas pelo usuário e em modelos matemáticos simplificados. Os resultados 
                      devem ser utilizados apenas como referência e não substituem a análise profissional.
                    </p>
                  </div>
                </section>

                {/* Disclaimer Investimentos - CRÍTICO */}
                <section id="investimentos">
                  <div className="bg-warning/10 border-2 border-warning/30 rounded-2xl p-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-warning" strokeWidth={2} />
                      Disclaimer de Investimentos
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="font-medium text-foreground">
                        LEIA COM ATENÇÃO - AVISO IMPORTANTE SOBRE INVESTIMENTOS:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                          <span>
                            As ferramentas e análises disponibilizadas pela Setter Toolbox têm 
                            <strong className="text-foreground"> caráter exclusivamente educacional e informativo</strong>.
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                          <span>
                            Os cálculos e resultados apresentados <strong className="text-foreground">não constituem 
                            recomendação de investimento</strong>, oferta ou solicitação de compra ou venda 
                            de qualquer ativo imobiliário ou financeiro.
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                          <span>
                            A Setter Toolbox <strong className="text-foreground">não é uma instituição financeira, 
                            corretora de valores ou consultoria de investimentos</strong> registrada na CVM 
                            (Comissão de Valores Mobiliários).
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                          <span>
                            Rentabilidade passada não é garantia de resultados futuros. Todo investimento 
                            envolve riscos, incluindo a possibilidade de <strong className="text-foreground">perda 
                            total do capital investido</strong>.
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                          <span>
                            <strong className="text-foreground">Antes de tomar qualquer decisão de investimento</strong>, 
                            consulte um profissional devidamente habilitado e registrado nos órgãos 
                            reguladores competentes.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Limitação */}
                <section id="limitacao">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Limitação de Responsabilidade
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Em nenhuma circunstância a Setter Toolbox, seus diretores, funcionários ou 
                      parceiros serão responsáveis por:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        <span>Perdas financeiras decorrentes de decisões de investimento</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        <span>Danos indiretos, incidentais ou consequenciais</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        <span>Erros ou omissões nas informações fornecidas</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-destructive" />
                        <span>Interrupções ou falhas nos serviços</span>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Modificações */}
                <section id="modificacoes">
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Modificações nos Termos
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      A Setter Toolbox reserva-se o direito de modificar estes Termos de Uso a qualquer 
                      momento. As alterações entrarão em vigor imediatamente após a publicação na Plataforma.
                    </p>
                    <p>
                      O uso continuado da Plataforma após alterações constitui aceitação dos novos termos. 
                      Recomendamos revisar periodicamente esta página.
                    </p>
                  </div>
                </section>

                {/* Lei Aplicável */}
                <section id="lei">
                  <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-3">
                    <Gavel className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    Lei Aplicável e Foro
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
                    </p>
                    <p>
                      Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, como competente 
                      para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia 
                      expressa a qualquer outro, por mais privilegiado que seja.
                    </p>
                  </div>
                </section>

                {/* Contato */}
                <section className="pt-8 border-t border-border">
                  <p className="text-muted-foreground mb-4">
                    Em caso de dúvidas sobre estes Termos de Uso, entre em contato:
                  </p>
                  <div className="bg-muted/30 rounded-xl p-6">
                    <p className="font-medium text-foreground mb-2">Setter Toolbox</p>
                    <p className="text-sm text-muted-foreground">E-mail: contato@settertoolbox.com</p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
