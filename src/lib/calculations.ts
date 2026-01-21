/**
 * Financial calculation utilities for Setter Toolbox
 */

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 * @param cashFlows Array of cash flows (first value is typically negative investment)
 * @param guess Initial guess for IRR (default 0.1 = 10%)
 * @returns IRR as decimal (e.g., 0.15 = 15%)
 */
export function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denominator = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denominator;
      dnpv -= (t * cashFlows[t]) / (denominator * (1 + rate));
    }

    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    if (dnpv === 0) {
      return NaN;
    }

    rate = rate - npv / dnpv;
  }

  return rate;
}

/**
 * Calculate Net Present Value (NPV)
 * @param cashFlows Array of cash flows
 * @param discountRate Annual discount rate as decimal
 * @returns NPV value
 */
export function calculateNPV(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((npv, cf, t) => {
    return npv + cf / Math.pow(1 + discountRate, t);
  }, 0);
}

/**
 * Calculate Cap Rate
 * @param noi Net Operating Income (annual)
 * @param propertyValue Property value or purchase price
 * @returns Cap Rate as decimal
 */
export function calculateCapRate(noi: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  return noi / propertyValue;
}

/**
 * Calculate Equity Multiple
 * @param totalDistributions Total distributions received over holding period
 * @param initialInvestment Initial equity investment
 * @returns Equity multiple
 */
export function calculateEquityMultiple(totalDistributions: number, initialInvestment: number): number {
  if (initialInvestment === 0) return 0;
  return totalDistributions / initialInvestment;
}

/**
 * Calculate NOI (Net Operating Income)
 * @param grossIncome Annual gross rental income
 * @param operatingExpenses Annual operating expenses
 * @returns NOI
 */
export function calculateNOI(grossIncome: number, operatingExpenses: number): number {
  return grossIncome - operatingExpenses;
}

/**
 * Calculate exit value based on projected NOI and exit cap rate
 * @param futureNOI Projected NOI at exit
 * @param exitCapRate Exit cap rate as decimal
 * @returns Exit value
 */
export function calculateExitValue(futureNOI: number, exitCapRate: number): number {
  if (exitCapRate === 0) return 0;
  return futureNOI / exitCapRate;
}

/**
 * Project cash flows for real estate investment
 * @param params Investment parameters
 * @returns Array of projected cash flows
 */
export interface InvestmentParams {
  totalInvestment: number;
  annualRent: number;
  rentGrowth: number; // Annual growth rate as decimal
  vacancyRate: number; // As decimal
  operatingExpenses: number; // Annual
  expenseGrowth: number; // Annual growth rate as decimal
  holdingPeriod: number; // Years
  exitCapRate: number; // As decimal
}

export function projectCashFlows(params: InvestmentParams): number[] {
  const {
    totalInvestment,
    annualRent,
    rentGrowth,
    vacancyRate,
    operatingExpenses,
    expenseGrowth,
    holdingPeriod,
    exitCapRate,
  } = params;

  const cashFlows: number[] = [-totalInvestment];

  for (let year = 1; year <= holdingPeriod; year++) {
    // Calculate gross income with growth
    const grossIncome = annualRent * Math.pow(1 + rentGrowth, year - 1);
    
    // Apply vacancy
    const effectiveIncome = grossIncome * (1 - vacancyRate);
    
    // Calculate expenses with growth
    const expenses = operatingExpenses * Math.pow(1 + expenseGrowth, year - 1);
    
    // NOI for this year
    const noi = effectiveIncome - expenses;

    if (year === holdingPeriod) {
      // Final year: add exit value
      const exitNOI = annualRent * Math.pow(1 + rentGrowth, year) * (1 - vacancyRate) -
                      operatingExpenses * Math.pow(1 + expenseGrowth, year);
      const exitValue = calculateExitValue(exitNOI, exitCapRate);
      cashFlows.push(noi + exitValue);
    } else {
      cashFlows.push(noi);
    }
  }

  return cashFlows;
}

/**
 * Calculate permuta (land swap) comparison
 */
