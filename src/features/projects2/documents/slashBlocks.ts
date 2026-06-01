export type SlashBlock = {
  id: string;
  label: string;
  hint: string;
  insert: string;
};

export const SLASH_BLOCKS: SlashBlock[] = [
  { id: 'h1', label: 'Заголовок 1', hint: 'Великий заголовок', insert: '# ' },
  { id: 'h2', label: 'Заголовок 2', hint: 'Середній заголовок', insert: '## ' },
  { id: 'h3', label: 'Заголовок 3', hint: 'Малий заголовок', insert: '### ' },
  { id: 'text', label: 'Текст', hint: 'Звичайний абзац', insert: '' },
  { id: 'bullet', label: 'Маркований список', hint: 'Пункти з •', insert: '- ' },
  { id: 'numbered', label: 'Нумерований список', hint: '1. 2. 3.', insert: '1. ' },
  { id: 'todo', label: 'Чекліст', hint: 'Задачі з галочками', insert: '- [ ] ' },
  { id: 'quote', label: 'Цитата', hint: 'Виділений блок', insert: '> ' },
  { id: 'code', label: 'Код', hint: 'Блок коду', insert: '```\n\n```' },
  { id: 'divider', label: 'Роздільник', hint: 'Горизонтальна лінія', insert: '\n---\n' },
  { id: 'image', label: 'Зображення', hint: 'Фото або скріншот', insert: '' },
  { id: 'file', label: 'Файл', hint: 'Вкладення для завантаження', insert: '' },
];

export function filterSlashBlocks(query: string): SlashBlock[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_BLOCKS;
  return SLASH_BLOCKS.filter(
    (block) =>
      block.label.toLowerCase().includes(q) ||
      block.hint.toLowerCase().includes(q) ||
      block.id.includes(q),
  );
}

/** Позиція `/запит` на поточному рядку (якщо є). */
export function findSlashToken(
  text: string,
  cursor: number,
): { start: number; end: number; query: string } | null {
  const before = text.slice(0, cursor);
  const lineStart = before.lastIndexOf('\n') + 1;
  const linePrefix = before.slice(lineStart);
  const match = linePrefix.match(/(?:^|\s)\/([^\n]*)$/);
  if (!match) return null;
  const query = match[1] ?? '';
  const slashAt = linePrefix.lastIndexOf('/');
  const start = lineStart + slashAt;
  return { start, end: cursor, query };
}

export function applySlashBlock(
  text: string,
  token: { start: number; end: number },
  insert: string,
): { next: string; cursor: number } {
  const lineStart = text.lastIndexOf('\n', token.start - 1) + 1;
  const lineEnd = text.indexOf('\n', token.end);
  const lineEndPos = lineEnd === -1 ? text.length : lineEnd;
  const line = text.slice(lineStart, lineEndPos);
  const trimmed = line.replace(/^\s*/, '');
  const indent = line.slice(0, line.length - trimmed.length);

  let block = insert;
  if (block.endsWith('```')) {
    block = `${indent}${block}`;
  } else if (block) {
    block = `${indent}${block}`;
  }

  const before = text.slice(0, lineStart);
  const after = text.slice(lineEndPos);
  const middle = block || '';
  const next = `${before}${middle}${after}`;
  const cursor = before.length + middle.length;
  return { next, cursor };
}
