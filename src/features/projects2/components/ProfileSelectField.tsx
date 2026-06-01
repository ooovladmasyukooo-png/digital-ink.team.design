import type { ReactNode } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { ProjectPatch } from '../types';
import styles from '../projects2.module.css';

interface ProfileSelectFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  fieldKey: keyof ProjectPatch;
  options: readonly string[];
  onSave: (field: keyof ProjectPatch, value: string) => void;
}

export function ProfileSelectField({ icon, label, value, fieldKey, options, onSave }: ProfileSelectFieldProps) {
  return (
    <div className={cx(styles.field, styles['p2-field'])}>
      <div className={styles['field-l']}>
        <span className={styles['field-i']}>{icon}</span>
        <span className={styles['field-k']}>{label}</span>
      </div>
      <div className={`${styles['field-v-wrap']} ${styles['select-wrap']}`}>
        <select
          className={`${styles['field-in']} ${styles['field-select']}`}
          value={value}
          onChange={(event) => onSave(fieldKey, event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className={styles['select-chev']}>{Icons.chevD}</span>
      </div>
    </div>
  );
}
