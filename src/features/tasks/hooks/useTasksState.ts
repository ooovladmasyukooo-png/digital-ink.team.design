import { useCallback, useState } from 'react';
import { ASSIGNEE_OPTIONS, createInitialTasks } from '../data';
import type { Subtask, Task, TaskAssignee, TaskPriority, TaskStatus } from '../types';
import {
  addSubtaskToTask,
  removeSubtaskFromTasks,
  removeTaskFromList,
  updateSubtaskInTasks,
  updateTaskInList,
} from '../taskTree';

let nextSubId = 1000;
const newSubId = () => `sub-${++nextSubId}`;

let nextTaskId = 1000;
const newTaskId = () => `task-${++nextTaskId}`;

export function useTasksState() {
  const [tasks, setTasks] = useState<Task[]>(() => createInitialTasks());

  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setTasks((prev) => updateTaskInList(prev, taskId, patch));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => removeTaskFromList(prev, taskId));
  }, []);

  const addTask = useCallback((deadline: string | null, options?: { draft?: boolean }) => {
    const assignee = ASSIGNEE_OPTIONS[0];
    const task: Task = {
      id: newTaskId(),
      title: '',
      description: '',
      isDraft: options?.draft ?? false,
      status: 'todo',
      priority: 'normal',
      deadline,
      projectId: 'p-internal',
      projectName: 'Внутрішні процеси',
      assigneeId: assignee.id,
      assignee,
      createdById: assignee.id,
      subtasks: [],
    };
    setTasks((prev) => [task, ...prev]);
    return task.id;
  }, []);

  const commitDraftTask = useCallback(
    (taskId: string, patch: { title: string; description?: string }) => {
      const title = patch.title.trim();
      if (!title) {
        setTasks((prev) => removeTaskFromList(prev, taskId));
        return false;
      }
      setTasks((prev) =>
        updateTaskInList(prev, taskId, {
          title,
          description: patch.description?.trim() ?? '',
          isDraft: false,
        }),
      );
      return true;
    },
    [],
  );

  const cancelDraftTask = useCallback((taskId: string) => {
    setTasks((prev) => removeTaskFromList(prev, taskId));
  }, []);

  const updateSubtask = useCallback((taskId: string, subId: string, patch: Partial<Subtask>) => {
    setTasks((prev) => updateSubtaskInTasks(prev, taskId, subId, patch));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subId: string) => {
    setTasks((prev) => removeSubtaskFromTasks(prev, taskId, subId));
  }, []);

  const addSubtask = useCallback((taskId: string, parentSubId: string | null, options?: { draft?: boolean }) => {
    const sub: Subtask = {
      id: newSubId(),
      title: '',
      done: false,
      isDraft: options?.draft ?? false,
    };
    setTasks((prev) => addSubtaskToTask(prev, taskId, parentSubId, sub));
    return sub.id;
  }, []);

  const commitDraftSubtask = useCallback((taskId: string, subId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTasks((prev) => removeSubtaskFromTasks(prev, taskId, subId));
      return false;
    }
    setTasks((prev) =>
      updateSubtaskInTasks(prev, taskId, subId, { title: trimmed, isDraft: false }),
    );
    return true;
  }, []);

  const cancelDraftSubtask = useCallback((taskId: string, subId: string) => {
    setTasks((prev) => removeSubtaskFromTasks(prev, taskId, subId));
  }, []);

  const setTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => updateTask(taskId, { status }),
    [updateTask],
  );

  const setTaskPriority = useCallback(
    (taskId: string, priority: TaskPriority) => updateTask(taskId, { priority }),
    [updateTask],
  );

  const setTaskDeadline = useCallback(
    (taskId: string, deadline: string | null) => updateTask(taskId, { deadline }),
    [updateTask],
  );

  const setTaskAssignee = useCallback(
    (taskId: string, assignee: TaskAssignee) =>
      updateTask(taskId, { assigneeId: assignee.id, assignee }),
    [updateTask],
  );

  const setTaskDirection = useCallback(
    (taskId: string, projectId: string, projectName: string) =>
      updateTask(taskId, { projectId, projectName }),
    [updateTask],
  );

  return {
    tasks,
    updateTask,
    deleteTask,
    addTask,
    commitDraftTask,
    cancelDraftTask,
    updateSubtask,
    deleteSubtask,
    addSubtask,
    commitDraftSubtask,
    cancelDraftSubtask,
    setTaskStatus,
    setTaskPriority,
    setTaskDeadline,
    setTaskAssignee,
    setTaskDirection,
  };
}

export type TasksStateApi = ReturnType<typeof useTasksState>;
