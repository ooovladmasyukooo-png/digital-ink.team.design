import { TASK_CREATOR_ASSIGNEE_ID } from '../../tasks/constants';
import type { ProjectDocumentScope } from './documentScope';
import type { ProjectDocument } from './types';

const SEED_TIME = '2026-05-19T09:03:00.000Z';

function page(
  id: string,
  title: string,
  content: string,
  children: ProjectDocument[] = [],
  icon: string | null = null,
  published = false,
): ProjectDocument {
  return {
    id,
    kind: 'page',
    title,
    content,
    icon,
    creatorId: TASK_CREATOR_ASSIGNEE_ID,
    createdAt: SEED_TIME,
    updatedById: TASK_CREATOR_ASSIGNEE_ID,
    updatedAt: SEED_TIME,
    published,
    children,
  };
}

function folder(id: string, title: string, children: ProjectDocument[] = []): ProjectDocument {
  return {
    id,
    kind: 'folder',
    title,
    content: '',
    icon: null,
    creatorId: TASK_CREATOR_ASSIGNEE_ID,
    createdAt: SEED_TIME,
    updatedById: TASK_CREATOR_ASSIGNEE_ID,
    updatedAt: SEED_TIME,
    published: false,
    children,
  };
}

const DESIGN_BRIEF_SEED_BY_PROJECT: Record<string, ProjectDocument[]> = {
  'black-ritual': [
    page('tz-br-root', 'ТЗ дизайнеру', '# ТЗ дизайнеру\n\nБриф, референси та вимоги до макетів.', [
      folder('tz-br-refs', 'Референси', [
        page('tz-br-mood', 'Moodboard', '## Moodboard\n\nПосилання та скріни стилю.'),
      ]),
      page('tz-br-spec', 'Специфікація', '## Специфікація\n\nФормати, дедлайни, deliverables.'),
    ]),
  ],
};

const SEED_BY_PROJECT: Record<string, ProjectDocument[]> = {
  'black-ritual': [
    page('doc-br-root', 'ТЕСТОВА Замітка', '# ТЕСТОВА Замітка\n\nКоренева сторінка документів проєкту.', [
      folder('doc-br-folder-brief', 'Бриф', [
        page(
          'doc-br-brief',
          'Опис брифу',
          '## Бриф\n\nОпис очікувань клієнта та референси.',
          [
            page(
              'doc-br-untitled',
              'Untitled',
              '## Untitled\n\nПишіть у **Markdown** або вставляйте блоки.\n\n- Пункт 1\n- Пункт 2',
            ),
            page('doc-br-like', 'Untitled', '## Нотатки\n\n👍 Швидкі ідеї для команди.', [], '👍'),
          ],
        ),
      ]),
      page('doc-br-misc', 'Ntcn', '## Ntcn\n\nДодаткові матеріали.'),
    ]),
  ],
  'vlad-ink': [
    page('doc-vi-welcome', 'Документи проєкту', '# Vlad Ink\n\nТут зберігаються SOP, брифи та нотатки сесій.'),
  ],
};

export function getSeedDocuments(projectId: string, scope: ProjectDocumentScope = 'documents'): ProjectDocument[] {
  if (scope === 'design-brief') {
    return DESIGN_BRIEF_SEED_BY_PROJECT[projectId] ?? [
      page(
        'tz-default',
        'ТЗ дизайнеру',
        '# ТЗ дизайнеру\n\nДодайте сторінки, референси та вимоги для дизайнера.',
      ),
    ];
  }
  return SEED_BY_PROJECT[projectId] ?? [
    page('doc-default', 'Документи', '# Документи\n\nДодайте сторінку або папку кнопками у дереві.'),
  ];
}
