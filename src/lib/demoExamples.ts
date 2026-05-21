/**
 * Exemplos pré-preenchidos para cada calculadora.
 * Estrutura compatível com `handleLoadProject(project)` de cada página.
 * Para usar: handleLoadProject(demoExamples.simulador, true)
 */

export type DemoExample = {
  name: string;
  project_type: string;
  inputs: Record<string, any>;
  description: string;
};

export const demoExamples: Record<string, DemoExample> = {
  simulador: {
    name: 'Exemplo: Galpão Logístico Cajamar',
    project_type: 'simulador',
    description: 'Galpão BTS de 2.500m² para operador logístico em Cajamar (SP), contrato 10 anos.',
    inputs: {
      projectName: 'Exemplo: Galpão Logístico Cajamar',
      investmentType: 'ready',
      showAddress: false,
      googleMapsLink: '',
      observations: 'Exemplo didático. Galpão modular, locatário AAA, contrato atípico 10 anos.',
      purchasePrice: 12_000_000,
      closingCosts: 0.04,
      builtArea: 2500,
      costPerSqm: 2200,
      hasTurnkey: false,
      turnkeyCost: 0,
      rentalUnits: [
        { id: '1', name: 'Locatário Único (BTS)', monthlyRent: 95_000 },
      ],
      adjustmentIndex: 'ipca',
      customIndexRate: 0.045,
      vacancyRate: 0.03,
      propertyTax: 36_000,
      condoFee: 0,
      managementFee: 0.05,
      holdingPeriod: 10,
      exitCapRate: 0.08,
      discountRate: 0.13,
    },
  },

  decisor: {
    name: 'Exemplo: Loja de Rua Pinheiros',
    project_type: 'decisor',
    description: 'Loja de 180m² em rua comercial em Pinheiros (SP) com inquilino consolidado.',
    inputs: {
      assetName: 'Exemplo: Loja de Rua Pinheiros',
      showAddress: false,
      googleMapsLink: '',
      observations: 'Exemplo didático. Inquilino há 6 anos, contrato típico recém-renovado.',
      askingPrice: 4_800_000,
      monthlyRent: 32_000,
      targetMonthlyCapRate: 0.0067,
      vacancyRate: 0.04,
      condoFee: 0,
      propertyTax: 18_000,
      managementFee: 0.08,
      locationQuality: 5,
      tenantRisk: 2,
      futureLiquidity: 4,
      assetCondition: 4,
    },
  },

  hbu: {
    name: 'Exemplo: Terreno 1.500m² Vila Madalena',
    project_type: 'hbu',
    description: 'Terreno de esquina em Vila Madalena, ZM, CA 2,0, análise resi vs. comercial vs. misto.',
    inputs: {
      showAddress: false,
      googleMapsLink: '',
      observations: 'Exemplo didático. Terreno com bom acesso e zoneamento permissivo.',
      terreno: {
        landArea: 1500,
        far: 2,
        occupancyRate: 0.5,
        location: 'central',
        zoning: 'zm',
      },
      residencial: {
        residencialPricePerSqm: 14_000,
        residencialCostPerSqm: 4_000,
        residencialAbsorptionMonths: 18,
      },
      comercial: {
        comercialPricePerSqm: 16_000,
        comercialCostPerSqm: 4_500,
        comercialAbsorptionMonths: 30,
      },
      gerais: {
        discountRate: 0.15,
        constructionMonths: 24,
        landCostPremissa: 0.15,
      },
    },
  },

  permuta: {
    name: 'Exemplo: Terreno R$ 12M com Incorporadora',
    project_type: 'permuta',
    description: 'Comparação entre vender por R$ 8M à vista vs. permutar 50/50 em incorporação.',
    inputs: {
      assetName: 'Exemplo: Terreno R$ 12M com Incorporadora',
      showAddress: false,
      googleMapsLink: '',
      observations: 'Exemplo didático. Incorporadora regional, projeto de 60 unidades.',
      vendaOferta: 8_000_000,
      valorImovelParceria: 12_000_000,
      percentualUnidades: 50,
      aprovacaoMeses: 12,
      construcaoMeses: 36,
      vendaMeses: 12,
      taxaDesconto: 13,
      precoUnidade: 500_000,
      custoMensalUnidade: 1_500,
    },
  },

  preco_teto: {
    name: 'Exemplo: Sala Comercial Faria Lima',
    project_type: 'preco_teto',
    description: 'Quanto pagar no máximo por sala de 80m² na Faria Lima para entregar Cap Rate de 8%.',
    inputs: {
      projectName: 'Exemplo: Sala Comercial Faria Lima',
      showAddress: false,
      googleMapsLink: '',
      observations: 'Exemplo didático. Edifício classe A, locatário corporativo.',
      calculationMode: 'capRate',
      targetCapRate: 0.08,
      targetIRR: 0.15,
      referencePrice: 1_800_000,
      monthlyRent: 14_500,
      rentGrowth: 0.045,
      vacancyRate: 0.05,
      closingCosts: 0.04,
      constructionCost: 0,
      propertyTax: 8_400,
      condoFee: 14_400,
      managementFee: 0.08,
      holdingPeriod: 10,
      exitCapRate: 0.085,
    },
  },
};