export interface PermutaParams {
  vgv: number; // Valor Geral de Vendas
  projectDuration: number; // Months
  discountRate: number; // Monthly rate as decimal
}

export interface VendaParams {
  salePrice: number;
  downPayment: number;
  installments: number;
  installmentValue: number;
}

export interface PermutaSwapParams {
  percentage: number; // Percentage of VGV as decimal
  torna: number; // Cash payment (positive = receive, negative = pay)
  deliveryMonth: number; // When units are delivered
}

export function calculatePermutaNPV(
  params: PermutaParams,
  venda: VendaParams
): number {
  const { discountRate } = params;
  const { downPayment, installments, installmentValue } = venda;
  
  let npv = downPayment; // Received immediately
  
  for (let month = 1; month <= installments; month++) {
    npv += installmentValue / Math.pow(1 + discountRate, month);
  }
  
  return npv;
}

export function calculateSwapNPV(
  params: PermutaParams,
  swap: PermutaSwapParams
): number {
  const { vgv, discountRate } = params;
  const { percentage, torna, deliveryMonth } = swap;
  
  const unitsValue = vgv * percentage;
  
  // Torna received/paid immediately
  let npv = torna;
  
  // Units received at delivery month
  npv += unitsValue / Math.pow(1 + discountRate, deliveryMonth);
  
  return npv;
}

/**
 * Highest and Best Use calculations
 */
export interface HBUScenario {
  name: string;
  efficiency: number; // Percentage of buildable area that is sellable
  pricePerSqm: number;
  constructionCostPerSqm: number;
  additionalCosts: number; // As percentage of construction cost
}

export interface HBUParams {
  landArea: number; // sqm
  far: number; // Floor Area Ratio
  landCost: number;
}

export interface HBUResult {
  name: string;
  maxBuildableArea: number;
  netSaleableArea: number;
  potentialRevenue: number;
  constructionCost: number;
  totalCost: number;
  netProfit: number;
  margin: number;
}

export function calculateHBU(params: HBUParams, scenario: HBUScenario): HBUResult {
  const { landArea, far, landCost } = params;
  const { name, efficiency, pricePerSqm, constructionCostPerSqm, additionalCosts } = scenario;
  
  const maxBuildableArea = landArea * far;
  const netSaleableArea = maxBuildableArea * efficiency;
  const potentialRevenue = netSaleableArea * pricePerSqm;
  const constructionCost = maxBuildableArea * constructionCostPerSqm * (1 + additionalCosts);
  const totalCost = landCost + constructionCost;
  const netProfit = potentialRevenue - totalCost;
  const margin = potentialRevenue > 0 ? netProfit / potentialRevenue : 0;
  
  return {
    name,
    maxBuildableArea,
    netSaleableArea,
    potentialRevenue,
    constructionCost,
    totalCost,
    netProfit,
    margin,
  };
}

/**
 * Go/No-Go Decision Calculator
 */
export interface GoNoGoParams {
  askingPrice: number;
  annualNOI: number;
  targetCapRate: number; // As decimal
  // Qualitative scores (1-5)
  locationQuality: number;
  tenantRisk: number;
  futureLiquidity: number;
  assetCondition: number;
}

export interface GoNoGoResult {
  maxStrikePrice: number;
  priceGap: number;
  priceGapPercentage: number;
  qualityScore: number;
  impliedCapRate: number;
  verdict: 'GO' | 'NEGOTIATE' | 'NO-GO';
}

