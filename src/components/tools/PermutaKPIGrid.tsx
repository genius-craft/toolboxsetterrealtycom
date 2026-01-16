import { Clock, Percent, Minus, Plus } from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface PermutaKPIGridProps {
  prazoTotalAnos: number;
  descontoTempo: number;
  vpUnidades: number;
  permutaLiquida: number;
  totalParceria: number;
  locked?: boolean;
}

export function PermutaKPIGrid({
  prazoTotalAnos,
  descontoTempo,
  vpUnidades,
  permutaLiquida,
  totalParceria,
  locked = false,
}: PermutaKPIGridProps) {
  const kpis = [
    {
      icon: Clock,
      label: "Prazo Total",
      value: `${prazoTotalAnos.toFixed(1)} anos`,
      subvalue: "até receber unidades",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      icon: Percent,
      label: "Desconto Tempo",
      value: formatCompactCurrency(descontoTempo),
      subvalue: formatCurrency(vpUnidades),
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      isNegative: true,
    },
    {
      icon: Minus,
      label: "Permuta Líquida",
      value: formatCompactCurrency(permutaLiquida),
      subvalue: "após descontos",
      color: "text-slate-700 dark:text-slate-300",
      bgColor: "bg-slate-50 dark:bg-slate-800/50",
      borderColor: "border-slate-200 dark:border-slate-700",
    },
    {
      icon: Plus,
      label: "Total Parceria",
      value: formatCompactCurrency(totalParceria),
      subvalue: "permuta + dinheiro",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      isHighlight: true,
    },
  ];

  if (locked) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="relative bg-muted/50 border border-border rounded-xl p-4 text-center overflow-hidden"
          >
            <div className="absolute inset-0 backdrop-blur-sm bg-background/50 flex items-center justify-center z-10">
              <span className="text-sm text-muted-foreground">Faça login</span>
            </div>
            <div className="opacity-30">
              <kpi.icon className="h-5 w-5 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold">R$ •••</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={cn(
            "border rounded-xl p-3 sm:p-4 text-center transition-all min-w-0 overflow-hidden",
            kpi.bgColor,
            kpi.borderColor,
            kpi.isHighlight && "border-2 shadow-lg"
          )}
        >
          <div className={cn("p-1.5 sm:p-2 rounded-full inline-flex mb-1.5 sm:mb-2", kpi.bgColor)}>
            <kpi.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", kpi.color)} />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide leading-tight">
            {kpi.label}
          </p>
          <p className={cn(
            "text-base sm:text-lg md:text-xl font-bold mt-1 truncate",
            kpi.isNegative ? "text-red-600 dark:text-red-400" : kpi.color
          )}>
            {kpi.value}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{kpi.subvalue}</p>
        </div>
      ))}
    </div>
  );
}
