import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { CurrencyInput } from "@/components/tools/CurrencyInput";
import { PercentageSlider } from "@/components/tools/PercentageSlider";
import { PermutaTimelineSliders } from "@/components/tools/PermutaTimelineSliders";
import { PermutaCarryingCosts } from "@/components/tools/PermutaCarryingCosts";
import { PermutaTimeline } from "@/components/tools/PermutaTimeline";
import { PermutaKPIGrid } from "@/components/tools/PermutaKPIGrid";
import { PermutaVerdict } from "@/components/tools/PermutaVerdict";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote, Building2, RefreshCcw, Save, FileDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveProject } from "@/hooks/useProjects";
import { toast } from "sonner";

export default function Permuta() {
  const { user } = useAuth();
  const saveProject = useSaveProject();
  const isLocked = !user;

  // === Estados: Venda à Vista ===
  const [vendaOferta, setVendaOferta] = useState(8000000);

  // === Estados: Parceria ===
  const [valorImovelParceria, setValorImovelParceria] = useState(12000000);
  const [percentualUnidades, setPercentualUnidades] = useState(50);
  const percentualDinheiro = 100 - percentualUnidades;

  // === Estados: Timeline ===
  const [aprovacaoMeses, setAprovacaoMeses] = useState(12);
  const [construcaoMeses, setConstrucaoMeses] = useState(36);
  const [vendaMeses, setVendaMeses] = useState(12);
  const [taxaDesconto, setTaxaDesconto] = useState(12);

  // === Estados: Custos de Carrego ===
  const [precoUnidade, setPrecoUnidade] = useState(500000);
  const [custoMensalUnidade, setCustoMensalUnidade] = useState(1500);

  // === Cálculos ===
  const calculations = useMemo(() => {
    const valorUnidades = valorImovelParceria * (percentualUnidades / 100);
    const valorDinheiro = valorImovelParceria * (percentualDinheiro / 100);
    const totalNominal = valorUnidades + valorDinheiro;
    const numeroUnidades = precoUnidade > 0 ? Math.round(valorUnidades / precoUnidade) : 0;
    const prazoTotalMeses = aprovacaoMeses + construcaoMeses + vendaMeses;
    const prazoTotalAnos = prazoTotalMeses / 12;
    const mesesCarrego = construcaoMeses + vendaMeses;
    const custoTotalCarrego = numeroUnidades * custoMensalUnidade * mesesCarrego;
    const taxaMensal = Math.pow(1 + taxaDesconto / 100, 1 / 12) - 1;
    const vpUnidades = valorUnidades / Math.pow(1 + taxaMensal, prazoTotalMeses);
    const descontoTempo = vpUnidades - valorUnidades;
    const permutaLiquida = vpUnidades - custoTotalCarrego;
    const totalParceria = valorDinheiro + permutaLiquida;
    const diferenca = totalParceria - vendaOferta;
    const vencedor = diferenca > 0 ? "parceria" : "venda";

    return {
      valorUnidades, valorDinheiro, totalNominal, numeroUnidades,
      prazoTotalMeses, prazoTotalAnos, mesesCarrego, custoTotalCarrego,
      vpUnidades, descontoTempo, permutaLiquida, totalParceria, diferenca, vencedor,
    };
  }, [vendaOferta, valorImovelParceria, percentualUnidades, percentualDinheiro,
      aprovacaoMeses, construcaoMeses, vendaMeses, taxaDesconto, precoUnidade, custoMensalUnidade]);

  const handleReset = () => {
    setVendaOferta(8000000); setValorImovelParceria(12000000); setPercentualUnidades(50);
    setAprovacaoMeses(12); setConstrucaoMeses(36); setVendaMeses(12); setTaxaDesconto(12);
    setPrecoUnidade(500000); setCustoMensalUnidade(1500);
  };

  const handleSave = async () => {
    if (!user) { toast.error("Faça login para salvar"); return; }
    try {
      await saveProject.mutateAsync({
        name: `Permuta - ${new Date().toLocaleDateString("pt-BR")}`,
        project_type: "permuta",
        inputs: { vendaOferta, valorImovelParceria, percentualUnidades, aprovacaoMeses,
                  construcaoMeses, vendaMeses, taxaDesconto, precoUnidade, custoMensalUnidade },
        results: calculations,
      });
      toast.success("Projeto salvo!");
    } catch { toast.error("Erro ao salvar"); }
  };

  const InputsPanel = (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium">Aviso</p>
            <p className="mt-1">Esta calculadora é para fins educacionais. Não constitui recomendação de investimento.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Banknote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Vender Agora</h3>
                <p className="text-xs text-muted-foreground">Dinheiro na mão HOJE</p>
              </div>
            </div>
            <CurrencyInput label="Oferta em Dinheiro" value={vendaOferta} onChange={setVendaOferta} />
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Parceria</h3>
                <p className="text-xs text-muted-foreground">Unidades + Dinheiro</p>
              </div>
            </div>
            <div className="space-y-4">
              <CurrencyInput label="Valor do Imóvel" value={valorImovelParceria} onChange={setValorImovelParceria} />
              <PercentageSlider label="% em Unidades" value={percentualUnidades} onChange={setPercentualUnidades} min={0} max={100} />
              <div className="bg-blue-100/50 dark:bg-blue-900/20 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Unidades:</span><span className="font-medium">{formatCurrency(calculations.valorUnidades)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dinheiro ({percentualDinheiro}%):</span><span className="font-medium">{formatCurrency(calculations.valorDinheiro)}</span></div>
                <div className="flex justify-between font-semibold pt-1 border-t border-blue-200 dark:border-blue-700"><span>Total Nominal:</span><span>{formatCurrency(calculations.totalNominal)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center -my-2">
        <div className="bg-primary text-primary-foreground font-bold text-lg px-4 py-2 rounded-full shadow-lg">VS</div>
      </div>

      <Card><CardContent className="pt-6">
        <PermutaTimelineSliders aprovacaoMeses={aprovacaoMeses} setAprovacaoMeses={setAprovacaoMeses}
          construcaoMeses={construcaoMeses} setConstrucaoMeses={setConstrucaoMeses}
          vendaMeses={vendaMeses} setVendaMeses={setVendaMeses} taxaDesconto={taxaDesconto} setTaxaDesconto={setTaxaDesconto} />
      </CardContent></Card>

      <Card><CardContent className="pt-6">
        <PermutaCarryingCosts numeroUnidades={calculations.numeroUnidades} precoUnidade={precoUnidade}
          setPrecoUnidade={setPrecoUnidade} custoMensalUnidade={custoMensalUnidade}
          setCustoMensalUnidade={setCustoMensalUnidade} mesesCarrego={calculations.mesesCarrego} />
      </CardContent></Card>
    </div>
  );

  const ResultsPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Resultados</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RefreshCcw className="h-4 w-4 mr-2" />Limpar</Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isLocked}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          <Button variant="outline" size="sm" disabled><FileDown className="h-4 w-4 mr-2" />PDF</Button>
        </div>
      </div>

      <PermutaKPIGrid prazoTotalAnos={calculations.prazoTotalAnos} descontoTempo={calculations.descontoTempo}
        vpUnidades={calculations.vpUnidades} permutaLiquida={calculations.permutaLiquida}
        totalParceria={calculations.totalParceria} locked={isLocked} />

      <Card><CardContent className="pt-6">
        <PermutaTimeline aprovacaoMeses={aprovacaoMeses} construcaoMeses={construcaoMeses}
          vendaMeses={vendaMeses} numeroUnidades={calculations.numeroUnidades} custoMensalUnidade={custoMensalUnidade} />
      </CardContent></Card>

      <PermutaVerdict vendaValor={vendaOferta} parceriaValor={calculations.totalParceria} locked={isLocked} />
    </div>
  );

  return (
    <ToolLayout title="Calculadora de Permuta" inputsPanel={InputsPanel} resultsPanel={ResultsPanel} />
  );
}
