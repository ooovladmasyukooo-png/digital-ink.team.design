import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import {
  allocateBlockId,
  applySlashToBlock,
  blockTypeAfterEnter,
  blocksForEditor,
  blocksForStorage,
  blocksToMarkdown,
  lastEditableBlockIndex,
  parseMarkdownToBlocks,
  reorderBlock,
  segmentDocumentBlocks,
  type DocumentBlock,
} from '../documents/documentBlocks';
import { buildPlainIndexMap } from '../documents/inlineMarkdown';
import {
  applyInlineFormatToElement,
  focusRichField,
  getSelectionOffsets,
  normalizeRichFieldDom,
  resizeRichField,
} from '../documents/inlineRichText';
import { toggleInlineFormat, type InlineFormatKind } from '../documents/inlineFormat';
import { filterSlashBlocks, findSlashToken, type SlashBlock } from '../documents/slashBlocks';
import { DocumentBlockFormatBar } from './DocumentBlockFormatBar';
import { DocumentBlockGripMenu } from './DocumentBlockGripMenu';
import { DocumentBlockRichField } from './DocumentBlockRichField';
import { DocumentSlashMenu } from './DocumentSlashMenu';
import styles from '../projects2.module.css';

type BlockInputEl = HTMLTextAreaElement | HTMLDivElement;

const DRAG_MIME = 'application/x-p2-doc-block';
const DRAG_ID_PREFIX = 'p2-block:';

function readDraggedBlockId(dataTransfer: DataTransfer): string {
  const plain = dataTransfer.getData('text/plain');
  if (plain.startsWith(DRAG_ID_PREFIX)) return plain.slice(DRAG_ID_PREFIX.length);
  return dataTransfer.getData(DRAG_MIME);
}

const MAX_IMAGE_BYTES = 450_000;
const MAX_FILE_BYTES = 2_500_000;

function getLastInputBlock(blocks: DocumentBlock[]): DocumentBlock | null {
  for (let i = blocks.length - 1; i >= 0; i -= 1) {
    const block = blocks[i]!;
    if (block.type !== 'divider' && block.type !== 'image' && block.type !== 'file') return block;
  }
  return null;
}

interface DocumentBlockEditorProps {
  documentId: string;
  value: string;
  onChange: (value: string) => void;
}

function resizeTextarea(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = '0';
  el.style.height = `${el.scrollHeight}px`;
}

