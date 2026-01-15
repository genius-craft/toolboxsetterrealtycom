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
  const annualManagement = annualRent * inputs.managementFee;
  const operatingExpenses = inputs.propertyTax + inputs.condoFee + annualManagement;
  const effectiveGrossIncome = annualRent * (1 - vacancyRate);
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
