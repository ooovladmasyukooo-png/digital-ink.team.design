import type { SlashBlock } from './slashBlocks';

export type DocumentBlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bullet'
  | 'numbered'
  | 'todo'
  | 'quote'
  | 'code'
  | 'divider'
  | 'image'
  | 'file';

export type DocumentBlock = {
  id: string;
  type: DocumentBlockType;
  text: string;
  checked?: boolean;
  /** URL або data: для зображень і вкладень */
  src?: string;
  fileName?: string;
};

const EDITABLE_TYPES = new Set<DocumentBlockType>([
  'paragraph',
  'h1',
  'h2',
  'h3',
  'bullet',
  'numbered',
  'todo',
  'quote',
  'code',
]);

let blockSeq = 0;

export function allocateBlockId(): string {
  blockSeq += 1;
  return `blk-${blockSeq}`;
}

export const SLASH_BLOCK_TYPE: Record<string, DocumentBlockType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  text: 'paragraph',
  bullet: 'bullet',
  numbered: 'numbered',
  todo: 'todo',
  quote: 'quote',
  code: 'code',
  divider: 'divider',
  image: 'image',
  file: 'file',
};

export function blockTypeAfterEnter(type: DocumentBlockType): DocumentBlockType {
  if (type === 'h1' || type === 'h2' || type === 'h3' || type === 'quote') return 'paragraph';
  if (type === 'todo') return 'todo';
  if (type === 'bullet') return 'bullet';
  if (type === 'numbered') return 'numbered';
  return 'paragraph';
}

/** Завжди порожній рядок внизу для вводу. */
export function blocksForEditor(blocks: DocumentBlock[]): DocumentBlock[] {
  const next = [...blocks];
  if (next.length === 0) {
    next.push({ id: allocateBlockId(), type: 'paragraph', text: '' });
    return next;
  }
  const last = next[next.length - 1]!;
  if (!EDITABLE_TYPES.has(last.type) || last.type === 'code') {
    next.push({ id: allocateBlockId(), type: 'paragraph', text: '' });
    return next;
  }
  if (last.type === 'paragraph' && last.text === '') return next;
  next.push({ id: allocateBlockId(), type: 'paragraph', text: '' });
  return next;
}

export type DocumentBlockSegment =
  | { kind: 'single'; block: DocumentBlock; index: number }
  | { kind: 'images'; items: { block: DocumentBlock; index: number }[] };

/** Підряд ідутьші зображення — одна компактна галерея. */
export function segmentDocumentBlocks(blocks: DocumentBlock[]): DocumentBlockSegment[] {
  const segments: DocumentBlockSegment[] = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i]!;
    if (block.type === 'image') {
      const items: { block: DocumentBlock; index: number }[] = [];
      while (i < blocks.length && blocks[i]!.type === 'image') {
        items.push({ block: blocks[i]!, index: i });
        i += 1;
      }
      segments.push({ kind: 'images', items });
      continue;
    }
    segments.push({ kind: 'single', block, index: i });
    i += 1;
  }
  return segments;
}

export function lastEditableBlockIndex(blocks: DocumentBlock[]): number {
  for (let i = blocks.length - 1; i >= 0; i -= 1) {
    const type = blocks[i]!.type;
    if (type !== 'divider' && type !== 'image' && type !== 'file') return i;
  }
  return -1;
}

/** При збереженні прибираємо фінальний порожній абзац. */
export function blocksForStorage(blocks: DocumentBlock[]): DocumentBlock[] {
  const next = [...blocks];
  while (next.length > 1) {
    const last = next[next.length - 1];
    if (last?.type === 'paragraph' && last.text.trim() === '') {
      next.pop();
    } else break;
  }
  return next;
}

