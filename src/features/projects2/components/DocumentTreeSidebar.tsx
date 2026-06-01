import { useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { cx } from '../../../shared/styles/cx';
import { Icons } from '../../../shared/components/Icon';
import type { DocumentDropPosition } from '../documents/documentTree';
import {
  containsDocumentId,
  findDocumentById,
  ROOT_TREE_END,
  ROOT_TREE_START,
} from '../documents/documentTree';
import { renderDocumentIcon } from '../documents/docIcon';
import { isFolder } from '../documents/types';
import type { ProjectDocument } from '../documents/types';
import { DocumentTreeGripMenu } from './DocumentTreeGripMenu';
import styles from '../projects2.module.css';

type DropHintTarget = { targetId: string; position: DocumentDropPosition };
type DropHint = DropHintTarget | null;
type GripMenuState = { nodeId: string; top: number; left: number } | null;

interface DocumentTreeSidebarProps {
  tree: ProjectDocument[];
  selectedId: string | null;
  expandedIds: ReadonlySet<string>;
  headLabel?: string;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddPage: (parentId: string | null) => void;
  onAddFolder: (parentId: string | null) => void;
  onMoveDocument: (dragId: string, targetId: string, position: DocumentDropPosition) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

interface TreeNodeProps {
  node: ProjectDocument;
  selectedId: string | null;
  expandedIds: ReadonlySet<string>;
  draggingId: string | null;
  dropHint: DropHint;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddPage: (parentId: string) => void;
  onOpenGripMenu: (nodeId: string, event: MouseEvent<HTMLButtonElement>) => void;
  onDragStart: (id: string, event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  onDragOverRow: (id: string, event: DragEvent<HTMLDivElement>) => void;
  onDropRow: (id: string, event: DragEvent<HTMLDivElement>) => void;
  onChildrenAreaDragOver: (parentId: string, event: DragEvent<HTMLDivElement>) => void;
  onChildrenAreaDrop: (parentId: string, event: DragEvent<HTMLDivElement>) => void;
}

function dropPositionFromEvent(event: DragEvent<HTMLDivElement>): DocumentDropPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  const offset = event.clientY - rect.top;
  const ratio = offset / rect.height;
  if (ratio < 0.28) return 'before';
  if (ratio > 0.72) return 'after';
  return 'inside';
}

/** Папки на одному рівні — лише before/after, щоб не «ховати» їх через inside. */
function resolveDropPosition(
  event: DragEvent<HTMLDivElement>,
  dragId: string,
  targetId: string,
  tree: ProjectDocument[],
): DocumentDropPosition {
  const position = dropPositionFromEvent(event);
  const drag = findDocumentById(tree, dragId);
  const target = findDocumentById(tree, targetId);
  if (!drag || !target || position !== 'inside') return position;
  if (drag.kind === 'folder' && target.kind === 'folder') {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  }
  if (drag.kind === 'folder' && target.kind === 'page') {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  }
  if (drag.kind === 'page' && target.kind === 'page') {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  }
  return position;
}

function pickDropTargetInChildren(
  parentId: string,
  container: HTMLElement,
  clientY: number,
): DropHintTarget {
  const endZone = container.querySelector<HTMLElement>(':scope > .p2-doc-tree-child-end');
  if (endZone) {
    const endRect = endZone.getBoundingClientRect();
    if (clientY >= endRect.top - 2) {
      return { targetId: parentId, position: 'append-child' };
    }
  }
  const rows = container.querySelectorAll<HTMLElement>(':scope > .p2-doc-tree-node > [data-node-id]');
  if (rows.length === 0) {
    return { targetId: parentId, position: 'append-child' };
  }
  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    const id = row.dataset.nodeId;
    if (!id) continue;
    if (clientY < rect.top + rect.height / 2) {
      return { targetId: id, position: 'before' };
    }
  }
  const last = rows[rows.length - 1]!;
  const lastId = last.dataset.nodeId;
  if (!lastId) return { targetId: parentId, position: 'append-child' };
  return { targetId: lastId, position: 'after' };
}

function isTreeControlTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('button'));
}

