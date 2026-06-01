import { useId, useRef, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { isDocumentImageIcon } from '../documents/dateDisplay';
import { renderDocumentIcon } from '../documents/docIcon';
import type { ProjectDocument } from '../documents/types';
import styles from '../projects2.module.css';

const EMOJI_OPTIONS = ['📄', '📝', '📌', '⭐', '💡', '🔥', '✅', '👍', '🎨', '📎', '🗂️', '❤️', '🚀', '📷'];

const MAX_ICON_BYTES = 120_000;

interface DocumentPageIconPickerProps {
  document: ProjectDocument;
  onIconChange: (icon: string | null) => void;
}

export function DocumentPageIconPicker({ document, onIconChange }: DocumentPageIconPickerProps) {
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > MAX_ICON_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') onIconChange(result);
      setOpen(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles['p2-doc-icon-picker']}>
      <button
        type="button"
        className={styles['p2-doc-icon-trigger']}
        aria-label="Іконка сторінки"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {document.icon && isDocumentImageIcon(document.icon) ? (
          <img src={document.icon} alt="" className={styles['p2-doc-icon-trigger-img']} />
        ) : (
          renderDocumentIcon(
            document,
            styles['p2-doc-icon-trigger-ic'],
            styles['p2-doc-icon-trigger-img'],
            styles['p2-doc-icon-trigger-emoji'],
          )
        )}
      </button>
      {open ? (
        <div className={styles['p2-doc-icon-popover']} role="dialog" aria-label="Обрати іконку">
          <div className={styles['p2-doc-icon-emoji-grid']}>
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={cx(
                  styles['p2-doc-icon-emoji'],
                  document.icon === emoji && styles['p2-doc-icon-emoji-on'],
                )}
                onClick={() => {
                  onIconChange(emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/*"
            className={styles['p2-doc-icon-file']}
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className={styles['p2-doc-icon-upload']}
            onClick={() => fileRef.current?.click()}
          >
            {Icons.camera}
            <span>Завантажити</span>
          </button>
          {document.icon ? (
            <button type="button" className={styles['p2-doc-icon-clear']} onClick={() => onIconChange(null)}>
              Прибрати іконку
            </button>
          ) : null}
        </div>
      ) : null}
      {open ? (
        <button
          type="button"
          className={styles['p2-doc-icon-backdrop']}
          aria-label="Закрити"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
