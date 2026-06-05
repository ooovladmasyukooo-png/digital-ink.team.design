import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from '../../../shared/components/Avatar';
import { cx } from '../../../shared/styles/cx';
import styles from '../projects2.module.css';

const VIEWPORT_MARGIN = 8;
const TIP_GAP = 6;

function computeTipPosition(anchor: HTMLElement, tip: HTMLElement): CSSProperties {
  const rect = anchor.getBoundingClientRect();
  let tw = tip.offsetWidth;
  let th = tip.offsetHeight;
  if (tw < 8) tw = 128;
  if (th < 8) th = 24;

  let top = rect.top - TIP_GAP - th;
  if (top < VIEWPORT_MARGIN) {
    top = rect.bottom + TIP_GAP;
  }

  let left = rect.left + rect.width / 2 - tw / 2;
  if (left + tw > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - tw;
  }
  if (left < VIEWPORT_MARGIN) {
    left = VIEWPORT_MARGIN;
  }

  return {
    position: 'fixed',
    top,
    left,
    zIndex: 320,
  };
}

interface ProjectTeamAvatarTipProps {
  name: string;
  hue: number;
  tip: string;
  stack: number;
}

export function ProjectTeamAvatarTip({ name, hue, tip, stack }: ProjectTeamAvatarTipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tipStyle, setTipStyle] = useState<CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (!anchorRef.current || !tipRef.current) return;
    setTipStyle(computeTipPosition(anchorRef.current, tipRef.current));
  }, []);

  useLayoutEffect(() => {
    if (!hovered) return;
    updatePosition();
    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [hovered, updatePosition, tip]);

  return (
    <>
      <span
        ref={anchorRef}
        className={styles['tlp-team-av']}
        style={{ '--team-stack': stack } as CSSProperties}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Avatar name={name} hue={hue} size="sm" />
      </span>
      {hovered
        ? createPortal(
            <span
              ref={tipRef}
              className={cx(styles['tlp-team-tip'], styles['tlp-team-tip-portal'])}
              role="tooltip"
              style={tipStyle}
            >
              {tip}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
