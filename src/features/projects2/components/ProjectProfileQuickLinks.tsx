import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { quickLinksWithUrl } from '../projectQuickLinks';
import type { ProjectCustomLink, ProjectQuickLinks } from '../types';
import styles from '../projects2.module.css';

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;

function computeMenuPosition(anchor: HTMLElement, pop: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let pw = pop.offsetWidth;
  let ph = pop.offsetHeight;
  if (pw < 48) pw = 176;
  if (ph < 48) ph = 120;

  let top = rect.bottom + POP_GAP;
  const fitsBelow = top + ph <= window.innerHeight - VIEWPORT_MARGIN;
  if (!fitsBelow) {
    const aboveTop = rect.top - POP_GAP - ph;
    if (aboveTop >= VIEWPORT_MARGIN) top = aboveTop;
  }

  let left = rect.right - pw;
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
  if (left + pw > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - pw;
  }

  return {
    position: 'fixed',
    top,
    left,
    zIndex: 320,
    maxHeight: window.innerHeight - VIEWPORT_MARGIN * 2,
  };
}

interface ProjectProfileQuickLinksProps {
  quickLinks: ProjectQuickLinks;
  customLinks?: ProjectCustomLink[];
  linkOrder?: string[];
}

export function ProjectProfileQuickLinks({ quickLinks, customLinks = [], linkOrder }: ProjectProfileQuickLinksProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const items = quickLinksWithUrl(quickLinks, customLinks, linkOrder);

  const updatePosition = useCallback(() => {
    const anchor = btnRef.current;
    const menu = menuRef.current;
    if (!anchor || !menu) return;
    setMenuStyle(computeMenuPosition(anchor, menu));
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onLayout = () => updatePosition();
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, true);
    return () => {
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout, true);
    };
  }, [open, updatePosition, items.length]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <>
      <div className={cx(styles['p2-profile-quick-links'], open && styles['p2-profile-quick-links-on'])}>
        <button
          ref={btnRef}
          type="button"
          className={styles['p2-profile-quick-links-btn']}
          aria-label="Links"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((current) => !current)}
        >
          {Icons.link}
          <span>Links</span>
          {items.length > 0 ? <span className={styles['p2-profile-quick-links-n']}>{items.length}</span> : null}
        </button>
      </div>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              className={cx('pop', 'pop-tab-menu', styles['p2-profile-quick-links-menu'])}
              style={menuStyle}
              role="menu"
            >
              <div className="pop-tab-list">
                {items.length > 0 ? (
                  items.map((item) => (
                    <a
                      key={item.key}
                      className="pop-row"
                      role="menuitem"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                    >
                      <span className="pop-row-i">{Icons.openExternal}</span>
                      <span className="pop-row-t">{item.label}</span>
                    </a>
                  ))
                ) : (
                  <div className="pop-tab-empty">Посилання не додані</div>
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
