import { cx } from '../../../shared/styles/cx';
import { ARCHIVE_GROUP_ORDER } from '../archiveGroups';
import type { TasksWorkspace } from '../useTasksWorkspace';
import styles from '../tasks.module.css';
import { ArchiveGroupSection } from './ArchiveGroupSection';

interface TasksArchiveViewProps {
  workspace: TasksWorkspace;
}

export function TasksArchiveView({ workspace }: TasksArchiveViewProps) {
  const {
    archiveGrouped,
    hasAnyArchive,
  } = workspace;

  return (
    <div className={cx(styles['ts-by-date'], styles['ts-archive'])}>
      {hasAnyArchive ? (
        <div className={styles['ts-table']}>
          {ARCHIVE_GROUP_ORDER.map((groupId) => (
            <ArchiveGroupSection
              key={groupId}
              groupId={groupId}
              items={archiveGrouped[groupId]}
              workspace={workspace}
            />
          ))}
        </div>
      ) : (
        <p className={styles['ts-empty-state']}>Архів порожній. Завершені задачі та підзадачі зʼявляться тут.</p>
      )}
    </div>
  );
}
