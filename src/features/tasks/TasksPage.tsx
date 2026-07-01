import { useCallback, useEffect, useMemo, useState } from 'react';
import { ARCHIVE_GROUP_ORDER } from './archiveGroups';
import { DATE_GROUP_ORDER } from './dateGroups';
import { buildDelegatedGroups } from './delegatedGroups';
import { buildPersonalGroups } from './personalGroups';
import { buildSprintPhaseGroups } from './sprintGroups';
import { TasksArchiveView } from './components/TasksArchiveView';
import { TasksByAreaView } from './components/TasksByAreaView';
import { TasksByDateView } from './components/TasksByDateView';
import { TasksDelegatedView } from './components/TasksDelegatedView';
import { TaskDetailLayer } from './components/TaskDetailLayer';
import { SprintDetailPanel } from './components/SprintDetailPanel';
import { TasksPageHeader } from './components/TasksPageHeader';
import { TasksPersonalView } from './components/TasksPersonalView';
import { TasksSprintsView } from './components/TasksSprintsView';
import {
  buildTasksSearch,
  parseTasksSearch,
  QUERY_TO_TAB_ID,
  tabIdFromSearch,
  TAB_ID_TO_QUERY,
  taskDocumentTitle,
  tasksDocumentTitle,
  type TasksViewQuery,
} from './tasksPaths';
import { TASK_CREATOR_ASSIGNEE_ID } from './constants';
import { useTasksWorkspace } from './useTasksWorkspace';
import { readTasksSortForTab, writeTasksSortForTab } from './taskSort';
import type { TasksSortField, TasksViewTabId } from './types';
import styles from './tasks.module.css';

const TASKS_VIEWER_STORAGE_KEY = 'tasks-viewer-id';

function readTabFromUrl(): TasksViewTabId {
  return tabIdFromSearch(window.location.search);
}

function readSearchFromUrl(): string {
  return window.location.search;
}

