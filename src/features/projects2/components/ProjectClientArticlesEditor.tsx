import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { TaskPickerPopover } from '../../tasks/components/TaskPickerPopover';
import { ProjectDatePicker } from './ProjectDatePicker';
import {
  buildArticleReferralUrl,
  getProjectArticle,
  PROJECT_ARTICLE_CATALOG,
} from '../projectArticleCatalog';
import {
  emptyClientArticleShare,
  normalizeClientArticleShares,
} from '../projectClientArticles';
import type { Project, ProjectClientArticleShare, ProjectPatch } from '../types';
import styles from '../projects2.module.css';

interface ProjectClientArticlesEditorProps {
  project: Project;
  onPatch: (patch: ProjectPatch) => void;
}

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;

function computeCommentPopPosition(anchor: HTMLElement, pop: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let pw = pop.offsetWidth || 220;
  let ph = pop.offsetHeight || 96;

  let top = rect.bottom + POP_GAP;
  if (top + ph > window.innerHeight - VIEWPORT_MARGIN) {
    const aboveTop = rect.top - POP_GAP - ph;
    if (aboveTop >= VIEWPORT_MARGIN) top = aboveTop;
  }

  let left = rect.right - pw;
  if (left + pw > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - pw;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  return { position: 'fixed', top, left, zIndex: 320 };
}

interface ArticleShareCommentPopoverProps {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  value: string;
  articleTitle: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

function ArticleShareCommentPopover({
  open,
  anchorRef,
  value,
  articleTitle,
  onChange,
  onClose,
}: ArticleShareCommentPopoverProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    setStyle(computeCommentPopPosition(anchor, pop));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    inputRef.current?.focus();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, onClose, reposition, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      className={styles['p2-settings-article-comment-pop']}
      style={style}
      role="dialog"
      aria-label={`Коментар до «${articleTitle}»`}
    >
      <textarea
        ref={inputRef}
        className={styles['p2-settings-article-comment-area']}
        value={value}
        rows={3}
        placeholder="Напр. Pyramid, контекст надсилання…"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>,
    document.body,
  );
}

interface ArticleShareRowProps {
  share: ProjectClientArticleShare;
  referralCode: string;
  onUpdate: (patch: Partial<ProjectClientArticleShare>) => void;
  onRemove: () => void;
  onCopyToast: (message: string) => void;
}

function ArticleShareRow({ share, referralCode, onUpdate, onRemove, onCopyToast }: ArticleShareRowProps) {
  const article = getProjectArticle(share.articleId);
  const [commentOpen, setCommentOpen] = useState(false);
  const commentRef = useRef<HTMLButtonElement>(null);

  if (!article) return null;

  const referralUrl = buildArticleReferralUrl(article.slug, referralCode);
  const hasComment = Boolean(share.comment.trim());

  const copyShareLink = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      onCopyToast('Посилання скопійовано');
    } catch {
      onCopyToast('Не вдалося скопіювати');
    }
  };

  return (
    <div className={styles['p2-settings-article-row']}>
      <span className={styles['p2-settings-article-title']} title={article.title}>
        {article.title}
      </span>
      <div className={styles['p2-settings-article-actions']}>
          <ProjectDatePicker
            id={`article-share-date-${share.id}`}
            compact
            className={cx(
              styles['p2-settings-article-date'],
              !share.sentAt.trim() && styles['p2-settings-article-date-empty'],
            )}
            value={share.sentAt}
            onSelect={(sentAt) => onUpdate({ sentAt })}
          />
          <button
            ref={commentRef}
            type="button"
            className={cx(
              styles['p2-settings-article-comment-btn'],
              hasComment && styles['p2-settings-article-comment-btn-on'],
            )}
            aria-label={hasComment ? `Коментар: ${share.comment}` : 'Додати коментар'}
            title={hasComment ? share.comment : 'Коментар'}
            onClick={() => setCommentOpen((open) => !open)}
          >
            {Icons.description}
          </button>
          <button
            type="button"
            className={styles['p2-settings-article-copy']}
            disabled={!referralUrl}
            aria-label={`Копіювати посилання: ${article.title}`}
            title="Копіювати посилання"
            onClick={copyShareLink}
          >
            {Icons.duplicate}
          </button>
          <button
            type="button"
            className={styles['p2-settings-article-remove']}
            aria-label={`Прибрати «${article.title}»`}
            onClick={onRemove}
          >
          {Icons.close}
        </button>
      </div>

      <ArticleShareCommentPopover
        open={commentOpen}
        anchorRef={commentRef}
        value={share.comment}
        articleTitle={article.title}
        onChange={(comment) => onUpdate({ comment })}
        onClose={() => setCommentOpen(false)}
      />
    </div>
  );
}

export function ProjectClientArticlesEditor({ project, onPatch }: ProjectClientArticlesEditorProps) {
  const shares = normalizeClientArticleShares(project.clientArticleShares);
  const referralCode = project.referralCode ?? '';
  const [pickerOpen, setPickerOpen] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const addRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!copyToast) return;
    const timer = window.setTimeout(() => setCopyToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

  const persistShares = (next: ProjectClientArticleShare[]) => {
    onPatch({ clientArticleShares: next });
  };

  const assignedIds = new Set(shares.map((share) => share.articleId));
  const availableArticles = PROJECT_ARTICLE_CATALOG.filter((article) => !assignedIds.has(article.id));

  const addArticle = (articleId: string) => {
    persistShares([...shares, emptyClientArticleShare(articleId)]);
    setPickerOpen(false);
  };

  const updateShare = (id: string, patch: Partial<ProjectClientArticleShare>) => {
    persistShares(shares.map((share) => (share.id === id ? { ...share, ...patch } : share)));
  };

  const removeShare = (id: string) => {
    persistShares(shares.filter((share) => share.id !== id));
  };

  return (
    <div className={styles['p2-settings-articles']}>
      {!referralCode.trim() ? (
        <p className={styles['p2-settings-articles-hint']}>Спочатку вкажіть реф. код.</p>
      ) : null}

      {shares.map((share) => (
        <ArticleShareRow
          key={share.id}
          share={share}
          referralCode={referralCode}
          onUpdate={(patch) => updateShare(share.id, patch)}
          onRemove={() => removeShare(share.id)}
          onCopyToast={setCopyToast}
        />
      ))}

      <button
        ref={addRef}
        type="button"
        className={styles['p2-settings-contact-add']}
        disabled={!referralCode.trim() || availableArticles.length === 0}
        onClick={() => setPickerOpen((open) => !open)}
      >
        {Icons.plus} Додати статтю
      </button>

      {pickerOpen ? (
        <TaskPickerPopover
          open
          anchorRef={addRef}
          items={availableArticles.map((article) => ({
            id: article.id,
            label: article.title,
            searchText: article.title,
          }))}
          width={240}
          searchable
          compact
          onClose={() => setPickerOpen(false)}
          onSelect={addArticle}
        />
      ) : null}

      {copyToast ? (
        <div className={styles['p2-settings-copy-toast']} role="status" aria-live="polite">
          {copyToast}
        </div>
      ) : null}
    </div>
  );
}
