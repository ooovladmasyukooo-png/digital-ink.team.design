import type { ReactNode } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { TaskPickerItem } from '../../tasks/components/TaskPickerPopover';
import tsStyles from '../../tasks/tasks.module.css';
import {
  REFERRAL_MATERIAL_STATUSES,
  REFERRAL_MATERIAL_STATUS_LABELS,
} from '../materialOptions';
import type { ReferralMaterialStatus } from '../types';

type MaterialStatusTone = 'gray' | 'green' | 'slate';

const MATERIAL_STATUS_META: Record<
  ReferralMaterialStatus,
  { tone: MaterialStatusTone; icon: ReactNode; label: string }
> = {
  draft: { tone: 'gray', icon: Icons.description, label: REFERRAL_MATERIAL_STATUS_LABELS.draft },
  available: { tone: 'green', icon: Icons.check, label: REFERRAL_MATERIAL_STATUS_LABELS.available },
  closed: { tone: 'slate', icon: Icons.archive, label: REFERRAL_MATERIAL_STATUS_LABELS.closed },
};

function MaterialStatusLabel({ status, size = 'sm' }: { status: ReferralMaterialStatus; size?: 'sm' | 'md' }) {
  const meta = MATERIAL_STATUS_META[status];

  return (
    <span
      className={cx(
        tsStyles['ts-status'],
        size === 'md' ? tsStyles['ts-status-md'] : tsStyles['ts-status-sm'],
        tsStyles[`ts-status-${meta.tone}`],
      )}
    >
      <span className={tsStyles['ts-status-i']}>{meta.icon}</span>
      <span className={tsStyles['ts-status-t']}>{meta.label}</span>
    </span>
  );
}

export function MaterialStatusBadge({ status }: { status: ReferralMaterialStatus }) {
  const meta = MATERIAL_STATUS_META[status];

  return (
    <span
      className={cx(
        tsStyles['ts-status'],
        tsStyles['ts-status-sm'],
        tsStyles['ts-subtask-status-only'],
        tsStyles[`ts-status-${meta.tone}`],
      )}
    >
      <span className={tsStyles['ts-status-i']}>{meta.icon}</span>
    </span>
  );
}

export function materialStatusPickerItems(current: ReferralMaterialStatus): TaskPickerItem[] {
  return REFERRAL_MATERIAL_STATUSES.map((id) => ({
    id,
    selected: id === current,
    searchText: MATERIAL_STATUS_META[id].label,
    label: <MaterialStatusLabel status={id} size="md" />,
  }));
}
