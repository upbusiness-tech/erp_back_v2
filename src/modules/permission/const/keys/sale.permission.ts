export const SalePermissions = {
  Create: {
    name: 'sale_create',
    displayName: 'Criar venda',
    description: 'Permite criar novas vendas',
    isAdminPermission: false,
  },
  Read: {
    name: 'sale_read',
    displayName: 'Visualizar vendas',
    description: 'Permite visualizar vendas existentes',
    isAdminPermission: false,
  },
  Update: {
    name: 'sale_update',
    displayName: 'Editar vendas',
    description: 'Permite editar vendas existentes',
    isAdminPermission: true,
  },
  Delete: {
    name: 'sale_delete',
    displayName: 'Excluir vendas',
    description: 'Permite excluir vendas',
    isAdminPermission: true,
  },
  Cancel: {
    name: 'sale_cancel',
    displayName: 'Cancelar venda',
    description: 'Permite cancelar vendas',
    isAdminPermission: false,
  },
  ApplyInternPrice: {
    name: 'apply_special_price',
    displayName: 'Aplicar preço especial na venda',
    description: 'Permite aplicar preços especiais nas vendas',
    isAdminPermission: false,
  },
};
