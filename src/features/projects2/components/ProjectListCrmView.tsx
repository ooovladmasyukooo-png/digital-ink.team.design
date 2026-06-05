import { useCallback, useMemo, useState, type DragEvent } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import { teamById } from '../../tasks/taskOptions';
import {
  normalizePipelineStatus,
  type ProjectPipelineStatus,
} from '../projectPipelineStatus';
import { buildCrmBoardColumns, type ProjectListChurnOrder, type ProjectListGroupBy } from '../projectListView';
import { ProjectCard } from './ProjectCard';
import styles from '../projects2.module.css';
import type { Project } from '../types';

const DRAG_PROJECT_MIME = 'application/x-aurora-project-id';

interface ProjectListCrmViewProps {
  projects: Project[];
  groupBy: ProjectListGroupBy;
  churnOrder: ProjectListChurnOrder;
  memberNameById: Record<string, string>;
  directionOrder: string[];
  onSelect: (id: string) => void;
  onMoveProject: (projectId: string, status: ProjectPipelineStatus) => void;
}

function readDraggedProjectId(dataTransfer: DataTransfer): string | null {
  const id = dataTransfer.getData(DRAG_PROJECT_MIME);
  return id || null;
}

export function ProjectListCrmView({
  projects,
  groupBy,
  churnOrder,
  memberNameById,
  directionOrder,
  onSelect,
  onMoveProject,
}: ProjectListCrmViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropColumnKey, setDropColumnKey] = useState<string | null>(null);

  const columns = useMemo(
    () => buildCrmBoardColumns(projects, groupBy, memberNameById, directionOrder, churnOrder),
    [projects, groupBy, memberNameById, directionOrder, churnOrder],
  );

  const statusGrouping = groupBy === 'status';

  const clearDropState = useCallback(() => {
    setDropColumnKey(null);
    setDraggingId(null);
  }, []);

  const handleColumnDragOver = useCallback(
    (columnKey: string, droppable: boolean) => (event: DragEvent) => {
      if (!droppable) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDropColumnKey(columnKey);
    },
    [],
  );

  const handleColumnDrop = useCallback(
    (status: ProjectPipelineStatus, columnKey: string, droppable: boolean) =>
      (event: DragEvent) => {
        if (!droppable) return;
        event.preventDefault();
        const projectId = readDraggedProjectId(event.dataTransfer);
        if (!projectId) {
          clearDropState();
          return;
        }
        const project = projects.find((item) => item.id === projectId);
        if (!project) {
          clearDropState();
          return;
        }
        if (normalizePipelineStatus(project.pipelineStatus) !== status) {
          onMoveProject(projectId, status);
        }
        clearDropState();
      },
    [projects, onMoveProject, clearDropState],
  );

  const clearDropForColumn = useCallback(
    (columnKey: string) => (event: DragEvent) => {
      if (event.currentTarget.contains(event.relatedTarget as Node)) return;
      if (dropColumnKey === columnKey) setDropColumnKey(null);
    },
    [dropColumnKey],
  );

  if (!columns.length) {
    return (
      <div className={styles['p2-crm-board']}>
        <div className={styles['p2-crm-col-empty']}>Проєктів не знайдено</div>
      </div>
    );
  }

  return (
    <div className={styles['p2-crm-board']}>
      {columns.map((column) => {
        const member = column.memberId ? teamById[column.memberId] : null;
        const dropStatus = column.pipelineStatus;

        return (
          <section
            key={column.key}
            className={cx(
              styles['p2-crm-col'],
              dropColumnKey === column.key && styles['p2-crm-col-drop'],
            )}
          >
            <header className={styles['p2-crm-col-h']}>
              <div className={styles['p2-crm-col-t']}>
                {member ? (
                  <span className={styles['p2-crm-col-av']}>
                    <Avatar name={member.name} hue={member.hue} size="sm" />
                  </span>
                ) : (
                  <span
                    className={cx(styles['p2-crm-col-dot'], styles[`tone-${column.tone}`])}
                    aria-hidden
                  />
                )}
                <span className={styles['p2-crm-col-name']} title={column.label}>
                  {column.label}
                </span>
                <span className={styles['p2-crm-col-n']}>{column.projects.length}</span>
              </div>
            </header>
            <div
              className={styles['p2-crm-col-body']}
              onDragOver={
                dropStatus ? handleColumnDragOver(column.key, column.droppable) : undefined
              }
              onDragLeave={dropStatus ? clearDropForColumn(column.key) : undefined}
              onDrop={
                dropStatus
                  ? handleColumnDrop(dropStatus, column.key, column.droppable)
                  : undefined
              }
            >
              {column.projects.length > 0 ? (
                column.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={onSelect}
                    draggable={statusGrouping}
                    isDragging={draggingId === project.id}
                    onDragStart={
                      statusGrouping
                        ? (event) => {
                            setDraggingId(project.id);
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData(DRAG_PROJECT_MIME, project.id);
                          }
                        : undefined
                    }
                    onDragEnd={statusGrouping ? clearDropState : undefined}
                  />
                ))
              ) : (
                <div className={styles['p2-crm-col-empty']}>
                  {statusGrouping ? 'Перетягніть сюди' : 'Немає проєктів'}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
