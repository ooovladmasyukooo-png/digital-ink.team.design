import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import type { SlashBlock } from '../documents/slashBlocks';
import styles from '../projects2.module.css';

interface SlashBlockIconProps {
  blockId: SlashBlock['id'];
}

export function SlashBlockIcon({ blockId }: SlashBlockIconProps) {
  return (
    <span className={cx(styles['p2-doc-slash-ic'], styles[`p2-doc-slash-ic-${blockId}`])} aria-hidden>
      {blockId === 'h1' ? <span className={styles['p2-doc-slash-ic-text']}>H1</span> : null}
      {blockId === 'h2' ? <span className={styles['p2-doc-slash-ic-text']}>H2</span> : null}
      {blockId === 'h3' ? <span className={styles['p2-doc-slash-ic-text']}>H3</span> : null}
      {blockId === 'text' ? Icons.crm : null}
      {blockId === 'bullet' ? <span className={styles['p2-doc-slash-ic-glyph']}>•</span> : null}
      {blockId === 'numbered' ? <span className={styles['p2-doc-slash-ic-glyph']}>1.</span> : null}
      {blockId === 'todo' ? Icons.tasks : null}
      {blockId === 'quote' ? <span className={styles['p2-doc-slash-ic-glyph']}>"</span> : null}
      {blockId === 'code' ? <span className={styles['p2-doc-slash-ic-code']}>&lt;/&gt;</span> : null}
      {blockId === 'divider' ? <span className={styles['p2-doc-slash-ic-glyph']}>—</span> : null}
      {blockId === 'image' ? Icons.camera : null}
      {blockId === 'file' ? Icons.briefcase : null}
    </span>
  );
}
