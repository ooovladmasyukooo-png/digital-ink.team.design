import type { Subtask, Task, TaskAssignee, TaskPriority, TaskStatus } from './types';

export function resolveSubtaskStatus(sub: Subtask): TaskStatus {
  return sub.status ?? (sub.done ? 'done' : 'todo');
}

export function countSubtasks(subtasks: Subtask[] | undefined): { done: number; total: number } {
  if (!subtasks?.length) return { done: 0, total: 0 };
  let done = 0;
  let total = 0;
  const walk = (list: Subtask[]) => {
    list.forEach((s) => {
      if (s.isDraft) return;
      total += 1;
      if (resolveSubtaskStatus(s) === 'done') done += 1;
      if (s.subtasks?.length) walk(s.subtasks);
    });
  };
  walk(subtasks);
  return { done, total };
}

export function updateTaskInList(tasks: Task[], taskId: string, patch: Partial<Task>): Task[] {
  return tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
}

export function removeTaskFromList(tasks: Task[], taskId: string): Task[] {
  return tasks.filter((t) => t.id !== taskId);
}

function mapSubtasks(list: Subtask[], subId: string, fn: (s: Subtask) => Subtask): Subtask[] {
  return list.map((s) => {
    if (s.id === subId) return fn(s);
    if (s.subtasks?.length) return { ...s, subtasks: mapSubtasks(s.subtasks, subId, fn) };
    return s;
  });
}

function filterSubtasks(list: Subtask[], subId: string): Subtask[] {
  return list
    .filter((s) => s.id !== subId)
    .map((s) => (s.subtasks?.length ? { ...s, subtasks: filterSubtasks(s.subtasks, subId) } : s));
}

export function updateSubtaskInTasks(tasks: Task[], taskId: string, subId: string, patch: Partial<Subtask>): Task[] {
  return tasks.map((t) =>
    t.id !== taskId
      ? t
      : {
          ...t,
          subtasks: mapSubtasks(t.subtasks, subId, (s) => ({
            ...s,
            ...patch,
            done: patch.status === 'done' ? true : patch.status ? false : (patch.done ?? s.done),
          })),
        },
  );
}

export function removeSubtaskFromTasks(tasks: Task[], taskId: string, subId: string): Task[] {
  return tasks.map((t) => (t.id !== taskId ? t : { ...t, subtasks: filterSubtasks(t.subtasks, subId) }));
}

export function addSubtaskToTask(tasks: Task[], taskId: string, parentSubId: string | null, sub: Subtask): Task[] {
  return tasks.map((t) => {
    if (t.id !== taskId) return t;
    if (!parentSubId) return { ...t, subtasks: [...t.subtasks, sub] };
    return {
      ...t,
      subtasks: mapSubtasks(t.subtasks, parentSubId, (s) => ({
        ...s,
        subtasks: [...(s.subtasks ?? []), sub],
      })),
    };
  });
}

export function resolveSubtaskAssignee(sub: Subtask, parent: TaskAssignee): TaskAssignee {
  return sub.assignee ?? parent;
}

export function resolveSubtaskPriority(sub: Subtask): TaskPriority | null {
  return sub.priority ?? null;
}
