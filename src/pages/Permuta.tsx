import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { CurrencyInput } from "@/components/tools/CurrencyInput";
import { PermutaTimelineSliders } from "@/components/tools/PermutaTimelineSliders";
import { PermutaCarryingCosts } from "@/components/tools/PermutaCarryingCosts";
import { PermutaTimeline } from "@/components/tools/PermutaTimeline";
import { PermutaKPIGrid } from "@/components/tools/PermutaKPIGrid";
import { PermutaVerdict } from "@/components/tools/PermutaVerdict";
import { GlossaryTooltip } from "@/components/tools/InfoTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Banknote, Building2, RefreshCcw, Save, FileDown, AlertTriangle, FolderOpen, Loader2, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { generatePermutaPDF } from "@/lib/pdfExport";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveProject, useProjects, useProject, ProjectType } from "@/hooks/useProjects";
import { HistoryButton } from '@/components/tools/HistoryButton';
import { AutoFillButton } from "@/components/ai/AutoFillButton";
import { AIAnalysisCard } from "@/components/ai/AIAnalysisCard";
import { PDFExportWithAIButton } from "@/components/ai/PDFExportWithAIButton";
import { applyAIFields } from "@/lib/applyAIFields";
import { toast } from "sonner";

export default function Permuta() {
  const { user } = useAuth();
  const saveProject = useSaveProject();
  const { data: savedProjects, isLoading: loadingProjects } = useProjects('permuta' as ProjectType);
  const isLocked = !user;

  // URL params for loading project
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('id');
  const { data: projectFromUrl, isLoading: loadingProjectFromUrl } = useProject(projectIdFromUrl || '');
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  // === Estado: Dialog ===
  const [openDialogOpen, setOpenDialogOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // === Estado: Nome do Ativo ===
  const [assetName, setAssetName] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [observations, setObservations] = useState('');

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
    setAssetName('');
    setShowAddress(false);
    setGoogleMapsLink('');
    setObservations('');
    setVendaOferta(8000000); setValorImovelParceria(12000000); setPercentualUnidades(50);
    setAprovacaoMeses(12); setConstrucaoMeses(36); setVendaMeses(12); setTaxaDesconto(12);
    setPrecoUnidade(500000); setCustoMensalUnidade(1500);
  };

  const handleSave = async () => {
    if (!user) { toast.error("Faça login para salvar"); return; }
    const projectName = assetName.trim() || `Permuta ${new Date().toLocaleDateString("pt-BR")}`;
    try {
      await saveProject.mutateAsync({
        name: projectName,
        project_type: "permuta",
        inputs: { assetName, showAddress, googleMapsLink, observations, vendaOferta, valorImovelParceria, percentualUnidades, aprovacaoMeses,
                  construcaoMeses, vendaMeses, taxaDesconto, precoUnidade, custoMensalUnidade },
        results: calculations,
      });
      toast.success("Projeto salvo!");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleLoadProject = useCallback((project: any, showToast = true) => {
    const inputs = project.inputs || {};
    setAssetName(inputs.assetName || project.name || '');
    setShowAddress(inputs.showAddress ?? false);
    setGoogleMapsLink(inputs.googleMapsLink ?? '');
    setObservations(inputs.observations ?? '');
    setVendaOferta(inputs.vendaOferta ?? 8000000);
    setValorImovelParceria(inputs.valorImovelParceria ?? 12000000);
    setPercentualUnidades(inputs.percentualUnidades ?? 50);
    setAprovacaoMeses(inputs.aprovacaoMeses ?? 12);
    setConstrucaoMeses(inputs.construcaoMeses ?? 36);
    setVendaMeses(inputs.vendaMeses ?? 12);
    setTaxaDesconto(inputs.taxaDesconto ?? 12);
    setPrecoUnidade(inputs.precoUnidade ?? 500000);
    setCustoMensalUnidade(inputs.custoMensalUnidade ?? 1500);
    setOpenDialogOpen(false);
    if (project.id) setLoadedProjectId(project.id);
    if (showToast) {
      toast.success(`Projeto "${project.name}" carregado!`);
    }
  }, []);

  const handleRestoreVersion = useCallback((v: any) => {
    handleLoadProject({ id: loadedProjectId, name: v.name, inputs: v.inputs, results: v.results }, false);
    toast.success(`Versão v${v.version_number} restaurada. Clique em Salvar para confirmar.`);
  }, [handleLoadProject, loadedProjectId]);

  // Auto-load project from URL
  useEffect(() => {
    if (projectFromUrl && !loadingProjectFromUrl && !hasLoadedFromUrl) {
      handleLoadProject(projectFromUrl, false);
      setHasLoadedFromUrl(true);
    }
  }, [projectFromUrl, loadingProjectFromUrl, hasLoadedFromUrl, handleLoadProject]);

  const handleExportPDF = async (aiSummary?: string) => {
    setIsExportingPDF(true);
    try {
      await generatePermutaPDF({
        aiSummary,
        assetName: assetName || 'Terreno sem nome',
        googleMapsLink: showAddress ? googleMapsLink : undefined,
        observations: observations.trim() || undefined,
        vendaOferta,
        calculations,
        inputs: {
          percentualUnidades,
          taxaDesconto,
          aprovacaoMeses,
          construcaoMeses,
          vendaMeses,
        },
      });
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    } finally {
    setIsExportingPDF(false);
    }
  };

  // Setters expostos para o auto-preenchimento por IA
  const aiSetters = {
    assetName: setAssetName,
    vendaOferta: setVendaOferta,
    valorImovelParceria: setValorImovelParceria,
    percentualUnidades: setPercentualUnidades,
    aprovacaoMeses: setAprovacaoMeses,
    construcaoMeses: setConstrucaoMeses,
    vendaMeses: setVendaMeses,
    taxaDesconto: setTaxaDesconto,
    precoUnidade: setPrecoUnidade,
    custoMensalUnidade: setCustoMensalUnidade,
  } as Record<string, ((value: never) => void) | undefined>;

  const handleAIFill = (fields: Record<string, unknown>) => {
    applyAIFields(aiSetters, fields);
  };

  const InputsPanel = (
    <div className="space-y-6">
      <div className="flex justify-end -mb-2">
        <AutoFillButton tool="permuta" onFill={handleAIFill} />
      </div>
      {/* Nome do Ativo */}
      <div className="bg-card rounded-lg border border-border p-4 shadow-card space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assetName" className="text-sm font-medium">
            Nome do Ativo
          </Label>
          <Input
            id="assetName"
            placeholder="Ex: Terreno Av. Paulista"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="bg-background"
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Endereço do Imóvel</Label>
            </div>
            <Switch
              checked={showAddress}
              onCheckedChange={setShowAddress}
            />
          </div>
          {showAddress && (
            <Input
              placeholder="Cole o link do Google Maps aqui"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              className="text-sm"
           />
          )}
        </div>
        {/* Observations */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Observações</Label>
          </div>
          <textarea
            placeholder="Anotações, premissas, contexto..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            maxLength={500}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
          />
          <p className="text-xs text-muted-foreground text-right">{observations.length}/500</p>
        </div>
      </div>

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
              <CurrencyInput label="Valor do Imóvel" value={valorImovelParceria} onChange={setValorImovelParceria} tooltip="permuta" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-medium">% em Unidades</Label>
                    <GlossaryTooltip term="percentualUnidades" />
                  </div>
                  <span className="font-mono text-sm font-medium text-accent">{percentualUnidades}%</span>
                </div>
                <Slider
                  value={[percentualUnidades]}
                  onValueChange={([v]) => setPercentualUnidades(v)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Resultados</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setOpenDialogOpen(true)} disabled={!user || loadingProjects}>
            <FolderOpen className="h-4 w-4 mr-2" />Abrir
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}><RefreshCcw className="h-4 w-4 mr-2" />Limpar</Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isLocked}><Save className="h-4 w-4 mr-2" />Salvar</Button>
          <HistoryButton loadedProjectId={loadedProjectId} onRestore={handleRestoreVersion} />
          <PDFExportWithAIButton
            tool="permuta"
            projectName={assetName}
            inputs={{
              vendaOferta, valorImovelParceria, percentualUnidades,
              aprovacaoMeses, construcaoMeses, vendaMeses, taxaDesconto,
              precoUnidade, custoMensalUnidade,
            }}
            results={calculations as unknown as Record<string, unknown>}
            onExport={handleExportPDF}
            disabled={isLocked || isExportingPDF}
          />
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

      <AIAnalysisCard
        tool="permuta"
        projectName={assetName}
        inputs={{
          vendaOferta, valorImovelParceria, percentualUnidades,
          aprovacaoMeses, construcaoMeses, vendaMeses, taxaDesconto,
          precoUnidade, custoMensalUnidade,
        }}
        results={calculations}
        resetKey={`${vendaOferta}-${valorImovelParceria}-${percentualUnidades}-${taxaDesconto}`}
      />

    </div>
  );

  return (
    <>
      <ToolLayout title="Calculadora de Permuta" rightPanel={ResultsPanel}>
        {InputsPanel}
      </ToolLayout>

      <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir Projeto Salvo</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {savedProjects && savedProjects.length > 0 ? (
              savedProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleLoadProject(project)}
                  className="w-full p-3 text-left rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum projeto salvo
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
