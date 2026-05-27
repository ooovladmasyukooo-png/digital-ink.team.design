import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { ARCHIVE_GROUP_ORDER, groupArchiveItems } from './archiveGroups';
import {
  createNewTaskForDelegatedStatus,
  createNewTaskForGroup,
  createNewTaskForMemberStatus,
  createNewTaskForPersonalStatus,
  createNewTaskForProject,
  TASK_CREATOR_ASSIGNEE_ID,
} from './constants';
import { DATE_GROUP_ORDER, groupTasksByDate } from './dateGroups';
import { buildProjectGroups } from './projectGroups';
import { allocateTaskId, getTasks, setTasks, subscribeTasks } from './tasksStore';
import { appendTaskActivity } from './taskActivity';
import {
  collectArchiveItemsForViewer,
  mergeSubtaskPatchWithCompletion,
  mergeTaskPatchWithCompletion,
} from './taskCompletion';
import { shouldSpawnRecurring, spawnRecurringTask } from './recurrence';
import {
  appendSubtaskAtPath,
  applyPatchAtSubtaskPath,
  getParentTaskLink,
  getSubtaskAtPath,
  removeSubtaskAtPath,
  taskFromSubtask,
} from './subtaskTask';
import { duplicateTaskTarget } from './taskDuplicate';
import { collapseTreeBranch, expandTreeBranch, treeRowKey } from './taskTree';
import type { DateGroupId, Status, Task, TaskPatch, TaskSubtask, TasksSortField } from './types';

