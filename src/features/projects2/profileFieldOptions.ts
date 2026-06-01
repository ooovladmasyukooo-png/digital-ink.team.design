export { PROJECT_PIPELINE_STATUS_OPTIONS } from './projectPipelineStatus';

export const PROJECT_NICHE_OPTIONS = [
  'Beauty',
  'Tattoo studio',
  'Real Estate',
  'E-commerce',
  'Education',
  'HoReCa',
  'Інше',
] as const;

export { PROJECT_CHURN_RISK_LEVELS as PROJECT_CHURN_RISK_OPTIONS } from './projectChurnRisk';

export const PROJECT_RESULT_OPTIONS = ['В процесі', 'Успіх', 'Частковий', 'Невдача', '—'] as const;

export const CHAT_TYPE_OPTIONS = ['Telegram', 'WhatsApp', 'Slack', 'Viber', 'Інше'] as const;
