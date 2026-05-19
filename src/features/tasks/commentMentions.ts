import { teamMembers } from '../team/data';
import { teamById } from './taskOptions';

export interface CommentToken {
  type: 'text' | 'mention';
  value: string;
  memberId?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function mentionIdsFromBody(body: string): string[] {
  const ids = new Set<string>();
  for (const member of teamMembers) {
    if (body.includes(`@${member.name}`)) ids.add(member.id);
  }
  return [...ids];
}

export function tokenizeCommentBody(body: string, mentionIds?: string[]): CommentToken[] {
  const mentionNames = new Set<string>();
  for (const id of mentionIds ?? []) {
    const name = teamById[id]?.name;
    if (name) mentionNames.add(name);
  }
  for (const member of teamMembers) {
    if (body.includes(`@${member.name}`)) mentionNames.add(member.name);
  }

  const sorted = [...mentionNames].sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return [{ type: 'text', value: body }];

  const pattern = new RegExp(`@(${sorted.map(escapeRegExp).join('|')})`, 'g');
  const tokens: CommentToken[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body)) !== null) {
    if (match.index > last) {
      tokens.push({ type: 'text', value: body.slice(last, match.index) });
    }
    const name = match[1];
    const member = teamMembers.find((m) => m.name === name);
    tokens.push({ type: 'mention', value: name, memberId: member?.id });
    last = match.index + match[0].length;
  }

  if (last < body.length) {
    tokens.push({ type: 'text', value: body.slice(last) });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', value: body }];
}

export function insertMention(
  value: string,
  selectionStart: number,
  mentionStart: number,
  memberName: string,
): { nextValue: string; cursor: number } {
  const before = value.slice(0, mentionStart);
  const after = value.slice(selectionStart);
  const tag = `@${memberName} `;
  const nextValue = `${before}${tag}${after}`;
  return { nextValue, cursor: before.length + tag.length };
}

export function getActiveMention(
  value: string,
  cursor: number,
): { start: number; query: string } | null {
  const head = value.slice(0, cursor);
  const at = head.lastIndexOf('@');
  if (at < 0) return null;
  const between = head.slice(at + 1);
  if (between.includes('\n') || /\s{2,}/.test(between)) return null;
  if (at > 0 && !/\s/.test(head[at - 1]!)) return null;
  return { start: at, query: between };
}

export function filterMentionCandidates(query: string) {
  const q = query.trim().toLowerCase();
  return teamMembers.filter((member) => {
    if (member.status === 'paused') return false;
    if (!q) return true;
    return (
      member.name.toLowerCase().includes(q) ||
      member.username.toLowerCase().includes(q) ||
      member.id.toLowerCase().includes(q)
    );
  });
}
