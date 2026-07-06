import { useRef, useState } from 'react';
import { cx } from '../../../shared/styles/cx';
import { TaskPickerPopover } from '../../tasks/components/TaskPickerPopover';
import tsStyles from '../../tasks/tasks.module.css';
import { formatMaterialConversion, formatMaterialUpdatedAt } from '../materialOptions';
import type { ReferralMaterial, ReferralMaterialPatch, ReferralMaterialStatus } from '../types';
import styles from '../tzDesigner.module.css';
import { MaterialStatusBadge, materialStatusPickerItems } from './MaterialStatusBadge';

interface MaterialRowProps {
  material: ReferralMaterial;
  onOpen: (id: string) => void;
  onUpdate: (id: string, patch: ReferralMaterialPatch) => void;
}

export function MaterialRow({ material, onOpen, onUpdate }: MaterialRowProps) {
  const statusRef = useRef<HTMLButtonElement>(null);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const hasDescription = material.description.trim().length > 0;

  const patch = (next: ReferralMaterialPatch) => {
    onUpdate(material.id, { ...next, updatedAt: new Date().toISOString() });
  };

  return (
    <div className={cx(tsStyles['ts-row'], hasDescription && styles['material-row-has-desc'])}>
      <div className={tsStyles['ts-cell-tree']} aria-hidden />

      <div className={tsStyles['ts-cell-lead']}>
        <button
          ref={statusRef}
          type="button"
          className={cx(tsStyles['ts-cell-btn'], tsStyles['ts-status-inline'])}
          onClick={() => setStatusPickerOpen((open) => !open)}
          aria-label={`Статус: ${material.status}`}
        >
          <MaterialStatusBadge status={material.status} />
        </button>

        <button
          type="button"
          className={cx(tsStyles['ts-title-btn'], hasDescription && styles['material-row-title-btn'])}
          onClick={() => onOpen(material.id)}
          aria-label={`Відкрити: ${material.title}`}
        >
          <span className={cx(tsStyles['ts-title-inner'], styles['material-row-title-inner'])}>
            <span className={styles['material-row-title-stack']}>
              <span className={tsStyles['ts-title-t']}>{material.title}</span>
              {hasDescription ? (
                <span className={styles['material-row-desc']}>{material.description}</span>
              ) : null}
            </span>
          </span>
        </button>
      </div>

      <div className={cx(styles['materials-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{material.stats.partnersUsed}</span>
      </div>
      <div className={cx(styles['materials-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{material.stats.views}</span>
      </div>
      <div className={cx(styles['materials-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{material.stats.linkClicks}</span>
      </div>
      <div className={cx(styles['materials-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{material.stats.joined}</span>
      </div>
      <div className={cx(styles['materials-stat-cell'], 'mono')}>
        <span className={tsStyles['ts-deadline-t']}>{formatMaterialConversion(material.stats)}</span>
      </div>
      <div className={styles['materials-stat-cell']}>
        <span className={cx(tsStyles['ts-deadline-t'], 'mono')}>{formatMaterialUpdatedAt(material.updatedAt)}</span>
      </div>

      <div className={tsStyles['ts-row-actions']} aria-hidden />

      {statusPickerOpen ? (
        <TaskPickerPopover
          open
          anchorRef={statusRef}
          compact
          width={168}
          items={materialStatusPickerItems(material.status)}
          onClose={() => setStatusPickerOpen(false)}
          onSelect={(id) => {
            patch({ status: id as ReferralMaterialStatus });
            setStatusPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
