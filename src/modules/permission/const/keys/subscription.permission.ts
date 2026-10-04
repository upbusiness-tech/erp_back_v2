export const SubscriptionPermissions = {
  Create: {
    name: 'subscription_create',
    displayName: 'Criar mensalidade',
    description: 'Permite criar novas mensalidades',
    isAdminPermission: true,
  },
  Read: {
    name: 'subscription_read',
    displayName: 'Visualizar mensalidades',
    description: 'Permite visualizar mensalidades existentes',
    isAdminPermission: false,
  },
  Update: {
    name: 'subscription_update',
    displayName: 'Editar mensalidades',
    description: 'Permite editar mensalidades existentes',
    isAdminPermission: true,
  },
  SendProof: {
    name: 'subscription_send_proof',
    displayName: 'Enviar comprovante',
    description: 'Permite enviar comprovante de pagamento da mensalidade',
    isAdminPermission: false,
  },
};
