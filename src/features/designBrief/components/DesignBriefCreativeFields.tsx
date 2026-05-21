import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { DESIGN_BRIEF_FORMAT_OPTIONS, DESIGN_BRIEF_SIZE_OPTIONS, createEmptyCopyVariant, defaultCopyVariantLabel } from '../constants';
import styles from '../designBrief.module.css';
import type {
  DesignBriefCopyVariant,
  DesignBriefFormat,
  DesignBriefPatch,
  DesignBriefReferenceLink,
  DesignBriefSize,
} from '../types';

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function syncTextareaHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

interface MultiSelectRowProps<T extends string> {
  label: string;
  options: { id: T; label: string }[];
  values: T[];
  onChange: (values: T[]) => void;
  renderOptionIcon?: (id: T) => ReactNode;
}

function MultiSelectRow<T extends string>({
  label,
  options,
  values,
  onChange,
  renderOptionIcon,
}: MultiSelectRowProps<T>) {
  return (
    <div className={styles['db-detail-row']}>
      <span className={styles['db-detail-k']}>{label}</span>
      <div className={styles['db-detail-chip-row']} role="group" aria-label={label}>
        {options.map((option) => {
          const selected = values.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={cx(styles['db-detail-chip'], selected && styles['db-detail-chip-on'])}
              aria-pressed={selected}
              onClick={() => onChange(toggleValue(values, option.id))}
            >
              {renderOptionIcon ? renderOptionIcon(option.id) : null}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SIZE_ASPECT_RATIOS: Record<DesignBriefSize, string> = {
  '1:1': '1 / 1',
  '4:5': '4 / 5',
  '16:9': '16 / 9',
  '9:16': '9 / 16',
};

function AspectRatioIcon({ size }: { size: DesignBriefSize }) {
  return (
    <span
      className={styles['db-detail-ratio']}
      style={{ aspectRatio: SIZE_ASPECT_RATIOS[size] }}
      aria-hidden
    />
  );
}

interface DesignBriefFormatSizeRowsProps {
  format: DesignBriefFormat | null;
  sizes: DesignBriefSize[];
  onPatch: (patch: DesignBriefPatch) => void;
}

function SingleSelectRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    <div className={styles['db-detail-row']}>
      <span className={styles['db-detail-k']}>{label}</span>
      <div className={styles['db-detail-chip-row']} role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              className={cx(styles['db-detail-chip'], selected && styles['db-detail-chip-on'])}
              aria-checked={selected}
              onClick={() => onChange(selected ? null : option.id)}
            >
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DesignBriefFormatSizeRows({ format, sizes, onPatch }: DesignBriefFormatSizeRowsProps) {
  return (
    <>
      <SingleSelectRow
        label="Формат"
        options={DESIGN_BRIEF_FORMAT_OPTIONS}
        value={format}
        onChange={(next) => onPatch({ format: next })}
      />
      <MultiSelectRow
        label="Розміри"
        options={DESIGN_BRIEF_SIZE_OPTIONS}
        values={sizes}
        onChange={(next) => onPatch({ sizes: next })}
        renderOptionIcon={(size) => <AspectRatioIcon size={size} />}
      />
    </>
  );
}

interface DesignBriefCopyTextBlockProps {
  briefId: string;
  copyVariants: DesignBriefCopyVariant[];
  onPatch: (patch: DesignBriefPatch) => void;
}

function CopyVariantInput({
  index,
  body,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number;
  body: string;
  canRemove: boolean;
  onChange: (body: string) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    syncTextareaHeight(ref.current);
  }, [body]);

  return (
    <div className={styles['db-copy-item']}>
      <textarea
        ref={ref}
        className={styles['db-copy-field']}
        value={body}
        placeholder="CTA, заголовок, підпис…"
        rows={3}
        onChange={(e) => {
          onChange(e.target.value);
          syncTextareaHeight(e.target);
        }}
        aria-label={defaultCopyVariantLabel(index)}
      />
      {canRemove ? (
        <button
          type="button"
          className={styles['db-copy-remove']}
          onClick={onRemove}
          aria-label={`Видалити ${defaultCopyVariantLabel(index)}`}
        >
          {Icons.trash}
        </button>
      ) : null}
    </div>
  );
}

export function DesignBriefCopyTextBlock({ briefId, copyVariants, onPatch }: DesignBriefCopyTextBlockProps) {
  const variants = copyVariants.length > 0 ? copyVariants : [createEmptyCopyVariant()];
  const canRemove = variants.length > 1;

  useEffect(() => {
    if (copyVariants.length === 0) {
      onPatch({ copyVariants: [createEmptyCopyVariant()] });
    }
  }, [briefId, copyVariants.length, onPatch]);

  const patchVariants = (next: DesignBriefCopyVariant[]) => {
    onPatch({ copyVariants: next });
  };

  const addVariant = () => {
    patchVariants([...variants, createEmptyCopyVariant()]);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) return;
    patchVariants(variants.filter((variant) => variant.id !== id));
  };

  const updateVariant = (id: string, body: string) => {
    patchVariants(variants.map((variant) => (variant.id === id ? { ...variant, body } : variant)));
  };

  return (
    <div className={styles['db-copy-section']}>
      <span className={styles['db-detail-k']}>Тексти для креативу</span>
      <div className={styles['db-copy-stack']}>
        {variants.map((variant, index) => (
          <CopyVariantInput
            key={variant.id}
            index={index}
            body={variant.body}
            canRemove={canRemove}
            onChange={(body) => updateVariant(variant.id, body)}
            onRemove={() => removeVariant(variant.id)}
          />
        ))}
      </div>
      <button type="button" className={styles['db-detail-add']} onClick={addVariant}>
        {Icons.plus}
        <span>Додати варіант</span>
      </button>
    </div>
  );
}

interface DesignBriefReferencesSectionProps {
  referenceLinks: DesignBriefReferenceLink[];
  onPatch: (patch: DesignBriefPatch) => void;
}

export function DesignBriefReferencesSection({ referenceLinks, onPatch }: DesignBriefReferencesSectionProps) {
  const updateReference = (id: string, patch: Partial<DesignBriefReferenceLink>) => {
    onPatch({
      referenceLinks: referenceLinks.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    });
  };

  const addReference = () => {
    onPatch({
      referenceLinks: [
        ...referenceLinks,
        {
          id: `ref${Date.now()}`,
          url: '',
          label: '',
        },
      ],
    });
  };

  const removeReference = (id: string) => {
    onPatch({ referenceLinks: referenceLinks.filter((link) => link.id !== id) });
  };

  if (referenceLinks.length === 0) {
    return (
      <button
        type="button"
        className={cx(
          styles['db-drawer-block'],
          styles['db-drawer-block-refs'],
          styles['db-drawer-block-refs-empty'],
          styles['db-drawer-block-empty-hit'],
        )}
        onClick={addReference}
        aria-label="Додати референси"
      >
        <span className={styles['db-drawer-empty-t']}>
          {Icons.plus}
          Додати референси
        </span>
      </button>
    );
  }

  return (
    <section className={cx(styles['db-drawer-block'], styles['db-drawer-block-refs'])}>
      <div className={styles['db-drawer-block-head']}>
        <h3 className={styles['db-drawer-block-title']}>Референси</h3>
        <span className={styles['db-drawer-block-meta']}>{referenceLinks.length}</span>
      </div>
      <div className={styles['db-drawer-block-body']}>
        <ul className={styles['db-ref-list']}>
          {referenceLinks.map((link) => (
            <li key={link.id} className={styles['db-ref-row']}>
              <input
                className={styles['db-ref-label']}
                value={link.label ?? ''}
                placeholder="Назва"
                onChange={(e) => updateReference(link.id, { label: e.target.value })}
                aria-label="Назва референсу"
              />
              <input
                className={styles['db-ref-url']}
                value={link.url}
                placeholder="https://…"
                onChange={(e) => updateReference(link.id, { url: e.target.value })}
                aria-label="Посилання на референс"
              />
              <button
                type="button"
                className={styles['db-ref-remove']}
                onClick={() => removeReference(link.id)}
                aria-label="Видалити референс"
              >
                {Icons.trash}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className={styles['db-detail-add']} onClick={addReference}>
          {Icons.plus}
          <span>Додати посилання</span>
        </button>
      </div>
    </section>
  );
}
