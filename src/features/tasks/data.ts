import type { Task } from './types';

/** Початкові задачі для вкладки «За датами». */
export const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Скинути шаблони і варіанти сайтів',
    status: 'new',
    priority: 'medium',
    deadline: null,
    assigneeId: 'daria',
    projectId: 'black-ritual',
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 't2',
    title: 'Базово налаштувати та видати доступи GHL',
    status: 'inbox',
    priority: 'low',
    deadline: null,
    assigneeId: 'yaroslav',
    projectId: 'vlad-ink',
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 't3',
    title: 'Підготувати звіт по кампанії Q4',
    status: 'doing',
    priority: 'high',
    deadline: offsetIso(-2),
    assigneeId: 'daria',
    projectId: 'maya-lines',
    description:
      'Зібрати метрики з Meta Ads і Google, порівняти з Q3, додати висновки для клієнта. Фінальний PDF — до пʼятниці.',
    checkItems: [
      { id: 'c1', label: 'Вивантажити статистику з кабінетів', done: true },
      { id: 'c2', label: 'Побудувати порівняльні графіки', done: false },
      { id: 'c3', label: 'Погодити структуру з PM', done: false },
    ],
    subtasks: [
      {
        id: 's1',
        title: 'Meta Ads — експорт',
        status: 'done',
        priority: 'high',
        assigneeId: 'daria',
        deadline: null,
        description: '',
        checkItems: [],
        subtasks: [],
      },
      {
        id: 's2',
        title: 'Google Ads — експорт',
        status: 'new',
        priority: 'medium',
        assigneeId: 'daria',
        deadline: offsetIso(2),
        description: '',
        checkItems: [],
        subtasks: [],
      },
    ],
    comments: [],
    activityLog: [],
  },
  {
    id: 't4',
    title: 'Узгодити креативи з клієнтом',
    status: 'control',
    priority: 'medium',
    deadline: todayIso(),
    assigneeId: 'sofia',
    projectId: 'old-sailor',
    description: 'Надіслати 3 варіанти банерів у Telegram, зафіксувати правки письмово.',
    checkItems: [{ id: 'c4', label: 'Зібрати фідбек у чаті', done: false }],
    subtasks: [
      {
        id: 's4',
        title: 'Надіслати варіанти в Telegram',
        status: 'done',
        priority: 'medium',
        assigneeId: 'sofia',
        deadline: todayIso(),
        description: '',
        checkItems: [],
        subtasks: [],
      },
    ],
    comments: [
      {
        id: 'cm1',
        at: atOffsetHours(5),
        authorId: 'sofia',
        body: 'Клієнт просить додати варіант з темним фоном.',
      },
    ],
    activityLog: [
      { id: 'a1', at: atOffsetHours(1), actorId: 'sofia', text: 'змінила статус на Control' },
      { id: 'a2', at: atOffsetHours(3), actorId: 'sofia', text: 'оновила опис' },
      { id: 'a3', at: atOffsetHours(8), actorId: 'daria', text: 'додала підзадачу' },
      { id: 'a4', at: atOffsetHours(14), actorId: 'sofia', text: 'встановила дедлайн 19 трав.' },
      { id: 'a5', at: atOffsetHours(26), actorId: 'mira', text: 'змінила відповідального' },
      { id: 'a6', at: atOffsetHours(40), actorId: 'sofia', text: 'змінила статус на Doing' },
    ],
  },
  {
    id: 't5',
    title: 'Оновити доступи в CRM',
    status: 'new',
    priority: 'low',
    deadline: tomorrowIso(),
    assigneeId: 'mira',
    projectId: null,
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 't6',
    title: 'Ревʼю payout-таблиці',
    status: 'inbox',
    priority: 'medium',
    deadline: weekEndIso(),
    assigneeId: 'andrii',
    projectId: 'black-ritual',
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 't7',
    title: 'Запустити A/B тест лендінгу',
    status: 'doing',
    priority: 'high',
    deadline: offsetIso(12),
    assigneeId: 'yaroslav',
    projectId: 'vlad-ink',
    description: '',
    checkItems: [],
    subtasks: [
      {
        id: 's3',
        title: 'Підключити аналітику',
        status: 'new',
        priority: 'low',
        assigneeId: 'yaroslav',
        deadline: null,
        description: '',
        checkItems: [],
        subtasks: [],
      },
    ],
    comments: [],
    activityLog: [],
  },
];

function atOffsetHours(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function todayIso(): string {
  const d = new Date();
  return toIso(d);
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toIso(d);
}

function weekEndIso(): string {
  const d = new Date();
  const day = d.getDay();
  const mondayOffset = (day + 6) % 7;
  d.setDate(d.getDate() + (6 - mondayOffset));
  return toIso(d);
}

function offsetIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toIso(d);
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
