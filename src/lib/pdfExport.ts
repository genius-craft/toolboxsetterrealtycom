/**
 * PDF Export Utility for Setter Toolbox
 * Uses jsPDF for PDF generation
 */

import jsPDF from 'jspdf';
import { formatCurrency, formatPercentage, formatCompactCurrency } from './formatters';

export interface PDFKPIItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface PDFTableRow {
  label: string;
  values: string[];
}

export interface PDFSection {
  title: string;
  type: 'kpi-grid' | 'table' | 'text' | 'verdict' | 'key-value';
  data: PDFKPIItem[] | PDFTableRow[] | string | { verdict: string; description: string };
  columns?: string[];
}

export interface PDFConfig {
  title: string;
  subtitle?: string;
  assetName?: string;
  googleMapsLink?: string;
  observations?: string;
  date: string;
  sections: PDFSection[];
  footer?: string;
}

// Brand colors - refined softer palette
const COLORS = {
  primary: [196, 168, 130] as [number, number, number], // #C4A882 - soft gold
  dark: [45, 45, 48] as [number, number, number],
  gray: [122, 122, 122] as [number, number, number], // #7A7A7A - softer gray
  lightGray: [220, 218, 215] as [number, number, number],
  warmBg: [250, 248, 246] as [number, number, number], // #FAF8F6 - warm beige
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

/**
 * Generate a professional PDF report
 */
export async function generatePDF(config: PDFConfig): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // === HEADER with Logo ===
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Logo "S" box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 8, 14, 14, 3, 3, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('S', margin + 4.5, 17);

  // "SETTER TOOLBOX" text
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SETTER', margin + 18, 16);
  doc.text('TOOLBOX', margin + 48, 16);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(config.title, margin + 18, 26);

  yPosition = 45;

  // === META INFO ===
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);

  if (config.assetName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Ativo:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(config.assetName, margin + 15, yPosition);
    yPosition += 6;
  }

  if (config.googleMapsLink) {
    doc.setFont('helvetica', 'bold');
    doc.text('Endereço:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    const linkText = config.googleMapsLink.length > 70
      ? config.googleMapsLink.substring(0, 67) + '...'
      : config.googleMapsLink;
    doc.setTextColor(41, 98, 255);
    doc.textWithLink(linkText, margin + 22, yPosition, { url: config.googleMapsLink });
    doc.setTextColor(...COLORS.dark);
    yPosition += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Data:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(config.date, margin + 15, yPosition);
  yPosition += 12;

  // === SECTIONS ===
  for (const section of config.sections) {
    checkNewPage(40);

    // Section title
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title.toUpperCase(), margin + 4, yPosition + 5.5);
    yPosition += 14;

    doc.setTextColor(...COLORS.dark);

    switch (section.type) {
      case 'kpi-grid':
        yPosition = renderKPIGrid(doc, section.data as PDFKPIItem[], margin, yPosition, contentWidth);
        break;
      case 'table':
        yPosition = renderTable(doc, section.data as PDFTableRow[], section.columns || [], margin, yPosition, contentWidth);
        break;
      case 'text':
        yPosition = renderText(doc, section.data as string, margin, yPosition, contentWidth);
        break;
      case 'verdict':
        yPosition = renderVerdict(doc, section.data as { verdict: string; description: string }, margin, yPosition, contentWidth);
        break;
      case 'key-value':
        yPosition = renderKeyValue(doc, section.data as PDFKPIItem[], margin, yPosition, contentWidth);
        break;
    }

    yPosition += 8;
  }

  // === OBSERVATIONS ===
  if (config.observations && config.observations.trim()) {
    const obsLines = doc.splitTextToSize(config.observations, contentWidth - 16);
    const obsBoxHeight = 14 + obsLines.length * 5;
    checkNewPage(obsBoxHeight + 10);

    // Section title bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', margin + 4, yPosition + 5.5);
    yPosition += 14;

    // Observations box with warm background
    doc.setFillColor(...COLORS.warmBg);
    doc.roundedRect(margin, yPosition, contentWidth, obsBoxHeight - 6, 3, 3, 'F');
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(obsLines, margin + 8, yPosition + 8);
    yPosition += obsBoxHeight;
  }

  // === FOOTER ===
  const footerY = pageHeight - 20;
  doc.setDrawColor(...COLORS.lightGray);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    config.footer || 'Este relatório é para fins informativos. Não constitui recomendação de investimento.',
    margin,
    footerY
  );
  doc.setFont('helvetica', 'normal');
  doc.text('Contato: (19) 97122-3648 | setter.realty', margin, footerY + 5);
  doc.text('Gerado por Setter Toolbox', pageWidth - margin, footerY + 5, { align: 'right' });

  // === SAVE ===
  const safeName = (config.assetName || config.title).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const fileName = `${safeName}_${config.date.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}

function renderKPIGrid(doc: jsPDF, kpis: PDFKPIItem[], x: number, y: number, width: number): number {
  // Se for apenas 1 KPI, renderizar de forma centralizada e destacada
  if (kpis.length === 1) {
    const singleKpi = kpis[0];
    const boxWidth = width * 0.6;  // 60% da largura
    const boxHeight = 35;          // Altura maior
    const boxX = x + (width - boxWidth) / 2;  // Centralizado

    // Background box
    doc.setFillColor(...COLORS.warmBg);
    doc.roundedRect(boxX, y, boxWidth, boxHeight, 4, 4, 'F');

    // Label centralizado
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(singleKpi.label, boxX + boxWidth / 2, y + 12, { align: 'center' });

    // Valor grande centralizado
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(singleKpi.value, boxX + boxWidth / 2, y + 28, { align: 'center' });

    return y + boxHeight + 4;
  }

  // Múltiplos KPIs - grid normal
  const cols = Math.min(kpis.length, 4);
  const colWidth = width / cols;
  const boxHeight = 22;

  kpis.forEach((kpi, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const boxX = x + col * colWidth;
    const boxY = y + row * (boxHeight + 4);

    // Box background - warm beige with rounded corners
    doc.setFillColor(...COLORS.warmBg);
    doc.roundedRect(boxX, boxY, colWidth - 4, boxHeight, 4, 4, 'F');

    // Label
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(kpi.label, boxX + 4, boxY + 7);

    // Value
    doc.setTextColor(kpi.highlight ? COLORS.primary[0] : COLORS.dark[0], kpi.highlight ? COLORS.primary[1] : COLORS.dark[1], kpi.highlight ? COLORS.primary[2] : COLORS.dark[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, boxX + 4, boxY + 17);
  });

  const rows = Math.ceil(kpis.length / cols);
  return y + rows * (boxHeight + 4);
}

function renderTable(doc: jsPDF, rows: PDFTableRow[], columns: string[], x: number, y: number, width: number): number {
  const colCount = columns.length + 1; // +1 for label column
  const colWidth = width / colCount;
  const rowHeight = 8;

  // Header row
  doc.setFillColor(240, 240, 240);
  doc.rect(x, y, width, rowHeight, 'F');
  doc.setTextColor(...COLORS.gray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  doc.text('', x + 2, y + 5.5);
  columns.forEach((col, i) => {
    doc.text(col, x + (i + 1) * colWidth + 2, y + 5.5);
  });

  y += rowHeight;

  // Data rows
  doc.setFont('helvetica', 'normal');
  rows.forEach((row, rowIndex) => {
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(x, y, width, rowHeight, 'F');
    }

    doc.setTextColor(...COLORS.dark);
    doc.text(row.label, x + 2, y + 5.5);

    row.values.forEach((val, i) => {
      doc.text(val, x + (i + 1) * colWidth + 2, y + 5.5);
    });

    y += rowHeight;
  });

  return y;
}

function renderText(doc: jsPDF, text: string, x: number, y: number, width: number): number {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y);

  return y + lines.length * 5;
}

function renderVerdict(doc: jsPDF, data: { verdict: string; description: string }, x: number, y: number, width: number): number {
  const boxHeight = 30;

  // Get color based on verdict
  let color: [number, number, number] = COLORS.gray;
  const verdictLower = data.verdict.toLowerCase();
  if (verdictLower.includes('go') && !verdictLower.includes('no')) {
    color = COLORS.success;
  } else if (verdictLower.includes('negoci') || verdictLower.includes('parcer')) {
    color = COLORS.warning;
  } else if (verdictLower.includes('no') || verdictLower.includes('vend')) {
    color = COLORS.danger;
  } else if (verdictLower === 'excellent' || verdictLower === 'excelente') {
    color = COLORS.success;
  } else if (verdictLower === 'good' || verdictLower === 'bom') {
    color = [34, 197, 94];
  } else if (verdictLower === 'fair' || verdictLower === 'regular') {
    color = COLORS.warning;
  } else if (verdictLower === 'poor' || verdictLower === 'ruim') {
    color = COLORS.danger;
  }

  // Background
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, width, boxHeight, 3, 3, 'F');

  // Verdict text
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.verdict.toUpperCase(), x + width / 2, y + 13, { align: 'center' });

  // Description
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.description, x + width / 2, y + 23, { align: 'center' });

  return y + boxHeight + 4;
}

function renderKeyValue(doc: jsPDF, items: PDFKPIItem[], x: number, y: number, width: number): number {
  doc.setFontSize(10);

  items.forEach((item) => {
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x, y);

    doc.setTextColor(item.highlight ? COLORS.primary[0] : COLORS.dark[0], item.highlight ? COLORS.primary[1] : COLORS.dark[1], item.highlight ? COLORS.primary[2] : COLORS.dark[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, x + width, y, { align: 'right' });

    y += 7;
  });

  return y;
}

// =====================================================
// CALCULATOR-SPECIFIC PDF GENERATORS
// =====================================================

/**
 * Generate PDF for Simulador de Viabilidade
 */
export interface ScenarioData {
  capRate: number;
  noiMonthly: number;
  paybackYears: number;
  vacancyPremise: number;
}

export interface SimuladorPDFData {
  /** Resumo executivo opcional gerado pela IA. Quando presente, abre o relatório. */
  aiSummary?: string;
  projectName: string;
  googleMapsLink?: string;
  observations?: string;
  kpis: {
    entryCapRate: number;
    monthlyCapRate: number;
    irr: number;
    npv: number;
    equityMultiple: number;
    totalInvestment: number;
    noi: number;
  };
  verdict: string;
  
  // CAPEX Breakdown
  capexBreakdown: {
    purchasePrice: number;
    closingCostsAmount: number;
    closingCostsPercent: number;
    builtArea: number;
    costPerSqm: number;
    shellCost: number;
    turnkeyCost: number;
    totalConstructionCost: number;
  };
  
  // Rental Units
  rentalUnits: Array<{
    name: string;
    monthlyRent: number;
  }>;
  
  // Total Monthly Rent
  totalMonthlyRent: number;
  
  // OPEX Breakdown
  opexBreakdown: {
    propertyTax: number;
    condoFee: number;
    managementFee: number;
    managementAmount: number;
  };
  
  // Scenarios
  scenarios: {
    pessimistic: ScenarioData;
    realistic: ScenarioData;
    optimistic: ScenarioData;
  };
  
  // Assumptions
  assumptions: {
    adjustmentIndex: string;
    rentGrowth: number;
    holdingPeriod: number;
    exitCapRate: number;
    discountRate: number;
    vacancyRate: number;
  };
}

export async function generateSimuladorPDF(data: SimuladorPDFData): Promise<void> {
  const verdictLabels: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bom',
    fair: 'Regular',
    poor: 'Ruim',
  };

  const indexLabels: Record<string, string> = {
    igpm: 'IGPM',
    ipca: 'IPCA',
    custom: 'Personalizado',
  };

  const totalMonthlyRent = data.totalMonthlyRent;
  const totalAnnualRent = totalMonthlyRent * 12;
  const totalOpex = data.opexBreakdown.propertyTax + data.opexBreakdown.condoFee + data.opexBreakdown.managementAmount;

  await generatePDF({
    title: 'Simulador de Viabilidade',
    assetName: data.projectName || 'Projeto sem nome',
    googleMapsLink: data.googleMapsLink,
    observations: data.observations,
    date: new Date().toLocaleDateString('pt-BR'),
    sections: [
      // Resumo Executivo IA (opcional)
      ...(data.aiSummary
        ? [{
            title: 'Resumo Executivo (IA)',
            type: 'text' as const,
            data: data.aiSummary,
          }]
        : []),
      // Único KPI - Cap Rate Mensal (Estimado) centralizado
      {
        title: 'Rentabilidade Estimada',
        type: 'kpi-grid',
        data: [
          { label: 'Cap Rate Mensal (Estimado)', value: formatPercentage(data.kpis.monthlyCapRate, 2), highlight: true },
        ],
      },
      // CAPEX Breakdown
      {
        title: 'Detalhamento do Investimento (CAPEX)',
        type: 'key-value',
        data: [
          { label: 'Preço de Aquisição', value: formatCurrency(data.capexBreakdown.purchasePrice) },
          { label: `Custos de Fechamento (${formatPercentage(data.capexBreakdown.closingCostsPercent)})`, value: formatCurrency(data.capexBreakdown.closingCostsAmount) },
          { label: `Obra Shell (${data.capexBreakdown.builtArea}m² × ${formatCurrency(data.capexBreakdown.costPerSqm)}/m²)`, value: formatCurrency(data.capexBreakdown.shellCost) },
          { label: 'Obras Turnkey', value: formatCurrency(data.capexBreakdown.turnkeyCost) },
          { label: 'TOTAL DE OBRA', value: formatCurrency(data.capexBreakdown.totalConstructionCost), highlight: true },
          { label: 'INVESTIMENTO TOTAL', value: formatCurrency(data.kpis.totalInvestment), highlight: true },
        ],
      },
      // Rental Units
      {
        title: 'Receita - Detalhamento por Lojista',
        type: 'key-value',
        data: [
          ...data.rentalUnits.map(unit => ({
            label: unit.name,
            value: `${formatCurrency(unit.monthlyRent)}/mês`,
          })),
          { label: 'TOTAL MENSAL', value: formatCurrency(totalMonthlyRent), highlight: true },
          { label: 'RECEITA BRUTA ANUAL', value: formatCurrency(totalAnnualRent), highlight: true },
          { label: `Vacância (${formatPercentage(data.assumptions.vacancyRate)})`, value: `-${formatCurrency(totalAnnualRent * data.assumptions.vacancyRate)}` },
          { label: 'RECEITA LÍQUIDA ANUAL', value: formatCurrency(totalAnnualRent * (1 - data.assumptions.vacancyRate)), highlight: true },
        ],
      },
      // OPEX Breakdown
      {
        title: 'Despesas Operacionais (OPEX)',
        type: 'key-value',
        data: [
          { label: 'IPTU (Anual)', value: formatCurrency(data.opexBreakdown.propertyTax) },
          { label: 'Condomínio (Anual)', value: formatCurrency(data.opexBreakdown.condoFee) },
          { label: `Taxa Administração (${formatCurrency(totalMonthlyRent)} × ${formatPercentage(data.opexBreakdown.managementFee)})`, value: `${formatCurrency(data.opexBreakdown.managementAmount / 12)}/mês` },
          { label: 'TOTAL OPEX ANUAL', value: formatCurrency(totalOpex), highlight: true },
          { label: 'NOI Anual (Receita - OPEX)', value: formatCurrency(data.kpis.noi), highlight: true },
        ],
      },
    ],
  });
}

/**
 * Generate PDF for Decisor Go/No-Go
 */
export interface DecisorPDFData {
  /** Resumo executivo opcional gerado pela IA. Quando presente, abre o relatório. */
  aiSummary?: string;
  assetName: string;
  googleMapsLink?: string;
  observations?: string;
  verdict: 'GO' | 'NEGOTIATE' | 'NO-GO';
  kpis: {
    impliedCapRate: number;
    qualityScore: number;
    maxStrikePrice: number;
    priceGap: number;
    priceGapPercentage: number;
  };
  inputs: {
    askingPrice: number;
    monthlyRent: number;
    targetMonthlyCapRate: number;
  };
  opex?: {
    condoFee: number;
    propertyTax: number;
    managementFee: number;
    vacancyRate: number;
    annualGrossRent: number;
    effectiveGrossIncome: number;
    totalOpex: number;
    annualNOI: number;
  };
  ratings: {
    locationQuality: number;
    tenantRisk: number;
    futureLiquidity: number;
    assetCondition: number;
  };
}

export async function generateDecisorPDF(data: DecisorPDFData): Promise<void> {
  const verdictDescriptions: Record<string, string> = {
    GO: 'Avance com a negociação',
    NEGOTIATE: 'Há espaço para negociação',
    'NO-GO': 'Não recomendado neste preço',
  };

  const starRating = (value: number) => '★'.repeat(value) + '☆'.repeat(5 - value);

  // Build sections array
  const sections: PDFSection[] = [
    ...(data.aiSummary
      ? [{
          title: 'Resumo Executivo (IA)',
          type: 'text' as const,
          data: data.aiSummary,
        }]
      : []),
    {
      title: 'Veredicto',
      type: 'verdict',
      data: {
        verdict: data.verdict,
        description: verdictDescriptions[data.verdict],
      },
    },
    {
      title: 'Análise de Preço',
      type: 'key-value',
      data: [
        { label: 'Preço Pedido', value: formatCurrency(data.inputs.askingPrice) },
        { label: 'Preço Máximo (Strike)', value: formatCurrency(data.kpis.maxStrikePrice), highlight: true },
        { label: 'Gap', value: `${formatCompactCurrency(data.kpis.priceGap)} (${formatPercentage(data.kpis.priceGapPercentage)})`, highlight: data.kpis.priceGap >= 0 },
      ],
    },
    {
      title: 'Indicadores Financeiros',
      type: 'kpi-grid',
      data: [
        { label: 'Cap Rate Implícito (mensal)', value: formatPercentage(data.kpis.impliedCapRate / 12) },
        { label: 'Aluguel Mensal', value: formatCurrency(data.inputs.monthlyRent) },
        { label: 'Cap Rate Alvo (mensal)', value: formatPercentage(data.inputs.targetMonthlyCapRate) },
        { label: 'Score Qualitativo', value: `${Math.round(data.kpis.qualityScore)}/100`, highlight: true },
      ],
    },
  ];

  // Add OPEX section if data is provided (show even if totalOpex is 0, since vacancy matters)
  if (data.opex) {
    sections.push({
      title: 'Custos Operacionais (OPEX)',
      type: 'key-value',
      data: [
        { label: 'Receita Bruta Anual', value: formatCurrency(data.opex.annualGrossRent) },
        { label: `Vacância (${formatPercentage(data.opex.vacancyRate)})`, value: `-${formatCurrency(data.opex.annualGrossRent * data.opex.vacancyRate)}` },
        { label: 'Receita Efetiva', value: formatCurrency(data.opex.effectiveGrossIncome) },
        { label: 'Condomínio (anual)', value: `-${formatCurrency(data.opex.condoFee * 12)}` },
        { label: 'IPTU (anual)', value: `-${formatCurrency(data.opex.propertyTax)}` },
        { label: `Taxa Adm (${formatPercentage(data.opex.managementFee)})`, value: `-${formatCurrency(data.opex.effectiveGrossIncome * data.opex.managementFee)}` },
        { label: 'NOI Líquido Anual', value: formatCurrency(data.opex.annualNOI), highlight: true },
      ],
    });
  }

  // Add qualitative section
  sections.push({
    title: 'Avaliação Qualitativa',
    type: 'key-value',
    data: [
      { label: 'Localização', value: starRating(data.ratings.locationQuality) },
      { label: 'Risco do Inquilino', value: starRating(data.ratings.tenantRisk) },
      { label: 'Liquidez Futura', value: starRating(data.ratings.futureLiquidity) },
      { label: 'Condição do Ativo', value: starRating(data.ratings.assetCondition) },
    ],
  });

  await generatePDF({
    title: 'Decisor Go/No-Go',
    assetName: data.assetName || 'Ativo sem nome',
    googleMapsLink: data.googleMapsLink,
    observations: data.observations,
    date: new Date().toLocaleDateString('pt-BR'),
    sections,
  });
}

/**
 * Generate PDF for Calculadora de Permuta
 */
export interface PermutaPDFData {
  /** Resumo executivo opcional gerado pela IA. */
  aiSummary?: string;
  assetName: string;
  googleMapsLink?: string;
  observations?: string;
  vendaOferta: number;
  calculations: {
    valorUnidades: number;
    valorDinheiro: number;
    totalNominal: number;
    numeroUnidades: number;
    prazoTotalAnos: number;
    custoTotalCarrego: number;
    vpUnidades: number;
    descontoTempo: number;
    permutaLiquida: number;
    totalParceria: number;
    diferenca: number;
    vencedor: string;
  };
  inputs: {
    percentualUnidades: number;
    taxaDesconto: number;
    aprovacaoMeses: number;
    construcaoMeses: number;
    vendaMeses: number;
  };
}

export async function generatePermutaPDF(data: PermutaPDFData): Promise<void> {
  const vencedorLabel = data.calculations.vencedor === 'parceria' ? 'PARCERIA' : 'VENDA À VISTA';
  const vencedorDesc = data.calculations.vencedor === 'parceria' 
    ? `Ganho adicional de ${formatCurrency(data.calculations.diferenca)}`
    : `Perda evitada de ${formatCurrency(Math.abs(data.calculations.diferenca))}`;

  await generatePDF({
    title: 'Calculadora de Permuta',
    assetName: data.assetName || 'Terreno sem nome',
    googleMapsLink: data.googleMapsLink,
    date: new Date().toLocaleDateString('pt-BR'),
    sections: [
      {
        title: 'Veredicto',
        type: 'verdict',
        data: {
          verdict: vencedorLabel,
          description: vencedorDesc,
        },
      },
      {
        title: 'Comparativo',
        type: 'kpi-grid',
        data: [
          { label: 'Venda à Vista', value: formatCurrency(data.vendaOferta) },
          { label: 'Total Parceria', value: formatCurrency(data.calculations.totalParceria), highlight: true },
          { label: 'Diferença', value: formatCurrency(data.calculations.diferenca), highlight: data.calculations.diferenca > 0 },
          { label: 'Prazo Total', value: `${data.calculations.prazoTotalAnos.toFixed(1)} anos` },
        ],
      },
      {
        title: 'Detalhamento da Parceria',
        type: 'key-value',
        data: [
          { label: 'Valor em Unidades (nominal)', value: formatCurrency(data.calculations.valorUnidades) },
          { label: 'Valor em Dinheiro', value: formatCurrency(data.calculations.valorDinheiro) },
          { label: 'VP das Unidades', value: formatCurrency(data.calculations.vpUnidades), highlight: true },
          { label: 'Desconto do Tempo', value: formatCurrency(data.calculations.descontoTempo) },
          { label: 'Custo de Carrego', value: formatCurrency(data.calculations.custoTotalCarrego) },
          { label: 'Permuta Líquida', value: formatCurrency(data.calculations.permutaLiquida), highlight: true },
        ],
      },
      {
        title: 'Premissas Utilizadas',
        type: 'key-value',
        data: [
          { label: 'Percentual em Unidades', value: `${data.inputs.percentualUnidades}%` },
          { label: 'Taxa de Desconto', value: `${data.inputs.taxaDesconto}% a.a.` },
          { label: 'Aprovação', value: `${data.inputs.aprovacaoMeses} meses` },
          { label: 'Construção', value: `${data.inputs.construcaoMeses} meses` },
          { label: 'Venda', value: `${data.inputs.vendaMeses} meses` },
          { label: 'Número de Unidades', value: `${data.calculations.numeroUnidades} unidades` },
        ],
      },
    ],
  });
}

/**
 * Generate PDF for Highest & Best Use
 */
export interface HBUPDFData {
  googleMapsLink?: string;
  observations?: string;
  landParams: {
    landArea: number;
    far: number;
    occupancyRate: number;
    location: string;
  };
  results: {
    residencial: { score: number; vgv: number; profit: number; npv: number; margin: number };
    comercial: { score: number; vgv: number; profit: number; npv: number; margin: number };
    misto: { score: number; vgv: number; profit: number; npv: number; margin: number };
    winner: string;
    justification: string;
  };
}

export async function generateHBUPDF(data: HBUPDFData): Promise<void> {
  const winnerLabels: Record<string, string> = {
    residencial: 'RESIDENCIAL',
    comercial: 'COMERCIAL',
    misto: 'USO MISTO',
  };

  await generatePDF({
    title: 'Highest & Best Use',
    subtitle: 'Análise de Melhor Uso do Terreno',
    googleMapsLink: data.googleMapsLink,
    observations: data.observations,
    date: new Date().toLocaleDateString('pt-BR'),
    sections: [
      {
        title: 'Recomendação',
        type: 'verdict',
        data: {
          verdict: winnerLabels[data.results.winner] || data.results.winner.toUpperCase(),
          description: data.results.justification,
        },
      },
      {
        title: 'Scores Comparativos',
        type: 'kpi-grid',
        data: [
          { label: 'Residencial', value: `${data.results.residencial.score}/100`, highlight: data.results.winner === 'residencial' },
          { label: 'Comercial', value: `${data.results.comercial.score}/100`, highlight: data.results.winner === 'comercial' },
          { label: 'Uso Misto', value: `${data.results.misto.score}/100`, highlight: data.results.winner === 'misto' },
        ],
      },
      {
        title: 'Comparativo Financeiro',
        type: 'table',
        columns: ['Residencial', 'Comercial', 'Misto'],
        data: [
          { label: 'VGV', values: [formatCompactCurrency(data.results.residencial.vgv), formatCompactCurrency(data.results.comercial.vgv), formatCompactCurrency(data.results.misto.vgv)] },
          { label: 'Lucro', values: [formatCompactCurrency(data.results.residencial.profit), formatCompactCurrency(data.results.comercial.profit), formatCompactCurrency(data.results.misto.profit)] },
          { label: 'VPL', values: [formatCompactCurrency(data.results.residencial.npv), formatCompactCurrency(data.results.comercial.npv), formatCompactCurrency(data.results.misto.npv)] },
          { label: 'Margem', values: [formatPercentage(data.results.residencial.margin), formatPercentage(data.results.comercial.margin), formatPercentage(data.results.misto.margin)] },
        ],
      },
      {
        title: 'Parâmetros do Terreno',
        type: 'key-value',
        data: [
          { label: 'Área do Terreno', value: `${data.landParams.landArea.toLocaleString('pt-BR')} m²` },
          { label: 'Coeficiente de Aproveitamento', value: `${data.landParams.far}x` },
          { label: 'Taxa de Ocupação', value: formatPercentage(data.landParams.occupancyRate) },
          { label: 'Localização', value: data.landParams.location.charAt(0).toUpperCase() + data.landParams.location.slice(1) },
          { label: 'Área Construível', value: `${(data.landParams.landArea * data.landParams.far).toLocaleString('pt-BR')} m²` },
        ],
      },
    ],
  });
}

/**
 * Generate PDF for Preço Teto
 */
export interface PrecoTetoPDFData {
  projectName: string;
  googleMapsLink?: string;
  observations?: string;
  calculationMode: 'capRate' | 'irr';
  targetReturn: number;
  maxPrice: number;
  referencePrice: number | null;
  kpis: {
    resultingCapRate: number;
    resultingIRR: number;
    totalInvestment: number;
    noi: number;
  };
  inputs: {
    monthlyRent: number;
    rentGrowth: number;
    vacancyRate: number;
    closingCosts: number;
    constructionCost: number;
    operatingExpenses: number;
    holdingPeriod: number;
    exitCapRate: number;
  };
}

export async function generatePrecoTetoPDF(data: PrecoTetoPDFData): Promise<void> {
  const modeLabel = data.calculationMode === 'irr' ? 'TIR' : 'Cap Rate';
  
  const sections: PDFSection[] = [
    {
      title: 'Resultado Principal',
      type: 'kpi-grid',
      data: [
        { label: 'Preço Teto', value: formatCurrency(data.maxPrice), highlight: true },
      ],
    },
    {
      title: 'Retorno Alvo',
      type: 'key-value',
      data: [
        { label: 'Modo de Cálculo', value: `Por ${modeLabel}` },
        { label: `${modeLabel} Alvo`, value: formatPercentage(data.targetReturn), highlight: true },
      ],
    },
    {
      title: 'Métricas Resultantes',
      type: 'kpi-grid',
      data: [
        { label: 'Cap Rate', value: formatPercentage(data.kpis.resultingCapRate) },
        { label: 'TIR', value: formatPercentage(data.kpis.resultingIRR) },
        { label: 'NOI Ano 1', value: formatCurrency(data.kpis.noi) },
        { label: 'Investimento Total', value: formatCurrency(data.kpis.totalInvestment) },
      ],
    },
  ];

  // Add comparison section if reference price is provided
  if (data.referencePrice) {
    const margin = data.referencePrice - data.maxPrice;
    const marginPercent = margin / data.referencePrice;
    
    sections.push({
      title: 'Comparativo',
      type: 'key-value',
      data: [
        { label: 'Preço de Referência', value: formatCurrency(data.referencePrice) },
        { label: 'Preço Teto', value: formatCurrency(data.maxPrice), highlight: true },
        { label: 'Margem de Negociação', value: `${formatCurrency(margin)} (${formatPercentage(marginPercent)})`, highlight: margin > 0 },
      ],
    });
  }

  // Add inputs section
  sections.push({
    title: 'Premissas Utilizadas',
    type: 'key-value',
    data: [
      { label: 'Aluguel Mensal', value: formatCurrency(data.inputs.monthlyRent) },
      { label: 'Crescimento Anual', value: formatPercentage(data.inputs.rentGrowth) },
      { label: 'Vacância', value: formatPercentage(data.inputs.vacancyRate) },
      { label: 'Custos de Fechamento', value: formatPercentage(data.inputs.closingCosts) },
      { label: 'Custo de Obra', value: formatCurrency(data.inputs.constructionCost) },
      { label: 'OPEX Anual', value: formatCurrency(data.inputs.operatingExpenses) },
      { label: 'Período de Holding', value: `${data.inputs.holdingPeriod} anos` },
      { label: 'Cap Rate de Saída', value: formatPercentage(data.inputs.exitCapRate) },
    ],
  });

  await generatePDF({
    title: 'Preço Teto',
    assetName: data.projectName || 'Projeto sem nome',
    googleMapsLink: data.googleMapsLink,
    observations: data.observations,
    date: new Date().toLocaleDateString('pt-BR'),
    sections,
  });
}
