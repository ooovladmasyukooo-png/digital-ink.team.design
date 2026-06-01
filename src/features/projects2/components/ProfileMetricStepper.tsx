import type { ReactNode, RefObject } from 'react';
import { Icon } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';

interface ProfileMetricStepperProps {
  label: string;
  valueLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onOpenPicker: () => void;
  pickerOpen: boolean;
  valueRef: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}

export function ProfileMetricStepper({
  label,
  valueLabel,
  onPrev,
  onNext,
  onOpenPicker,
  pickerOpen,
  valueRef,
  children,
}: ProfileMetricStepperProps) {
  return (
    <div className={styles['p2-profile-metric']}>
      <span className={styles['p2-profile-metric-k']}>{label}</span>
      <div className={styles['p2-profile-stepper']}>
        <button
          type="button"
          className={styles['p2-profile-stepper-nav']}
          aria-label={`Попередній: ${label}`}
          onClick={onPrev}
        >
          <Icon d={<path d="m15 18-6-6 6-6" />} size={12} sw={1.5} />
        </button>
        <button
          ref={valueRef}
          type="button"
          className={cx(styles['p2-profile-stepper-val'], pickerOpen && styles['p2-profile-stepper-val-on'])}
          aria-label={`${label}: ${valueLabel}. Відкрити список`}
          aria-expanded={pickerOpen}
          onClick={onOpenPicker}
        >
          {children}
        </button>
        <button
          type="button"
          className={styles['p2-profile-stepper-nav']}
          aria-label={`Наступний: ${label}`}
          onClick={onNext}
        >
          <Icon d={<path d="m9 18 6-6-6-6" />} size={12} sw={1.5} />
        </button>
      </div>
    </div>
  );
}
