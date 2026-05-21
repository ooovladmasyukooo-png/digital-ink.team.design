/** Ключ рядка дерева для expand/collapse (root id + шлях підзадач). */
export function treeRowKey(rootBriefId: string, subtaskPath: string[]): string {
  return subtaskPath.length === 0 ? rootBriefId : `${rootBriefId}/${subtaskPath.join('/')}`;
}

export function countDirectSubtasks(subtasks: { subtasks: unknown[] }[]): number {
  return subtasks.length;
}

export function hasTaskDescription(description: string): boolean {
  return description.trim().length > 0;
}

/** Розгортає гілку: корінь + усі предки шляху. */
export function expandTreeBranch(keys: Set<string>, rootId: string, path: string[]): void {
  keys.add(rootId);
  for (let i = 1; i <= path.length; i++) {
    keys.add(treeRowKey(rootId, path.slice(0, i)));
  }
}

/** Згортає вузол і всі вкладені ключі. */
export function collapseTreeBranch(keys: Set<string>, rootId: string, path: string[]): void {
  const prefix = path.length === 0 ? rootId : treeRowKey(rootId, path);
  keys.delete(prefix);
  for (const key of [...keys]) {
    if (key.startsWith(`${prefix}/`)) keys.delete(key);
  }
}
