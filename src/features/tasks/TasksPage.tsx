import { useCallback, useEffect, useMemo, useState } from 'react';
import { ARCHIVE_GROUP_ORDER } from './archiveGroups';
import { DATE_GROUP_ORDER } from './dateGroups';
import { buildDelegatedGroups } from './delegatedGroups';
import { buildPersonalGroups } from './personalGroups';
import { TasksArchiveView } from './components/TasksArchiveView';
import { TasksByAreaView } from './components/TasksByAreaView';
import { TasksByDateView } from './components/TasksByDateView';
import { TasksDelegatedView } from './components/TasksDelegatedView';
import { TaskDetailLayer } from './components/TaskDetailLayer';
import { TasksPageHeader } from './components/TasksPageHeader';
import { TasksPersonalView } from './components/TasksPersonalView';
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
import type { TasksViewTabId } from './types';
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
  const workspace = useTasksWorkspace(viewerId);
  const {
    panelTask,
    selectedTaskId,
    openTask,
    closeDetail,
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
        return buildPersonalGroups(tasks, viewerId).reduce((sum, group) => sum + group.tasks.length, 0);
      case 'delegated':
        return buildDelegatedGroups(tasks, viewerId).reduce((sum, group) => sum + group.tasks.length, 0);
      case 'archive':
        return ARCHIVE_GROUP_ORDER.reduce((sum, groupId) => sum + archiveGrouped[groupId].length, 0);
      default:
        return 0;
    }
  }, [activeTab, archiveGrouped, grouped, projectGroups, tasks, viewerId]);

  const parsed = parseTasksSearch(urlSearch);
  const taskFull = parsed.full;

  const pushTasksUrl = useCallback(
    (opts: { view?: TasksViewQuery; task?: string | null; full?: boolean; replace?: boolean }) => {
      const current = parseTasksSearch(urlSearch);
      const view = opts.view ?? current.view;
      const task =
        opts.task !== undefined ? (opts.task ?? undefined) : (current.taskId ?? undefined);
      const full = opts.full ?? false;
      const next = buildTasksSearch(view, { task, full });
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

    const { view, taskId, full } = parseTasksSearch(window.location.search);
    if (!window.location.search) {
      window.history.replaceState({}, '', `/tasks${buildTasksSearch('day')}`);
      setUrlSearch('?day');
      setActiveTab('by-date');
      document.title = tasksDocumentTitle('by-date');
      return;
    }

    const tab = QUERY_TO_TAB_ID[view] ?? 'by-date';
    setActiveTab(tab);
    if (taskId) openTask(taskId, []);
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
      const { view, taskId, full } = parseTasksSearch(search);
      const tab = QUERY_TO_TAB_ID[view] ?? 'by-date';
      setActiveTab(tab);
      if (taskId) openTask(taskId, []);
      else closeDetail();
      const root = workspace.tasks.find((t) => t.id === taskId);
      if (full && taskId && root) {
        document.title = taskDocumentTitle(root.title, taskId);
      } else {
        document.title = tasksDocumentTitle(tab);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [closeDetail, openTask, workspace.tasks]);

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
      const { taskId, full } = parseTasksSearch(urlSearch);
      const view = TAB_ID_TO_QUERY[tabId];
      pushTasksUrl({ view, task: taskId, full });
      syncTitle(tabId, panelTask?.title, taskId);
    },
    [panelTask?.title, pushTasksUrl, syncTitle, urlSearch],
  );

  const closeTaskDetail = useCallback(() => {
    closeDetail();
    const view = TAB_ID_TO_QUERY[activeTab];
    pushTasksUrl({ view, task: null, full: false });
    syncTitle(activeTab);
  }, [activeTab, closeDetail, pushTasksUrl, syncTitle]);

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
      pushTasksUrl({ view, task: taskId, full: false });
    },
    [activeTab, openTask, pushTasksUrl],
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

  const workspaceWithNav = { ...workspace, openTask: wrapOpenTask };

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
        ) : null}
      </div>
      <TaskDetailLayer
        workspace={workspace}
        full={false}
        onExpand={expandTask}
        onCollapse={collapseTask}
        onClose={closeTaskDetail}
      />
    </div>
  );
}
