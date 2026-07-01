import type { Task, TaskSubtask, TaskTagId } from './types';

type SeedSubtask = Omit<TaskSubtask, 'tagIds' | 'customTags' | 'subtasks'> & {
  tagIds?: TaskTagId[];
  customTags?: string[];
  subtasks: SeedSubtask[];
};
type SeedTask = Omit<Task, 'tagIds' | 'customTags' | 'subtasks' | 'published' | 'sprintId'> & {
  tagIds?: TaskTagId[];
  customTags?: string[];
  published?: boolean;
  sprintId?: string | null;
  subtasks: SeedSubtask[];
};

/** Початкові задачі для вкладки «За датами». */
export const initialTasks: SeedTask[] = [
  {
    id: 't1',
    title: 'Скинути шаблони і варіанти сайтів',
    status: 'new',
    priority: 'medium',
    deadline: null,
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['daria'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: 'black-ritual',
    sprintId: 'spr-queue-1',
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
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['yaroslav'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: 'vlad-ink',
    sprintId: 'spr-queue-1',
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
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['daria', 'mira'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: 'maya-lines',
    sprintId: 'spr-active-1',
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
        assigneeIds: ['daria'],
        projectId: null,
        deadline: null,
        completedAt: atOffsetHours(26),
        description: '',
        checkItems: [],
        subtasks: [],
      },
      {
        id: 's2',
        title: 'Google Ads — експорт',
        status: 'new',
        priority: 'medium',
        assigneeIds: ['daria'],
        projectId: null,
        deadline: offsetIso(2),
        completedAt: null,
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
    published: true,
    title: 'Узгодити креативи з клієнтом',
    status: 'control',
    priority: 'medium',
    deadline: todayIso(),
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['sofia'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: 'old-sailor',
    sprintId: 'spr-active-1',
    description: 'Надіслати 3 варіанти банерів у Telegram, зафіксувати правки письмово.',
    checkItems: [{ id: 'c4', label: 'Зібрати фідбек у чаті', done: false }],
    subtasks: [
      {
        id: 's4',
        title: 'Надіслати варіанти в Telegram',
        status: 'done',
        priority: 'medium',
        assigneeIds: ['sofia'],
        projectId: null,
        deadline: todayIso(),
        completedAt: atOffsetHours(4),
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
    completedAt: null,
    recurrenceRule: { kind: 'weekly', weekday: 1 },
    assigneeIds: ['mira'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
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
    tagIds: ['quick'],
    deadline: weekEndIso(),
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['andrii'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: 'black-ritual',
    sprintId: 'spr-queue-1',
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
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['yaroslav'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: 'vlad-ink',
    sprintId: 'spr-active-2',
    description: '',
    checkItems: [],
    subtasks: [
      {
        id: 's3',
        title: 'Підключити аналітику',
        status: 'new',
        priority: 'low',
        assigneeIds: ['yaroslav'],
        projectId: null,
        deadline: null,
        completedAt: null,
        description: '',
        checkItems: [],
        subtasks: [
          {
            id: 's3a',
            title: 'Під-підзадача: події в GTM',
            status: 'new',
            priority: null,
            assigneeIds: ['yaroslav'],
            projectId: null,
            deadline: null,
            completedAt: null,
            description: '',
            checkItems: [],
            subtasks: [],
          },
        ],
      },
      {
        id: 's3b',
        title: 'Зібрати UTM-мітки',
        status: 'doing',
        priority: 'medium',
        assigneeIds: ['mira'],
        projectId: null,
        deadline: offsetIso(3),
        completedAt: null,
        description: '',
        checkItems: [],
        subtasks: [],
      },
    ],
    comments: [],
    activityLog: [],
  },
  {
    id: 't9',
    title: 'Запланувати 1:1 з командою',
    status: 'inbox',
    priority: 'medium',
    tagIds: ['client'],
    deadline: todayIso(),
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['andrii'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: null,
    sprintId: 'spr-queue-1',
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 't10',
    title: 'Переглянути особистий backlog',
    status: 'doing',
    priority: 'high',
    deadline: tomorrowIso(),
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['andrii'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: null,
    sprintId: 'spr-active-2',
    description: 'Задачі без проєкту для поточного користувача.',
    checkItems: [
      { id: 't10c1', label: 'Відкрити вкладку «Особисті»', done: false },
      { id: 't10c2', label: 'Закрити або перенести застарілі', done: false },
      { id: 't10c3', label: 'Додати дедлайни без дати', done: false },
      { id: 't10c4', label: 'Позначити пріоритети', done: false },
      { id: 't10c5', label: 'Зафіксувати наступні кроки', done: false },
    ],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 't11',
    title: 'Оновити нотатки з мітингу',
    status: 'done',
    priority: 'low',
    deadline: offsetIso(-3),
    completedAt: atOffsetHours(18),
    recurrenceRule: null,
    assigneeIds: ['andrii'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(96),
    projectId: null,
    sprintId: 'spr-done-1',
    description: '',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 't8',
    title: 'Закрити листопадовий звіт',
    status: 'done',
    priority: 'medium',
    deadline: offsetIso(-10),
    completedAt: atOffsetHours(96),
    recurrenceRule: null,
    assigneeIds: ['daria'],
    creatorId: 'daria',
    createdAt: atOffsetHours(120),
    projectId: 'maya-lines',
    sprintId: 'spr-done-1',
    description: '',
    checkItems: [],
    subtasks: [],
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
