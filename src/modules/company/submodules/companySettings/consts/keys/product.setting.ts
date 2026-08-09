import { PlanIds } from 'src/modules/plan/plan.enum';

export const ProductSetting = {
  NoteOnProduct: {
    module: 'Product',
    key: 'note_on_product',
    description: 'Anexar anotações em produtos',
    defaultActive: false,
    plan: PlanIds.GESTOR,
  },
  ScanProductByCode: {
    module: 'Product',
    key: 'scan_product_by_code',
    description: 'Escanear produtos via código de barras',
    defaultActive: true,
    plan: PlanIds.GESTOR,
  },
};