export function calculateGoNoGo(params: GoNoGoParams): GoNoGoResult {
  const {
    askingPrice,
    annualNOI,
    targetCapRate,
    locationQuality,
    tenantRisk,
    futureLiquidity,
    assetCondition,
  } = params;
  
  // Calculate max strike price based on target cap rate
  const maxStrikePrice = targetCapRate > 0 ? annualNOI / targetCapRate : 0;
  
  // Calculate price gap
  const priceGap = maxStrikePrice - askingPrice;
  const priceGapPercentage = askingPrice > 0 ? priceGap / askingPrice : 0;
  
  // Calculate quality score (0-100)
  const qualityScore = ((locationQuality + tenantRisk + futureLiquidity + assetCondition) / 20) * 100;
  
  // Implied cap rate
  const impliedCapRate = askingPrice > 0 ? annualNOI / askingPrice : 0;
  
  // Determine verdict
  let verdict: 'GO' | 'NEGOTIATE' | 'NO-GO';
  
  if (priceGapPercentage >= 0 && qualityScore >= 70) {
    verdict = 'GO';
  } else if (priceGapPercentage >= -0.1 && qualityScore >= 50) {
    verdict = 'NEGOTIATE';
  } else {
    verdict = 'NO-GO';
  }
  
  return {
    maxStrikePrice,
    priceGap,
    priceGapPercentage,
    qualityScore,
    impliedCapRate,
    verdict,
  };
}

/**
 * Calculate scenarios for sensitivity analysis
 */
export interface SimuladorInputs {
  purchasePrice: number;
  closingCosts: number;
  renovationCost: number;
  monthlyRent: number;
  rentGrowth: number;
  vacancyRate: number;
  propertyTax: number;
  condoFee: number;
  managementFee: number;
  holdingPeriod: number;
  exitCapRate: number;
}

export interface ScenarioResult {
  capRate: number;
  noiMonthly: number;
  paybackYears: number;
  vacancyPremise: number;
}

export function calculateScenarioMetrics(
  inputs: SimuladorInputs,
  vacancyOverride?: number
): ScenarioResult {
  const vacancyRate = vacancyOverride !== undefined ? vacancyOverride : inputs.vacancyRate;
  const totalInvestment = inputs.purchasePrice * (1 + inputs.closingCosts) + inputs.renovationCost;
  const annualRent = inputs.monthlyRent * 12;
  const effectiveGrossIncome = annualRent * (1 - vacancyRate);
  const annualManagement = effectiveGrossIncome * inputs.managementFee; // Taxa sobre valor recebido
  const operatingExpenses = inputs.propertyTax + inputs.condoFee + annualManagement;
  const noi = effectiveGrossIncome - operatingExpenses;
  const capRate = calculateCapRate(noi, inputs.purchasePrice);
  const noiMonthly = noi / 12;
  const paybackYears = noi > 0 ? totalInvestment / noi : Infinity;

  return {
    capRate,
    noiMonthly,
    paybackYears,
    vacancyPremise: vacancyRate,
  };
}

export function calculateAllScenarios(inputs: SimuladorInputs): {
  pessimistic: ScenarioResult;
  realistic: ScenarioResult;
  optimistic: ScenarioResult;
} {
  return {
    pessimistic: calculateScenarioMetrics(inputs, 0.20), // 20% vacancy
    realistic: calculateScenarioMetrics(inputs, 0.05),   // 5% vacancy
    optimistic: calculateScenarioMetrics(inputs, 0),     // 0% vacancy
  };
}

/**
 * Generate sensitivity matrix data
 */
export function generateSensitivityMatrix(
  baseInvestment: number,
  baseRent: number,
  variations: number[] = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15]
): { capRate: number; investment: number; rent: number; isBase: boolean }[][] {
  return variations.map((rentVar) => {
    return variations.map((invVar) => {
      const adjustedInvestment = baseInvestment * (1 + invVar);
      const adjustedRent = baseRent * (1 + rentVar);
      const annualRent = adjustedRent * 12;
      const capRate = annualRent / adjustedInvestment;
      return {
        capRate,
        investment: adjustedInvestment,
        rent: adjustedRent,
        isBase: invVar === 0 && rentVar === 0,
      };
    });
  });
}

/**
 * HBU v2 - Three Business Models Comparison
 */

// Incorporar Residencial (Build & Sell)
export interface IncorporarParams {
  landArea: number;
  far: number;
  landCost: number;
  pricePerSqm: number;
  constructionCostPerSqm: number;
  efficiency: number; // % of sellable area
  totalMonths: number; // construction + sales period
  discountRate: number; // annual
}

