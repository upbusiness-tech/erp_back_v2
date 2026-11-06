import { PlanIds } from 'src/modules/plan/plan.enum';

export const SaleSetting = {
  SaleByCashFlow: {
    module: 'Sale',
    key: 'sale_by_cash_flow',
    description: 'Vendas baseadas em caixas',
    defaultActive: true,
    plan: PlanIds.GESTOR,
  },
  GenerateSaleProofDocument: {
    module: 'Sale',
    key: 'generate_sale_proof_document',
    description: 'Gerar comprovantes ao realizar venda',
    defaultActive: true,
    plan: PlanIds.GESTOR,
  },
  NegotiatedSalePrice: {
    module: 'Sale',
    key: 'negotiated_sale_price',
    description: 'Permitir preço negociado por item na venda',
    defaultActive: false,
    plan: PlanIds.GESTOR,
  },
};
