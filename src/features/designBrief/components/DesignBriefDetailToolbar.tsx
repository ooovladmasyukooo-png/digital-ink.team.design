import { useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { formatDesignBriefRef } from '../designBriefRef';
import { buildDesignBriefPublicLink, buildDesignBriefTaskLink } from '../designBriefPaths';
import styles from '../designBrief.module.css';
import type { DesignBrief, DesignBriefPatch } from '../types';

interface DesignBriefDetailToolbarProps {
  brief: DesignBrief;
  /** id у URL повної сторінки (коренева задача) */
  briefLinkId: string;
  variant: 'drawer' | 'page';
  onClose: () => void;
  onExpand?: () => void;
  onCollapse?: () => void;
  onUpdate?: (patch: DesignBriefPatch) => void;
  creatorName: string;
  creatorHue: number;
  createdAtIso: string;
  createdAtLabel: string;
}

export function DesignBriefDetailToolbar({
  brief,
  briefLinkId,
  variant,
  onClose,
  onExpand,
  onUpdate,
  creatorName,
  creatorHue,
  createdAtIso,
  createdAtLabel,
}: DesignBriefDetailToolbarProps) {
  const [shareNote, setShareNote] = useState<string | null>(null);

  const fullPageHref = buildDesignBriefTaskLink(briefLinkId);
  const publicHref = buildDesignBriefPublicLink(briefLinkId);

  const onShare = async () => {
    const path = brief.published ? publicHref : fullPageHref;
    const url = `${window.location.origin}${path}`;
    const text = `${brief.title}\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setShareNote(brief.published ? 'Публічне посилання' : 'Скопійовано');
      window.setTimeout(() => setShareNote(null), 2000);
    } catch {
      setShareNote('Не вдалося скопіювати');
      window.setTimeout(() => setShareNote(null), 2000);
    }
    onExpand?.();
  };

  const publishToggle = onUpdate ? (
    <label
      className={cx(styles['db-publish-toggle'], brief.published && styles['db-publish-toggle-on'])}
      title="Доступ без входу в CRM"
    >
      <input
        type="checkbox"
        className={styles['db-publish-toggle-input']}
        checked={brief.published}
        onChange={(event) => onUpdate({ published: event.target.checked })}
      />
      <span className={styles['db-publish-track']} aria-hidden>
        <span className={styles['db-publish-thumb']} />
      </span>
      <span className={styles['db-publish-toggle-label']}>
        {brief.published ? 'Опубліковано' : 'Публікувати'}
      </span>
    </label>
  ) : null;

  const meta = (
    <div className={styles['db-detail-top-meta']}>
      {publishToggle}
      <button type="button" className={styles['db-drawer-share']} onClick={onShare}>
        <span className={styles['db-drawer-share-i']}>{Icons.share}</span>
        <span>{shareNote ?? 'Поділитися'}</span>
      </button>
      <span className={styles['db-drawer-creator-av']} title={creatorName} aria-label={`Автор: ${creatorName}`}>
        <Avatar name={creatorName} hue={creatorHue} size="sm" />
      </span>
      <time className={styles['db-drawer-created']} dateTime={createdAtIso} title={createdAtLabel}>
        {createdAtLabel}
      </time>
    </div>
  );

  if (variant === 'drawer') {
    return (
      <header className={cx(styles['db-detail-head'], styles['db-detail-head-drawer'])}>
        <div className={styles['db-detail-head-actions']}>
          <button type="button" className={styles['db-drawer-close']} aria-label="Закрити" onClick={onClose}>
            {Icons.close}
          </button>
          {onExpand ? (
            <a
              href={fullPageHref}
              className={styles['db-drawer-close']}
              aria-label="Відкрити на всю сторінку"
              onClick={(e) => {
                e.preventDefault();
                onExpand();
              }}
            >
              {Icons.openExternal}
            </a>
          ) : null}
        </div>
        {meta}
      </header>
    );
  }

  return (
    <header className={cx(styles['db-detail-head'], styles['db-detail-head-page'])}>
      <div className={styles['db-detail-head-row']}>
        <nav className={styles['db-detail-crumb']} aria-label="Навігація">
          <button type="button" className={cx(styles['db-detail-crumb-text'], styles['db-detail-crumb-root'])} onClick={onClose}>
            ТЗ дизайнеру
          </button>
          <span className={cx(styles['db-detail-crumb-text'], styles['db-detail-crumb-sep'])} aria-hidden>
            /
          </span>
          <span className={cx(styles['db-detail-crumb-text'], styles['db-detail-crumb-ref'])}>{formatDesignBriefRef(brief.id)}</span>
        </nav>
        {meta}
      </div>
    </header>
  );
}
