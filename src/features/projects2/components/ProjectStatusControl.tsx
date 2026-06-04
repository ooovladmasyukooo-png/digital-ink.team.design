import { useRef, useState } from 'react';
import { cx } from '../../../shared/styles/cx';
import { ProjectPipelineStatusPopover } from './ProjectPipelineStatusPopover';
import {
  PipelineStatusChip,
  normalizePipelineStatus,
  type ProjectPipelineStatus,
} from '../projectPipelineStatus';
import styles from '../projects2.module.css';

interface ProjectStatusControlProps {
  pipelineStatus: string;
  onChange: (status: ProjectPipelineStatus) => void;
}

export function ProjectStatusControl({ pipelineStatus: rawStatus, onChange }: ProjectStatusControlProps) {
  const [open, setOpen] = useState(false);
  const statusRef = useRef<HTMLButtonElement>(null);
  const pipelineStatus = normalizePipelineStatus(rawStatus);

  return (
    <>
      <div className={styles['p2-profile-metric']}>
        <span className={styles['p2-profile-metric-k']}>Статус</span>
        <button
          ref={statusRef}
          type="button"
          className={cx(styles['p2-profile-status-chip'], open && styles['p2-profile-status-chip-on'])}
          aria-label={`Статус: ${pipelineStatus}. Відкрити список`}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <PipelineStatusChip status={pipelineStatus} size="compact" />
        </button>
      </div>

      {open ? (
        <ProjectPipelineStatusPopover
          open
          anchorRef={statusRef}
          current={pipelineStatus}
          onClose={() => setOpen(false)}
          onSelect={(status) => {
            onChange(status);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