function TreeNode({
  node,
  selectedId,
  expandedIds,
  draggingId,
  dropHint,
  onSelect,
  onToggleExpand,
  onAddPage,
  onOpenGripMenu,
  onDragStart,
  onDragEnd,
  onDragOverRow,
  onDropRow,
  onChildrenAreaDragOver,
  onChildrenAreaDrop,
}: TreeNodeProps) {
  const folder = isFolder(node);
  const hasChildren = node.children.length > 0;
  const canExpand = folder || hasChildren;
  const expanded = expandedIds.has(node.id);
  const active = selectedId === node.id;
  const isDragging = draggingId === node.id;
  const dropBefore = dropHint?.targetId === node.id && dropHint.position === 'before';
  const dropAfter = dropHint?.targetId === node.id && dropHint.position === 'after';
  const dropInside = dropHint?.targetId === node.id && dropHint.position === 'inside';
  const childSelected =
    selectedId != null && selectedId !== node.id && containsDocumentId(node, selectedId);
  const showBranch = hasChildren && (expanded || childSelected);

  return (
    <div className={styles['p2-doc-tree-node']} role="treeitem" aria-expanded={canExpand ? expanded : undefined}>
      <div
        className={cx(
          styles['p2-doc-tree-row'],
          folder && styles['p2-doc-tree-row-folder'],
          active && styles['p2-doc-tree-row-on'],
          isDragging && styles['p2-doc-tree-row-dragging'],
          dropBefore && styles['p2-doc-tree-drop-before'],
          dropAfter && styles['p2-doc-tree-drop-after'],
          dropInside && styles['p2-doc-tree-drop-inside'],
        )}
        data-node-id={node.id}
        onDragEnter={(event) => {
          if (!draggingId) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
        onDragOver={(event) => {
          if (!draggingId) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          onDragOverRow(node.id, event);
        }}
        onDrop={(event) => {
          onDropRow(node.id, event);
        }}
        onClick={(event) => {
          if (isTreeControlTarget(event.target)) return;
          onSelect(node.id);
        }}
      >
        <div className={styles['p2-doc-tree-mark']}>
          <button
            type="button"
            className={styles['p2-doc-tree-drag']}
            draggable
            aria-label="Перетягнути. ПКМ — дублювати"
            title="Перетягнути. ПКМ — дублювати"
            onDragStart={(event) => onDragStart(node.id, event)}
            onDragEnd={onDragEnd}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenGripMenu(node.id, event);
            }}
          >
            {Icons.grip}
          </button>
          {canExpand ? (
            <button
              type="button"
              className={styles['p2-doc-tree-chev']}
              aria-label={expanded ? 'Згорнути' : 'Розгорнути'}
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
            >
              <span className={cx(styles['p2-doc-tree-chev-i'], expanded && styles['p2-doc-tree-chev-open'])}>
                {Icons.chevR}
              </span>
            </button>
          ) : (
            <span className={styles['p2-doc-tree-chev-spacer']} aria-hidden />
          )}
          <span className={cx(styles['p2-doc-tree-ic'], folder && styles['p2-doc-tree-ic-folder'])} aria-hidden>
            {renderDocumentIcon(
              node,
              styles['p2-doc-tree-ic-svg'],
              styles['p2-doc-tree-ic-img'],
              styles['p2-doc-tree-emoji'],
            )}
          </span>
        </div>
        <span className={styles['p2-doc-tree-label']} title={node.title}>
          {node.title || (folder ? 'Папка' : 'Untitled')}
        </span>
        <div className={styles['p2-doc-tree-actions']}>
          <button
            type="button"
            className={styles['p2-doc-tree-add']}
            aria-label="Додати сторінку"
            title="Додати сторінку"
            onClick={(e) => {
              e.stopPropagation();
              onAddPage(node.id);
            }}
          >
            {Icons.plus}
          </button>
        </div>
      </div>
      {showBranch ? (
        <div
          className={styles['p2-doc-tree-children']}
          role="group"
          onDragEnter={(event) => onChildrenAreaDragOver(node.id, event)}
          onDragOver={(event) => onChildrenAreaDragOver(node.id, event)}
          onDrop={(event) => onChildrenAreaDrop(node.id, event)}
        >
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              draggingId={draggingId}
              dropHint={dropHint}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddPage={onAddPage}
              onOpenGripMenu={onOpenGripMenu}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverRow={onDragOverRow}
              onDropRow={onDropRow}
              onChildrenAreaDragOver={onChildrenAreaDragOver}
              onChildrenAreaDrop={onChildrenAreaDrop}
            />
          ))}
          <div
            className={cx(
              styles['p2-doc-tree-child-end'],
              dropHint?.targetId === node.id &&
                dropHint.position === 'append-child' &&
                styles['p2-doc-tree-child-end-on'],
            )}
            onDragEnter={(event) => onChildrenAreaDragOver(node.id, event)}
            onDragOver={(event) => onChildrenAreaDragOver(node.id, event)}
            onDrop={(event) => onChildrenAreaDrop(node.id, event)}
          />
        </div>
      ) : null}
    </div>
  );
}

