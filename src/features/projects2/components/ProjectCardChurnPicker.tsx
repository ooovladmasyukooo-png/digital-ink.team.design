import { useRef, useState, type MouseEvent } from 'react';
import { cx } from '../../../shared/styles/cx';
import { TaskPickerPopover } from '../../tasks/components/TaskPickerPopover';
import {
  ChurnRiskChip,
  churnRiskPickerItems,
  normalizeChurnRisk,
  type ProjectChurnRiskLevel,
} from '../projectChurnRisk';
import styles from '../projects2.module.css';

interface ProjectCardChurnPickerProps {
  churnRisk: string;
  onChange: (level: ProjectChurnRiskLevel) => void;
}

export function ProjectCardChurnPicker({ churnRisk, onChange }: ProjectCardChurnPickerProps) {
  const churnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const level = normalizeChurnRisk(churnRisk);

  const stopCardActivation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <>
      <button
        ref={churnRef}
        type="button"
        className={cx(styles['tlp-card-churn-btn'], open && styles['tlp-card-churn-btn-on'])}
        aria-label={`Критичність: ${level}`}
        aria-expanded={open}
        onClick={(event) => {
          stopCardActivation(event);
          setOpen((current) => !current);
        }}
        onMouseDown={stopCardActivation}
      >
        <ChurnRiskChip level={level} size="compact" showFlag={false} />
      </button>
      {open ? (
        <TaskPickerPopover
          open
          anchorRef={churnRef}
          items={churnRiskPickerItems(level)}
          width={200}
          compact
          onClose={() => setOpen(false)}
          onSelect={(id) => {
            onChange(id as ProjectChurnRiskLevel);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
