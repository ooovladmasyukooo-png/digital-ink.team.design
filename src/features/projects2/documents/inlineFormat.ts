export type InlineFormatKind = 'bold' | 'italic' | 'strike' | 'code';

const WRAP: Record<InlineFormatKind, [string, string]> = {
  bold: ['**', '**'],
  italic: ['*', '*'],
  strike: ['~~', '~~'],
  code: ['`', '`'],
};

/** Обгортає виділення маркдауном або знімає обгортку, якщо вже є. */
export function toggleInlineFormat(
  text: string,
  start: number,
  end: number,
  kind: InlineFormatKind,
): { text: string; selectionStart: number; selectionEnd: number } {
  const [open, close] = WRAP[kind];
  if (start === end) return { text, selectionStart: start, selectionEnd: end };

  let s = start;
  let e = end;

  if (text.slice(s - open.length, s) === open && text.slice(e, e + close.length) === close) {
    s -= open.length;
    e += close.length;
  }

  const selected = text.slice(s, e);
  if (!selected) return { text, selectionStart: start, selectionEnd: end };

  if (selected.startsWith(open) && selected.endsWith(close)) {
    const inner = selected.slice(open.length, selected.length - close.length);
    const next = text.slice(0, s) + inner + text.slice(e);
    return { text: next, selectionStart: s, selectionEnd: s + inner.length };
  }

  const wrapped = `${open}${selected}${close}`;
  const next = text.slice(0, s) + wrapped + text.slice(e);
  return {
    text: next,
    selectionStart: s,
    selectionEnd: s + wrapped.length,
  };
}

export function wrapInlineFormat(
  text: string,
  start: number,
  end: number,
  kind: InlineFormatKind,
): { text: string; selectionStart: number; selectionEnd: number } {
  const [open, close] = WRAP[kind];
  const selected = text.slice(start, end);
  if (!selected) return { text, selectionStart: start, selectionEnd: end };
  const wrapped = `${open}${selected}${close}`;
  const next = text.slice(0, start) + wrapped + text.slice(end);
  return {
    text: next,
    selectionStart: start,
    selectionEnd: start + wrapped.length,
  };
}