function readFileAsDataUrl(file: File, maxBytes: number): Promise<string | null> {
  return new Promise((resolve) => {
    if (file.size > maxBytes) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

interface BlockChromeProps {
  blockId: string;
  isDragging: boolean;
  isSelected: boolean;
  dropBefore: boolean;
  dropAfter: boolean;
  onDragStart: (blockId: string) => void;
  onDragEnd: () => void;
  onDragOver: (blockId: string, place: 'before' | 'after') => void;
  onDrop: (blockId: string, place: 'before' | 'after', dragId: string) => void;
  onGripClick: (blockId: string, anchor: DOMRect) => void;
  children: ReactNode;
}

function BlockChrome({
  blockId,
  isDragging,
  isSelected,
  dropBefore,
  dropAfter,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onGripClick,
  children,
}: BlockChromeProps) {
  const draggedRef = useRef(false);
  const onWrapDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    const place = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    onDragOver(blockId, place);
  };

  const onWrapDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const dragId = readDraggedBlockId(event.dataTransfer);
    if (!dragId || dragId === blockId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const place = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
    onDrop(blockId, place, dragId);
  };

  return (
    <div
      className={cx(
        styles['p2-doc-block-wrap'],
        isDragging && styles['p2-doc-block-wrap-dragging'],
        isSelected && styles['p2-doc-block-wrap-selected'],
        dropBefore && styles['p2-doc-block-wrap-drop-before'],
        dropAfter && styles['p2-doc-block-wrap-drop-after'],
      )}
      onDragEnter={onWrapDragOver}
      onDragOver={onWrapDragOver}
      onDrop={onWrapDrop}
    >
      <button
        type="button"
        className={styles['p2-doc-block-grip']}
        draggable
        aria-label="Перетягнути або дії з блоком"
        onDragStart={(event) => {
          draggedRef.current = true;
          event.stopPropagation();
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData(DRAG_MIME, blockId);
          event.dataTransfer.setData('text/plain', `${DRAG_ID_PREFIX}${blockId}`);
          onDragStart(blockId);
        }}
        onDragEnd={() => {
          onDragEnd();
          window.setTimeout(() => {
            draggedRef.current = false;
          }, 0);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (draggedRef.current) return;
          onGripClick(blockId, event.currentTarget.getBoundingClientRect());
        }}
      >
        {Icons.grip}
      </button>
      <div className={styles['p2-doc-block-main']}>{children}</div>
    </div>
  );
}

export function DocumentBlockEditor({ documentId, value, onChange }: DocumentBlockEditorProps) {
  const [blocks, setBlocks] = useState<DocumentBlock[]>(() => blocksForEditor(parseMarkdownToBlocks(value)));
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [slashCtx, setSlashCtx] = useState<{
    blockId: string;
    token: { start: number; end: number; query: string };
  } | null>(null);

  const areaRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Map<string, BlockInputEl>>(new Map());
  const draggingIdRef = useRef<string | null>(null);
  const pendingFocusRef = useRef<{
    blockId: string;
    mdStart: number;
    mdEnd: number;
    mdText?: string;
  } | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [gripMenu, setGripMenu] = useState<{ blockId: string; top: number; left: number } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadRef = useRef<{ blockId: string; kind: 'image' | 'file' } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ id: string; place: 'before' | 'after' } | null>(null);
  const [formatBar, setFormatBar] = useState<{
    blockId: string;
    top: number;
    left: number;
    start: number;
    end: number;
  } | null>(null);

  const options = filterSlashBlocks(query);

  useEffect(() => {
    setBlocks(blocksForEditor(parseMarkdownToBlocks(value)));
    setOpen(false);
    setSlashCtx(null);
  }, [documentId]);

  const commit = useCallback(
    (raw: DocumentBlock[]) => {
      const next = blocksForEditor(raw);
      setBlocks(next);
      onChange(blocksToMarkdown(blocksForStorage(next)));
    },
    [onChange],
  );

  const readInputState = (el: BlockInputEl) => {
    if (el instanceof HTMLTextAreaElement) {
      return { text: el.value, cursor: el.selectionStart };
    }
    const text = normalizeRichFieldDom(el);
    return { text, cursor: getSelectionOffsets(el).start };
  };

  const closeBlockMenu = useCallback(() => {
    setOpen(false);
    setSlashCtx(null);
  }, []);

  const syncSlash = useCallback(
    (blockId: string, el: BlockInputEl) => {
      const { text, cursor } = readInputState(el);
      const found = findSlashToken(text, cursor);
      if (found) {
        setSlashCtx({ blockId, token: found });
        setQuery(found.query);
        setOpen(true);
        setActiveIndex(0);
        return;
      }
      closeBlockMenu();
    },
    [closeBlockMenu],
  );

  useEffect(() => {
    if (!gripMenu) return;
    const closeFromPointer = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest(`.${styles['p2-doc-grip-menu']}`)) return;
      if (target.closest(`.${styles['p2-doc-block-grip']}`)) return;
      setGripMenu(null);
    };
    const closeMenu = () => setGripMenu(null);
    window.addEventListener('mousedown', closeFromPointer);
    window.addEventListener('scroll', closeMenu, true);
    return () => {
      window.removeEventListener('mousedown', closeFromPointer);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [gripMenu]);

  const repositionMenu = useCallback(() => {
    if (!open || !slashCtx) return;
    const el = inputRefs.current.get(slashCtx.blockId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuStyle({
      position: 'fixed',
      top: Math.min(rect.bottom + 4, window.innerHeight - 320),
      left: Math.min(rect.left, window.innerWidth - 292),
      width: 280,
      zIndex: 340,
    });
  }, [open, slashCtx]);

  useLayoutEffect(() => {
    if (!open) return;
    repositionMenu();
    window.addEventListener('resize', repositionMenu);
    window.addEventListener('scroll', repositionMenu, true);
    return () => {
      window.removeEventListener('resize', repositionMenu);
      window.removeEventListener('scroll', repositionMenu, true);
    };
  }, [open, repositionMenu, query]);

  useEffect(() => {
    if (activeIndex >= options.length) setActiveIndex(0);
  }, [activeIndex, options.length]);

  const applyFocusToBlock = useCallback(
    (id: string, mdStart = 0, mdEnd = mdStart, mdText?: string) => {
      const el = inputRefs.current.get(id);
      if (!el) return false;
      if (el instanceof HTMLTextAreaElement) {
        el.focus();
        el.setSelectionRange(mdStart, mdEnd);
        resizeTextarea(el);
        return true;
      }
      const text = mdText ?? blocks.find((b) => b.id === id)?.text ?? '';
      focusRichField(el, text, mdStart, mdEnd);
      return true;
    },
    [blocks],
  );

  const focusBlock = useCallback(
    (id: string, mdStart = 0, mdEnd = mdStart, mdText?: string) => {
      pendingFocusRef.current = { blockId: id, mdStart, mdEnd, mdText };
      if (applyFocusToBlock(id, mdStart, mdEnd, mdText)) {
        pendingFocusRef.current = null;
      }
    },
    [applyFocusToBlock],
  );

  useLayoutEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    if (applyFocusToBlock(pending.blockId, pending.mdStart, pending.mdEnd, pending.mdText)) {
      pendingFocusRef.current = null;
    }
  }, [blocks, applyFocusToBlock]);

  const focusLastBlock = useCallback(() => {
    const last = getLastInputBlock(blocks);
    if (!last) return;
    const len = last.text.length;
    focusBlock(last.id, len, len, last.text);
  }, [blocks]);

  const onBlockDragStart = (blockId: string) => {
    draggingIdRef.current = blockId;
    setDraggingId(blockId);
    setFormatBar(null);
  };

  const onBlockDragEnd = () => {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDropHint(null);
  };

  const onBlockDragOver = (targetId: string, place: 'before' | 'after') => {
    const dragId = draggingIdRef.current;
    if (!dragId || dragId === targetId) return;
    setDropHint({ id: targetId, place });
  };

  const onBlockDrop = (targetId: string, place: 'before' | 'after', dragId: string) => {
    if (!dragId || dragId === targetId) return;
    commit(reorderBlock(blocks, dragId, targetId, place));
    onBlockDragEnd();
  };

  const chromeProps = (blockId: string) => ({
    blockId,
    isDragging: draggingId === blockId,
    isSelected: selectedBlockId === blockId,
    dropBefore: dropHint?.id === blockId && dropHint.place === 'before',
    dropAfter: dropHint?.id === blockId && dropHint.place === 'after',
    onDragStart: onBlockDragStart,
    onDragEnd: onBlockDragEnd,
    onDragOver: onBlockDragOver,
    onDrop: onBlockDrop,
    onGripClick: (id: string, anchor: DOMRect) => {
      setGripMenu({ blockId: id, top: anchor.bottom, left: anchor.left });
      setFormatBar(null);
    },
  });

  const syncFormatBar = (blockId: string, el: BlockInputEl) => {
    if (el instanceof HTMLTextAreaElement) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      if (start === end) {
        setFormatBar(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setFormatBar({
        blockId,
        top: rect.top - 40,
        left: rect.left + Math.min(start, 80) * 4,
        start,
        end,
      });
      return;
    }

    const { start, end } = getSelectionOffsets(el);
    if (start === end) {
      setFormatBar(null);
      return;
    }
    const sel = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();
    const box = rect && rect.width > 0 ? rect : el.getBoundingClientRect();
    setFormatBar({
      blockId,
      top: box.top - 44,
      left: box.left + box.width / 2 - 72,
      start,
      end,
    });
  };

  const applyFormat = (blockId: string, kind: InlineFormatKind) => {
    const el = inputRefs.current.get(blockId);
    const block = blocks.find((b) => b.id === blockId);
    if (!el || !block) return;

    if (el instanceof HTMLDivElement) {
      const { start, end } = getSelectionOffsets(el);
      if (start === end) return;
      const result = applyInlineFormatToElement(el, kind);
      updateBlock(blockId, { text: result.text });
      requestAnimationFrame(() => {
        syncFormatBar(blockId, el);
      });
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return;
    const result = toggleInlineFormat(block.text, start, end, kind);
    updateBlock(blockId, { text: result.text });
    focusBlock(blockId, result.selectionStart, result.selectionEnd);
    requestAnimationFrame(() => syncFormatBar(blockId, el));
  };

  const insertBlockAfter = (index: number, block: DocumentBlock) => {
    const next = [...blocks];
    next.splice(index + 1, 0, block);
    commit(next);
    focusBlock(block.id);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    commit(blocks.filter((b) => b.id !== id));
  };

  const updateBlock = (id: string, patch: Partial<DocumentBlock>) => {
    commit(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const applyFileToBlock = async (blockId: string, kind: 'image' | 'file', file: File) => {
    const max = kind === 'image' ? MAX_IMAGE_BYTES : MAX_FILE_BYTES;
    const dataUrl = await readFileAsDataUrl(file, max);
    if (!dataUrl) return;
    const existing = blocks.find((b) => b.id === blockId);
    if (kind === 'image') {
      updateBlock(blockId, {
        src: dataUrl,
        text: existing?.text || file.name.replace(/\.[^.]+$/, ''),
      });
    } else {
      updateBlock(blockId, { src: dataUrl, fileName: file.name, text: file.name });
    }
  };

  const onMediaInput = async (event: ChangeEvent<HTMLInputElement>, kind: 'image' | 'file') => {
    const file = event.target.files?.[0];
    event.target.value = '';
    const pending = pendingUploadRef.current;
    if (!file || !pending || pending.kind !== kind) return;
    await applyFileToBlock(pending.blockId, kind, file);
    pendingUploadRef.current = null;
  };

  const pickBlock = useCallback(
    (slash: SlashBlock) => {
      if (!slashCtx) return;
      const index = blocks.findIndex((b) => b.id === slashCtx.blockId);
      if (index < 0) return;
      const current = blocks[index]!;
      const result = applySlashToBlock(current, slashCtx.token, slash);
      closeBlockMenu();

      if (!result) return;

      if ('insertAfter' in result && result.insertAfter) {
        const inserted = result.insertAfter;
        const next = [...blocks];
        const before = current.text.slice(0, slashCtx.token.start);
        const after = current.text.slice(slashCtx.token.end);
        const cleanedText = `${before}${after}`;
        next[index] = { ...current, text: cleanedText };
        next.splice(index + 1, 0, inserted);
        commit(next);
        focusBlock(current.id, slashCtx.token.start, slashCtx.token.start, cleanedText);

        if (inserted.type === 'image' || inserted.type === 'file') {
          pendingUploadRef.current = { blockId: inserted.id, kind: inserted.type };
          (inserted.type === 'image' ? imageInputRef : fileInputRef).current?.click();
        }
        return;
      }

      if ('block' in result) {
        const next = [...blocks];
        next[index] = result.block;
        commit(next);
        focusBlock(result.block.id, result.cursor, result.cursor, result.block.text);
      }
    },
    [blocks, closeBlockMenu, commit, slashCtx],
  );

  const onKeyDown = (event: KeyboardEvent<BlockInputEl>, index: number, block: DocumentBlock) => {
    if ((event.metaKey || event.ctrlKey) && !open) {
      if (event.key === 'b') {
        event.preventDefault();
        applyFormat(block.id, 'bold');
        return;
      }
      if (event.key === 'i') {
        event.preventDefault();
        applyFormat(block.id, 'italic');
        return;
      }
    }

    if (open && options.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        pickBlock(options[activeIndex]!);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeBlockMenu();
        return;
      }
    }

    const el = event.currentTarget;

    if (event.key === 'Enter' && !event.shiftKey && block.type !== 'code') {
      event.preventDefault();

      let currentText = block.text;
      if (el instanceof HTMLDivElement) {
        currentText = normalizeRichFieldDom(el);
        if (currentText !== block.text) {
          updateBlock(block.id, { text: currentText });
        }
      }

      const nextType = blockTypeAfterEnter(block.type);
      const newBlock: DocumentBlock = {
        id: allocateBlockId(),
        type: nextType,
        text: '',
        checked: nextType === 'todo' ? false : undefined,
      };

      const isTrailingTail =
        index === blocks.length - 1 && block.type === 'paragraph' && currentText === '';

      if (isTrailingTail) {
        const next = [...blocks];
        next.splice(index, 0, newBlock);
        commit(next);
        focusBlock(newBlock.id, 0, 0, '');
        return;
      }

      const next = [...blocks];
      next.splice(index + 1, 0, newBlock);
      commit(next);
      focusBlock(newBlock.id, 0, 0, '');
      return;
    }

    const { cursor } = readInputState(el);
    const selectionEnd =
      el instanceof HTMLTextAreaElement ? el.selectionEnd : getSelectionOffsets(el).end;

    if (event.key === 'Backspace' && cursor === 0 && selectionEnd === 0) {
      if (
        block.text === '' &&
        (block.type === 'h1' ||
          block.type === 'h2' ||
          block.type === 'h3' ||
          block.type === 'quote' ||
          block.type === 'todo' ||
          block.type === 'bullet' ||
          block.type === 'numbered')
      ) {
        event.preventDefault();
        updateBlock(block.id, { type: 'paragraph' });
        return;
      }
      if (block.text === '' && block.type === 'paragraph' && blocks.length > 1) {
        event.preventDefault();
        const prev = blocks[index - 1];
        const next = blocks.filter((b) => b.id !== block.id);
        commit(next);
        if (prev && prev.type !== 'divider' && prev.type !== 'image' && prev.type !== 'file') {
          const map = buildPlainIndexMap(prev.text);
          focusBlock(prev.id, map.plainEndMd);
        }
        return;
      }
    }
  };

  const registerBlockRef = (blockId: string, el: BlockInputEl | null) => {
    if (el) inputRefs.current.set(blockId, el);
    else inputRefs.current.delete(blockId);
  };

  const onPasteImage = (
    event: React.ClipboardEvent<HTMLDivElement>,
    index: number,
    _block: DocumentBlock,
  ) => {
    const file = event.clipboardData.files[0];
    if (!file?.type.startsWith('image/')) return false;
    event.preventDefault();
    void readFileAsDataUrl(file, MAX_IMAGE_BYTES).then((dataUrl) => {
      if (!dataUrl) return;
      const imageBlock: DocumentBlock = {
        id: allocateBlockId(),
        type: 'image',
        text: '',
        src: dataUrl,
      };
      insertBlockAfter(index, imageBlock);
    });
    return true;
  };

  const renderTextBlock = (block: DocumentBlock, index: number) => {
    const numbered =
      block.type === 'numbered'
        ? blocks.slice(0, index).filter((b) => b.type === 'numbered').length + 1
        : 0;

    return (
      <BlockChrome {...chromeProps(block.id)}>
        <div
          className={cx(
            styles['p2-doc-block-row'],
            block.type === 'quote' && styles['p2-doc-block-row-quote'],
            block.type === 'todo' && styles['p2-doc-block-row-todo'],
          )}
        >
          {block.type === 'bullet' ? <span className={styles['p2-doc-block-marker']} aria-hidden>•</span> : null}
          {block.type === 'numbered' ? (
            <span className={styles['p2-doc-block-marker']} aria-hidden>
              {numbered}.
            </span>
          ) : null}
          {block.type === 'todo' ? (
            <input
              type="checkbox"
              className={styles['p2-doc-block-check']}
              checked={Boolean(block.checked)}
              aria-label="Виконано"
              onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
            />
          ) : null}
          <DocumentBlockRichField
            blockId={block.id}
            value={block.text}
            className={styles[`p2-doc-block-${block.type}`]}
            placeholder={index === lastEditableBlockIndex(blocks) ? 'Пишіть або /…' : undefined}
            registerRef={registerBlockRef}
            onChange={(text) => {
              updateBlock(block.id, { text });
              const el = inputRefs.current.get(block.id);
              if (el instanceof HTMLDivElement) syncSlash(block.id, el);
            }}
            onKeyDown={(e) => onKeyDown(e, index, block)}
            onKeyUp={(e) => {
              syncSlash(block.id, e.currentTarget);
              syncFormatBar(block.id, e.currentTarget);
            }}
            onSelect={(el) => syncFormatBar(block.id, el)}
            onClick={(el) => syncSlash(block.id, el)}
            onPasteImage={(e) => onPasteImage(e, index, block)}
          />
        </div>
      </BlockChrome>
    );
  };

  const slashMenu =
    open && options.length > 0 ? (
      <DocumentSlashMenu
        menuRef={menuRef}
        style={menuStyle}
        hint="Введіть / для блоку"
        options={options}
        activeIndex={activeIndex}
        onPick={pickBlock}
        onHover={setActiveIndex}
      />
    ) : null;

  return (
    <div ref={areaRef} className={styles['p2-doc-blocks']}>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className={styles['p2-doc-hidden-input']}
        onChange={(e) => onMediaInput(e, 'image')}
      />
      <input ref={fileInputRef} type="file" className={styles['p2-doc-hidden-input']} onChange={(e) => onMediaInput(e, 'file')} />

      {segmentDocumentBlocks(blocks).map((segment) => {
        if (segment.kind === 'images') {
          return (
            <div
              key={`gallery-${segment.items[0]!.block.id}`}
              className={styles['p2-doc-image-gallery']}
              onDragEnter={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
            >
              {segment.items.map(({ block }) => (
                <BlockChrome key={block.id} {...chromeProps(block.id)}>
                  <div className={styles['p2-doc-image-tile']}>
                    {block.src ? (
                      <>
                        <img
                          src={block.src}
                          alt={block.text || 'Зображення'}
                          className={styles['p2-doc-block-image']}
                        />
                        <div className={styles['p2-doc-image-tile-actions']}>
                          <button
                            type="button"
                            className={styles['p2-doc-image-tile-btn']}
                            aria-label="Замінити"
                            onClick={() => {
                              pendingUploadRef.current = { blockId: block.id, kind: 'image' };
                              imageInputRef.current?.click();
                            }}
                          >
                            {Icons.camera}
                          </button>
                          <button
                            type="button"
                            className={styles['p2-doc-image-tile-btn']}
                            aria-label="Видалити"
                            onClick={() => removeBlock(block.id)}
                          >
                            {Icons.trash}
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        className={styles['p2-doc-media-placeholder']}
                        aria-label="Додати зображення"
                        onClick={() => {
                          pendingUploadRef.current = { blockId: block.id, kind: 'image' };
                          imageInputRef.current?.click();
                        }}
                      >
                        {Icons.camera}
                      </button>
                    )}
                  </div>
                </BlockChrome>
              ))}
            </div>
          );
        }

        const { block, index } = segment;

        if (block.type === 'divider') {
          return (
            <BlockChrome key={block.id} {...chromeProps(block.id)}>
              <hr className={styles['p2-doc-block-divider']} />
            </BlockChrome>
          );
        }

        if (block.type === 'file') {
          return (
            <BlockChrome key={block.id} {...chromeProps(block.id)}>
              <div className={styles['p2-doc-block-file']}>
                {block.src ? (
                  <a
                    href={block.src}
                    download={block.fileName ?? block.text}
                    className={styles['p2-doc-file-link']}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📎 {block.fileName ?? block.text}
                  </a>
                ) : (
                  <button
                    type="button"
                    className={styles['p2-doc-media-placeholder']}
                    onClick={() => {
                      pendingUploadRef.current = { blockId: block.id, kind: 'file' };
                      fileInputRef.current?.click();
                    }}
                  >
                    📎
                    <span>Додати файл</span>
                  </button>
                )}
                <div className={styles['p2-doc-media-actions']}>
                  <button
                    type="button"
                    className={styles['p2-doc-media-btn']}
                    onClick={() => {
                      pendingUploadRef.current = { blockId: block.id, kind: 'file' };
                      fileInputRef.current?.click();
                    }}
                  >
                    Замінити
                  </button>
                  <button type="button" className={styles['p2-doc-media-btn']} onClick={() => removeBlock(block.id)}>
                    Видалити
                  </button>
                </div>
              </div>
            </BlockChrome>
          );
        }

        if (block.type === 'code') {
          return (
            <BlockChrome key={block.id} {...chromeProps(block.id)}>
              <textarea
                ref={(el) => {
                  if (el) {
                    inputRefs.current.set(block.id, el);
                    resizeTextarea(el);
                  } else inputRefs.current.delete(block.id);
                }}
                rows={3}
                className={cx(styles['p2-doc-block'], styles['p2-doc-block-code'])}
                value={block.text}
                placeholder={index === lastEditableBlockIndex(blocks) ? 'Код…' : undefined}
                spellCheck={false}
                onChange={(e) => {
                  updateBlock(block.id, { text: e.target.value });
                  resizeTextarea(e.target);
                }}
                onKeyDown={(e) => onKeyDown(e, index, block)}
                onKeyUp={(e) => syncSlash(block.id, e.currentTarget)}
              />
            </BlockChrome>
          );
        }

        return <div key={block.id}>{renderTextBlock(block, index)}</div>;
      })}
      <div
        className={styles['p2-doc-blocks-pad']}
        aria-label="Продовжити писати"
        onMouseDown={(event) => {
          event.preventDefault();
          focusLastBlock();
        }}
      />
      {formatBar ? (
        <DocumentBlockFormatBar
          top={formatBar.top}
          left={formatBar.left}
          onFormat={(kind) => applyFormat(formatBar.blockId, kind)}
        />
      ) : null}
      {gripMenu ? (
        <DocumentBlockGripMenu
          top={gripMenu.top}
          left={gripMenu.left}
          onSelect={() => {
            setSelectedBlockId(gripMenu.blockId);
            focusBlock(gripMenu.blockId);
            setGripMenu(null);
          }}
          onDelete={() => {
            removeBlock(gripMenu.blockId);
            setSelectedBlockId(null);
            setGripMenu(null);
          }}
        />
      ) : null}
      {slashMenu}
    </div>
  );
}
