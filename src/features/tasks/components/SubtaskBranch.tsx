import { useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import type { Subtask, Task } from '../types';
import type { TasksStateApi } from '../hooks/useTasksState';
import { SubtaskComposerRow } from './SubtaskComposerRow';
import { SubtaskRow } from './SubtaskRow';
import styles from '../tasks.module.css';

interface SubtaskBranchProps {
  task: Task;
  subs: Subtask[];
  parentSubId: string | null;
  depth: number;
  api: TasksStateApi;
}

function SubtaskNode({
  task,
  sub,
  depth,
  api,
}: {
  task: Task;
  sub: Subtask;
  depth: number;
  api: TasksStateApi;
}) {
  const children = sub.subtasks ?? [];
  const savedChildren = children.filter((c) => !c.isDraft);
  const hasChildren = savedChildren.length > 0;
  const [expanded, setExpanded] = useState(hasChildren && depth === 0);

  return (
    <div className={styles['sub-node']} data-has-children={hasChildren ? '' : undefined} data-sub-open={expanded ? '' : undefined}>
      <SubtaskRow
        task={task}
        sub={sub}
        api={api}
        expanded={expanded}
        onToggleExpand={() => {
          if (expanded) {
            setExpanded(false);
            return;
          }
          setExpanded(true);
          if (!children.some((c) => c.isDraft)) {
            api.addSubtask(task.id, sub.id, { draft: true });
          }
        }}
      />
      {expanded ? (
        <SubtaskBranch task={task} subs={children} parentSubId={sub.id} depth={depth + 1} api={api} />
      ) : null}
    </div>
  );
}

export function SubtaskBranch({ task, subs, parentSubId, depth, api }: SubtaskBranchProps) {
  const draftSub = subs.find((s) => s.isDraft);
  const savedSubs = subs.filter((s) => !s.isDraft);

  const startDraft = () => {
    if (!subs.some((s) => s.isDraft)) {
      api.addSubtask(task.id, parentSubId, { draft: true });
    }
  };

  const closeDraft = () => {
    if (draftSub) api.cancelDraftSubtask(task.id, draftSub.id);
  };

  return (
    <div className={styles['sub-branch']} data-depth={depth}>
      <div className={styles['sub-nodes']}>
        {savedSubs.map((sub) => (
          <SubtaskNode key={sub.id} task={task} sub={sub} depth={depth} api={api} />
        ))}
        {draftSub ? (
          <SubtaskComposerRow task={task} sub={draftSub} api={api} onClose={closeDraft} />
        ) : null}
      </div>
      {!draftSub ? (
        <button type="button" className={styles['add-sub']} onClick={startDraft}>
          {Icons.plus}
          <span>Підзадача</span>
        </button>
      ) : null}
    </div>
  );
}
