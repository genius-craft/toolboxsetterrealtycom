import { Label } from "@/components/ui/label";
import { CurrencyInput } from "./CurrencyInput";
import { Home, Wallet, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface PermutaCarryingCostsProps {
  numeroUnidades: number;
  precoUnidade: number;
  setPrecoUnidade: (value: number) => void;
  custoMensalUnidade: number;
  setCustoMensalUnidade: (value: number) => void;
  mesesCarrego: number;
}

export function PermutaCarryingCosts({
  numeroUnidades,
  precoUnidade,
  setPrecoUnidade,
  custoMensalUnidade,
  setCustoMensalUnidade,
  mesesCarrego,
}: PermutaCarryingCostsProps) {
  const custoMensalTotal = numeroUnidades * custoMensalUnidade;
  const custoTotalCarrego = custoMensalTotal * mesesCarrego;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-foreground">
          Custos de Carrego das Unidades
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preço por Unidade */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
          </div>
          <CurrencyInput
            label="Preço Estimado por Unidade"
            value={precoUnidade}
            onChange={setPrecoUnidade}
            placeholder="R$ 500.000"
          />
          <p className="text-xs text-muted-foreground">
            {numeroUnidades} unidades recebidas
          </p>
        </div>

        {/* Custo Mensal por Unidade */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <CurrencyInput
            label="Custo Mensal por Unidade (IPTU + Cond.)"
            value={custoMensalUnidade}
            onChange={setCustoMensalUnidade}
            placeholder="R$ 1.500"
          />
          <p className="text-xs text-muted-foreground">
            Custos recorrentes até a venda
          </p>
        </div>
      </div>

      {/* Resumo de Custos */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{numeroUnidades} unidades</span>
            {" × "}
            <span className="font-medium text-foreground">{formatCurrency(custoMensalUnidade)}/mês</span>
            {" = "}
            <span className="font-medium text-foreground">{formatCurrency(custoMensalTotal)}/mês</span>
            {" × "}
            <span className="font-medium text-foreground">{mesesCarrego} meses</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(custoTotalCarrego)}
            </span>
            <p className="text-xs text-red-500 dark:text-red-400">total de custos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