export function useTasksWorkspace(
  viewerId = TASK_CREATOR_ASSIGNEE_ID,
  sortField: TasksSortField = 'priority',
) {
  const tasks = useSyncExternalStore(subscribeTasks, getTasks, getTasks);
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [subtaskPath, setSubtaskPath] = useState<string[]>([]);
  const [expandedTreeKeys, setExpandedTreeKeys] = useState<Set<string>>(() => new Set());

  const grouped = useMemo(
    () => groupTasksByDate(tasks, new Date(), viewerId, sortField),
    [tasks, viewerId, sortField],
  );
  const projectGroups = useMemo(
    () => buildProjectGroups(tasks, viewerId, sortField),
    [tasks, viewerId, sortField],
  );
  const archiveGrouped = useMemo(
    () => groupArchiveItems(collectArchiveItemsForViewer(tasks, viewerId), new Date()),
    [tasks, viewerId],
  );

  const closeDetail = useCallback(() => {
    setSelectedTaskId(null);
    setSubtaskPath([]);
  }, []);

  const toggleTreeExpand = useCallback((rootId: string, path: string[]) => {
    const key = treeRowKey(rootId, path);
    setExpandedTreeKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) collapseTreeBranch(next, rootId, path);
      else expandTreeBranch(next, rootId, path);
      return next;
    });
  }, []);

  const openTask = useCallback((taskId: string, path: string[] = []) => {
    setSelectedTaskId(taskId);
    setSubtaskPath(path);
  }, []);

  const updateSubtaskAtPath = useCallback((rootId: string, path: string[], patch: TaskPatch) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== rootId) return t;
        const sub = getSubtaskAtPath(t, path);
        if (!sub) return t;
        const merged = mergeSubtaskPatchWithCompletion(sub, patch);
        const subtasks = applyPatchAtSubtaskPath(t.subtasks, path, merged);
        return appendTaskActivity({ ...t, subtasks }, t, { subtasks });
      }),
    );
  }, []);

  const addSubtaskAtPath = useCallback(
    (rootId: string, parentPath: string[], subtask: TaskSubtask) => {
      setExpandedTreeKeys((prev) => {
        const next = new Set(prev);
        expandTreeBranch(next, rootId, parentPath);
        return next;
      });
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== rootId) return t;
          const subtasks = appendSubtaskAtPath(t.subtasks, parentPath, subtask);
          return appendTaskActivity({ ...t, subtasks }, t, { subtasks });
        }),
      );
    },
    [],
  );

  const updateTask = useCallback((id: string, patch: TaskPatch) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const t = prev[idx];
      const merged = mergeTaskPatchWithCompletion(t, patch);
      const next = appendTaskActivity({ ...t, ...merged }, t, merged);
      if (!shouldSpawnRecurring(t, merged)) {
        return prev.map((task, i) => (i === idx ? next : task));
      }
      const clone = spawnRecurringTask(next, allocateTaskId());
      return prev.map((task, i) => (i === idx ? next : task)).concat(clone);
    });
  }, []);

  const duplicateTask = useCallback((targetId: string) => {
    setArmedDeleteId(null);
    setTasks((prev) => duplicateTaskTarget(prev, targetId, allocateTaskId()));
  }, []);

  const deleteTask = useCallback((targetId: string) => {
    setArmedDeleteId((cur) => (cur === targetId ? null : cur));

    const slashIdx = targetId.indexOf('/');
    if (slashIdx === -1) {
      setTasks((prev) => prev.filter((t) => t.id !== targetId));
      setSelectedTaskId((cur) => (cur === targetId ? null : cur));
      setSubtaskPath([]);
      return;
    }

    const rootId = targetId.slice(0, slashIdx);
    const path = targetId.slice(slashIdx + 1).split('/');

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== rootId) return t;
        const subtasks = removeSubtaskAtPath(t.subtasks, path);
        return appendTaskActivity({ ...t, subtasks }, t, { subtasks });
      }),
    );

    setExpandedTreeKeys((prev) => {
      const next = new Set(prev);
      collapseTreeBranch(next, rootId, path);
      return next;
    });

    setSelectedTaskId((selId) => {
      if (selId !== rootId) return selId;
      setSubtaskPath((curPath) => {
        const curKey = treeRowKey(rootId, curPath);
        if (curKey === targetId || curKey.startsWith(`${targetId}/`)) return [];
        return curPath;
      });
      return selId;
    });
  }, []);

  const addTask = useCallback(
    (groupId: DateGroupId) => {
      const id = allocateTaskId();
      setTasks((prev) => [...prev, createNewTaskForGroup(groupId, id, new Date(), viewerId)]);
    },
    [viewerId],
  );

  const addTaskForProject = useCallback(
    (projectId: string | null) => {
      const id = allocateTaskId();
      setTasks((prev) => [...prev, createNewTaskForProject(projectId, id, viewerId)]);
    },
    [viewerId],
  );

  const addTaskForPersonal = useCallback(
    (status: Status) => {
      const id = allocateTaskId();
      setTasks((prev) => [...prev, createNewTaskForPersonalStatus(status, id, viewerId)]);
    },
    [viewerId],
  );

  const addTaskForDelegated = useCallback(
    (status: Status) => {
      const id = allocateTaskId();
      setTasks((prev) => [...prev, createNewTaskForDelegatedStatus(status, id, viewerId)]);
    },
    [viewerId],
  );

  const addTaskForMember = useCallback((memberId: string, status: Status) => {
    const id = allocateTaskId();
    setTasks((prev) => [...prev, createNewTaskForMemberStatus(status, id, memberId)]);
  }, []);

  /** Нова порожня задача: відповідальний — поточний користувач, відкривається в drawer. */
  const createTask = useCallback(() => {
    const id = allocateTaskId();
    const task = createNewTaskForProject(null, id, TASK_CREATOR_ASSIGNEE_ID);
    setTasks((prev) => [...prev, task]);
    openTask(id, []);
    return id;
  }, [openTask]);

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
  const panelSubtask = selectedTask && subtaskPath.length > 0 ? getSubtaskAtPath(selectedTask, subtaskPath) : null;
  const panelTask =
    selectedTask && panelSubtask ? taskFromSubtask(panelSubtask, selectedTask) : selectedTask;
  const parentLink = selectedTask ? getParentTaskLink(selectedTask, subtaskPath) : null;

  const updateDetail = useCallback(
    (_id: string, patch: TaskPatch) => {
      if (!selectedTaskId) return;
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === selectedTaskId);
        if (idx === -1) return prev;
        const t = prev[idx];
        if (subtaskPath.length > 0) {
          const sub = getSubtaskAtPath(t, subtaskPath);
          if (!sub) return prev;
          const merged = mergeSubtaskPatchWithCompletion(sub, patch);
          return prev.map((task, i) => {
            if (i !== idx) return task;
            const subtasks = applyPatchAtSubtaskPath(task.subtasks, subtaskPath, merged);
            return appendTaskActivity({ ...task, subtasks }, task, { subtasks });
          });
        }
        const merged = mergeTaskPatchWithCompletion(t, patch);
        const next = appendTaskActivity({ ...t, ...merged }, t, merged);
        if (!shouldSpawnRecurring(t, merged)) {
          return prev.map((task, i) => (i === idx ? next : task));
        }
        const clone = spawnRecurringTask(next, allocateTaskId());
        return prev.map((task, i) => (i === idx ? next : task)).concat(clone);
      });
    },
    [selectedTaskId, subtaskPath],
  );

  const updateArchiveItem = useCallback(
    (rootId: string, path: string[], patch: TaskPatch) => {
      if (path.length === 0) updateTask(rootId, patch);
      else updateSubtaskAtPath(rootId, path, patch);
    },
    [updateTask, updateSubtaskAtPath],
  );

  const hasAnyByDate = DATE_GROUP_ORDER.some((g) => grouped[g].length > 0);
  const hasAnyByArea = projectGroups.length > 0;
  const hasAnyArchive = ARCHIVE_GROUP_ORDER.some((g) => archiveGrouped[g].length > 0);

  return {
    viewerId,
    sortField,
    tasks,
    grouped,
    projectGroups,
    archiveGrouped,
    armedDeleteId,
    expandedTreeKeys,
    selectedTaskId,
    subtaskPath,
    panelTask,
    parentLink,
    hasAnyByDate,
    hasAnyByArea,
    hasAnyArchive,
    setArmedDeleteId,
    toggleTreeExpand,
    openTask,
    updateTask,
    updateSubtaskAtPath,
    updateArchiveItem,
    addSubtaskAtPath,
    deleteTask,
    duplicateTask,
    addTask,
    addTaskForProject,
    addTaskForPersonal,
    addTaskForDelegated,
    addTaskForMember,
    createTask,
    closeDetail,
    updateDetail,
    setSubtaskPath,
  };
}

export type TasksWorkspace = ReturnType<typeof useTasksWorkspace>;
