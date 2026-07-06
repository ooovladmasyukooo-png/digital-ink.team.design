import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import dbStyles from '../../designBrief/designBrief.module.css';
import {
  formatMaterialUpdatedAt,
  REFERRAL_MATERIAL_STATUS_LABELS,
  REFERRAL_MATERIAL_STATUSES,
} from '../materialOptions';
import type { ReferralMaterial, ReferralMaterialPatch } from '../types';
import styles from '../tzDesigner.module.css';
import { MaterialStatsBlock } from './MaterialStatsBlock';

interface MaterialDetailPanelProps {
  material: ReferralMaterial;
  onClose: () => void;
  onUpdate: (id: string, patch: ReferralMaterialPatch) => void;
  onDelete: (id: string) => void;
}

function syncTextareaHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

export function MaterialDetailPanel({ material, onClose, onUpdate, onDelete }: MaterialDetailPanelProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    syncTextareaHeight(titleRef.current);
    syncTextareaHeight(descRef.current);
    syncTextareaHeight(htmlRef.current);
  }, [material.id, material.title, material.description, material.html]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const patch = (next: ReferralMaterialPatch) => {
    onUpdate(material.id, { ...next, updatedAt: new Date().toISOString() });
  };

  return createPortal(
    <>
      <button
        type="button"
        className={dbStyles['db-drawer-backdrop']}
        aria-label="Закрити матеріал"
        onClick={onClose}
      />
      <aside
        className={dbStyles['db-drawer']}
        role="dialog"
        aria-modal="true"
        aria-label={material.title}
      >
        <header className={cx(dbStyles['db-detail-head'], dbStyles['db-detail-head-drawer'])}>
          <div className={styles['material-drawer-head-main']}>
            <div className={styles['material-drawer-head-row']}>
              <span className={styles['material-drawer-k']}>Матеріал</span>
              <span className={cx(styles['materials-status'], styles[`materials-status-${material.status}`])}>
                {REFERRAL_MATERIAL_STATUS_LABELS[material.status]}
              </span>
            </div>
            <span className={cx(styles['material-drawer-updated'], 'mono', 'muted')}>
              {formatMaterialUpdatedAt(material.updatedAt)}
            </span>
          </div>
          <button type="button" className={dbStyles['db-drawer-close']} aria-label="Закрити" onClick={onClose}>
            {Icons.close}
          </button>
        </header>

        <div className={dbStyles['db-drawer-scroll']}>
          <div className={dbStyles['db-drawer-body']}>
            <textarea
              ref={titleRef}
              className={dbStyles['db-detail-title']}
              value={material.title}
              rows={1}
              aria-label="Назва матеріалу"
              placeholder="Назва матеріалу"
              onChange={(event) => {
                patch({ title: event.target.value });
                syncTextareaHeight(event.target);
              }}
            />

            <div className={dbStyles['db-detail-rows']}>
              <div className={dbStyles['db-detail-row']}>
                <span className={dbStyles['db-detail-k']}>Статус</span>
                <div className={styles['material-status-picker']}>
                  {REFERRAL_MATERIAL_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={cx(
                        styles['material-status-btn'],
                        styles[`material-status-btn-${status}`],
                        material.status === status && styles['material-status-btn-on'],
                      )}
                      onClick={() => patch({ status })}
                    >
                      {REFERRAL_MATERIAL_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <MaterialStatsBlock stats={material.stats} />

            <div className={dbStyles['db-detail-desc-block']}>
              <span className={dbStyles['db-detail-k']}>Опис</span>
              <textarea
                ref={descRef}
                className={dbStyles['db-detail-desc']}
                value={material.description}
                rows={3}
                aria-label="Опис матеріалу"
                placeholder="Короткий опис або примітки"
                onChange={(event) => {
                  patch({ description: event.target.value });
                  syncTextareaHeight(event.target);
                }}
              />
            </div>

            <div className={dbStyles['db-detail-desc-block']}>
              <span className={dbStyles['db-detail-k']}>HTML</span>
              <textarea
                ref={htmlRef}
                className={cx(dbStyles['db-detail-desc'], styles['material-html-field'])}
                value={material.html}
                rows={8}
                aria-label="HTML матеріалу"
                placeholder="<section>...</section>"
                spellCheck={false}
                onChange={(event) => {
                  patch({ html: event.target.value });
                  syncTextareaHeight(event.target);
                }}
              />
            </div>
          </div>
        </div>

        <footer className={styles['material-drawer-foot']}>
          <button type="button" className={styles['material-delete-btn']} onClick={() => onDelete(material.id)}>
            {Icons.trash}
            Видалити
          </button>
        </footer>
      </aside>
    </>,
    document.body,
  );
}
