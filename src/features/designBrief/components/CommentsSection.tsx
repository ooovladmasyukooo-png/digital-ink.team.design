import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { DESIGN_BRIEF_CREATOR_ID } from '../constants';
import { readImageFiles, readImagesFromDataTransfer } from '../commentAttachments';
import {
  filterMentionCandidates,
  getActiveMention,
  insertMention,
  mentionIdsFromBody,
  tokenizeCommentBody,
  type CommentToken,
} from '../commentMentions';
import { formatActivityAt } from '../designBriefActivity';
import styles from '../designBrief.module.css';
import type { DesignBriefComment, DesignBriefCommentAttachment } from '../types';
import { teamById } from '../designBriefOptions';

let nextCommentId = 3000;

function syncTextareaHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

interface CommentsSectionProps {
  briefId: string;
  comments: DesignBriefComment[];
  onChange: (comments: DesignBriefComment[]) => void;
}

function CommentBody({ body, mentionIds }: { body: string; mentionIds?: string[] }) {
  if (!body.trim()) return null;
  const tokens = tokenizeCommentBody(body, mentionIds);
  return (
    <p className={styles['db-comment-body']}>
      {tokens.map((token, index) => (
        <CommentTokenSpan key={`${index}-${token.type}-${token.value}`} token={token} />
      ))}
    </p>
  );
}

function CommentTokenSpan({ token }: { token: CommentToken }) {
  if (token.type === 'mention') {
    return <span className={styles['db-comment-mention']}>@{token.value}</span>;
  }
  return <>{token.value}</>;
}

function CommentAttachments({
  attachments,
  onRemove,
  onPreview,
  compact = false,
  side = false,
}: {
  attachments: DesignBriefCommentAttachment[];
  onRemove?: (id: string) => void;
  onPreview?: (attachment: DesignBriefCommentAttachment) => void;
  compact?: boolean;
  side?: boolean;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul
      className={cx(
        styles['db-comment-attachments'],
        compact && styles['db-comment-attachments-compact'],
        side && styles['db-comment-attachments-side'],
      )}
    >
      {attachments.map((attachment) => (
        <li key={attachment.id} className={styles['db-comment-attachment']}>
          {onPreview ? (
            <button
              type="button"
              className={styles['db-comment-attachment-link']}
              onClick={() => onPreview(attachment)}
              title={attachment.name}
              aria-label={`Відкрити ${attachment.name}`}
            >
              <img src={attachment.dataUrl} alt={attachment.name} className={styles['db-comment-attachment-img']} />
            </button>
          ) : (
            <span className={styles['db-comment-attachment-link']}>
              <img src={attachment.dataUrl} alt={attachment.name} className={styles['db-comment-attachment-img']} />
            </span>
          )}
          {onRemove ? (
            <button
              type="button"
              className={styles['db-comment-attachment-remove']}
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
  attachment: DesignBriefCommentAttachment;
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
      className={styles['db-image-lightbox']}
      role="dialog"
      aria-modal="true"
      aria-label={attachment.name}
      onClick={onClose}
    >
      <button
        type="button"
        className={styles['db-image-lightbox-close']}
        onClick={onClose}
        aria-label="Закрити"
      >
        {Icons.close}
      </button>
      <img
        className={styles['db-image-lightbox-img']}
        src={attachment.dataUrl}
        alt={attachment.name}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function CommentsSection({ briefId, comments, onChange }: CommentsSectionProps) {
  const [draft, setDraft] = useState('');
  const [draftAttachments, setDraftAttachments] = useState<DesignBriefCommentAttachment[]>([]);
  const [mentionCtx, setMentionCtx] = useState<{ start: number; query: string } | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [lightboxAttachment, setLightboxAttachment] = useState<DesignBriefCommentAttachment | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commentsNewestFirst = [...comments].reverse();
  const mentionCandidates = mentionCtx ? filterMentionCandidates(mentionCtx.query) : [];
  const canSubmit = draft.trim().length > 0 || draftAttachments.length > 0;

  useEffect(() => {
    setDraft('');
    setDraftAttachments([]);
    setMentionCtx(null);
    setMentionIndex(0);
    setLightboxAttachment(null);
  }, [briefId]);

  useLayoutEffect(() => {
    syncTextareaHeight(inputRef.current);
  }, [draft]);

  const syncMention = (value: string, cursor: number) => {
    setMentionCtx(getActiveMention(value, cursor));
    setMentionIndex(0);
  };

  const addAttachments = (attachments: DesignBriefCommentAttachment[]) => {
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
        authorId: DESIGN_BRIEF_CREATOR_ID,
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
    <section className={cx(styles['db-drawer-block'], styles['db-drawer-block-comments'])}>
      <div className={styles['db-drawer-block-head']}>
        <h3 className={styles['db-drawer-block-title']}>Коментарі</h3>
        {comments.length > 0 ? <span className={styles['db-drawer-block-n']}>{comments.length}</span> : null}
      </div>
      <div className={styles['db-drawer-block-body']}>
        <div className={styles['db-comments-wrap']}>
          <div className={styles['db-comment-compose']}>
            <div className={styles['db-comment-compose-box']}>
              <CommentAttachments
                attachments={draftAttachments}
                compact
                onRemove={(id) => setDraftAttachments((current) => current.filter((item) => item.id !== id))}
              />

              <div className={styles['db-comment-compose-input-row']}>
                <textarea
                  ref={inputRef}
                  className={styles['db-comment-in']}
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

                <div className={styles['db-comment-compose-actions']}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles['db-comment-file-input']}
                    onChange={(e) => void onFilesSelected(e.target.files)}
                  />
                  <button
                    type="button"
                    className={styles['db-comment-attach-btn']}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Додати файл"
                  >
                    {Icons.description}
                  </button>
                  <button
                    type="button"
                    className={styles['db-comment-send-btn']}
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
              <ul className={styles['db-mention-menu']} role="listbox">
                {mentionCandidates.map((member, index) => (
                  <li key={member.id} role="option" aria-selected={index === mentionIndex}>
                    <button
                      type="button"
                      className={cx(
                        styles['db-mention-item'],
                        index === mentionIndex && styles['db-mention-item-on'],
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickMention(member.id)}
                    >
                      <Avatar name={member.name} hue={member.hue} size="sm" />
                      <span className={styles['db-mention-name']}>{member.name}</span>
                      <span className={styles['db-mention-user']}>@{member.username}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {commentsNewestFirst.length > 0 ? (
            <ul className={styles['db-comments']}>
              {commentsNewestFirst.map((comment) => {
                const author = teamById[comment.authorId];
                return (
                  <li key={comment.id} className={styles['db-comment']}>
                    <Avatar name={author?.name ?? 'Користувач'} hue={author?.hue ?? 0} size="sm" />
                    <div className={styles['db-comment-main']}>
                      <div className={styles['db-comment-head']}>
                        <span className={styles['db-comment-author']}>{author?.name ?? 'Користувач'}</span>
                        <span className={styles['db-comment-t']}>{formatActivityAt(comment.at)}</span>
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
      </div>

      {lightboxAttachment ? (
        <CommentImageLightbox attachment={lightboxAttachment} onClose={() => setLightboxAttachment(null)} />
      ) : null}
    </section>
  );
}
