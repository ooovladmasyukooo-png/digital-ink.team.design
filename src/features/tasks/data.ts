import type { Subtask, Task, TaskAssignee } from './types';

export function ymdShift(from: Date, deltaDays: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const A = (id: string, name: string, hue: number): TaskAssignee => ({ id, name, hue });

const sub = (id: string, title: string, done: boolean): Subtask => ({ id, title, done });

let sid = 0;
const nid = () => `t-${++sid}`;

/** Демо-дані з динамічними датами відносно сьогодні */
export function createInitialTasks(): Task[] {
  const now = new Date();
  const andrii = A('andrii', 'Андрій Мельник', 20);
  const daria = A('daria', 'Дарія Власенко', 340);
  const yaroslav = A('yaroslav', 'Ярослав Антонюк', 200);
  const sofia = A('sofia', 'Sofia Beaumont', 60);
  const mira = A('mira', 'Mira Halvorsen', 280);

  const tasks: Task[] = [
    {
      id: nid(),
      title: 'Підготувати QBR для Reinhardt Group',
      description:
        'Звести цифри по воронці, коротко по ризиках і додати рекомендації на наступний квартал.\n\nШаблон у нотатках команди.',
      status: 'in_progress',
      priority: 'urgent',
      deadline: ymdShift(now, -2),
      projectId: 'p-reinhardt',
      projectName: 'Reinhardt Group',
      assigneeId: daria.id,
      assignee: daria,
      createdById: andrii.id,
      subtasks: [
        sub('s1', 'Експорт з CRM', true),
        sub('s2', 'Слайди з графіками', false),
        sub('s3', 'Чернетка для керівника', false),
      ],
    },
    {
      id: nid(),
      title: 'Перевірити лендінг A/B до запуску',
      description: 'Mobile LCP, форма, пікселі — короткий чеклист перед заливкою бюджету.',
      status: 'todo',
      priority: 'high',
      deadline: ymdShift(now, 0),
      projectId: 'p-cold',
      projectName: 'Cold launch · Nord',
      assigneeId: yaroslav.id,
      assignee: yaroslav,
      createdById: daria.id,
      subtasks: [sub('s4', 'GA4 події', false), sub('s5', 'Текст політики', false)],
    },
    {
      id: nid(),
      title: 'Погодити бриф з креативною студією',
      description: '',
      status: 'todo',
      priority: 'high',
      deadline: ymdShift(now, 1),
      projectId: 'p-cold',
      projectName: 'Cold launch · Nord',
      assigneeId: sofia.id,
      assignee: sofia,
      createdById: mira.id,
      subtasks: [],
    },
    {
      id: nid(),
      title: 'Оновити доступи до рекламних кабінетів',
      description: 'Після зміни статусу Олексія — закрити зайві ролі, залишити read-only аудиту.',
      status: 'review',
      priority: 'normal',
      deadline: ymdShift(now, 3),
      projectId: 'p-internal',
      projectName: 'Внутрішні процеси',
      assigneeId: andrii.id,
      assignee: andrii,
      createdById: mira.id,
      subtasks: [sub('s6', 'Meta Business', false), sub('s7', 'Google Ads', false)],
    },
    {
      id: nid(),
      title: 'Ретеншн-сценарій для Mansour (email)',
      description: '',
      status: 'todo',
      priority: 'normal',
      deadline: ymdShift(now, 14),
      projectId: 'p-mansour',
      projectName: 'Mansour Holdings',
      assigneeId: daria.id,
      assignee: daria,
      createdById: andrii.id,
      subtasks: [],
    },
    {
      id: nid(),
      title: 'Backlog: ідеї для тесту креативів',
      description: 'Просто список гіпотез без жорсткого дедлайну.',
      status: 'todo',
      priority: 'low',
      deadline: null,
      projectId: 'p-lab',
      projectName: 'Creative lab',
      assigneeId: yaroslav.id,
      assignee: yaroslav,
      createdById: yaroslav.id,
      subtasks: [sub('s8', '3 UGC концепти', false)],
    },
    {
      id: nid(),
      title: 'Закрити onboarding Mira (документація)',
      description: '',
      status: 'done',
      priority: 'normal',
      deadline: ymdShift(now, -5),
      projectId: 'p-internal',
      projectName: 'Внутрішні процеси',
      assigneeId: mira.id,
      assignee: mira,
      createdById: andrii.id,
      subtasks: [sub('s9', 'Notion сторінка', true), sub('s10', 'Доступи', true)],
    },
  ];

  return tasks;
}

export const ASSIGNEE_OPTIONS: TaskAssignee[] = [
  A('andrii', 'Андрій Мельник', 20),
  A('daria', 'Дарія Власенко', 340),
  A('yaroslav', 'Ярослав Антонюк', 200),
  A('sofia', 'Sofia Beaumont', 60),
  A('mira', 'Mira Halvorsen', 280),
];