export interface IncorporarResult {
  buildableArea: number;
  sellableArea: number;
  vgv: number;
  constructionCost: number;
  totalCost: number;
  grossProfit: number;
  margin: number;
  npv: number;
}

export function calculateIncorporar(params: IncorporarParams): IncorporarResult {
  const { landArea, far, landCost, pricePerSqm, constructionCostPerSqm, efficiency, totalMonths, discountRate } = params;
  
  const buildableArea = landArea * far;
  const sellableArea = buildableArea * efficiency;
  const vgv = sellableArea * pricePerSqm;
  const constructionCost = buildableArea * constructionCostPerSqm;
  const totalCost = landCost + constructionCost;
  const grossProfit = vgv - totalCost;
  const margin = vgv > 0 ? grossProfit / vgv : 0;
  
  // NPV: profit received at end of project
  const years = totalMonths / 12;
  const npv = grossProfit / Math.pow(1 + discountRate, years);
  
  return {
    buildableArea,
    sellableArea,
    vgv,
    constructionCost,
    totalCost,
    grossProfit,
    margin,
    npv,
  };
}

// Alugar Como Está (Rent Existing)
export interface AlugarParams {
  landCost: number;
  rentableArea: number; // existing rentable area
  rentPerSqmMonthly: number;
  vacancy: number; // as decimal
  capRate: number; // exit cap rate
  discountRate: number; // annual
}

export interface AlugarResult {
  annualNOI: number;
  assetValue: number;
  annualReturn: number;
  paybackYears: number;
  valueCreated: number;
  npv: number;
}

export function calculateAlugar(params: AlugarParams): AlugarResult {
  const { landCost, rentableArea, rentPerSqmMonthly, vacancy, capRate, discountRate } = params;
  
  const annualGrossRent = rentableArea * rentPerSqmMonthly * 12;
  const annualNOI = annualGrossRent * (1 - vacancy);
  const assetValue = capRate > 0 ? annualNOI / capRate : 0;
  const annualReturn = landCost > 0 ? annualNOI / landCost : 0;
  const paybackYears = annualNOI > 0 ? landCost / annualNOI : Infinity;
  const valueCreated = assetValue - landCost;
  
  // NPV: perpetuity value (NOI / discount rate) - land cost
  // This represents the present value of holding forever
  const perpetuityValue = discountRate > 0 ? annualNOI / discountRate : 0;
  const npv = perpetuityValue - landCost;
  
  return {
    annualNOI,
    assetValue,
    annualReturn,
    paybackYears,
    valueCreated,
    npv,
  };
}

// Build-to-Suit (Build to Rent)
export interface BTSParams {
  landArea: number;
  far: number;
  landCost: number;
  constructionCostPerSqm: number;
  efficiency: number;
  rentPerSqmMonthly: number;
  vacancy: number;
  capRate: number;
  constructionMonths: number;
  discountRate: number;
}

export interface BTSResult {
  buildableArea: number;
  rentableArea: number;
  totalInvestment: number;
  annualNOI: number;
  stabilizedValue: number;
  valueCreated: number;
  npv: number;
}

export function calculateBTS(params: BTSParams): BTSResult {
  const { landArea, far, landCost, constructionCostPerSqm, efficiency, rentPerSqmMonthly, vacancy, capRate, constructionMonths, discountRate } = params;
  
  const buildableArea = landArea * far;
  const rentableArea = buildableArea * efficiency;
  const constructionCost = buildableArea * constructionCostPerSqm;
  const totalInvestment = landCost + constructionCost;
  
  const annualGrossRent = rentableArea * rentPerSqmMonthly * 12;
  const annualNOI = annualGrossRent * (1 - vacancy);
  const stabilizedValue = capRate > 0 ? annualNOI / capRate : 0;
  const valueCreated = stabilizedValue - totalInvestment;
  
  // NPV: stabilized value at end of construction, discounted back
  const constructionYears = constructionMonths / 12;
  const npv = stabilizedValue / Math.pow(1 + discountRate, constructionYears) - totalInvestment;
  
  return {
    buildableArea,
    rentableArea,
    totalInvestment,
    annualNOI,
    stabilizedValue,
    valueCreated,
    npv,
  };
}

