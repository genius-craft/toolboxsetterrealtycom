import { ArrowRight, TrendingUp, TrendingDown, Banknote, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface PermutaVerdictProps {
  vendaValor: number;
  parceriaValor: number;
  locked?: boolean;
}

export function PermutaVerdict({
  vendaValor,
  parceriaValor,
  locked = false,
}: PermutaVerdictProps) {
  const diferenca = parceriaValor - vendaValor;
  const percentualDiferenca = vendaValor > 0 ? ((diferenca / vendaValor) * 100).toFixed(1) : 0;
  const parceriaVence = diferenca > 0;

  if (locked) {
    return (
      <div className="relative bg-muted/50 border border-border rounded-xl p-8 text-center overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-sm bg-background/50 flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground">Faça login para ver o veredicto</p>
            <p className="text-sm text-muted-foreground mt-1">Compare venda vs parceria</p>
          </div>
        </div>
        <div className="opacity-20">
          <h3 className="text-2xl font-bold">RESULTADO</h3>
          <p className="text-4xl font-bold mt-2">R$ •••.•••</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Veredicto Principal */}
      <div
        className={cn(
          "rounded-xl p-6 text-center border-2",
          parceriaVence
            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
            : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          {parceriaVence ? (
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
          <h3
            className={cn(
              "text-xl font-bold uppercase",
              parceriaVence
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-blue-700 dark:text-blue-300"
            )}
          >
            {parceriaVence ? "Parceria é Melhor" : "Venda é Melhor"}
          </h3>
        </div>

        <div
          className={cn(
            "text-3xl font-bold",
            diferenca >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {diferenca >= 0 ? "+" : ""}
          {formatCurrency(diferenca)}
          <span className="text-lg ml-2">({diferenca >= 0 ? "+" : ""}{percentualDiferenca}%)</span>
        </div>

        <p className="text-sm text-muted-foreground mt-2">
          {parceriaVence
            ? "A parceria oferece um retorno líquido superior à venda à vista"
            : "A venda à vista oferece mais valor imediato que a parceria"}
        </p>
      </div>

      {/* Comparativo Visual */}
      <div className="flex items-center justify-center gap-4">
        {/* Venda */}
        <div className="flex-1 max-w-[200px]">
          <div className={cn(
            "rounded-xl p-4 text-center border-2 transition-all",
            !parceriaVence
              ? "bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow-lg"
              : "bg-muted border-border"
          )}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Vender</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              !parceriaVence ? "text-blue-700 dark:text-blue-300" : "text-foreground"
            )}>
              {formatCurrency(vendaValor)}
            </p>
          </div>
        </div>

        {/* Seta */}
        <div className="flex-shrink-0">
          <div className="p-2 bg-muted rounded-full">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Parceria */}
        <div className="flex-1 max-w-[200px]">
          <div className={cn(
            "rounded-xl p-4 text-center border-2 transition-all",
            parceriaVence
              ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600 shadow-lg"
              : "bg-muted border-border"
          )}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Parceria</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              parceriaVence ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
            )}>
              {formatCurrency(parceriaValor)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
