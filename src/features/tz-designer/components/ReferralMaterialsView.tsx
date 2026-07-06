import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import tsStyles from '../../tasks/tasks.module.css';
import { REFERRAL_MATERIAL_STATUSES } from '../materialOptions';
import type { ReferralMaterial, ReferralMaterialPatch } from '../types';
import styles from '../tzDesigner.module.css';
import { MaterialStatusGroupSection } from './MaterialStatusGroupSection';

interface ReferralMaterialsViewProps {
  materials: ReferralMaterial[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, patch: ReferralMaterialPatch) => void;
  onAdd: () => void;
}

export function ReferralMaterialsView({ materials, onOpen, onUpdate, onAdd }: ReferralMaterialsViewProps) {
  if (materials.length === 0) {
    return (
      <div className={cx(tsStyles['ts-by-date'], styles['materials-ts-shell'])}>
        <p className={tsStyles['ts-empty-state']}>
          Немає матеріалів.{' '}
          <button type="button" className={styles['materials-empty-link']} onClick={onAdd}>
            {Icons.plus}
            <span>Додати перший</span>
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className={cx(tsStyles['ts-by-date'], styles['materials-ts-shell'])}>
      <div className={tsStyles['ts-table']}>
        {REFERRAL_MATERIAL_STATUSES.map((status) => (
          <MaterialStatusGroupSection
            key={status}
            status={status}
            materials={materials.filter((material) => material.status === status)}
            onOpen={onOpen}
            onUpdate={onUpdate}
            onAdd={status === 'draft' ? onAdd : undefined}
          />
        ))}
      </div>
    </div>
  );
}
