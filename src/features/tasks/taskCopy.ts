import type { TaskPriority, TaskStatus } from './types';

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'До роботи',
  in_progress: 'В роботі',
  review: 'На перевірці',
  done: 'Готово',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  urgent: 'Критичний',
  high: 'Високий',
  normal: 'Звичайний',
  low: 'Низький',
};
