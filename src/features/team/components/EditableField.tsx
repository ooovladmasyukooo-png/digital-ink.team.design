import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../../shared/styles/cx';
import styles from '../team.module.css';
import type { TeamMemberPatch } from '../types';
import { TeamDatePicker } from './TeamDatePicker';

interface EditableFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  fieldKey: keyof TeamMemberPatch;
  multiline?: boolean;
  /** Календар у стилі CRM; значення DD.MM.YYYY */
  date?: boolean;
  onSave: (field: keyof TeamMemberPatch, value: string) => void;
}

export function EditableField({
  icon,
  label,
  value,
  fieldKey,
  multiline,
  date,
  onSave,
}: EditableFieldProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useLayoutEffect(() => {
    if (!multiline) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [multiline, draft]);

  const commit = () => {
    setFocused(false);
    if (draft !== value) onSave(fieldKey, draft);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !multiline) {
      event.preventDefault();
      event.currentTarget.blur();
    }

    if (event.key === 'Escape') {
      setDraft(value);
      event.currentTarget.blur();
    }
  };

  const className = cx(styles['field-in'], focused && styles.focus);

  const dateFieldId = `team-field-date-${String(fieldKey)}`;

  const bind = {
    className,
    onFocus: () => setFocused(true),
    onBlur: commit,
    onKeyDown: handleKeyDown,
  };

  return (
    <div className={cx(styles.field, multiline && !date && styles['field-long'])}>
      <div className={styles['field-l']}>
        <span className={styles['field-i']}>{icon}</span>
        <span className={styles['field-k']}>{label}</span>
      </div>
      <div className={styles['field-v-wrap']}>
        {date ? (
          <TeamDatePicker
            id={dateFieldId}
            value={draft}
            onSelect={(next) => {
              setFocused(false);
              setDraft(next);
              if (next !== value) onSave(fieldKey, next);
            }}
          />
        ) : multiline ? (
          <textarea {...bind} ref={textareaRef} rows={1} placeholder="-" value={draft} onChange={(event) => setDraft(event.target.value)} />
        ) : (
          <input {...bind} type="text" placeholder="-" value={draft} onChange={(event) => setDraft(event.target.value)} />
        )}
      </div>
    </div>
  );
}
