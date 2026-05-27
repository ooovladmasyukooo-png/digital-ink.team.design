import { useEffect, useSyncExternalStore } from 'react';
import { PRIORITIES, STATUS_META } from '../constants';
import { formatTaskDateTime, formatTaskDeadline } from '../dateDisplay';
import { resolveTaskCreatedAt } from '../taskCreatedAt';
import { formatTaskRef } from '../taskRef';
import { parseTaskPublicSearch } from '../tasksPaths';
import { getTaskById, subscribeTasks } from '../tasksStore';
import { taskHasTags, TASK_TAGS } from '../taskTags';
import styles from '../tasks.module.css';
import { teamById, projectById } from '../taskOptions';

export function TaskPublicPage() {
  const taskId = parseTaskPublicSearch(window.location.search);
  const task = useSyncExternalStore(
    subscribeTasks,
    () => (taskId ? getTaskById(taskId) : null),
    () => (taskId ? getTaskById(taskId) : null),
  );

  useEffect(() => {
    if (task?.published) {
      document.title = `${task.title} · Задачі`;
      return;
    }
    document.title = 'Задачі';
  }, [task?.published, task?.title]);

  if (!taskId) {
    return (
      <div className={styles['ts-public-page']}>
        <p className={styles['ts-public-empty']}>Невірне посилання на задачу.</p>
      </div>
    );
  }

  if (!task || !task.published) {
    return (
      <div className={styles['ts-public-page']}>
        <p className={styles['ts-public-empty']}>Ця задача недоступна або ще не опублікована.</p>
      </div>
    );
  }

  const creator = teamById[task.creatorId];
  const createdAtLabel = formatTaskDateTime(resolveTaskCreatedAt(task));
  const priorityLabel = task.priority ? PRIORITIES[task.priority].label : '—';
  const statusLabel = STATUS_META[task.status].label;
  const deadlineLabel = task.deadline ? formatTaskDeadline(task.deadline) : '—';
  const projectName = task.projectId ? (projectById[task.projectId]?.name ?? task.projectId) : '—';
  const assignees = task.assigneeIds.map((id) => teamById[id]?.name ?? id).join(', ') || '—';
  const tagLabels = [
    ...task.tagIds.map((id) => TASK_TAGS[id].label),
    ...task.customTags,
  ];

  return (
    <div className={styles['ts-public-page']}>
      <header className={styles['ts-public-head']}>
        <span className={styles['ts-public-brand']}>Задачі</span>
        <span className={styles['ts-public-ref']}>{formatTaskRef(task.id)}</span>
      </header>
      <main className={styles['ts-public-main']}>
        <h1 className={styles['ts-public-title']}>{task.title}</h1>
        <dl className={styles['ts-public-meta']}>
          <div>
            <dt>Статус</dt>
            <dd>{statusLabel}</dd>
          </div>
          <div>
            <dt>Пріоритет</dt>
            <dd>{priorityLabel}</dd>
          </div>
          <div>
            <dt>Дедлайн</dt>
            <dd>{deadlineLabel}</dd>
          </div>
          <div>
            <dt>Проєкт</dt>
            <dd>{projectName}</dd>
          </div>
          <div>
            <dt>Відповідальні</dt>
            <dd>{assignees}</dd>
          </div>
          <div>
            <dt>Автор</dt>
            <dd>{creator?.name ?? task.creatorId}</dd>
          </div>
          <div>
            <dt>Створено</dt>
            <dd>{createdAtLabel}</dd>
          </div>
        </dl>
        {taskHasTags(task.tagIds, task.customTags) ? (
          <section className={styles['ts-public-block']}>
            <h2 className={styles['ts-public-k']}>Теги</h2>
            <p className={styles['ts-public-text']}>{tagLabels.join(', ')}</p>
          </section>
        ) : null}
        {task.description.trim() ? (
          <section className={styles['ts-public-block']}>
            <h2 className={styles['ts-public-k']}>Опис</h2>
            <p className={styles['ts-public-text']}>{task.description}</p>
          </section>
        ) : null}
        {task.checkItems.length > 0 ? (
          <section className={styles['ts-public-block']}>
            <h2 className={styles['ts-public-k']}>Чекліст</h2>
            <ul className={styles['ts-public-checklist']}>
              {task.checkItems.map((item) => (
                <li key={item.id} className={item.done ? styles['ts-public-check-done'] : undefined}>
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
