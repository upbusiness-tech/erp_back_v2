import { ValueTransformer } from 'typeorm';

/**
 * Transformer that converts PostgreSQL numeric/string values to JavaScript numbers.
 * PostgreSQL `numeric` columns return strings (e.g., "5.000") which this transformer
 * converts to proper numbers (e.g., 5).
 */
export const numericTransformer: ValueTransformer = {
  to: (value: number): number => value,
  from: (value: string | number): number => {
    if (value === null || value === undefined) return value as any;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  },
};
