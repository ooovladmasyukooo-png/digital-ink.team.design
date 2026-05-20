import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../tasks.module.css';
import {
  appendSubtaskAtPath,
  createNewSubtask,
  resolveSubtaskProjectId,
} from '../subtaskTask';
import { treeRowKey } from '../taskTree';
import type { Task, TaskPatch, TaskSubtask } from '../types';
import { TaskRow } from './TaskRow';

export type TaskListVariant = 'default' | 'personal' | 'withCompleted';

function taskRowVariant(listVariant: TaskListVariant): 'default' | 'personal' | 'withCompleted' {
  if (listVariant === 'personal') return 'personal';
  if (listVariant === 'withCompleted') return 'withCompleted';
  return 'default';
}

interface TaskListTreeProps {
  task: Task;
  listVariant?: TaskListVariant;
  expandedKeys: ReadonlySet<string>;
  onToggleExpand: (rootId: string, path: string[]) => void;
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdateRoot: (id: string, patch: TaskPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onOpen: (rootId: string, subtaskPath: string[]) => void;
}

interface SubtaskBranchProps {
  rootTask: Task;
  subtask: TaskSubtask;
  depth: number;
  subtaskPath: string[];
  rootProjectId: string | null;
  listVariant: TaskListVariant;
  expandedKeys: ReadonlySet<string>;
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (rootId: string, path: string[]) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: TaskPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: TaskSubtask) => void;
  onOpen: (rootId: string, subtaskPath: string[]) => void;
}

function TreeAddSubtaskRow({ depth, onAdd }: { depth: number; onAdd: () => void }) {
  const indentStyle = { ['--ts-tree-depth' as string]: String(depth) };
  return (
    <button
      type="button"
      className={styles['ts-new-subtask-row']}
      style={indentStyle}
      onClick={onAdd}
    >
      <span className={styles['ts-cell-tree']} style={indentStyle} aria-hidden />
      <span className={cx(styles['ts-cell-lead'], styles['ts-new-subtask-label'])} style={indentStyle}>
        {Icons.plus}
        <span>Нова підзадача</span>
      </span>
    </button>
  );
}

function SubtaskBranch({
  rootTask,
  subtask,
  depth,
  subtaskPath,
  rootProjectId,
  listVariant,
  expandedKeys,
  armedDeleteId,
  onArmDelete,
  onDelete,
  onToggleExpand,
  onUpdateSubtask,
  onAddSubtask,
  onOpen,
}: SubtaskBranchProps) {
  const key = treeRowKey(rootTask.id, subtaskPath);
  const hasChildren = subtask.subtasks.length > 0;
  const expanded = expandedKeys.has(key);
  const projectId = resolveSubtaskProjectId(subtask, rootProjectId);

  return (
    <>
      <TaskRow
        variant={taskRowVariant(listVariant)}
        depth={depth}
        isSubtask
        title={subtask.title}
        description={subtask.description}
        status={subtask.status}
        priority={subtask.priority}
        deadline={subtask.deadline}
        completedAt={subtask.completedAt}
        assigneeIds={subtask.assigneeIds}
        projectId={projectId}
        childCount={subtask.subtasks.length}
        hasChildren={hasChildren}
        expanded={expanded}
        onToggleExpand={() => onToggleExpand(rootTask.id, subtaskPath)}
        onOpen={() => onOpen(rootTask.id, subtaskPath)}
        onUpdate={(patch) => onUpdateSubtask(rootTask.id, subtaskPath, patch)}
        armedDeleteId={armedDeleteId}
        onArmDelete={onArmDelete}
        onDelete={onDelete}
        deleteTaskId={key}
      />
      {expanded ? (
        <>
          {subtask.subtasks.map((child) => (
            <SubtaskBranch
              key={child.id}
              rootTask={rootTask}
              subtask={child}
              depth={depth + 1}
              subtaskPath={[...subtaskPath, child.id]}
              rootProjectId={rootProjectId}
              listVariant={listVariant}
              expandedKeys={expandedKeys}
              armedDeleteId={armedDeleteId}
              onArmDelete={onArmDelete}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              onUpdateSubtask={onUpdateSubtask}
              onAddSubtask={onAddSubtask}
              onOpen={onOpen}
            />
          ))}
          <TreeAddSubtaskRow
            depth={depth + 1}
            onAdd={() =>
              onAddSubtask(rootTask.id, subtaskPath, createNewSubtask(projectId))
            }
          />
        </>
      ) : null}
    </>
  );
}

export function TaskListTree({
  task,
  listVariant = 'default',
  expandedKeys,
  onToggleExpand,
  armedDeleteId,
  onArmDelete,
  onDelete,
  onUpdateRoot,
  onUpdateSubtask,
  onAddSubtask,
  onOpen,
}: TaskListTreeProps) {
  const rootKey = treeRowKey(task.id, []);
  const hasChildren = task.subtasks.length > 0;
  const expanded = expandedKeys.has(rootKey);

  return (
    <>
      <TaskRow
        variant={taskRowVariant(listVariant)}
        depth={0}
        isSubtask={false}
        title={task.title}
        description={task.description}
        status={task.status}
        priority={task.priority}
        deadline={task.deadline}
        completedAt={task.completedAt}
        recurrenceRule={task.recurrenceRule}
        showRecurrence
        assigneeIds={task.assigneeIds}
        projectId={task.projectId}
        childCount={task.subtasks.length}
        hasChildren={hasChildren}
        expanded={expanded}
        onToggleExpand={() => onToggleExpand(task.id, [])}
        onOpen={() => onOpen(task.id, [])}
        onUpdate={(patch) => onUpdateRoot(task.id, patch)}
        armedDeleteId={armedDeleteId}
        onArmDelete={onArmDelete}
        onDelete={onDelete}
        deleteTaskId={task.id}
      />
      {expanded ? (
        <>
          {task.subtasks.map((subtask) => (
            <SubtaskBranch
              key={subtask.id}
              rootTask={task}
              subtask={subtask}
              depth={1}
              subtaskPath={[subtask.id]}
              rootProjectId={task.projectId}
              listVariant={listVariant}
              expandedKeys={expandedKeys}
              armedDeleteId={armedDeleteId}
              onArmDelete={onArmDelete}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              onUpdateSubtask={onUpdateSubtask}
              onAddSubtask={onAddSubtask}
              onOpen={onOpen}
            />
          ))}
          <TreeAddSubtaskRow
            depth={1}
            onAdd={() => onAddSubtask(task.id, [], createNewSubtask(task.projectId))}
          />
        </>
      ) : null}
    </>
  );
}
