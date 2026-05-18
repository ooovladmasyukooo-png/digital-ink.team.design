import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { ASSIGNEE_OPTIONS } from '../data';
import { PRIORITY_LABEL, STATUS_LABEL } from '../taskCopy';
import type { Subtask, Task, TaskPriority, TaskStatus } from '../types';
import styles from '../tasks.module.css';

function slugProject(s: string): string {
  const t = s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-їієґ-]/gi, '');
  return t.slice(0, 48) || 'project';
}

let subIdSeq = 0;
const newSubId = () => `sub-${Date.now()}-${++subIdSeq}`;

interface TaskDrawerProps {
  task: Task;
  onClose: () => void;
  onChange: (next: Task) => void;
}

export function TaskDrawer({ task, onClose, onChange }: TaskDrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const setSubtasks = (subtasks: Subtask[]) => onChange({ ...task, subtasks });

  const toggleSub = (id: string) =>
    setSubtasks(task.subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));

  const setSubTitle = (id: string, title: string) =>
    setSubtasks(task.subtasks.map((s) => (s.id === id ? { ...s, title } : s)));

  const addSubtask = () =>
    setSubtasks([...task.subtasks, { id: newSubId(), title: '', done: false }]);

  const removeEmptySubs = () => {
    const next = task.subtasks.filter((s) => s.title.trim() || s.done);
    if (next.length !== task.subtasks.length) setSubtasks(next);
  };

  return createPortal(
    <>
      <div
        className={styles['ts-backdrop']}
        role="presentation"
        aria-hidden
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />
      <aside className={styles['ts-drawer']} aria-label="Деталі задачі">
        <header className={styles['ts-dr-h']}>
          <span className={styles['ts-dr-eyebrow']}>Задача</span>
          <button type="button" className={styles['ts-dr-close']} aria-label="Закрити" onClick={onClose}>
            <Icon d={<path d="M18 6 6 18M6 6l12 12" />} size={16} sw={1.8} />
          </button>
        </header>
        <div className={styles['ts-dr-body']}>
          <label className="sr-only" htmlFor="ts-dr-title-in">
            Назва задачі
          </label>
          <textarea
            id="ts-dr-title-in"
            className={styles['ts-dr-title']}
            rows={2}
            value={task.title}
            placeholder="Назва задачі"
            onChange={(e) => onChange({ ...task, title: e.target.value })}
          />

          <div className={styles['ts-dr-meta']}>
            <div className={styles['ts-field']}>
              <span className={styles['ts-field-k']}>Статус</span>
              <select
                className={styles['ts-field-in']}
                value={task.status}
                onChange={(e) => onChange({ ...task, status: e.target.value as TaskStatus })}
              >
                {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {STATUS_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['ts-field']}>
              <span className={styles['ts-field-k']}>Пріоритет</span>
              <select
                className={styles['ts-field-in']}
                value={task.priority}
                onChange={(e) => onChange({ ...task, priority: e.target.value as TaskPriority })}
              >
                {(Object.keys(PRIORITY_LABEL) as TaskPriority[]).map((k) => (
                  <option key={k} value={k}>
                    {PRIORITY_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['ts-field']}>
              <span className={styles['ts-field-k']}>Дедлайн</span>
              <input
                className={styles['ts-field-in']}
                type="date"
                value={task.deadline ?? ''}
                onChange={(e) =>
                  onChange({
                    ...task,
                    deadline: e.target.value.trim() ? e.target.value : null,
                  })
                }
              />
            </div>
            <div className={styles['ts-field']}>
              <span className={styles['ts-field-k']}>Відповідальний</span>
              <select
                className={styles['ts-field-in']}
                value={task.assigneeId}
                onChange={(e) => {
                  const m = ASSIGNEE_OPTIONS.find((x) => x.id === e.target.value);
                  if (!m) return;
                  onChange({
                    ...task,
                    assigneeId: m.id,
                    assignee: m,
                  });
                }}
              >
                {ASSIGNEE_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={cx(styles['ts-field'], styles['ts-field-full'])}>
              <span className={styles['ts-field-k']}>Проєкт</span>
              <input
                className={styles['ts-field-in']}
                value={task.projectName}
                onChange={(e) => {
                  const projectName = e.target.value;
                  onChange({
                    ...task,
                    projectName,
                    projectId: slugProject(projectName),
                  });
                }}
              />
            </div>
          </div>

          <div className={styles['ts-desc-wrap']}>
            <div className={styles['ts-desc-label']}>Опис</div>
            <label className="sr-only" htmlFor="ts-desc-area">
              Опис задачі
            </label>
            <textarea
              id="ts-desc-area"
              className={styles['ts-desc']}
              value={task.description}
              placeholder="Контекст, посилання, чеклист у вільній формі…"
              onChange={(e) => onChange({ ...task, description: e.target.value })}
            />
          </div>

          <div className={styles['ts-sub-wrap']}>
            <div className={styles['ts-sub-t']}>Підзадачі</div>
            <ul className={styles['ts-sub-list']}>
              {task.subtasks.map((s) => (
                <li key={s.id} className={styles['ts-sub-li']}>
                  <input
                    type="checkbox"
                    className={styles['ts-sub-ch']}
                    checked={s.done}
                    onChange={() => toggleSub(s.id)}
                  />
                  <input
                    type="text"
                    className={cx(styles['ts-sub-in'], s.done && styles.done)}
                    value={s.title}
                    placeholder="Підзадача"
                    onChange={(e) => setSubTitle(s.id, e.target.value)}
                    onBlur={removeEmptySubs}
                  />
                </li>
              ))}
            </ul>
            <button type="button" className={styles['ts-add-sub']} onClick={addSubtask}>
              + Додати підзадачу
            </button>
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
