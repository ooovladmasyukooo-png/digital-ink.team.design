import { useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { formatTaskRef } from '../taskRef';
import { buildTaskLink } from '../tasksPaths';
import styles from '../tasks.module.css';
import type { Task } from '../types';

interface TaskDetailToolbarProps {
  task: Task;
  /** id у URL повної сторінки (коренева задача) */
  taskLinkId: string;
  variant: 'drawer' | 'page';
  onClose: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  creatorName: string;
  creatorHue: number;
  createdAtIso: string;
  createdAtLabel: string;
}

export function TaskDetailToolbar({
  task,
  taskLinkId,
  variant,
  onClose,
  onExpand,
  onCollapse,
  creatorName,
  creatorHue,
  createdAtIso,
  createdAtLabel,
}: TaskDetailToolbarProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);

  const fullPageHref = buildTaskLink(taskLinkId);

  const onShare = async () => {
    const url = `${window.location.origin}${fullPageHref}`;
    const text = `${task.title}\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareNote('Скопійовано');
      window.setTimeout(() => setShareNote(null), 2000);
    } catch {
      setShareNote('Не вдалося скопіювати');
      window.setTimeout(() => setShareNote(null), 2000);
    }
  };

  const meta = (
    <div className={styles['ts-detail-top-meta']}>
      {variant === 'page' ? (
        <button type="button" className={styles['ts-drawer-share']} onClick={onShare}>
          <span className={styles['ts-drawer-share-i']}>{Icons.share}</span>
          <span>{shareNote ?? 'Поділитися'}</span>
        </button>
      ) : null}
      <span className={styles['ts-drawer-creator-av']} title={creatorName} aria-label={`Автор: ${creatorName}`}>
        <Avatar name={creatorName} hue={creatorHue} size="sm" />
      </span>
      <time className={styles['ts-drawer-created']} dateTime={createdAtIso} title={createdAtLabel}>
        {createdAtLabel}
      </time>
    </div>
  );

  if (variant === 'drawer') {
    return (
      <header className={cx(styles['ts-detail-head'], styles['ts-detail-head-drawer'])}>
        <div className={styles['ts-detail-head-actions']}>
          <button type="button" className={styles['ts-drawer-close']} aria-label="Закрити" onClick={onClose}>
            {Icons.close}
          </button>
          {onExpand ? (
            <a
              href={fullPageHref}
              className={styles['ts-drawer-close']}
              aria-label="Відкрити на всю сторінку"
              onClick={(e) => {
                e.preventDefault();
                onExpand();
              }}
            >
              {Icons.openExternal}
            </a>
          ) : null}
          <button type="button" className={styles['ts-drawer-share']} onClick={onShare}>
            <span className={styles['ts-drawer-share-i']}>{Icons.share}</span>
            <span>{shareNote ?? 'Поділитися'}</span>
          </button>
        </div>
        {meta}
      </header>
    );
  }

  return (
    <header className={cx(styles['ts-detail-head'], styles['ts-detail-head-page'])}>
      <div className={styles['ts-detail-head-row']}>
        <nav className={styles['ts-detail-crumb']} aria-label="Навігація">
          <button type="button" className={cx(styles['ts-detail-crumb-text'], styles['ts-detail-crumb-root'])} onClick={onClose}>
            Задача
          </button>
          <span className={cx(styles['ts-detail-crumb-text'], styles['ts-detail-crumb-sep'])} aria-hidden>
            /
          </span>
          <span className={cx(styles['ts-detail-crumb-text'], styles['ts-detail-crumb-ref'])}>{formatTaskRef(task.id)}</span>
        </nav>
        {meta}
      </div>
    </header>
  );
}
