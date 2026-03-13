import type { ReportInput } from '@/core/ports';

export const STUB_VALID_RAW_RESPONSE = JSON.stringify({
  category: 'Via Pública',
  priority: 'Alta',
  technical_summary: 'Dano estrutural identificado em via pública.',
});

export const STUB_REPORT_INPUT: ReportInput = {
  title: 'Buraco na rua',
  description: 'Buraco enorme na frente da casa',
  location: 'Rua das Flores, 42',
};
