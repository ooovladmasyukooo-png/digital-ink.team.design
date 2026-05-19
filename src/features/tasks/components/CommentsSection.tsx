import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import { TASK_CREATOR_ASSIGNEE_ID } from '../constants';
import {
  filterMentionCandidates,
  getActiveMention,
  insertMention,
  mentionIdsFromBody,
  tokenizeCommentBody,
  type CommentToken,
} from '../commentMentions';
import { formatActivityAt } from '../taskActivity';
import styles from '../tasks.module.css';
import type { TaskComment } from '../types';
import { teamById } from '../taskOptions';

let nextCommentId = 3000;

interface CommentsSectionProps {
  taskId: string;
  comments: TaskComment[];
  onChange: (comments: TaskComment[]) => void;
}

function CommentBody({ body, mentionIds }: { body: string; mentionIds?: string[] }) {
  const tokens = tokenizeCommentBody(body, mentionIds);
  return (
    <p className={styles['ts-comment-body']}>
      {tokens.map((token, index) => (
        <CommentTokenSpan key={`${index}-${token.type}-${token.value}`} token={token} />
      ))}
    </p>
  );
}

function CommentTokenSpan({ token }: { token: CommentToken }) {
  if (token.type === 'mention') {
    return <span className={styles['ts-comment-mention']}>@{token.value}</span>;
  }
  return <>{token.value}</>;
}

export function CommentsSection({ taskId, comments, onChange }: CommentsSectionProps) {
  const [draft, setDraft] = useState('');
  const [mentionCtx, setMentionCtx] = useState<{ start: number; query: string } | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const commentsNewestFirst = [...comments].reverse();
  const mentionCandidates = mentionCtx ? filterMentionCandidates(mentionCtx.query) : [];

  useEffect(() => {
    setDraft('');
    setMentionCtx(null);
    setMentionIndex(0);
  }, [taskId]);

  const syncMention = (value: string, cursor: number) => {
    setMentionCtx(getActiveMention(value, cursor));
    setMentionIndex(0);
  };

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    onChange([
      ...comments,
      {
        id: `cm${nextCommentId++}`,
        at: new Date().toISOString(),
        authorId: TASK_CREATOR_ASSIGNEE_ID,
        body,
        mentionIds: mentionIdsFromBody(body),
      },
    ]);
    setDraft('');
    setMentionCtx(null);
    setMentionIndex(0);
  };

  const pickMention = (memberId: string) => {
    const member = teamById[memberId];
    const el = inputRef.current;
    if (!member || !mentionCtx || !el) return;

    const { nextValue, cursor } = insertMention(draft, el.selectionStart, mentionCtx.start, member.name);
    setDraft(nextValue);
    setMentionCtx(null);
    setMentionIndex(0);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    const el = inputRef.current;
    syncMention(value, el?.selectionStart ?? value.length);
  };

  return (
    <section className={cx(styles['ts-drawer-block'], styles['ts-drawer-block-comments'])}>
      <div className={styles['ts-drawer-block-head']}>
        <h3 className={styles['ts-drawer-block-title']}>Коментарі</h3>
        {comments.length > 0 ? <span className={styles['ts-drawer-block-n']}>{comments.length}</span> : null}
      </div>
      <div className={styles['ts-drawer-block-body']}>
        <div className={styles['ts-comments-wrap']}>
          <div className={styles['ts-comment-compose']}>
            <textarea
              ref={inputRef}
              className={styles['ts-comment-in']}
              value={draft}
              placeholder="Написати коментар… (@ — згадати колегу)"
              rows={2}
              onChange={(e) => onDraftChange(e.target.value)}
              onClick={(e) => syncMention(draft, e.currentTarget.selectionStart)}
              onKeyUp={(e) => syncMention(draft, e.currentTarget.selectionStart)}
              onKeyDown={(e) => {
                if (mentionCandidates.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setMentionIndex((i) => (i + 1) % mentionCandidates.length);
                    return;
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length);
                    return;
                  }
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    pickMention(mentionCandidates[mentionIndex]!.id);
                    return;
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setMentionCtx(null);
                    setMentionIndex(0);
                    return;
                  }
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            {mentionCandidates.length > 0 ? (
              <ul className={styles['ts-mention-menu']} role="listbox">
                {mentionCandidates.map((member, index) => (
                  <li key={member.id} role="option" aria-selected={index === mentionIndex}>
                    <button
                      type="button"
                      className={cx(
                        styles['ts-mention-item'],
                        index === mentionIndex && styles['ts-mention-item-on'],
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickMention(member.id)}
                    >
                      <Avatar name={member.name} hue={member.hue} size="sm" />
                      <span className={styles['ts-mention-name']}>{member.name}</span>
                      <span className={styles['ts-mention-user']}>@{member.username}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {commentsNewestFirst.length > 0 ? (
            <ul className={styles['ts-comments']}>
              {commentsNewestFirst.map((comment) => {
                const author = teamById[comment.authorId];
                return (
                  <li key={comment.id} className={styles['ts-comment']}>
                    <Avatar
                      name={author?.name ?? 'Користувач'}
                      hue={author?.hue ?? 0}
                      size="sm"
                    />
                    <div className={styles['ts-comment-main']}>
                      <div className={styles['ts-comment-head']}>
                        <span className={styles['ts-comment-author']}>{author?.name ?? 'Користувач'}</span>
                        <span className={styles['ts-comment-t']}>{formatActivityAt(comment.at)}</span>
                      </div>
                      <CommentBody body={comment.body} mentionIds={comment.mentionIds} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
