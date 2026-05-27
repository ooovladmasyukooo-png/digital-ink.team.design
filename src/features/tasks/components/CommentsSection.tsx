import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { readImageFiles, readImagesFromDataTransfer } from '../commentAttachments';
import {
  filterMentionCandidates,
  getActiveMention,
  insertMention,
  mentionIdsFromBody,
  tokenizeCommentBody,
  type CommentToken,
} from '../commentMentions';
import { TASK_CREATOR_ASSIGNEE_ID } from '../constants';
import { activityActorName, formatActivityAt } from '../taskActivity';
import styles from '../tasks.module.css';
import type { TaskActivityEntry, TaskComment, TaskCommentAttachment } from '../types';
import { teamById } from '../taskOptions';

let nextCommentId = 3000;

function syncTextareaHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

type CommentsSectionView = 'comments' | 'history';

interface CommentsSectionProps {
  taskId: string;
  comments: TaskComment[];
  activityLog: TaskActivityEntry[];
  onChange: (comments: TaskComment[]) => void;
}

function TaskActivityHistory({ entries }: { entries: TaskActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className={styles['ts-drawer-empty']}>Поки немає змін по задачі.</p>;
  }

  return (
    <ul className={styles['ts-activity-list']}>
      {entries.map((entry) => {
        const actor = entry.actorId ? teamById[entry.actorId] : null;
        const actorName = activityActorName(entry.actorId);

        return (
          <li key={entry.id} className={styles['ts-activity-item']}>
            <div className={styles['ts-activity-main']}>
              <div className={styles['ts-activity-head']}>
                <div className={styles['ts-activity-who-row']}>
                  <Avatar name={actorName} hue={actor?.hue ?? 0} size="sm" />
                  <span className={styles['ts-activity-who']}>{actorName}</span>
                </div>
                <time className={styles['ts-activity-t']} dateTime={entry.at}>
                  {formatActivityAt(entry.at)}
                </time>
              </div>
              <p className={styles['ts-activity-x']}>{entry.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CommentBody({ body, mentionIds }: { body: string; mentionIds?: string[] }) {
  if (!body.trim()) return null;
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

function CommentAttachments({
  attachments,
  onRemove,
  onPreview,
  compact = false,
}: {
  attachments: TaskCommentAttachment[];
  onRemove?: (id: string) => void;
  onPreview?: (attachment: TaskCommentAttachment) => void;
  compact?: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul
      className={cx(styles['ts-comment-attachments'], compact && styles['ts-comment-attachments-compact'])}
    >
      {attachments.map((attachment) => (
        <li key={attachment.id} className={styles['ts-comment-attachment']}>
          {onPreview ? (
            <button
              type="button"
              className={styles['ts-comment-attachment-link']}
              onClick={() => onPreview(attachment)}
              title={attachment.name}
              aria-label={`Відкрити ${attachment.name}`}
            >
              <img src={attachment.dataUrl} alt={attachment.name} className={styles['ts-comment-attachment-img']} />
            </button>
          ) : (
            <span className={styles['ts-comment-attachment-link']}>
              <img src={attachment.dataUrl} alt={attachment.name} className={styles['ts-comment-attachment-img']} />
            </span>
          )}
          {onRemove ? (
            <button
              type="button"
              className={styles['ts-comment-attachment-remove']}
              onClick={() => onRemove(attachment.id)}
              aria-label={`Видалити ${attachment.name}`}
            >
              {Icons.close}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function CommentImageLightbox({
  attachment,
  onClose,
}: {
  attachment: TaskCommentAttachment;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles['ts-image-lightbox']}
      role="dialog"
      aria-modal="true"
      aria-label={attachment.name}
      onClick={onClose}
    >
      <button type="button" className={styles['ts-image-lightbox-close']} onClick={onClose} aria-label="Закрити">
        {Icons.close}
      </button>
      <img
        className={styles['ts-image-lightbox-img']}
        src={attachment.dataUrl}
        alt={attachment.name}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function CommentsSection({ taskId, comments, activityLog, onChange }: CommentsSectionProps) {
  const [view, setView] = useState<CommentsSectionView>('comments');
  const [draft, setDraft] = useState('');
  const [draftAttachments, setDraftAttachments] = useState<TaskCommentAttachment[]>([]);
  const [mentionCtx, setMentionCtx] = useState<{ start: number; query: string } | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [lightboxAttachment, setLightboxAttachment] = useState<TaskCommentAttachment | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commentsNewestFirst = [...comments].reverse();
  const mentionCandidates = mentionCtx ? filterMentionCandidates(mentionCtx.query) : [];
  const canSubmit = draft.trim().length > 0 || draftAttachments.length > 0;

  useEffect(() => {
    setView('comments');
    setDraft('');
    setDraftAttachments([]);
    setMentionCtx(null);
    setMentionIndex(0);
    setLightboxAttachment(null);
  }, [taskId]);

  const isHistory = view === 'history';

  useLayoutEffect(() => {
    syncTextareaHeight(inputRef.current);
  }, [draft]);

  const syncMention = (value: string, cursor: number) => {
    setMentionCtx(getActiveMention(value, cursor));
    setMentionIndex(0);
  };

  const addAttachments = (attachments: TaskCommentAttachment[]) => {
    if (attachments.length === 0) return;
    setDraftAttachments((current) => [...current, ...attachments]);
  };

  const onFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return;
    addAttachments(await readImageFiles(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const attachments = await readImagesFromDataTransfer(event.clipboardData);
    if (attachments.length === 0) return;
    event.preventDefault();
    addAttachments(attachments);
  };

  const submit = () => {
    const body = draft.trim();
    if (!body && draftAttachments.length === 0) return;
    onChange([
      ...comments,
      {
        id: `cm${nextCommentId++}`,
        at: new Date().toISOString(),
        authorId: TASK_CREATOR_ASSIGNEE_ID,
        body,
        mentionIds: body ? mentionIdsFromBody(body) : undefined,
        attachments: draftAttachments.length > 0 ? draftAttachments : undefined,
      },
    ]);
    setDraft('');
    setDraftAttachments([]);
    setMentionCtx(null);
    setMentionIndex(0);
    requestAnimationFrame(() => syncTextareaHeight(inputRef.current));
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
    syncTextareaHeight(el);
  };

  return (
    <section
      className={cx(
        styles['ts-drawer-block'],
        styles['ts-drawer-block-comments'],
        isHistory && styles['ts-drawer-block-history'],
      )}
    >
      <div className={styles['ts-drawer-block-head']}>
        <h3 className={styles['ts-drawer-block-title']}>{isHistory ? 'Історія змін' : 'Коментарі'}</h3>
        {!isHistory && comments.length > 0 ? (
          <span className={styles['ts-drawer-block-n']}>{comments.length}</span>
        ) : null}
        {isHistory && activityLog.length > 0 ? (
          <span className={styles['ts-drawer-block-n']}>{activityLog.length}</span>
        ) : null}
        <div className={styles['ts-drawer-block-head-actions']}>
          <button
            type="button"
            className={cx(styles['ts-drawer-block-tab'], isHistory && styles['ts-drawer-block-tab-on'])}
            onClick={() => setView(isHistory ? 'comments' : 'history')}
            aria-pressed={isHistory}
          >
            {isHistory ? 'Коментарі' : 'Історія'}
          </button>
        </div>
      </div>
      <div className={styles['ts-drawer-block-body']}>
        {isHistory ? (
          <TaskActivityHistory entries={activityLog} />
        ) : (
        <div className={styles['ts-comments-wrap']}>
          <div className={styles['ts-comment-compose']}>
            <div className={styles['ts-comment-compose-box']}>
              <CommentAttachments
                attachments={draftAttachments}
                compact
                onRemove={(id) => setDraftAttachments((current) => current.filter((item) => item.id !== id))}
              />

              <div className={styles['ts-comment-compose-input-row']}>
                <textarea
                  ref={inputRef}
                  className={styles['ts-comment-in']}
                  value={draft}
                  placeholder="Написати коментар… (@ — згадати, Ctrl+V — скріншот)"
                  rows={1}
                  onChange={(e) => onDraftChange(e.target.value)}
                  onPaste={onPaste}
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
                    if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                />

                <div className={styles['ts-comment-compose-actions']}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles['ts-comment-file-input']}
                    onChange={(e) => void onFilesSelected(e.target.files)}
                  />
                  <button
                    type="button"
                    className={styles['ts-comment-attach-btn']}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Додати зображення"
                  >
                    {Icons.description}
                  </button>
                  <button
                    type="button"
                    className={styles['ts-comment-send-btn']}
                    disabled={!canSubmit}
                    onClick={submit}
                    aria-label="Надіслати коментар"
                  >
                    {Icons.arrowU}
                  </button>
                </div>
              </div>
            </div>

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
                    <Avatar name={author?.name ?? 'Користувач'} hue={author?.hue ?? 0} size="sm" />
                    <div className={styles['ts-comment-main']}>
                      <div className={styles['ts-comment-head']}>
                        <span className={styles['ts-comment-author']}>{author?.name ?? 'Користувач'}</span>
                        <span className={styles['ts-comment-t']}>{formatActivityAt(comment.at)}</span>
                      </div>
                      <CommentAttachments
                        attachments={comment.attachments ?? []}
                        compact
                        onPreview={setLightboxAttachment}
                      />
                      <CommentBody body={comment.body} mentionIds={comment.mentionIds} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        )}
      </div>

      {lightboxAttachment ? (
        <CommentImageLightbox attachment={lightboxAttachment} onClose={() => setLightboxAttachment(null)} />
      ) : null}
    </section>
  );
}
