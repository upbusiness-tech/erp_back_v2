export const CompanyPermissions = {
  AccessAny: {
    name: 'access_companies',
    displayName: 'Acessar qualquer empresa',
    description: 'Visualizar qualquer empresa fora do token',
    isAdminPermission: true,
  },
  CreateAny: {
    name: 'create_any_company',
    displayName: 'Registrar empresa',
    description: 'Cadastrar um empresa e suas informações',
    isAdminPermission: true,
  },
  ReadAny: {
    name: 'read_any_company',
    displayName: 'Ver empresa',
    description: 'Ver informações da empresa',
    isAdminPermission: false,
  },
  UpdateAny: {
    name: 'update_any_company',
    displayName: 'Editar empresa',
    description: 'Editar as informações da empresa',
    isAdminPermission: false,
  },
  DeleteAny: {
    name: 'delete_any_company',
    displayName: 'Deletar empresa',
    description: 'Deletar qualquer empresa',
    isAdminPermission: true,
  },
};
