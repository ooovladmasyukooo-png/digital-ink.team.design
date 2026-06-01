import { markdownInlineToHtml } from './inlineMarkdown';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMarkdown(text: string): string {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: string[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(text))) {
    parts.push(markdownInlineToHtml(text.slice(last, match.index)));
    parts.push(
      `<a href="${escapeAttr(match[2] ?? '')}" target="_blank" rel="noreferrer">${markdownInlineToHtml(match[1] ?? '')}</a>`,
    );
    last = match.index + match[0].length;
  }
  parts.push(markdownInlineToHtml(text.slice(last)));
  return parts.join('');
}

/** Легкий перегляд Markdown без зовнішніх залежностей. */
export function renderSimpleMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let inCode = false;
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('```')) {
      closeList();
      if (!inCode) {
        inCode = true;
        html.push('<pre><code>');
      } else {
        inCode = false;
        html.push('</code></pre>');
      }
      continue;
    }

    if (inCode) {
      html.push(`${escapeHtml(raw)}\n`);
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    const fileMatch = line.match(/^📎\s+\[([^\]]+)\]\(([^)]+)\)$/);
    if (fileMatch) {
      closeList();
      const name = escapeHtml(fileMatch[1] ?? 'Файл');
      const href = escapeHtml(fileMatch[2] ?? '#');
      html.push(
        `<p class="p2-doc-attach"><a href="${href}" download="${name}" target="_blank" rel="noreferrer">📎 ${name}</a></p>`,
      );
      continue;
    }

    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      closeList();
      const alt = escapeHtml(imgMatch[1] ?? '');
      const src = escapeHtml(imgMatch[2] ?? '');
      html.push(
        `<figure class="p2-doc-figure"><img src="${src}" alt="${alt}" loading="lazy" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`,
      );
      continue;
    }

    if (line.startsWith('### ')) {
      closeList();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      closeList();
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    const todoMatch = line.match(/^- \[( |x|X)\] (.*)$/);
    if (todoMatch) {
      closeList();
      const checked = todoMatch[1] !== ' ';
      html.push(
        `<p class="p2-doc-todo"><input type="checkbox" disabled${checked ? ' checked' : ''} /> ${inlineMarkdown(todoMatch[2] ?? '')}</p>`,
      );
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  closeList();
  if (inCode) html.push('</code></pre>');
  return html.join('');
}
