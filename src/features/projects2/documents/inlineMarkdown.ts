/** Спільний парсер інлайн-маркдауну (редактор + публічний перегляд). */

const TOKEN_RULES = [
  { re: /^`([^`\n]+)`/, html: (s: string) => `<code>${s}</code>`, open: '`', close: '`' },
  { re: /^\*\*([^*\n]+)\*\*/, html: (s: string) => `<strong>${s}</strong>`, open: '**', close: '**' },
  { re: /^~~([^~\n]+)~~/, html: (s: string) => `<s>${s}</s>`, open: '~~', close: '~~' },
  { re: /^\*([^*\n]+)\*/, html: (s: string) => `<em>${s}</em>`, open: '*', close: '*' },
] as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function markdownInlineToHtml(text: string): string {
  if (!text) return '';
  let html = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const rule of TOKEN_RULES) {
      const slice = text.slice(i);
      const m = slice.match(rule.re);
      if (!m) continue;
      const inner = escapeHtml(m[1] ?? '');
      html += rule.html(inner);
      i += m[0].length;
      matched = true;
      break;
    }
    if (!matched) {
      html += escapeHtml(text[i]!);
      i += 1;
    }
  }
  return html;
}

export type PlainIndexMap = {
  plain: string;
  /** plain[i] → індекс символу в markdown */
  plainToMd: number[];
  /** індекс у markdown після останнього plain-символу */
  plainEndMd: number;
};

export function buildPlainIndexMap(markdown: string): PlainIndexMap {
  const plainToMd: number[] = [];
  let plain = '';
  let i = 0;

  while (i < markdown.length) {
    let matched = false;
    for (const rule of TOKEN_RULES) {
      const m = markdown.slice(i).match(rule.re);
      if (!m) continue;
      const content = m[1] ?? '';
      const openLen = rule.open.length;
      for (let c = 0; c < content.length; c += 1) {
        plain += content[c]!;
        plainToMd.push(i + openLen + c);
      }
      i += m[0].length;
      matched = true;
      break;
    }
    if (!matched) {
      plain += markdown[i]!;
      plainToMd.push(i);
      i += 1;
    }
  }

  return { plain, plainToMd, plainEndMd: markdown.length };
}

export function plainOffsetToMd(map: PlainIndexMap, plainOffset: number): number {
  if (plainOffset <= 0) return 0;
  if (plainOffset >= map.plain.length) return map.plainEndMd;
  return map.plainToMd[plainOffset] ?? map.plainEndMd;
}

export function mdOffsetToPlain(map: PlainIndexMap, mdOffset: number): number {
  if (mdOffset <= 0) return 0;
  if (mdOffset >= map.plainEndMd) return map.plain.length;
  let best = 0;
  for (let p = 0; p < map.plain.length; p += 1) {
    const md = map.plainToMd[p] ?? 0;
    if (md <= mdOffset) best = p;
    else break;
  }
  if (map.plain.length > 0) {
    const lastMd = map.plainToMd[map.plain.length - 1] ?? 0;
    if (mdOffset > lastMd) return map.plain.length;
  }
  return best;
}

/** Прибирає зайві переноси — блок документа один рядок. */
export function sanitizeBlockMarkdown(markdown: string): string {
  return markdown.replace(/\u200b/g, '').replace(/\r\n/g, '\n').replace(/\n/g, ' ');
}
