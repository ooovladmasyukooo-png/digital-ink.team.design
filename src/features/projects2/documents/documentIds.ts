import type { ProjectDocument } from './types';

let nextDocId = 500;

function numericDocId(id: string): number | null {
  const match = /^doc-(\d+)$/.exec(id);
  if (!match) return null;
  return Number.parseInt(match[1]!, 10);
}

export function syncDocIdCounterFromTrees(trees: ProjectDocument[][]): void {
  let max = nextDocId;
  const walk = (nodes: ProjectDocument[]) => {
    for (const node of nodes) {
      const n = numericDocId(node.id);
      if (n != null) max = Math.max(max, n);
      walk(node.children);
    }
  };
  for (const tree of trees) walk(tree);
  nextDocId = max;
}

/** Унікальні id: повтори отримують новий id (типова причина — HMR скидає лічильник). */
export function deduplicateDocumentIds(nodes: ProjectDocument[], seen = new Set<string>()): ProjectDocument[] {
  return nodes.map((node) => {
    let id = node.id;
    if (seen.has(id)) {
      nextDocId += 1;
      id = `doc-${nextDocId}`;
    }
    seen.add(id);
    return {
      ...node,
      id,
      children: deduplicateDocumentIds(node.children, seen),
    };
  });
}

export function allocateDocumentId(): string {
  nextDocId += 1;
  return `doc-${nextDocId}`;
}
