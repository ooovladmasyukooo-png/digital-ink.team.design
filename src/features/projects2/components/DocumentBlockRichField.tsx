import { useLayoutEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cx } from '../../../shared/styles/cx';
import {
  markdownInlineToHtml,
  normalizeRichFieldDom,
  resizeRichField,
  setRichFieldHtml,
} from '../documents/inlineRichText';
import styles from '../projects2.module.css';

interface DocumentBlockRichFieldProps {
  blockId: string;
  value: string;
  className?: string;
  placeholder?: string;
  onChange: (markdown: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onSelect?: (el: HTMLDivElement) => void;
  onClick?: (el: HTMLDivElement) => void;
  onFocus?: (el: HTMLDivElement) => void;
  /** Якщо true — батько обробляє вставку (наприклад, зображення). */
  onPasteImage?: (event: ClipboardEvent<HTMLDivElement>) => boolean;
  registerRef: (blockId: string, el: HTMLDivElement | null) => void;
}

export function DocumentBlockRichField({
  blockId,
  value,
  className,
  placeholder,
  onChange,
  onKeyDown,
  onKeyUp,
  onSelect,
  onClick,
  onFocus,
  onPasteImage,
  registerRef,
}: DocumentBlockRichFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lastMarkdown = useRef(value);
  const isComposing = useRef(false);

  const applyDomState = (el: HTMLDivElement, notify = true) => {
    const md = normalizeRichFieldDom(el);
    lastMarkdown.current = md;
    el.dataset.empty = md ? 'false' : 'true';
    resizeRichField(el);
    if (notify) onChange(md);
  };

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const isFocused = document.activeElement === el;
    if (isFocused) return;
    if (value !== lastMarkdown.current) {
      setRichFieldHtml(el, value);
      lastMarkdown.current = value;
      resizeRichField(el);
    }
  }, [value, blockId]);

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (onPasteImage?.(event)) return;
    const file = event.clipboardData.files[0];
    if (file?.type.startsWith('image/')) return;

    event.preventDefault();
    const text = event.clipboardData.getData('text/plain').replace(/\r?\n/g, ' ');
    if (!text) return;
    document.execCommand('insertText', false, text);
    const el = rootRef.current;
    if (el) applyDomState(el);
  };

  return (
    <div
      data-block-id={blockId}
      ref={(el) => {
        rootRef.current = el;
        registerRef(blockId, el);
        if (el && document.activeElement !== el && value !== lastMarkdown.current) {
          setRichFieldHtml(el, value);
          lastMarkdown.current = value;
          resizeRichField(el);
        }
      }}
      role="textbox"
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      {...(placeholder ? { 'data-placeholder': placeholder } : {})}
      className={cx(styles['p2-doc-block'], styles['p2-doc-block-rich'], className)}
      onInput={() => {
        if (isComposing.current) return;
        const el = rootRef.current;
        if (el) applyDomState(el);
      }}
      onCompositionStart={() => {
        isComposing.current = true;
      }}
      onCompositionEnd={() => {
        isComposing.current = false;
        const el = rootRef.current;
        if (el) applyDomState(el);
      }}
      onKeyDown={onKeyDown}
      onKeyUp={(e) => {
        onKeyUp?.(e);
        if (!isComposing.current) onSelect?.(e.currentTarget);
      }}
      onSelect={(e) => onSelect?.(e.currentTarget)}
      onMouseUp={(e) => onSelect?.(e.currentTarget)}
      onFocus={(e) => onFocus?.(e.currentTarget)}
      onClick={(e) => {
        onClick?.(e.currentTarget);
        onSelect?.(e.currentTarget);
      }}
      onPaste={onPaste}
      onBlur={() => {
        const el = rootRef.current;
        if (el) applyDomState(el);
      }}
    />
  );
}
