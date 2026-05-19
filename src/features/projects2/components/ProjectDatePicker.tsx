import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Icon, Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { displayDateToIso } from '../dateDisplay';
import styles from '../projects2.module.css';

function parseDisplayToLocalDate(display: string): Date | null {
  const iso = displayDateToIso(display.trim());
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

function toDisplay(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
}

/** Пн … Нд — один символ, як у системних календарях */
const WEEKDAYS_UK = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];

function capitalizeUk(s: string) {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase('uk-UA') + s.slice(1);
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, m) => ({
  value: m,
  label: capitalizeUk(new Intl.DateTimeFormat('uk-UA', { month: 'long' }).format(new Date(2000, m, 1))),
}));

const NOW_Y = new Date().getFullYear();
const YEAR_OPTIONS: number[] = [];
for (let y = NOW_Y - 120; y <= NOW_Y + 20; y++) YEAR_OPTIONS.push(y);

function monthCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const mondayFirst = (first.getDay() + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < mondayFirst; i++) cells.push(null);
  for (let day = 1; day <= lastDay; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const VIEWPORT_MARGIN = 8;
const POP_GAP = 6;

/** Розміщує попап у межах вікна (вгору/вниз, зсув по X, обмеження висоти). */
function computeDatePopPosition(shell: HTMLElement, pop: HTMLElement): CSSProperties {
  const rect = shell.getBoundingClientRect();
  let pw = pop.offsetWidth;
  let ph = pop.offsetHeight;
  if (pw < 48) pw = 272;
  if (ph < 48) ph = 280;

  let top = rect.bottom + POP_GAP;
  const fitsBelow = top + ph <= window.innerHeight - VIEWPORT_MARGIN;

  if (!fitsBelow) {
    const aboveTop = rect.top - POP_GAP - ph;
    const fitsAbove = aboveTop >= VIEWPORT_MARGIN;
    if (fitsAbove) {
      top = aboveTop;
    }
  }

  if (top < VIEWPORT_MARGIN) {
    top = VIEWPORT_MARGIN;
  }

  let left = rect.left;
  const maxW = window.innerWidth - 2 * VIEWPORT_MARGIN;
  if (pw > maxW) {
    pw = maxW;
  }
  if (left + pw > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - pw;
  }
  if (left < VIEWPORT_MARGIN) {
    left = VIEWPORT_MARGIN;
  }

  const style: CSSProperties = {
    top,
    left,
  };

  const maxH = window.innerHeight - VIEWPORT_MARGIN - top;
  if (ph > maxH - 1) {
    style.maxHeight = Math.max(168, maxH);
    style.overflowY = 'auto';
  }

  return style;
}

interface ProjectDatePickerProps {
  id: string;
  value: string;
  onSelect: (display: string) => void;
}

export function ProjectDatePicker({ id, value, onSelect }: ProjectDatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popStyle, setPopStyle] = useState<CSSProperties>({});
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const selected = useMemo(() => parseDisplayToLocalDate(value), [value]);

  const cells = useMemo(() => monthCells(viewYear, viewMonth), [viewYear, viewMonth]);

  useEffect(() => {
    if (!open) {
      setPopStyle({});
      return;
    }
    const sel = parseDisplayToLocalDate(value);
    if (sel) {
      setViewYear(sel.getFullYear());
      setViewMonth(sel.getMonth());
    }
  }, [open, value]);

  const reposition = useCallback(() => {
    if (!open) return;
    const shell = triggerRef.current;
    const pop = popRef.current;
    if (!shell || !pop) return;
    setPopStyle(computeDatePopPosition(shell, pop));
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const id = requestAnimationFrame(() => reposition());
    return () => cancelAnimationFrame(id);
  }, [open, viewMonth, viewYear, cells.length, reposition]);

  useEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const sameDay = (a: Date, y: number, m: number, day: number) =>
    a.getFullYear() === y && a.getMonth() === m && a.getDate() === day;

  const today = new Date();

  return (
    <div ref={rootRef} className={styles['field-date-root']}>
      <div ref={triggerRef} className={styles['field-date-shell']}>
        <button id={id} type="button" className={styles['field-date-trigger']} onClick={() => setOpen((o) => !o)}>
          {value.trim() ? value : '—'}
        </button>
        <span className={styles['field-date-cal']} aria-hidden>
          {Icons.calendar}
        </span>
      </div>
      {open ? (
        <div
          ref={popRef}
          className={styles['date-pop']}
          style={popStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Календар"
        >
          <div className={styles['date-pop-head']}>
            <button type="button" className={styles['date-pop-nav']} onClick={() => shiftMonth(-1)} aria-label="Попередній місяць">
              <Icon d={<path d="m15 18-6-6 6-6" />} size={14} sw={1.7} />
            </button>
            <div className={styles['date-pop-picks']}>
              <div className={cx(styles['date-pop-select-wrap'], styles['date-pop-select-month'])}>
                <select
                  className={styles['date-pop-select']}
                  value={viewMonth}
                  aria-label="Місяць"
                  onChange={(event) => setViewMonth(Number(event.target.value))}
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className={styles['select-chev']} aria-hidden>
                  {Icons.chevD}
                </span>
              </div>
              <div className={cx(styles['date-pop-select-wrap'], styles['date-pop-select-year'])}>
                <select
                  className={styles['date-pop-select']}
                  value={viewYear}
                  aria-label="Рік"
                  onChange={(event) => setViewYear(Number(event.target.value))}
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className={styles['select-chev']} aria-hidden>
                  {Icons.chevD}
                </span>
              </div>
            </div>
            <button type="button" className={styles['date-pop-nav']} onClick={() => shiftMonth(1)} aria-label="Наступний місяць">
              <Icon d={<path d="m9 18 6-6-6-6" />} size={14} sw={1.7} />
            </button>
          </div>
          <div className={styles['date-pop-weekdays']}>
            {WEEKDAYS_UK.map((label, i) => (
              <span key={i} className={styles['date-pop-wd']}>
                {label}
              </span>
            ))}
          </div>
          <div className={styles['date-pop-grid']}>
            {cells.map((cell, idx) =>
              cell === null ? (
                <span key={`e-${idx}`} className={styles['date-pop-cell']} data-empty="" aria-hidden />
              ) : (
                <button
                  key={`${viewYear}-${viewMonth}-${cell}`}
                  type="button"
                  className={styles['date-pop-cell']}
                  data-today={sameDay(today, viewYear, viewMonth, cell) ? '' : undefined}
                  data-selected={selected && sameDay(selected, viewYear, viewMonth, cell) ? '' : undefined}
                  onClick={() => {
                    onSelect(toDisplay(new Date(viewYear, viewMonth, cell)));
                    setOpen(false);
                  }}
                >
                  {cell}
                </button>
              ),
            )}
          </div>
          <div className={styles['date-pop-foot']}>
            <button type="button" className={styles['date-pop-link']} onClick={() => { onSelect(''); setOpen(false); }}>
              Очистити
            </button>
            <button
              type="button"
              className={styles['date-pop-link']}
              onClick={() => {
                onSelect(toDisplay(new Date()));
                setOpen(false);
              }}
            >
              Сьогодні
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
