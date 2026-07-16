import { PlanIds } from 'src/modules/plan/plan.enum';

export const SaleSetting = {
  SaleByCashFlow: {
    key: 'sale_by_cash_flow',
    description: 'Vendas baseadas em caixas',
    defaultActive: true,
    plan: PlanIds.GESTOR,
  },
  GenerateSaleProofDocument: {
    key: 'generate_sale_proof_document',
    description: 'Gerar comprovantes ao realizar venda',
    defaultActive: true,
    plan: PlanIds.GESTOR,
  },
};
