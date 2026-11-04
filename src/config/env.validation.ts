const requiredEnvironmentKeys = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_COMPANY_SECRET',
  'JWT_EMPLOYEE_SECRET',
  'JWT_ADMIN_SECRET',
  'FIREBASE_SERVICE_ACCOUNT',
];

export function validateEnv(config: Record<string, unknown>) {
  const missing = requiredEnvironmentKeys.filter((key) => {
    const value = config[key];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  if (missing.length > 0) {
    throw new Error('Variaveis de ambiente obrigatorias ausentes: ' + missing.join(', '));
  }

  return config;
}
