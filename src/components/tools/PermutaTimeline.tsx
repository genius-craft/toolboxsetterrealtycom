import { Calendar, CheckCircle2, Building2, ShoppingCart, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface PermutaTimelineProps {
  aprovacaoMeses: number;
  construcaoMeses: number;
  vendaMeses: number;
  numeroUnidades: number;
  custoMensalUnidade: number;
}

export function PermutaTimeline({
  aprovacaoMeses,
  construcaoMeses,
  vendaMeses,
  numeroUnidades,
  custoMensalUnidade,
}: PermutaTimelineProps) {
  const mesesAteVenda = construcaoMeses + vendaMeses;
  const anosCarrego = (mesesAteVenda / 12).toFixed(1);
  const custoAnualCarrego = numeroUnidades * custoMensalUnidade * 12;

  const milestones = [
    {
      icon: Calendar,
      label: "Assinatura",
      sublabel: "Hoje",
      color: "bg-blue-600",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: CheckCircle2,
      label: "Aprovação",
      sublabel: `+${aprovacaoMeses} meses`,
      color: "bg-emerald-600",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      icon: Building2,
      label: "Obra Pronta",
      sublabel: `+${construcaoMeses} meses`,
      color: "bg-orange-600",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      icon: ShoppingCart,
      label: "Vendido",
      sublabel: `+${vendaMeses} meses`,
      color: "bg-green-600",
      iconColor: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Linha do Tempo do Projeto
      </h3>

      {/* Timeline */}
      <div className="relative">
        {/* Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-orange-500 to-green-600 rounded-full" />

        {/* Milestones */}
        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${milestone.bgColor} border-4 border-background z-10`}>
                <milestone.icon className={`h-5 w-5 ${milestone.iconColor}`} />
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-foreground">{milestone.label}</p>
                <p className="text-xs text-muted-foreground">{milestone.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carrying Costs Badge */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-full px-4 py-2">
          <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">
            <span className="font-semibold">{numeroUnidades} unidades</span>
            {" × IPTU + Cond. durante "}
            <span className="font-semibold">{anosCarrego} ano(s)</span>
            {" = "}
            <span className="font-semibold">{formatCurrency(custoAnualCarrego)}/ano</span>
          </span>
        </div>
      </div>
    </div>
  );
}