function readViewerFromStorage(): string {
  try {
    const stored = sessionStorage.getItem(TASKS_VIEWER_STORAGE_KEY);
    return stored || TASK_CREATOR_ASSIGNEE_ID;
  } catch {
    return TASK_CREATOR_ASSIGNEE_ID;
  }
}

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<TasksViewTabId>(readTabFromUrl);
  const [urlSearch, setUrlSearch] = useState(readSearchFromUrl);
  const [viewerId, setViewerId] = useState(readViewerFromStorage);
  const [sortField, setSortField] = useState<TasksSortField>(() =>
    readTasksSortForTab(readTabFromUrl()),
  );
  const workspace = useTasksWorkspace(viewerId, sortField);
  const {
    panelTask,
    panelSprint,
    selectedTaskId,
    openTask,
    openSprint,
    closeDetail,
    closeSprint,
    assignTaskToSprint,
    assignTaskToSprintAsSubtask,
    addTaskForSprint,
    updateSprintFields,
    armedDeleteId,
    expandedTreeKeys,
    setArmedDeleteId,
    toggleTreeExpand,
    updateTask,
    updateSubtaskAtPath,
    addSubtaskAtPath,
    deleteTask,
    duplicateTask,
    grouped,
    projectGroups,
    archiveGrouped,
    tasks,
  } = workspace;

  const totalCount = useMemo(() => {
    switch (activeTab) {
      case 'by-date':
        return DATE_GROUP_ORDER.reduce((sum, groupId) => sum + grouped[groupId].length, 0);
      case 'by-area':
        return projectGroups.reduce((sum, group) => sum + group.tasks.length, 0);
      case 'personal':
        return buildPersonalGroups(tasks, viewerId, sortField).reduce(
          (sum, group) => sum + group.tasks.length,
          0,
        );
      case 'delegated':
        return buildDelegatedGroups(tasks, viewerId, sortField).reduce(
          (sum, group) => sum + group.tasks.length,
          0,
        );
      case 'archive':
        return ARCHIVE_GROUP_ORDER.reduce((sum, groupId) => sum + archiveGrouped[groupId].length, 0);
      case 'sprints':
        return buildSprintPhaseGroups(workspace.sprints, tasks, viewerId, sortField).reduce(
          (sum, group) => sum + group.taskCount,
          0,
        );
      default:
        return 0;
    }
  }, [activeTab, archiveGrouped, grouped, projectGroups, sortField, tasks, viewerId, workspace.sprints]);

  const sprintPanelTasks = useMemo(() => {
    if (!panelSprint) return [];
    return tasks.filter((task) => task.sprintId === panelSprint.id && task.status !== 'archive');
  }, [panelSprint, tasks]);

  const sprintSearchTasks = useMemo(() => {
    if (!panelSprint) return [];
    return tasks.filter((task) => task.sprintId !== panelSprint.id && task.status !== 'archive');
  }, [panelSprint, tasks]);

  const parsed = parseTasksSearch(urlSearch);
  const taskFull = parsed.full;

  const pushTasksUrl = useCallback(
    (opts: {
      view?: TasksViewQuery;
      task?: string | null;
      sprint?: string | null;
      full?: boolean;
      replace?: boolean;
    }) => {
      const current = parseTasksSearch(urlSearch);
      const view = opts.view ?? current.view;
      const task =
        opts.task !== undefined ? (opts.task ?? undefined) : (current.taskId ?? undefined);
      const sprint =
        opts.sprint !== undefined ? (opts.sprint ?? undefined) : (current.sprintId ?? undefined);
      const full = opts.full ?? false;
      const next = buildTasksSearch(view, { task, sprint, full });
      setUrlSearch(next);
      if (opts.replace) {
        window.history.replaceState({}, '', `/tasks${next}`);
      } else {
        window.history.pushState({}, '', `/tasks${next}`);
      }
      return next;
    },
    [urlSearch],
  );

  const syncTitle = useCallback(
    (tab: TasksViewTabId, taskTitle?: string | null, taskId?: string | null) => {
      if (taskTitle && taskId) {
        document.title = taskDocumentTitle(taskTitle, taskId);
        return;
      }
      document.title = tasksDocumentTitle(tab);
    },
    [],
  );

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path !== '/tasks') return;

    const { view, taskId, sprintId, full } = parseTasksSearch(window.location.search);
    if (!window.location.search) {
      window.history.replaceState({}, '', `/tasks${buildTasksSearch('day')}`);
      setUrlSearch('?day');
      setActiveTab('by-date');
      document.title = tasksDocumentTitle('by-date');
      return;
    }

    const tab = QUERY_TO_TAB_ID[view] ?? 'by-date';
    setActiveTab(tab);
    setSortField(readTasksSortForTab(tab));
    if (taskId) openTask(taskId, []);
    if (sprintId) openSprint(sprintId);
    const root = workspace.tasks.find((t) => t.id === taskId);
    if (full && taskId && root) {
      document.title = taskDocumentTitle(root.title, taskId);
    } else {
      document.title = tasksDocumentTitle(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate from URL once on mount
  }, []);

  useEffect(() => {
    const onPop = () => {
      const search = window.location.search;
      setUrlSearch(search);
      const { view, taskId, sprintId, full } = parseTasksSearch(search);
      const tab = QUERY_TO_TAB_ID[view] ?? 'by-date';
      setActiveTab(tab);
      setSortField(readTasksSortForTab(tab));
      if (taskId) openTask(taskId, []);
      else closeDetail();
      if (sprintId) openSprint(sprintId);
      else closeSprint();
      const root = workspace.tasks.find((t) => t.id === taskId);
      if (full && taskId && root) {
        document.title = taskDocumentTitle(root.title, taskId);
      } else {
        document.title = tasksDocumentTitle(tab);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [closeDetail, closeSprint, openSprint, openTask, workspace.tasks]);

  const onSortChange = useCallback(
    (field: TasksSortField) => {
      setSortField(field);
      writeTasksSortForTab(activeTab, field);
    },
    [activeTab],
  );

  const onViewerChange = useCallback((memberId: string) => {
    setViewerId(memberId);
    try {
      sessionStorage.setItem(TASKS_VIEWER_STORAGE_KEY, memberId);
    } catch {
      /* ignore */
    }
    closeDetail();
  }, [closeDetail]);

  const onTab = useCallback(
    (tabId: TasksViewTabId) => {
      setActiveTab(tabId);
      setSortField(readTasksSortForTab(tabId));
      const { taskId, sprintId, full } = parseTasksSearch(urlSearch);
      const view = TAB_ID_TO_QUERY[tabId];
      pushTasksUrl({ view, task: taskId, sprint: sprintId, full });
      syncTitle(tabId, panelTask?.title, taskId);
    },
    [panelTask?.title, pushTasksUrl, syncTitle, urlSearch],
  );

  const closeTaskDetail = useCallback(() => {
    closeDetail();
    const view = TAB_ID_TO_QUERY[activeTab];
    const { sprintId } = parseTasksSearch(urlSearch);
    pushTasksUrl({ view, task: null, sprint: sprintId, full: false });
    syncTitle(activeTab);
  }, [activeTab, closeDetail, pushTasksUrl, syncTitle, urlSearch]);

  const closeSprintDetail = useCallback(() => {
    closeSprint();
    const view = TAB_ID_TO_QUERY[activeTab];
    const { taskId } = parseTasksSearch(urlSearch);
    pushTasksUrl({ view, task: taskId, sprint: null, full: false });
    syncTitle(activeTab, panelTask?.title, taskId);
  }, [activeTab, closeSprint, panelTask?.title, pushTasksUrl, syncTitle, urlSearch]);

  const expandTask = useCallback(() => {
    const id = selectedTaskId ?? panelTask?.id ?? parseTasksSearch(urlSearch).taskId;
    if (!id) return;
    pushTasksUrl({ task: id, full: true });
    if (panelTask) syncTitle(activeTab, panelTask.title, id);
  }, [activeTab, panelTask, pushTasksUrl, selectedTaskId, syncTitle, urlSearch]);

  const collapseTask = useCallback(() => {
    const { taskId } = parseTasksSearch(urlSearch);
    const id = taskId ?? panelTask?.id;
    const view = TAB_ID_TO_QUERY[activeTab];
    pushTasksUrl({ view, task: id ?? null, full: false });
    syncTitle(activeTab, panelTask?.title, id);
  }, [activeTab, panelTask?.title, pushTasksUrl, syncTitle, urlSearch]);

  const wrapOpenTask = useCallback(
    (taskId: string, path: string[] = []) => {
      openTask(taskId, path);
      const view = TAB_ID_TO_QUERY[activeTab];
      const { sprintId } = parseTasksSearch(urlSearch);
      pushTasksUrl({ view, task: taskId, sprint: sprintId, full: false });
    },
    [activeTab, openTask, pushTasksUrl, urlSearch],
  );

  const wrapOpenSprint = useCallback(
    (sprintId: string) => {
      openSprint(sprintId);
      const view = TAB_ID_TO_QUERY[activeTab];
      const { taskId } = parseTasksSearch(urlSearch);
      pushTasksUrl({ view, sprint: sprintId, task: taskId ?? undefined, full: false });
    },
    [activeTab, openSprint, pushTasksUrl, urlSearch],
  );

  const onCreateTask = useCallback(() => {
    const id = workspace.createTask();
    const view = TAB_ID_TO_QUERY[activeTab];
    pushTasksUrl({ view, task: id, full: false });
    syncTitle(activeTab, 'Нова задача', id);
  }, [activeTab, pushTasksUrl, syncTitle, workspace]);

  useEffect(() => {
    const { taskId, full } = parseTasksSearch(urlSearch);
    if (!taskId) return;
    const root = workspace.tasks.find((t) => t.id === taskId);
    if (full && root) {
      document.title = taskDocumentTitle(root.title, taskId);
    }
  }, [urlSearch, workspace.tasks]);

  const workspaceWithNav = { ...workspace, openTask: wrapOpenTask, openSprint: wrapOpenSprint };

  if (taskFull && panelTask) {
    return (
      <div className={styles['ts-shell']}>
        <TaskDetailLayer
          workspace={workspace}
          full
          onExpand={expandTask}
          onCollapse={collapseTask}
          onClose={closeTaskDetail}
        />
      </div>
    );
  }

  return (
    <div className={styles['ts-shell']}>
      <TasksPageHeader
        activeTab={activeTab}
        count={totalCount}
        onTab={onTab}
        onCreateTask={onCreateTask}
        viewerId={viewerId}
        onViewerChange={onViewerChange}
        sortField={sortField}
        onSortChange={onSortChange}
      />
      <div className={styles['ts-main']}>
        {activeTab === 'by-date' ? (
          <TasksByDateView workspace={workspaceWithNav} />
        ) : activeTab === 'by-area' ? (
          <TasksByAreaView workspace={workspaceWithNav} />
        ) : activeTab === 'personal' ? (
          <TasksPersonalView workspace={workspaceWithNav} />
        ) : activeTab === 'delegated' ? (
          <TasksDelegatedView workspace={workspaceWithNav} />
        ) : activeTab === 'archive' ? (
          <TasksArchiveView workspace={workspaceWithNav} />
        ) : activeTab === 'sprints' ? (
          <TasksSprintsView workspace={workspaceWithNav} />
        ) : null}
      </div>
      <TaskDetailLayer
        workspace={workspace}
        full={false}
        onExpand={expandTask}
        onCollapse={collapseTask}
        onClose={closeTaskDetail}
      />
      {activeTab === 'sprints' && panelSprint ? (
        <SprintDetailPanel
          sprint={panelSprint}
          sprintTasks={sprintPanelTasks}
          searchTasks={sprintSearchTasks}
          armedDeleteId={armedDeleteId}
          expandedTreeKeys={expandedTreeKeys}
          onClose={closeSprintDetail}
          onUpdate={(patch) => updateSprintFields(panelSprint.id, patch)}
          onOpenTask={wrapOpenTask}
          onAssignTask={(taskId) => assignTaskToSprint(taskId, panelSprint.id)}
          onAssignTaskAsSubtask={(taskId, rootId, parentPath) =>
            assignTaskToSprintAsSubtask(taskId, rootId, parentPath)
          }
          onToggleTreeExpand={toggleTreeExpand}
          onArmDelete={setArmedDeleteId}
          onDeleteTask={deleteTask}
          onDuplicateTask={duplicateTask}
          onUpdateTask={updateTask}
          onUpdateSubtask={updateSubtaskAtPath}
          onAddSubtask={addSubtaskAtPath}
          onCreateTask={() => {
            const id = addTaskForSprint(panelSprint.id);
            wrapOpenTask(id);
          }}
          sortField={sortField}
        />
      ) : null}
    </div>
  );
}
