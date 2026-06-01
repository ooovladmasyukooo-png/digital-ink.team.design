import type { ReactNode } from 'react';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';

interface ProfileBoolFieldProps {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ProfileBoolField({ icon, label, checked, onChange }: ProfileBoolFieldProps) {
  return (
    <label className={cx(styles.field, styles['p2-field'])}>
      <span className={styles['field-l']}>
        <span className={styles['field-i']}>{icon}</span>
        <span className={styles['field-k']}>{label}</span>
      </span>
      <span className={styles['field-v-wrap']}>
        <input
          type="checkbox"
          className={styles['p2-profile-check']}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </span>
    </label>
  );
}
