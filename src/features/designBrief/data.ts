import type { DesignBrief } from './types';

export const initialDesignBriefs: DesignBrief[] = [
  {
    id: 'db1',
    title: 'Банери Black Ritual — spring drop',
    status: 'new',
    priority: 'high',
    deadline: tomorrowIso(),
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['nina'],
    creatorId: 'andrii',
    createdAt: atOffsetHours(48),
    projectId: 'black-ritual',
    format: 'static',
    sizes: ['1:1', '9:16'],
    referenceLinks: [
      { id: 'ref1', url: 'https://www.pinterest.com/search/pins/?q=dark%20neon%20beauty', label: 'Moodboard' },
    ],
    referenceMaterials: [],
    videoMaterials: [],
    copyVariants: [
      {
        id: 'copy1',
        body: 'CTA: «Записатися»\nАкцент: нова колекція spring drop',
      },
    ],
    description:
      '3 формати: 1080×1080, 1080×1920, 1200×628. Акцент на нову колекцію, CTA «Записатися». Стиль — темний фон, неонові акценти.',
    checkItems: [
      { id: 'dbc1', label: 'Референси та moodboard', done: true },
      { id: 'dbc2', label: '3 варіанти композиції', done: false },
    ],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 'db2',
    title: 'UI-kit для CRM — форми та таблиці',
    status: 'in_design',
    priority: 'medium',
    deadline: offsetIso(5),
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['nina'],
    creatorId: 'mira',
    createdAt: atOffsetHours(72),
    projectId: null,
    format: 'static',
    sizes: ['16:9'],
    referenceLinks: [],
    referenceMaterials: [],
    videoMaterials: [],
    copyVariants: [],
    description: 'Оновити стани input/select, таблиці задач і drawer. Підтримка light/dark.',
    checkItems: [],
    subtasks: [],
    comments: [],
    activityLog: [],
  },
  {
    id: 'db3',
    title: 'Storyboard для Old Sailor Reels',
    status: 'ready',
    priority: 'low',
    deadline: null,
    completedAt: null,
    recurrenceRule: null,
    assigneeIds: ['nina'],
    creatorId: 'sofia',
    createdAt: atOffsetHours(12),
    projectId: 'old-sailor',
    format: 'video',
    sizes: ['9:16'],
    referenceLinks: [],
    referenceMaterials: [],
    videoMaterials: [],
    copyVariants: [],
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

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
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
