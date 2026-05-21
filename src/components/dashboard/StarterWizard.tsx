import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Calculator,
  CheckCircle,
  Target,
  Map,
  Repeat2,
  ArrowRight,
  ArrowLeft,
  Compass,
} from 'lucide-react';

type Step = 'goal' | 'situation' | 'recommendation';

type Goal = 'analyze' | 'compare' | 'price' | 'exchange';

interface Recommendation {
  toolKey: 'simulador' | 'decisor' | 'preco_teto' | 'hbu' | 'permuta';
  label: string;
  icon: typeof Calculator;
  color: string;
  path: string;
  why: string;
}

const RECOMMENDATIONS: Record<string, Recommendation> = {
  simulador: {
    toolKey: 'simulador',
    label: 'Simulador',
    icon: Calculator,
    color: 'text-blue-500',
    path: '/simulador',
    why: 'Modela receita, OPEX, indexação e valor de saída pra projetar TIR, NPV e Cap Rate ao longo do tempo.',
  },
  decisor: {
    toolKey: 'decisor',
    label: 'Decisor',
    icon: CheckCircle,
    color: 'text-amber-500',
    path: '/decisor',
    why: 'Compara o preço pedido com o "strike price" que faz sentido pra você e dá um veredicto GO / NEGOTIATE / NO-GO.',
  },
  preco_teto: {
    toolKey: 'preco_teto',
    label: 'Preço Teto',
    icon: Target,
    color: 'text-rose-500',
    path: '/preco-teto',
    why: 'Calcula o preço máximo a pagar para entregar a sua TIR ou Cap Rate alvo.',
  },
  hbu: {
    toolKey: 'hbu',
    label: 'H&BU',
    icon: Map,
    color: 'text-emerald-500',
    path: '/highest-best-use',
    why: 'Compara residencial, comercial e misto para descobrir o melhor uso de um terreno.',
  },
  permuta: {
    toolKey: 'permuta',
    label: 'Permuta',
    icon: Repeat2,
    color: 'text-purple-500',
    path: '/permuta',
    why: 'Compara vender o imóvel à vista com fechar parceria/permuta com uma incorporadora.',
  },
};

interface StarterWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StarterWizard({ open, onOpenChange }: StarterWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [situation, setSituation] = useState<string | null>(null);

  const reset = () => {
    setStep('goal');
    setGoal(null);
    setSituation(null);
  };

  const close = () => {
    onOpenChange(false);
    // pequeno delay pra animação fechar antes de resetar
    setTimeout(reset, 200);
  };

  const recommendation: Recommendation | null = (() => {
    if (!goal) return null;
    if (goal === 'analyze') return RECOMMENDATIONS.simulador;
    if (goal === 'price') return RECOMMENDATIONS.preco_teto;
    if (goal === 'exchange') return RECOMMENDATIONS.permuta;
    if (goal === 'compare') {
      if (situation === 'land') return RECOMMENDATIONS.hbu;
      if (situation === 'offer') return RECOMMENDATIONS.decisor;
      return RECOMMENDATIONS.decisor;
    }
    return null;
  })();

  const goToTool = () => {
    if (!recommendation) return;
    navigate(recommendation.path);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="max-w-lg animate-scale-in">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Compass className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="font-serif text-xl">Por onde começar?</DialogTitle>
              <DialogDescription>Em 2 cliques, te levo à ferramenta certa.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 'goal' && (
          <div className="space-y-2 mt-2">
            <p className="text-sm text-muted-foreground mb-3">O que você quer fazer agora?</p>
            <WizardOption
              icon={Calculator}
              iconColor="text-blue-500"
              title="Analisar um imóvel que estou avaliando"
              hint="Receita, custos, TIR e valor de saída"
              onClick={() => {
                setGoal('analyze');
                setStep('recommendation');
              }}
            />
            <WizardOption
              icon={CheckCircle}
              iconColor="text-amber-500"
              title="Comparar uma oportunidade concreta"
              hint="Já tenho um preço pedido ou um terreno em mãos"
              onClick={() => {
                setGoal('compare');
                setStep('situation');
              }}
            />
            <WizardOption
              icon={Target}
              iconColor="text-rose-500"
              title="Descobrir quanto vale pagar"
              hint="Tenho uma TIR/Cap Rate alvo e quero o preço teto"
              onClick={() => {
                setGoal('price');
                setStep('recommendation');
              }}
            />
            <WizardOption
              icon={Repeat2}
              iconColor="text-purple-500"
              title="Analisar uma permuta com incorporadora"
              hint="Vender à vista vs. participar do empreendimento"
              onClick={() => {
                setGoal('exchange');
                setStep('recommendation');
              }}
            />
          </div>
        )}

        {step === 'situation' && (
          <div className="space-y-2 mt-2">
            <p className="text-sm text-muted-foreground mb-3">O que você está comparando?</p>
            <WizardOption
              icon={CheckCircle}
              iconColor="text-amber-500"
              title="Uma proposta de compra"
              hint="Vale ou não pagar o preço pedido?"
              onClick={() => {
                setSituation('offer');
                setStep('recommendation');
              }}
            />
            <WizardOption
              icon={Map}
              iconColor="text-emerald-500"
              title="O melhor uso de um terreno"
              hint="Residencial vs. comercial vs. misto"
              onClick={() => {
                setSituation('land');
                setStep('recommendation');
              }}
            />
          </div>
        )}

        {step === 'recommendation' && recommendation && (
          <div className="space-y-4 mt-2">
            <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-card border border-border">
                  <recommendation.icon className={cn('h-6 w-6', recommendation.color)} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Calculadora recomendada
                  </div>
                  <div className="font-serif text-lg font-medium">{recommendation.label}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.why}</p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (goal === 'compare' && step === 'recommendation') {
                    setStep('situation');
                  } else {
                    setStep('goal');
                    setGoal(null);
                    setSituation(null);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <Button variant="gold" onClick={goToTool}>
                Ir para {recommendation.label}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WizardOption({
  icon: Icon,
  iconColor,
  title,
  hint,
  onClick,
}: {
  icon: typeof Calculator;
  iconColor: string;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-all active:scale-[0.99] group"
    >
      <div className="p-2 rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors shrink-0">
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors mt-2 shrink-0" />
    </button>
  );
}
