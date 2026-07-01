import { SPRINT_PHASE_PICKER_ORDER, SPRINT_PHASE_BADGE_LABELS } from './sprints';
import type { TaskPickerItem } from './components/TaskPickerPopover';
import { SprintPhaseBadge } from './components/SprintPhaseBadge';
import type { SprintPhaseId } from './types';

export function sprintPhasePickerItems(current: SprintPhaseId): TaskPickerItem[] {
  return SPRINT_PHASE_PICKER_ORDER.map((phase) => ({
    id: phase,
    selected: phase === current,
    searchText: SPRINT_PHASE_BADGE_LABELS[phase],
    label: <SprintPhaseBadge phase={phase} size="md" />,
  }));
}
