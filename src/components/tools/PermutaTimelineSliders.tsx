import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Clock, Building2, ShoppingCart, Percent } from "lucide-react";

interface PermutaTimlineSlidersProps {
  aprovacaoMeses: number;
  setAprovacaoMeses: (value: number) => void;
  construcaoMeses: number;
  setConstrucaoMeses: (value: number) => void;
  vendaMeses: number;
  setVendaMeses: (value: number) => void;
  taxaDesconto: number;
  setTaxaDesconto: (value: number) => void;
}

export function PermutaTimelineSliders({
  aprovacaoMeses,
  setAprovacaoMeses,
  construcaoMeses,
  setConstrucaoMeses,
  vendaMeses,
  setVendaMeses,
  taxaDesconto,
  setTaxaDesconto,
}: PermutaTimlineSlidersProps) {
  const prazoTotalMeses = aprovacaoMeses + construcaoMeses + vendaMeses;
  const prazoTotalAnos = (prazoTotalMeses / 12).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Mas quanto a permuta vale de verdade?
        </h3>
        <div className="bg-muted px-3 py-1.5 rounded-full">
          <span className="text-sm font-medium text-muted-foreground">
            Prazo total: <span className="text-foreground font-bold">{prazoTotalAnos} anos</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Aprovação */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <Label className="text-sm font-medium">Aprovação</Label>
          </div>
          <Slider
            value={[aprovacaoMeses]}
            onValueChange={(v) => setAprovacaoMeses(v[0])}
            min={3}
            max={36}
            step={1}
            className="w-full"
          />
          <div className="text-center">
            <span className="text-2xl font-bold text-foreground">{aprovacaoMeses}</span>
            <span className="text-sm text-muted-foreground ml-1">meses</span>
          </div>
        </div>

        {/* Construção */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded">
              <Building2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <Label className="text-sm font-medium">Construção</Label>
          </div>
          <Slider
            value={[construcaoMeses]}
            onValueChange={(v) => setConstrucaoMeses(v[0])}
            min={12}
            max={60}
            step={1}
            className="w-full"
          />
          <div className="text-center">
            <span className="text-2xl font-bold text-foreground">{construcaoMeses}</span>
            <span className="text-sm text-muted-foreground ml-1">meses</span>
          </div>
        </div>

        {/* Venda */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
              <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <Label className="text-sm font-medium">Venda</Label>
          </div>
          <Slider
            value={[vendaMeses]}
            onValueChange={(v) => setVendaMeses(v[0])}
            min={1}
            max={24}
            step={1}
            className="w-full"
          />
          <div className="text-center">
            <span className="text-2xl font-bold text-foreground">{vendaMeses}</span>
            <span className="text-sm text-muted-foreground ml-1">meses</span>
          </div>
        </div>

        {/* Taxa de Desconto */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded">
              <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <Label className="text-sm font-medium">Taxa de Desconto</Label>
          </div>
          <Slider
            value={[taxaDesconto]}
            onValueChange={(v) => setTaxaDesconto(v[0])}
            min={5}
            max={25}
            step={0.5}
            className="w-full"
          />
          <div className="text-center">
            <span className="text-2xl font-bold text-foreground">{taxaDesconto}</span>
            <span className="text-sm text-muted-foreground ml-1">% a.a.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
