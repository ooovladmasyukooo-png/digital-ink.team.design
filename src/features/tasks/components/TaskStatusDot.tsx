import type { TaskStatus } from '../types';
import styles from '../tasks.module.css';

interface TaskStatusDotProps {
  status: TaskStatus;
}

export function TaskStatusDot({ status }: TaskStatusDotProps) {
  return <span className={styles['status-dot']} data-status={status} aria-hidden />;
}
