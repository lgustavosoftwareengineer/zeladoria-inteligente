export const CATEGORIES = [
  'Via Pública',
  'Iluminação',
  'Saneamento',
  'Limpeza Urbana',
  'Áreas Verdes',
  'Edificações Públicas',
  'Outros',
] as const;
export type Category = (typeof CATEGORIES)[number];
export const DEFAULT_REPORT_CATEGORY: Category = 'Outros';

export const PRIORITIES = ['Baixa', 'Média', 'Alta'] as const;
export type Priority = (typeof PRIORITIES)[number];
export const DEFAULT_REPORT_PRIORITY: Priority = PRIORITIES[0];
