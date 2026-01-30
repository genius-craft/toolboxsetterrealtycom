import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { GlossaryTooltip } from '@/components/tools/InfoTooltip';
import { Calendar, User, Building, Store, Layers, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectViewerHBUProps {
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  projectName: string;
  userName?: string | null;
  updatedAt?: string;
}

interface ScenarioResult {
  score: number;
  vgv: number;
  grossProfit: number;
  npv: number;
  margin: number;
}

export function ProjectViewerHBU({
  inputs,
  results,
  projectName,
  userName,
  updatedAt,
}: ProjectViewerHBUProps) {
  // Extract results
  const residencial = (results.residencial as ScenarioResult) || { score: 0, vgv: 0, grossProfit: 0, npv: 0, margin: 0 };
  const comercial = (results.comercial as ScenarioResult) || { score: 0, vgv: 0, grossProfit: 0, npv: 0, margin: 0 };
  const misto = (results.misto as ScenarioResult) || { score: 0, vgv: 0, grossProfit: 0, npv: 0, margin: 0 };
  const winner = (results.winner as string) || 'residencial';
  const justification = (results.justification as string) || '';

  // Extract inputs
  const terreno = (inputs.terreno as Record<string, unknown>) || {};
  const landArea = (terreno.landArea as number) || 0;
  const location = (terreno.location as string) || 'central';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const scenarios = [
    { key: 'residencial', name: 'Residencial', icon: Building, data: residencial, color: 'blue' },
    { key: 'comercial', name: 'Comercial', icon: Store, data: comercial, color: 'amber' },
    { key: 'misto', name: 'Uso Misto', icon: Layers, data: misto, color: 'purple' },
  ];

  const winnerData = scenarios.find(s => s.key === winner);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Layers className="h-4 w-4" />
          <span>Highest & Best Use</span>
        </div>
        <h2 className="text-xl font-semibold">{projectName}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          {userName && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{userName}</span>
            </div>
          )}
          {updatedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-3">
        {scenarios.map(({ key, name, icon: Icon, data, color }) => (
          <div
            key={key}
            className={cn(
              "rounded-xl border-2 p-4 text-center transition-all",
              winner === key
                ? `border-${color}-500/50 bg-${color}-500/10`
                : "border-border bg-card"
            )}
          >
            <Icon className={cn(
              "h-6 w-6 mx-auto mb-2",
              winner === key ? `text-${color}-600` : "text-muted-foreground"
            )} />
            <p className="text-sm font-medium mb-1">{name}</p>
            <p className="text-2xl font-mono font-bold">{Math.round(data.score)}</p>
            <p className="text-xs text-muted-foreground">pontos</p>
            {winner === key && (
              <div className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-amber-600">
                <Trophy className="h-3.5 w-3.5" />
                <span>WINNER</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Comparativo</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Métrica</th>
                <th className="text-right p-3 font-medium">Residencial</th>
                <th className="text-right p-3 font-medium">Comercial</th>
                <th className="text-right p-3 font-medium">Misto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>VGV</span>
                    <GlossaryTooltip term="vgv" />
                  </div>
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'residencial' && "font-bold text-primary")}>
                  {formatCurrency(residencial.vgv)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'comercial' && "font-bold text-primary")}>
                  {formatCurrency(comercial.vgv)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'misto' && "font-bold text-primary")}>
                  {formatCurrency(misto.vgv)}
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-3 text-muted-foreground">Lucro Bruto</td>
                <td className={cn("p-3 text-right font-mono", winner === 'residencial' && "font-bold text-primary")}>
                  {formatCurrency(residencial.grossProfit)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'comercial' && "font-bold text-primary")}>
                  {formatCurrency(comercial.grossProfit)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'misto' && "font-bold text-primary")}>
                  {formatCurrency(misto.grossProfit)}
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>VPL</span>
                    <GlossaryTooltip term="npv" />
                  </div>
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'residencial' && "font-bold text-primary")}>
                  {formatCurrency(residencial.npv)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'comercial' && "font-bold text-primary")}>
                  {formatCurrency(comercial.npv)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'misto' && "font-bold text-primary")}>
                  {formatCurrency(misto.npv)}
                </td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>Margem</span>
                    <GlossaryTooltip term="margin" />
                  </div>
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'residencial' && "font-bold text-primary")}>
                  {formatPercentage(residencial.margin)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'comercial' && "font-bold text-primary")}>
                  {formatPercentage(comercial.margin)}
                </td>
                <td className={cn("p-3 text-right font-mono", winner === 'misto' && "font-bold text-primary")}>
                  {formatPercentage(misto.margin)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      {winnerData && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Recomendação: {winnerData.name}</h3>
          </div>
          {justification && (
            <p className="text-sm text-muted-foreground">{justification}</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>VPL Esperado</span>
                <GlossaryTooltip term="npv" />
              </div>
              <p className="font-mono font-bold text-lg text-primary">
                {formatCurrency(winnerData.data.npv)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>Margem</span>
                <GlossaryTooltip term="margin" />
              </div>
              <p className="font-mono font-bold text-lg text-primary">
                {formatPercentage(winnerData.data.margin)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
