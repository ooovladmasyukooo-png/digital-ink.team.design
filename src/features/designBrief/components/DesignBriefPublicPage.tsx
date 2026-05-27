import { useEffect, useSyncExternalStore } from 'react';
import { formatDesignBriefRef } from '../designBriefRef';
import { formatTaskDateTime } from '../dateDisplay';
import { resolveDesignBriefCreatedAt } from '../designBriefCreatedAt';
import { parseDesignBriefPublicSearch } from '../designBriefPaths';
import { getDesignBriefById, subscribeDesignBriefs } from '../designBriefStore';
import styles from '../designBrief.module.css';
import { teamById } from '../designBriefOptions';
import { PRIORITIES, STATUS_META } from '../constants';

export function DesignBriefPublicPage() {
  const briefId = parseDesignBriefPublicSearch(window.location.search);
  const brief = useSyncExternalStore(
    subscribeDesignBriefs,
    () => (briefId ? getDesignBriefById(briefId) : null),
    () => (briefId ? getDesignBriefById(briefId) : null),
  );

  useEffect(() => {
    if (brief?.published) {
      document.title = `${brief.title} · ТЗ дизайнеру`;
      return;
    }
    document.title = 'ТЗ дизайнеру';
  }, [brief?.published, brief?.title]);

  if (!briefId) {
    return (
      <div className={styles['db-public-page']}>
        <p className={styles['db-public-empty']}>Невірне посилання на ТЗ.</p>
      </div>
    );
  }

  if (!brief || !brief.published) {
    return (
      <div className={styles['db-public-page']}>
        <p className={styles['db-public-empty']}>Це ТЗ недоступне або ще не опубліковане.</p>
      </div>
    );
  }

  const creator = teamById[brief.creatorId];
  const createdAtLabel = formatTaskDateTime(resolveDesignBriefCreatedAt(brief));
  const priorityLabel = brief.priority ? PRIORITIES[brief.priority].label : '—';
  const statusLabel = STATUS_META[brief.status].label;

  return (
    <div className={styles['db-public-page']}>
      <header className={styles['db-public-head']}>
        <span className={styles['db-public-brand']}>ТЗ дизайнеру</span>
        <span className={styles['db-public-ref']}>{formatDesignBriefRef(brief.id)}</span>
      </header>
      <main className={styles['db-public-main']}>
        <h1 className={styles['db-public-title']}>{brief.title}</h1>
        <dl className={styles['db-public-meta']}>
          <div>
            <dt>Статус</dt>
            <dd>{statusLabel}</dd>
          </div>
          <div>
            <dt>Пріоритет</dt>
            <dd>{priorityLabel}</dd>
          </div>
          <div>
            <dt>Автор</dt>
            <dd>{creator?.name ?? brief.creatorId}</dd>
          </div>
          <div>
            <dt>Створено</dt>
            <dd>{createdAtLabel}</dd>
          </div>
        </dl>
        {brief.description.trim() ? (
          <section className={styles['db-public-block']}>
            <h2 className={styles['db-public-k']}>Опис</h2>
            <p className={styles['db-public-text']}>{brief.description}</p>
          </section>
        ) : null}
        {brief.copyVariants.some((v) => v.body.trim()) ? (
          <section className={styles['db-public-block']}>
            <h2 className={styles['db-public-k']}>Тексти</h2>
            {brief.copyVariants.map((variant) =>
              variant.body.trim() ? (
                <pre key={variant.id} className={styles['db-public-pre']}>
                  {variant.body}
                </pre>
              ) : null,
            )}
          </section>
        ) : null}
        {brief.referenceLinks.length > 0 ? (
          <section className={styles['db-public-block']}>
            <h2 className={styles['db-public-k']}>Референси</h2>
            <ul className={styles['db-public-links']}>
              {brief.referenceLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noreferrer noopener">
                    {link.label?.trim() || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {brief.checkItems.length > 0 ? (
          <section className={styles['db-public-block']}>
            <h2 className={styles['db-public-k']}>Чекліст</h2>
            <ul className={styles['db-public-checklist']}>
              {brief.checkItems.map((item) => (
                <li key={item.id} className={item.done ? styles['db-public-check-done'] : undefined}>
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
