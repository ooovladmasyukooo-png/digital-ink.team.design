import { useEffect, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import tsStyles from '../../tasks/tasks.module.css';
import {
  REFERRAL_MATERIAL_STATUS_LABELS,
} from '../materialOptions';
import type { ReferralMaterial, ReferralMaterialPatch, ReferralMaterialStatus } from '../types';
import { MaterialColumnsHeader } from './MaterialColumnsHeader';
import { MaterialRow } from './MaterialRow';

const STATUS_TONE_CLASS: Record<ReferralMaterialStatus, string> = {
  draft: tsStyles['ts-group-status-gray'],
  available: tsStyles['ts-group-status-green'],
  closed: tsStyles['ts-group-status-slate'],
};

interface MaterialStatusGroupSectionProps {
  status: ReferralMaterialStatus;
  materials: ReferralMaterial[];
  onOpen: (id: string) => void;
  onUpdate: (id: string, patch: ReferralMaterialPatch) => void;
  onAdd?: () => void;
}

export function MaterialStatusGroupSection({
  status,
  materials,
  onOpen,
  onUpdate,
  onAdd,
}: MaterialStatusGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(() => status === 'closed' || materials.length === 0);
  const prevMaterialCount = useRef(materials.length);

  useEffect(() => {
    if (materials.length === 0) {
      setCollapsed(true);
    } else if (prevMaterialCount.current === 0 && status !== 'closed') {
      setCollapsed(false);
    }
    prevMaterialCount.current = materials.length;
  }, [materials.length, status]);

  const label = REFERRAL_MATERIAL_STATUS_LABELS[status];
  const showAdd = Boolean(onAdd && status === 'draft');

  const handleAdd = () => {
    setCollapsed(false);
    onAdd?.();
  };

  return (
    <section
      className={cx(tsStyles['ts-group'], tsStyles['ts-group-status'], STATUS_TONE_CLASS[status])}
      aria-label={label}
    >
      <div className={tsStyles['ts-group-head']}>
        <button
          type="button"
          className={tsStyles['ts-group-toggle']}
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
        >
          <span className={cx(tsStyles['ts-chev'], collapsed && tsStyles['ts-chev-closed'])}>{Icons.chevD}</span>
          <span className={tsStyles['ts-group-title']}>{label}</span>
        </button>
        <span className={tsStyles['ts-group-count']}>{materials.length}</span>
        {showAdd ? (
          <button
            type="button"
            className={cx(tsStyles['ts-group-head-btn'], tsStyles['ts-group-add'])}
            aria-label={`Новий матеріал: ${label}`}
            onClick={handleAdd}
          >
            {Icons.plus}
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <>
          <MaterialColumnsHeader inGroup />
          {materials.length > 0 ? (
            <div className={tsStyles['ts-rows']}>
              {materials.map((material) => (
                <MaterialRow key={material.id} material={material} onOpen={onOpen} onUpdate={onUpdate} />
              ))}
            </div>
          ) : (
            <p className={tsStyles['ts-group-empty']}>Немає матеріалів</p>
          )}

          {showAdd ? (
            <button type="button" className={tsStyles['ts-new-row']} onClick={handleAdd}>
              {Icons.plus}
              <span>Новий матеріал</span>
            </button>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