// Combined HBU v2 Result for comparison
export interface HBUv2ComparisonResult {
  incorporar: IncorporarResult & { type: 'incorporar' };
  alugar: AlugarResult & { type: 'alugar' };
  bts: BTSResult & { type: 'bts' };
  winner: 'incorporar' | 'alugar' | 'bts';
  maxNPV: number;
}

/**
 * HBU v3 - Residencial vs Comercial vs Uso Misto
 * Comparison with cash flow, IRR, NPV, Payback and Score system
 */

export interface HBUv3Params {
  // Terreno
  landArea: number;
  far: number;
  occupancyRate: number;
  location: 'premium' | 'central' | 'periferia';
  zoning: 'zm' | 'zc' | 'zr' | 'zeis';
  
  // Premissas Residencial
  residencialPricePerSqm: number;
  residencialCostPerSqm: number;
  residencialAbsorptionMonths: number;
  
  // Premissas Comercial
  comercialPricePerSqm: number;
  comercialCostPerSqm: number;
  comercialAbsorptionMonths: number;
  
  // Premissas Gerais
  discountRate: number; // annual
  constructionMonths: number;
  landCostPremissa: number; // 0.15 = 15% of VGV
}

export interface HBUv3ScenarioResult {
  name: string;
  type: 'residencial' | 'comercial' | 'misto';
  buildableArea: number;
  vgv: number;
  constructionCost: number;
  landCost: number;
  totalCost: number;
  grossProfit: number;
  margin: number;
  cashFlows: number[];
  npv: number;
  irr: number;
  paybackMonths: number;
  score: number;
}

export interface HBUv3Result {
  residencial: HBUv3ScenarioResult;
  comercial: HBUv3ScenarioResult;
  misto: HBUv3ScenarioResult;
  winner: 'residencial' | 'comercial' | 'misto';
  justification: string;
}

/**
 * Generate monthly cash flows for HBU scenario
 * Month 0: Land cost + 30% construction
 * Months 1 to N (construction): 70% construction / N
 * Months N+1 to N+absorption: VGV / absorption months
 */
function generateHBUCashFlows(
  landCost: number,
  constructionCost: number,
  vgv: number,
  constructionMonths: number,
  absorptionMonths: number
): number[] {
  const cashFlows: number[] = [];
  
  // Month 0: Initial disbursement (land + 30% construction)
  const initialDisbursement = -(landCost + constructionCost * 0.3);
  cashFlows.push(initialDisbursement);
  
  // Construction period (70% of construction cost spread)
  const monthlyConstruction = -(constructionCost * 0.7) / constructionMonths;
  for (let m = 1; m <= constructionMonths; m++) {
    cashFlows.push(monthlyConstruction);
  }
  
  // Absorption/sales period (VGV spread)
  const monthlyRevenue = vgv / absorptionMonths;
  for (let m = 1; m <= absorptionMonths; m++) {
    cashFlows.push(monthlyRevenue);
  }
  
  return cashFlows;
}

/**
 * Calculate payback month from cash flows
 */
function calculatePaybackMonths(cashFlows: number[]): number {
  let cumulative = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= 0) {
      return i;
    }
  }
  return cashFlows.length; // Never recovered
}

/**
 * Calculate HBU v3 Score (0-100)
 * - Margin: up to 40 points
 * - NPV: up to 30 points
 * - IRR: up to 30 points
 */
function calculateHBUScore(margin: number, npv: number, irr: number): number {
  // Margin points: (margin / 0.30) * 40, capped at 40
  const marginPoints = Math.min(40, (margin / 0.30) * 40);
  
  // NPV points: (npv / 10,000,000) * 30, capped at 30
  const npvPoints = Math.min(30, Math.max(0, (npv / 10000000) * 30));
  
  // IRR points: (irr / 0.30) * 30, capped at 30
  const irrPoints = Math.min(30, Math.max(0, (irr / 0.30) * 30));
  
  return Math.max(0, Math.round(marginPoints + npvPoints + irrPoints));
}

