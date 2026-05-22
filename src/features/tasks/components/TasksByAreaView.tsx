import type { TasksWorkspace } from '../useTasksWorkspace';
import styles from '../tasks.module.css';
import { TaskProjectGroupSection } from './TaskProjectGroupSection';

interface TasksByAreaViewProps {
  workspace: TasksWorkspace;
}

export function TasksByAreaView({ workspace }: TasksByAreaViewProps) {
  const {
    projectGroups,
    armedDeleteId,
    expandedTreeKeys,
    hasAnyByArea,
    setArmedDeleteId,
    toggleTreeExpand,
    openTask,
    updateTask,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteTask,
    duplicateTask,
    addTaskForProject,
  } = workspace;

  return (
    <div className={styles['ts-by-date']}>
      {hasAnyByArea ? (
        <div className={styles['ts-table']}>
          {projectGroups.map((group) => (
            <TaskProjectGroupSection
              key={group.id}
              projectId={group.projectId}
              label={group.label}
              fullLabel={group.fullLabel}
              tasks={group.tasks}
              armedDeleteId={armedDeleteId}
              expandedTreeKeys={expandedTreeKeys}
              onToggleTreeExpand={toggleTreeExpand}
              onArmDelete={setArmedDeleteId}
              onDelete={deleteTask}
              onDuplicate={duplicateTask}
              onUpdate={updateTask}
              onUpdateSubtask={updateSubtaskAtPath}
              onAddSubtask={addSubtaskAtPath}
              onAdd={addTaskForProject}
              onOpenTask={openTask}
            />
          ))}
        </div>
      ) : (
        <p className={styles['ts-empty-state']}>Немає задач. Додайте першу у будь-якому напрямку.</p>
      )}
    </div>
  );
}