export function moveBlock(blocks: DocumentBlock[], index: number, direction: -1 | 1): DocumentBlock[] {
  const target = index + direction;
  if (target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  const tmp = next[index]!;
  next[index] = next[target]!;
  next[target] = tmp;
  return next;
}

export function reorderBlock(
  blocks: DocumentBlock[],
  dragId: string,
  targetId: string,
  place: 'before' | 'after',
): DocumentBlock[] {
  if (dragId === targetId) return blocks;
  const from = blocks.findIndex((b) => b.id === dragId);
  if (from < 0) return blocks;

  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  let to = next.findIndex((b) => b.id === targetId);
  if (to < 0 || !moved) return blocks;
  if (place === 'after') to += 1;
  next.splice(to, 0, moved);
  return next;
}

export function parseMarkdownToBlocks(source: string): DocumentBlock[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: DocumentBlock[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  const push = (block: Omit<DocumentBlock, 'id'>) => {
    blocks.push({ id: allocateBlockId(), ...block });
  };

  for (const raw of lines) {
    if (raw.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        push({ type: 'code', text: codeLines.join('\n') });
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(raw);
      continue;
    }

    const line = raw.trimEnd();
    if (!line.trim()) continue;

    if (line === '---') {
      push({ type: 'divider', text: '' });
      continue;
    }

    const fileMatch = line.match(/^📎\s+\[([^\]]+)\]\(([^)]+)\)$/);
    if (fileMatch) {
      push({ type: 'file', text: fileMatch[1] ?? 'Файл', fileName: fileMatch[1], src: fileMatch[2] });
      continue;
    }

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      push({ type: 'image', text: imgMatch[1] ?? '', src: imgMatch[2] });
      continue;
    }

    if (line.startsWith('### ')) {
      push({ type: 'h3', text: line.slice(4) });
      continue;
    }
    if (line.startsWith('## ')) {
      push({ type: 'h2', text: line.slice(3) });
      continue;
    }
    if (line.startsWith('# ')) {
      push({ type: 'h1', text: line.slice(2) });
      continue;
    }
    if (line.startsWith('> ')) {
      push({ type: 'quote', text: line.slice(2) });
      continue;
    }

    const todoMatch = line.match(/^- \[( |x|X)\] (.*)$/);
    if (todoMatch) {
      push({
        type: 'todo',
        text: todoMatch[2] ?? '',
        checked: todoMatch[1] !== ' ',
      });
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      push({ type: 'numbered', text: numberedMatch[2] ?? '' });
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      push({ type: 'bullet', text: line.slice(2) });
      continue;
    }

    push({ type: 'paragraph', text: line });
  }

  return blocksForEditor(blocks.length === 0 ? [{ id: allocateBlockId(), type: 'paragraph', text: '' }] : blocks);
}

export function blocksToMarkdown(blocks: DocumentBlock[]): string {
  let numbered = 0;
  const stored = blocksForStorage(blocks);

  const lines = stored.map((block) => {
    switch (block.type) {
      case 'h1':
        numbered = 0;
        return `# ${block.text}`;
      case 'h2':
        numbered = 0;
        return `## ${block.text}`;
      case 'h3':
        numbered = 0;
        return `### ${block.text}`;
      case 'quote':
        numbered = 0;
        return `> ${block.text}`;
      case 'bullet':
        numbered = 0;
        return `- ${block.text}`;
      case 'numbered': {
        numbered += 1;
        return `${numbered}. ${block.text}`;
      }
      case 'todo':
        numbered = 0;
        return `- [${block.checked ? 'x' : ' '}] ${block.text}`;
      case 'code':
        numbered = 0;
        return `\`\`\`\n${block.text}\n\`\`\``;
      case 'divider':
        numbered = 0;
        return '---';
      case 'image':
        numbered = 0;
        return `![${block.text}](${block.src ?? ''})`;
      case 'file':
        numbered = 0;
        return `📎 [${block.fileName ?? block.text}](${block.src ?? ''})`;
      default:
        numbered = 0;
        return block.text;
    }
  });

  return lines.join('\n');
}

export function applySlashToBlock(
  block: DocumentBlock,
  token: { start: number; end: number },
  slash: SlashBlock,
): { block: DocumentBlock; cursor: number } | { insertAfter: DocumentBlock } | null {
  const type = SLASH_BLOCK_TYPE[slash.id];
  if (!type) return null;

  if (type === 'image' || type === 'file') {
    return {
      insertAfter: {
        id: allocateBlockId(),
        type,
        text: type === 'image' ? '' : 'Файл',
        src: '',
        fileName: type === 'file' ? 'Файл' : undefined,
      },
    };
  }

  const before = block.text.slice(0, token.start);
  const after = block.text.slice(token.end);
  const text = `${before}${after}`;

  if (type === 'divider') {
    return { block: { ...block, type: 'divider', text: '' }, cursor: 0 };
  }
  if (type === 'code') {
    return { block: { ...block, type: 'code', text: '' }, cursor: 0 };
  }

  return {
    block: {
      ...block,
      type,
      text,
      checked: type === 'todo' ? false : block.checked,
    },
    cursor: before.length,
  };
}