/**
 * Calculate a single HBU v3 scenario
 */
function calculateHBUv3Scenario(
  params: HBUv3Params,
  type: 'residencial' | 'comercial' | 'misto'
): HBUv3ScenarioResult {
  const buildableArea = params.landArea * params.far;
  
  let vgv: number;
  let constructionCost: number;
  let absorptionMonths: number;
  let name: string;
  
  if (type === 'residencial') {
    name = 'Residencial';
    vgv = buildableArea * params.residencialPricePerSqm;
    constructionCost = buildableArea * params.residencialCostPerSqm;
    absorptionMonths = params.residencialAbsorptionMonths;
  } else if (type === 'comercial') {
    name = 'Comercial';
    vgv = buildableArea * params.comercialPricePerSqm;
    constructionCost = buildableArea * params.comercialCostPerSqm;
    absorptionMonths = params.comercialAbsorptionMonths;
  } else {
    // Misto: 60% residencial + 40% comercial
    name = 'Uso Misto';
    vgv = (buildableArea * params.residencialPricePerSqm * 0.6) + 
          (buildableArea * params.comercialPricePerSqm * 0.4);
    constructionCost = (buildableArea * params.residencialCostPerSqm * 0.6) + 
                       (buildableArea * params.comercialCostPerSqm * 0.4);
    // Weighted average absorption
    absorptionMonths = Math.round(
      params.residencialAbsorptionMonths * 0.6 + 
      params.comercialAbsorptionMonths * 0.4
    );
  }
  
  // Land cost is 15% of VGV (or custom premissa)
  const landCost = vgv * params.landCostPremissa;
  const totalCost = landCost + constructionCost;
  const grossProfit = vgv - totalCost;
  const margin = vgv > 0 ? grossProfit / vgv : 0;
  
  // Generate cash flows
  const cashFlows = generateHBUCashFlows(
    landCost,
    constructionCost,
    vgv,
    params.constructionMonths,
    absorptionMonths
  );
  
  // Calculate monthly discount rate from annual
  const monthlyRate = Math.pow(1 + params.discountRate, 1/12) - 1;
  
  // Calculate NPV with monthly rate
  const npv = calculateNPV(cashFlows, monthlyRate);
  
  // Calculate IRR (monthly) and annualize
  const monthlyIRR = calculateIRR(cashFlows);
  const irr = isNaN(monthlyIRR) ? 0 : Math.pow(1 + monthlyIRR, 12) - 1;
  
  // Calculate payback
  const paybackMonths = calculatePaybackMonths(cashFlows);
  
  // Calculate score
  const score = calculateHBUScore(margin, npv, irr);
  
  return {
    name,
    type,
    buildableArea,
    vgv,
    constructionCost,
    landCost,
    totalCost,
    grossProfit,
    margin,
    cashFlows,
    npv,
    irr,
    paybackMonths,
    score,
  };
}

/**
 * Calculate all three HBU v3 scenarios and determine winner
 */
export function calculateHBUv3(params: HBUv3Params): HBUv3Result {
  const residencial = calculateHBUv3Scenario(params, 'residencial');
  const comercial = calculateHBUv3Scenario(params, 'comercial');
  const misto = calculateHBUv3Scenario(params, 'misto');
  
  // Determine winner by highest NPV
  const scenarios = [
    { result: residencial, type: 'residencial' as const },
    { result: comercial, type: 'comercial' as const },
    { result: misto, type: 'misto' as const },
  ];
  
  const winner = scenarios.reduce((prev, curr) => 
    curr.result.npv > prev.result.npv ? curr : prev
  ).type;
  
  // Generate justification
  const justifications: Record<typeof winner, string> = {
    residencial: 'Melhor relação entre preço de venda e velocidade de absorção',
    comercial: 'Maior valor por m² compensa o prazo maior de comercialização',
    misto: 'Diversificação de risco e demanda equilibrada',
  };
  
  return {
    residencial,
    comercial,
    misto,
    winner,
    justification: justifications[winner],
  };
}
