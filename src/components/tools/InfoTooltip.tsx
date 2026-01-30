import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function InfoTooltip({ content, className, side = 'top' }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full p-0.5',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'transition-colors duration-200',
              className
            )}
            aria-label="Mais informações"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs text-sm bg-popover text-popover-foreground"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Glossário de termos financeiros imobiliários
export const financialGlossary = {
  // CAPEX
  purchasePrice: {
    title: 'Preço de Aquisição',
    description: 'Valor de compra do imóvel, sem custos adicionais. É a base para calcular o investimento total e o Cap Rate de entrada.',
  },
  closingCosts: {
    title: 'Custos de Fechamento',
    description: 'Despesas na compra: ITBI (2-3%), escritura, registro, due diligence jurídica. Geralmente somam 3-5% do valor do imóvel.',
  },
  renovationCost: {
    title: 'Reforma / Retrofit',
    description: 'Investimento em melhorias físicas para valorizar ou adequar o imóvel. Pode incluir modernização, adequação de layout ou manutenção estrutural.',
  },
  builtArea: {
    title: 'Metros Construídos',
    description: 'Área total em metros quadrados a ser construída ou reformada. Base para calcular o custo total de obra (m² × custo/m²).',
  },
  costPerSqm: {
    title: 'Custo por m²',
    description: 'Valor médio por metro quadrado de construção ou reforma. Varia conforme padrão de acabamento e tipo de obra (shell, retrofit completo, etc.).',
  },
  turnkeyCost: {
    title: 'Obras Turnkey',
    description: 'Custo de adequação sob medida para o inquilino (ex: lojas, escritórios). O investidor entrega o espaço pronto para operar. Comum em contratos BTS.',
  },
  
  // Revenue
  monthlyRent: {
    title: 'Aluguel Mensal',
    description: 'Receita bruta mensal esperada. Considere valores de mercado para imóveis similares na região.',
  },
  vacancyRate: {
    title: 'Taxa de Vacância',
    description: 'Percentual médio de desocupação esperado. Imóveis comerciais bem localizados: 3-5%. Imóveis em áreas secundárias: 8-15%.',
  },
  adjustmentIndex: {
    title: 'Índice de Reajuste',
    description: 'Índice para correção anual do aluguel. IGPM e IPCA são os mais comuns. O IPCA tem sido preferido por ser menos volátil.',
  },
  
  // OPEX
  propertyTax: {
    title: 'IPTU',
    description: 'Imposto Predial e Territorial Urbano. Varia de 1-3% do valor venal do imóvel. Geralmente repassado ao locatário em contratos comerciais.',
  },
  condoFee: {
    title: 'Condomínio',
    description: 'Taxa mensal de manutenção das áreas comuns. Pode variar significativamente conforme a idade e qualidade do edifício.',
  },
  managementFee: {
    title: 'Taxa de Administração',
    description: 'Percentual pago à administradora imobiliária (6-10% do aluguel). Cobre gestão do contrato, cobranças e vistorias.',
  },
  
  // Exit
  holdingPeriod: {
    title: 'Horizonte de Investimento',
    description: 'Período planejado para manter o investimento. Períodos maiores diluem custos de transação e capturam valorização de longo prazo.',
  },
  exitCapRate: {
    title: 'Cap Rate de Saída',
    description: 'Taxa de capitalização esperada na venda. Cap Rates menores indicam maior valorização. Use premissas conservadoras (maior que entrada).',
  },
  
  // KPIs
  capRate: {
    title: 'Cap Rate (Taxa de Capitalização)',
    description: 'NOI ÷ Valor do Imóvel. Mede o retorno anual sobre o capital investido, sem considerar financiamento. Referência: 6-10% a.a.',
  },
  irr: {
    title: 'TIR (Taxa Interna de Retorno)',
    description: 'Taxa que iguala o valor presente dos fluxos de caixa ao investimento inicial. Considera timing e inclui valorização. Meta: >12% a.a.',
  },
  equityMultiple: {
    title: 'Multiplicador de Capital',
    description: 'Total recebido ÷ Capital investido. Um multiplicador de 2x significa que você dobrou seu dinheiro no período.',
  },
  noi: {
    title: 'NOI (Net Operating Income)',
    description: 'Receita Operacional Líquida: Aluguel bruto menos vacância e despesas operacionais (IPTU, condomínio, administração). Não inclui financiamento.',
  },
  
  // H&BU
  far: {
    title: 'Coeficiente de Aproveitamento (CA)',
    description: 'Quantas vezes a área do terreno pode ser construída. CA de 2x significa que um terreno de 1.000m² pode ter até 2.000m² de área construída.',
  },
  occupancyRate: {
    title: 'Taxa de Ocupação (TO)',
    description: 'Percentual máximo do terreno que pode ser ocupado pela projeção da edificação. Define o "footprint" do prédio.',
  },
  vgv: {
    title: 'VGV (Valor Geral de Vendas)',
    description: 'Receita bruta total estimada com a venda de todas as unidades de um empreendimento. Base para estudos de viabilidade.',
  },
  discountRate: {
    title: 'Taxa de Desconto',
    description: 'Taxa usada para trazer valores futuros ao presente. Reflete o custo de oportunidade e risco do investimento. Referência: 12-18% a.a.',
  },
  absorptionMonths: {
    title: 'Prazo de Absorção',
    description: 'Tempo estimado para vender todas as unidades. Depende do mercado, produto e condições econômicas. Residencial: 18-36 meses.',
  },
  
  // Permuta
  permuta: {
    title: 'Permuta',
    description: 'Troca de terreno por unidades construídas. O proprietário recebe apartamentos/lojas em vez de dinheiro, participando do resultado do empreendimento.',
  },
  percentualUnidades: {
    title: 'Percentual em Unidades',
    description: 'Fração do empreendimento que o proprietário do terreno receberá. Varia de 15-35% dependendo da localização e potencial construtivo.',
  },
  presentValue: {
    title: 'Valor Presente',
    description: 'Valor atual de um pagamento futuro, descontado pela taxa de juros. Permite comparar opções com timings diferentes.',
  },
  
  // Decisor
  targetCapRate: {
    title: 'Cap Rate Alvo',
    description: 'Taxa mínima de retorno exigida pelo investidor. Serve como critério de compra: só adquirir se o Cap Rate real for maior ou igual.',
  },
  locationQuality: {
    title: 'Qualidade da Localização',
    description: 'Avalia acessibilidade, vizinhança, infraestrutura e potencial de valorização. Localizações premium têm menor risco e maior liquidez.',
  },
  tenantRisk: {
    title: 'Risco do Inquilino',
    description: 'Avalia a solidez financeira e histórico do locatário. Inquilinos AAA (grandes empresas) representam menor risco de inadimplência.',
  },
  futureLiquidity: {
    title: 'Liquidez Futura',
    description: 'Facilidade esperada de revenda do imóvel. Imóveis padronizados em boas localizações têm maior liquidez que ativos especializados.',
  },
  assetCondition: {
    title: 'Condição do Ativo',
    description: 'Estado físico e funcional do imóvel. Considera idade, manutenção, sistemas (elétrico, hidráulico, ar-condicionado) e adequação às normas.',
  },
  
  // Additional KPIs
  npv: {
    title: 'VPL (Valor Presente Líquido)',
    description: 'Soma de todos os fluxos de caixa futuros trazidos a valor presente, menos o investimento inicial. VPL positivo indica que o investimento gera valor.',
  },
  margin: {
    title: 'Margem de Lucro',
    description: 'Lucro bruto dividido pela receita total (VGV). Indica o percentual de cada real de venda que sobra como lucro.',
  },
  qualityScore: {
    title: 'Score Qualitativo',
    description: 'Pontuação de 0-100 baseada em fatores qualitativos: localização, risco do inquilino, liquidez e condição do ativo.',
  },
  yieldAnual: {
    title: 'Yield Anual',
    description: 'Retorno anual do investimento calculado como NOI dividido pelo investimento total. Similar ao Cap Rate, mas considera todos os custos de aquisição.',
  },
  carryingCost: {
    title: 'Custo de Carrego',
    description: 'Despesas para manter a propriedade durante o período de espera: IPTU, condomínio, segurança, manutenção. Reduz o valor líquido da permuta.',
  },
  jCurve: {
    title: 'Fluxo de Caixa (J-Curve)',
    description: 'Gráfico que mostra os fluxos de caixa ao longo do período de investimento. Começa negativo (investimento inicial), segue com rendas positivas anuais, e termina com um pico na venda do ativo. O formato de "J" é típico de investimentos imobiliários.',
  },
} as const;

// Componente de tooltip com termo do glossário
interface GlossaryTooltipProps {
  term: keyof typeof financialGlossary;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function GlossaryTooltip({ term, className, side = 'top' }: GlossaryTooltipProps) {
  const item = financialGlossary[term];
  
  return (
    <InfoTooltip
      side={side}
      className={className}
      content={
        <div className="space-y-1">
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="text-muted-foreground">{item.description}</p>
        </div>
      }
    />
  );
}
