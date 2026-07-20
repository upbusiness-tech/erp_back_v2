export const CashFlowPermissions = {
  Open: {
    name: 'cashflow_open',
    displayName: 'Abrir caixa',
    description: 'Permite abrir o caixa da empresa',
    isAdminPermission: false,
  },
  Close: {
    name: 'cashflow_close',
    displayName: 'Fechar caixa',
    description: 'Permite fechar o caixa da empresa',
    isAdminPermission: false,
  },
  Read: {
    name: 'cashflow_read',
    displayName: 'Visualizar caixa',
    description: 'Permite visualizar informações do caixa',
    isAdminPermission: false,
  },
  TransactionCreate: {
    name: 'cashflow_transaction_create',
    displayName: 'Lançar transação',
    description: 'Permite lançar transações no caixa',
    isAdminPermission: false,
  },
};
