import { useCallback, useMemo, useState } from 'react';
import { DATE_GROUP_ORDER, groupTasksByDate } from '../dateGroups';
import { createNewTaskForGroup } from '../constants';
import { initialTasks } from '../data';
import { appendTaskActivity } from '../taskActivity';
import {
  applyPatchAtSubtaskPath,
  getParentTaskLink,
  getSubtaskAtPath,
  taskFromSubtask,
} from '../subtaskTask';
import styles from '../tasks.module.css';
import type { DateGroupId, Task, TaskPatch } from '../types';
import { TaskDetailPanel } from './TaskDetailPanel';
import { TaskGroupSection } from './TaskGroupSection';

let nextTaskId = 100;

export function TasksByDateView() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [subtaskPath, setSubtaskPath] = useState<string[]>([]);

  const grouped = useMemo(() => groupTasksByDate(tasks), [tasks]);

  const closeDetail = useCallback(() => {
    setSelectedTaskId(null);
    setSubtaskPath([]);
  }, []);

  const openTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setSubtaskPath([]);
  }, []);

  const updateTask = useCallback((id: string, patch: TaskPatch) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        return appendTaskActivity(next, t, patch);
      }),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setArmedDeleteId((cur) => (cur === id ? null : cur));
    setSelectedTaskId((cur) => (cur === id ? null : cur));
    setSubtaskPath([]);
  }, []);

  const addTask = useCallback((groupId: DateGroupId) => {
    const id = `t${nextTaskId++}`;
    setTasks((prev) => [...prev, createNewTaskForGroup(groupId, id)]);
  }, []);

  const hasAny = DATE_GROUP_ORDER.some((g) => grouped[g].length > 0);
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
  const panelSubtask = selectedTask && subtaskPath.length > 0 ? getSubtaskAtPath(selectedTask, subtaskPath) : null;
  const panelTask =
    selectedTask && panelSubtask ? taskFromSubtask(panelSubtask, selectedTask) : selectedTask;
  const parentLink = selectedTask ? getParentTaskLink(selectedTask, subtaskPath) : null;

  const updateDetail = useCallback(
    (_id: string, patch: TaskPatch) => {
      if (!selectedTaskId) return;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTaskId) return t;
          if (subtaskPath.length === 0) {
            const next = { ...t, ...patch };
            return appendTaskActivity(next, t, patch);
          }
          const subtasks = applyPatchAtSubtaskPath(t.subtasks, subtaskPath, patch);
          return appendTaskActivity({ ...t, subtasks }, t, { subtasks });
        }),
      );
    },
    [selectedTaskId, subtaskPath],
  );

  return (
    <div className={styles['ts-by-date']}>
      {hasAny ? (
        <div className={styles['ts-table']}>
          {DATE_GROUP_ORDER.map((groupId) => (
            <TaskGroupSection
              key={groupId}
              groupId={groupId}
              tasks={grouped[groupId]}
              armedDeleteId={armedDeleteId}
              onArmDelete={setArmedDeleteId}
              onDelete={deleteTask}
              onUpdate={updateTask}
              onAdd={addTask}
              onOpenTask={openTask}
            />
          ))}
        </div>
      ) : (
        <p className={styles['ts-empty-state']}>Немає задач. Додайте першу у будь-якій групі.</p>
      )}

      {panelTask ? (
        <TaskDetailPanel
          task={panelTask}
          parentTask={parentLink ?? undefined}
          parentTaskLabel={subtaskPath.length === 1 ? 'Головна задача' : 'Батьківська підзадача'}
          onOpenParentTask={
            parentLink
              ? () => setSubtaskPath((path) => path.slice(0, -1))
              : undefined
          }
          onClose={closeDetail}
          onUpdate={updateDetail}
          onOpenSubtask={(subtaskId) => setSubtaskPath((path) => [...path, subtaskId])}
        />
      ) : null}
    </div>
  );
}
