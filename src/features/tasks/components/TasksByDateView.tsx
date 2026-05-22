import { DATE_GROUP_ORDER } from '../dateGroups';
import { taskForActiveList } from '../taskCompletion';
import type { TasksWorkspace } from '../useTasksWorkspace';
import styles from '../tasks.module.css';
import { TaskGroupSection } from './TaskGroupSection';

interface TasksByDateViewProps {
  workspace: TasksWorkspace;
}

export function TasksByDateView({ workspace }: TasksByDateViewProps) {
  const {
    grouped,
    armedDeleteId,
    expandedTreeKeys,
    hasAnyByDate,
    setArmedDeleteId,
    toggleTreeExpand,
    openTask,
    updateTask,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteTask,
    duplicateTask,
    addTask,
  } = workspace;

  return (
    <div className={styles['ts-by-date']}>
      {hasAnyByDate ? (
        <div className={styles['ts-table']}>
          {DATE_GROUP_ORDER.map((groupId) => (
            <TaskGroupSection
              key={groupId}
              groupId={groupId}
              tasks={grouped[groupId].map(taskForActiveList)}
              armedDeleteId={armedDeleteId}
              expandedTreeKeys={expandedTreeKeys}
              onToggleTreeExpand={toggleTreeExpand}
              onArmDelete={setArmedDeleteId}
              onDelete={deleteTask}
              onDuplicate={duplicateTask}
              onUpdate={updateTask}
              onUpdateSubtask={updateSubtaskAtPath}
              onAddSubtask={addSubtaskAtPath}
              onAdd={addTask}
              onOpenTask={openTask}
            />
          ))}
        </div>
      ) : (
        <p className={styles['ts-empty-state']}>Немає задач. Додайте першу у будь-якій групі.</p>
      )}

    </div>
  );
}
