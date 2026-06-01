import { useRef, useState } from 'react';
import { ProfileMetricStepper } from './ProfileMetricStepper';
import { ProjectPipelineStatusPopover } from './ProjectPipelineStatusPopover';
import {
  PipelineStatusChip,
  normalizePipelineStatus,
  stepPipelineStatus,
  type ProjectPipelineStatus,
} from '../projectPipelineStatus';

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
      <ProfileMetricStepper
        label="Статус"
        valueLabel={pipelineStatus}
        onPrev={() => onChange(stepPipelineStatus(pipelineStatus, 'prev'))}
        onNext={() => onChange(stepPipelineStatus(pipelineStatus, 'next'))}
        onOpenPicker={() => setOpen((current) => !current)}
        pickerOpen={open}
        valueRef={statusRef}
      >
        <PipelineStatusChip status={pipelineStatus} size="compact" />
      </ProfileMetricStepper>

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