export function DocumentTreeSidebar({
  tree,
  selectedId,
  expandedIds,
  headLabel = 'Документи',
  onSelect,
  onToggleExpand,
  onAddPage,
  onAddFolder,
  onMoveDocument,
  onDuplicate,
  onDelete,
}: DocumentTreeSidebarProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<DropHint>(null);
  const [gripMenu, setGripMenu] = useState<GripMenuState>(null);
  const draggingIdRef = useRef<string | null>(null);

  const clearDrag = useCallback(() => {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDropHint(null);
  }, []);

  const onDragStart = useCallback((id: string, event: DragEvent<HTMLButtonElement>) => {
    setGripMenu(null);
    draggingIdRef.current = id;
    setDraggingId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  }, []);

  const onDragOverRow = useCallback(
    (targetId: string, event: DragEvent<HTMLDivElement>) => {
      const dragId = draggingIdRef.current;
      if (!dragId || dragId === targetId) return;
      event.stopPropagation();
      setDropHint({
        targetId,
        position: resolveDropPosition(event, dragId, targetId, tree),
      });
    },
    [tree],
  );

  const onChildrenAreaDragOver = useCallback(
    (parentId: string, event: DragEvent<HTMLDivElement>) => {
      const dragId = draggingIdRef.current;
      if (!dragId) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      const dragNode = findDocumentById(tree, dragId);
      if (dragNode && containsDocumentId(dragNode, parentId)) return;
      const dropTarget = pickDropTargetInChildren(parentId, event.currentTarget, event.clientY);
      setDropHint(dropTarget);
    },
    [tree],
  );

  const onChildrenAreaDrop = useCallback(
    (parentId: string, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const dragId = draggingIdRef.current || event.dataTransfer.getData('text/plain');
      if (!dragId) {
        clearDrag();
        return;
      }
      const dragNode = findDocumentById(tree, dragId);
      if (dragNode && containsDocumentId(dragNode, parentId)) {
        clearDrag();
        return;
      }
      const dropTarget = pickDropTargetInChildren(parentId, event.currentTarget, event.clientY);
      if (dropTarget.position === 'append-child') {
        onMoveDocument(dragId, parentId, 'append-child');
      } else {
        const position = resolveDropPosition(event, dragId, dropTarget.targetId, tree);
        onMoveDocument(dragId, dropTarget.targetId, position);
      }
      clearDrag();
    },
    [clearDrag, onMoveDocument, tree],
  );

  const onDropRow = useCallback(
    (targetId: string, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const dragId = draggingIdRef.current || event.dataTransfer.getData('text/plain');
      if (!dragId || dragId === targetId) {
        clearDrag();
        return;
      }
      const position = resolveDropPosition(event, dragId, targetId, tree);
      onMoveDocument(dragId, targetId, position);
      clearDrag();
    },
    [clearDrag, onMoveDocument, tree],
  );

  const onRootZoneDragOver = useCallback(
    (targetId: typeof ROOT_TREE_START | typeof ROOT_TREE_END, event: DragEvent<HTMLDivElement>) => {
      if (!draggingIdRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      setDropHint({ targetId, position: targetId === ROOT_TREE_START ? 'before' : 'after' });
    },
    [],
  );

  const onRootZoneDrop = useCallback(
    (targetId: typeof ROOT_TREE_START | typeof ROOT_TREE_END, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const dragId = draggingIdRef.current || event.dataTransfer.getData('text/plain');
      if (!dragId) {
        clearDrag();
        return;
      }
      onMoveDocument(dragId, targetId, targetId === ROOT_TREE_START ? 'before' : 'after');
      clearDrag();
    },
    [clearDrag, onMoveDocument],
  );

  const onOpenGripMenu = useCallback((nodeId: string, event: MouseEvent<HTMLButtonElement>) => {
    setGripMenu({ nodeId, top: event.clientY, left: event.clientX });
  }, []);

  useEffect(() => {
    if (!gripMenu) return;
    const close = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest(`.${styles['p2-doc-grip-menu']}`)) return;
      if (target.closest(`.${styles['p2-doc-tree-drag']}`)) return;
      setGripMenu(null);
    };
    const closeOnScroll = () => setGripMenu(null);
    window.addEventListener('mousedown', close);
    window.addEventListener('scroll', closeOnScroll, true);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', closeOnScroll, true);
    };
  }, [gripMenu]);

  return (
    <aside className={styles['p2-doc-tree']} aria-label={headLabel} role="tree">
      <div className={styles['p2-doc-tree-head']}>
        <span className={styles['p2-doc-tree-head-k']}>{headLabel}</span>
        <div className={styles['p2-doc-tree-head-actions']}>
          <button
            type="button"
            className={styles['p2-doc-tree-head-btn']}
            aria-label="Новий документ"
            title="Новий документ"
            onClick={() => onAddPage(null)}
          >
            {Icons.plus}
          </button>
          <button
            type="button"
            className={styles['p2-doc-tree-head-btn']}
            aria-label="Нова папка"
            title="Нова папка"
            onClick={() => onAddFolder(null)}
          >
            {Icons.projects}
          </button>
        </div>
      </div>
      <div className={styles['p2-doc-tree-list']}>
        <div
          className={cx(
            styles['p2-doc-tree-root-zone'],
            dropHint?.targetId === ROOT_TREE_START && styles['p2-doc-tree-root-zone-on'],
          )}
          onDragEnter={(e) => onRootZoneDragOver(ROOT_TREE_START, e)}
          onDragOver={(e) => onRootZoneDragOver(ROOT_TREE_START, e)}
          onDrop={(e) => onRootZoneDrop(ROOT_TREE_START, e)}
        />
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            expandedIds={expandedIds}
            draggingId={draggingId}
            dropHint={dropHint}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            onAddPage={onAddPage}
            onOpenGripMenu={onOpenGripMenu}
            onDragStart={onDragStart}
            onDragEnd={clearDrag}
            onDragOverRow={onDragOverRow}
            onDropRow={onDropRow}
            onChildrenAreaDragOver={onChildrenAreaDragOver}
            onChildrenAreaDrop={onChildrenAreaDrop}
          />
        ))}
        <div
          className={cx(
            styles['p2-doc-tree-root-zone'],
            dropHint?.targetId === ROOT_TREE_END && styles['p2-doc-tree-root-zone-on'],
          )}
          onDragEnter={(e) => onRootZoneDragOver(ROOT_TREE_END, e)}
          onDragOver={(e) => onRootZoneDragOver(ROOT_TREE_END, e)}
          onDrop={(e) => onRootZoneDrop(ROOT_TREE_END, e)}
        />
      </div>
      {gripMenu ? (
        <DocumentTreeGripMenu
          top={gripMenu.top}
          left={gripMenu.left}
          onDuplicate={() => {
            onDuplicate(gripMenu.nodeId);
            setGripMenu(null);
          }}
          onDelete={() => {
            onDelete(gripMenu.nodeId);
            setGripMenu(null);
          }}
        />
      ) : null}
    </aside>
  );
}
