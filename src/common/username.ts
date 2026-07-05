export function generateUsername(fullName: string, unique = false): string {
  const base = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.');

  return unique ? `${base}.${Math.floor(Math.random() * 9000) + 1000}` : base;
}
