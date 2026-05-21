import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../designBrief.module.css';
import {
  appendSubtaskAtPath,
  createNewDesignBriefSubtask,
  resolveSubtaskProjectId,
} from '../designBriefSubtask';
import { treeRowKey } from '../designBriefTree';
import type { DesignBrief, DesignBriefPatch, DesignBriefSubtask } from '../types';
import { DesignBriefRow } from './DesignBriefRow';

export type DesignBriefListVariant = 'default' | 'personal' | 'withCompleted';

function taskRowVariant(listVariant: DesignBriefListVariant): 'default' | 'personal' | 'withCompleted' {
  if (listVariant === 'personal') return 'personal';
  if (listVariant === 'withCompleted') return 'withCompleted';
  return 'default';
}

interface DesignBriefListTreeProps {
  brief: DesignBrief;
  listVariant?: DesignBriefListVariant;
  expandedKeys: ReadonlySet<string>;
  onToggleExpand: (rootId: string, path: string[]) => void;
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onUpdateRoot: (id: string, patch: DesignBriefPatch) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: DesignBriefPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: DesignBriefSubtask) => void;
  onOpen: (rootId: string, subtaskPath: string[]) => void;
}

interface SubtaskBranchProps {
  rootBrief: DesignBrief;
  subtask: DesignBriefSubtask;
  depth: number;
  subtaskPath: string[];
  rootProjectId: string | null;
  listVariant: DesignBriefListVariant;
  expandedKeys: ReadonlySet<string>;
  armedDeleteId: string | null;
  onArmDelete: (id: string | null) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (rootId: string, path: string[]) => void;
  onUpdateSubtask: (rootId: string, path: string[], patch: DesignBriefPatch) => void;
  onAddSubtask: (rootId: string, parentPath: string[], subtask: DesignBriefSubtask) => void;
  onOpen: (rootId: string, subtaskPath: string[]) => void;
}

function TreeAddSubtaskRow({ depth, onAdd }: { depth: number; onAdd: () => void }) {
  const indentStyle = { ['--ts-tree-depth' as string]: String(depth) };
  return (
    <button
      type="button"
      className={styles['db-new-subtask-row']}
      style={indentStyle}
      onClick={onAdd}
    >
      <span className={styles['db-cell-tree']} style={indentStyle} aria-hidden />
      <span className={cx(styles['db-cell-lead'], styles['db-new-subtask-label'])} style={indentStyle}>
        {Icons.plus}
        <span>Нова підзадача</span>
      </span>
    </button>
  );
}

function SubtaskBranch({
  rootBrief,
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
  const key = treeRowKey(rootBrief.id, subtaskPath);
  const hasChildren = subtask.subtasks.length > 0;
  const expanded = expandedKeys.has(key);
  const projectId = resolveSubtaskProjectId(subtask, rootProjectId);

  return (
    <>
      <DesignBriefRow
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
        onToggleExpand={() => onToggleExpand(rootBrief.id, subtaskPath)}
        onOpen={() => onOpen(rootBrief.id, subtaskPath)}
        onUpdate={(patch) => onUpdateSubtask(rootBrief.id, subtaskPath, patch)}
        armedDeleteId={armedDeleteId}
        onArmDelete={onArmDelete}
        onDelete={onDelete}
        deleteBriefId={key}
      />
      {expanded ? (
        <>
          {subtask.subtasks.map((child) => (
            <SubtaskBranch
              key={child.id}
              rootBrief={rootBrief}
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
              onAddSubtask(rootBrief.id, subtaskPath, createNewDesignBriefSubtask(projectId))
            }
          />
        </>
      ) : null}
    </>
  );
}

export function DesignBriefListTree({
  brief,
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
}: DesignBriefListTreeProps) {
  const rootKey = treeRowKey(brief.id, []);
  const hasChildren = brief.subtasks.length > 0;
  const expanded = expandedKeys.has(rootKey);

  return (
    <>
      <DesignBriefRow
        variant={taskRowVariant(listVariant)}
        depth={0}
        isSubtask={false}
        title={brief.title}
        description={brief.description}
        status={brief.status}
        priority={brief.priority}
        deadline={brief.deadline}
        completedAt={brief.completedAt}
        recurrenceRule={brief.recurrenceRule}
        showRecurrence
        assigneeIds={brief.assigneeIds}
        projectId={brief.projectId}
        childCount={brief.subtasks.length}
        hasChildren={hasChildren}
        expanded={expanded}
        onToggleExpand={() => onToggleExpand(brief.id, [])}
        onOpen={() => onOpen(brief.id, [])}
        onUpdate={(patch) => onUpdateRoot(brief.id, patch)}
        armedDeleteId={armedDeleteId}
        onArmDelete={onArmDelete}
        onDelete={onDelete}
        deleteBriefId={brief.id}
      />
      {expanded ? (
        <>
          {brief.subtasks.map((subtask) => (
            <SubtaskBranch
              key={subtask.id}
              rootBrief={brief}
              subtask={subtask}
              depth={1}
              subtaskPath={[subtask.id]}
              rootProjectId={brief.projectId}
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
            onAdd={() => onAddSubtask(brief.id, [], createNewDesignBriefSubtask(brief.projectId))}
          />
        </>
      ) : null}
    </>
  );
}
