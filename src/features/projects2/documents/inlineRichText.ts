import type { InlineFormatKind } from './inlineFormat';
import { toggleInlineFormat } from './inlineFormat';
import {
  buildPlainIndexMap,
  markdownInlineToHtml,
  mdOffsetToPlain,
  plainOffsetToMd,
  sanitizeBlockMarkdown,
} from './inlineMarkdown';

export { markdownInlineToHtml } from './inlineMarkdown';

function isEmptyRichRoot(root: HTMLElement): boolean {
  const text = (root.textContent ?? '').replace(/\u200b/g, '').trim();
  if (text) return false;
  const html = root.innerHTML.trim().toLowerCase();
  return !html || html === '<br>' || html === '<div><br></div>' || html === '<p><br></p>';
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  const inner = () => Array.from(el.childNodes).map(nodeToMarkdown).join('');

  const tag = el.tagName;
  if (tag === 'BR') return ' ';

  if (tag === 'STRONG' || tag === 'B') return `**${inner()}**`;
  if (tag === 'EM' || tag === 'I') return `*${inner()}*`;
  if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') return `~~${inner()}~~`;
  if (tag === 'CODE') return `\`${inner()}\``;

  if (tag === 'SPAN' || tag === 'FONT') {
    const weight = el.style.fontWeight;
    const deco = el.style.textDecoration;
    const content = inner();
    if (weight === 'bold' || Number.parseInt(weight, 10) >= 600) return `**${content}**`;
    if (deco.includes('line-through')) return `~~${content}~~`;
    if (el.style.fontStyle === 'italic') return `*${content}*`;
    return content;
  }

  if (tag === 'DIV' || tag === 'P') return inner();
  return inner();
}

/** Зчитує markdown з DOM contenteditable. */
export function htmlToMarkdown(root: HTMLElement): string {
  if (isEmptyRichRoot(root)) return '';
  const raw = Array.from(root.childNodes)
    .map(nodeToMarkdown)
    .join('')
    .replace(/\u00a0/g, ' ');
  return sanitizeBlockMarkdown(raw);
}

function measureOffset(root: HTMLElement, container: Node, nodeOffset: number): number {
  const probe = document.createRange();
  probe.selectNodeContents(root);
  probe.setEnd(container, nodeOffset);
  return probe.toString().replace(/\u00a0/g, ' ').length;
}

export function getSelectionOffsets(root: HTMLElement): { start: number; end: number } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { start: 0, end: 0 };
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return { start: 0, end: 0 };
  }

  const start = measureOffset(root, range.startContainer, range.startOffset);
  const end = measureOffset(root, range.endContainer, range.endOffset);
  return start <= end ? { start, end } : { start: end, end: start };
}

function locateTextOffset(root: HTMLElement, target: number): { node: Node; offset: number } {
  if (target <= 0) {
    const first = root.firstChild;
    if (first?.nodeType === Node.TEXT_NODE) return { node: first, offset: 0 };
    return { node: root, offset: 0 };
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = 0;
  let text = walker.nextNode() as Text | null;
  while (text) {
    const len = (text.textContent ?? '').replace(/\u00a0/g, ' ').length;
    if (current + len >= target) {
      return { node: text, offset: target - current };
    }
    current += len;
    text = walker.nextNode() as Text | null;
  }

  const last = root.lastChild;
  if (last?.nodeType === Node.TEXT_NODE) {
    const t = last as Text;
    return { node: t, offset: t.textContent?.length ?? 0 };
  }
  return { node: root, offset: root.childNodes.length };
}

export function setSelectionOffsets(root: HTMLElement, start: number, end: number) {
  const sel = window.getSelection();
  if (!sel) return;

  const a = locateTextOffset(root, start);
  const b = locateTextOffset(root, end);
  const range = document.createRange();
  range.setStart(a.node, a.offset);
  range.setEnd(b.node, b.offset);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function setRichFieldHtml(
  root: HTMLElement,
  markdown: string,
  selection?: { start: number; end: number },
) {
  const md = sanitizeBlockMarkdown(markdown);
  root.innerHTML = markdownInlineToHtml(md);
  root.dataset.empty = md ? 'false' : 'true';
  if (selection) setSelectionOffsets(root, selection.start, selection.end);
}

/** Підганяє DOM під markdown і повертає очищений текст. */
export function normalizeRichFieldDom(root: HTMLElement): string {
  const selection = getSelectionOffsets(root);
  const md = sanitizeBlockMarkdown(htmlToMarkdown(root));
  const html = markdownInlineToHtml(md);
  const normalized = root.innerHTML !== html;
  if (normalized) {
    root.innerHTML = html;
    root.dataset.empty = md ? 'false' : 'true';
    const map = buildPlainIndexMap(md);
    const safeStart = Math.min(selection.start, map.plain.length);
    const safeEnd = Math.min(selection.end, map.plain.length);
    setSelectionOffsets(root, safeStart, safeEnd);
  }
  return md;
}

export function applyInlineFormatToElement(
  root: HTMLElement,
  kind: InlineFormatKind,
): { text: string; selectionStart: number; selectionEnd: number; plainStart: number; plainEnd: number } {
  const md = normalizeRichFieldDom(root);
  const map = buildPlainIndexMap(md);
  const { start: plainStart, end: plainEnd } = getSelectionOffsets(root);
  if (plainStart === plainEnd) {
    return { text: md, selectionStart: plainStart, selectionEnd: plainEnd, plainStart, plainEnd };
  }

  const mdStart = plainOffsetToMd(map, plainStart);
  const mdEnd = plainOffsetToMd(map, plainEnd);
  const result = toggleInlineFormat(md, mdStart, mdEnd, kind);
  const nextMap = buildPlainIndexMap(result.text);

  const nextPlainStart = mdOffsetToPlain(nextMap, result.selectionStart);
  const nextPlainEnd = mdOffsetToPlain(nextMap, result.selectionEnd);

  setRichFieldHtml(root, result.text, { start: nextPlainStart, end: nextPlainEnd });
  return {
    text: result.text,
    selectionStart: result.selectionStart,
    selectionEnd: result.selectionEnd,
    plainStart: nextPlainStart,
    plainEnd: nextPlainEnd,
  };
}

export function focusRichField(
  root: HTMLElement,
  markdown: string,
  mdCursor = markdown.length,
  mdEnd = mdCursor,
) {
  const map = buildPlainIndexMap(sanitizeBlockMarkdown(markdown));
  const plainStart = mdOffsetToPlain(map, mdCursor);
  const plainEnd = mdOffsetToPlain(map, mdEnd);
  setRichFieldHtml(root, markdown, { start: plainStart, end: plainEnd });
  root.focus();
  resizeRichField(root);
}

export function resizeRichField(el: HTMLElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}
