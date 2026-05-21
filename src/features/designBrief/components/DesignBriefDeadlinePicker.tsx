import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Icon, Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import teamStyles from '../../team/team.module.css';
import { displayDateToIso } from '../dateDisplay';
import { defaultRecurrenceRule, normalizeRecurrenceRule, recurrenceDaysInMonth } from '../recurrence';
import briefStyles from '../designBrief.module.css';
import type { DesignBriefRecurrenceRule } from '../types';
import { DesignBriefRecurrenceRuleEditor } from './DesignBriefRecurrenceRuleEditor';

function parseIsoToLocalDate(iso: string | null): Date | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

function toDisplay(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}.${mm}.${yyyy}`;
}

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
for (let y = NOW_Y - 5; y <= NOW_Y + 5; y++) YEAR_OPTIONS.push(y);

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

function computeDatePopPosition(shell: HTMLElement, pop: HTMLElement): CSSProperties {
  const rect = shell.getBoundingClientRect();
  let pw = pop.offsetWidth;
  let ph = pop.offsetHeight;
  if (pw < 48) pw = 272;
  if (ph < 48) ph = 320;

  let top = rect.bottom + POP_GAP;
  const fitsBelow = top + ph <= window.innerHeight - VIEWPORT_MARGIN;
  if (!fitsBelow) {
    const aboveTop = rect.top - POP_GAP - ph;
    if (aboveTop >= VIEWPORT_MARGIN) top = aboveTop;
  }

  let left = rect.left;
  if (left + pw > window.innerWidth - VIEWPORT_MARGIN) {
    left = window.innerWidth - VIEWPORT_MARGIN - pw;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  return { position: 'fixed', top, left, zIndex: 320 };
}

interface DesignBriefDeadlinePickerProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  valueIso: string | null;
  recurrenceRule?: DesignBriefRecurrenceRule | null;
  showRecurrence?: boolean;
  onClose: () => void;
  onSelectIso: (iso: string | null) => void;
  onRecurrenceChange?: (rule: DesignBriefRecurrenceRule | null) => void;
}

export function DesignBriefDeadlinePicker({
  open,
  anchorRef,
  valueIso,
  recurrenceRule = null,
  showRecurrence = false,
  onClose,
  onSelectIso,
  onRecurrenceChange,
}: DesignBriefDeadlinePickerProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const [popStyle, setPopStyle] = useState<CSSProperties>({});
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [recurOn, setRecurOn] = useState(Boolean(recurrenceRule));
  const [recurRule, setRecurRule] = useState<DesignBriefRecurrenceRule>(() =>
    normalizeRecurrenceRule(recurrenceRule, valueIso) ?? defaultRecurrenceRule('weekly', valueIso),
  );

  const selected = useMemo(() => parseIsoToLocalDate(valueIso), [valueIso]);
  const cells = useMemo(() => monthCells(viewYear, viewMonth), [viewYear, viewMonth]);

  const reposition = useCallback(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    setPopStyle(computeDatePopPosition(anchor, pop));
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
    setRecurOn(Boolean(recurrenceRule));
    setRecurRule(
      normalizeRecurrenceRule(recurrenceRule, valueIso) ?? defaultRecurrenceRule('weekly', valueIso),
    );
    reposition();
  }, [open, selected, recurrenceRule, valueIso, reposition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const sameDay = (a: Date, y: number, m: number, day: number) =>
    a.getFullYear() === y && a.getMonth() === m && a.getDate() === day;

  const today = new Date();
  const todayStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    [today.getFullYear(), today.getMonth(), today.getDate()],
  );

  const recurHighlightDays = useMemo(() => {
    if (!recurOn) return new Set<number>();
    const floor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return recurrenceDaysInMonth(viewYear, viewMonth, recurRule, valueIso, floor);
  }, [recurOn, recurRule, viewYear, viewMonth, valueIso, today.getDate(), today.getMonth(), today.getFullYear()]);

  const pickDisplay = (display: string) => {
    const iso = display.trim() ? displayDateToIso(display) : '';
    onSelectIso(iso || null);
    onClose();
  };

  const setRecurrenceEnabled = (enabled: boolean) => {
    setRecurOn(enabled);
    onRecurrenceChange?.(enabled ? recurRule : null);
  };

  const setRecurrenceRuleValue = (rule: DesignBriefRecurrenceRule) => {
    setRecurRule(rule);
    if (recurOn) onRecurrenceChange?.(rule);
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      className={cx(teamStyles['date-pop'], briefStyles['db-date-pop'])}
      style={popStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Дедлайн"
    >
      <div className={teamStyles['date-pop-head']}>
        <button type="button" className={teamStyles['date-pop-nav']} onClick={() => shiftMonth(-1)} aria-label="Попередній місяць">
          <Icon d={<path d="m15 18-6-6 6-6" />} size={14} sw={1.7} />
        </button>
        <div className={teamStyles['date-pop-picks']}>
          <div className={cx(teamStyles['date-pop-select-wrap'], teamStyles['date-pop-select-month'])}>
            <select
              className={teamStyles['date-pop-select']}
              value={viewMonth}
              aria-label="Місяць"
              onChange={(e) => setViewMonth(Number(e.target.value))}
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className={teamStyles['select-chev']} aria-hidden>
              {Icons.chevD}
            </span>
          </div>
          <div className={cx(teamStyles['date-pop-select-wrap'], teamStyles['date-pop-select-year'])}>
            <select
              className={teamStyles['date-pop-select']}
              value={viewYear}
              aria-label="Рік"
              onChange={(e) => setViewYear(Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <span className={teamStyles['select-chev']} aria-hidden>
              {Icons.chevD}
            </span>
          </div>
        </div>
        <button type="button" className={teamStyles['date-pop-nav']} onClick={() => shiftMonth(1)} aria-label="Наступний місяць">
          <Icon d={<path d="m9 18 6-6-6-6" />} size={14} sw={1.7} />
        </button>
      </div>
      <div className={teamStyles['date-pop-weekdays']}>
        {WEEKDAYS_UK.map((label, i) => (
          <span key={i} className={teamStyles['date-pop-wd']}>
            {label}
          </span>
        ))}
      </div>
      <div className={teamStyles['date-pop-grid']}>
        {cells.map((cell, idx) => {
          if (cell === null) {
            return <span key={`e-${idx}`} className={teamStyles['date-pop-cell']} data-empty="" aria-hidden />;
          }
          const cellDate = new Date(viewYear, viewMonth, cell);
          const isSelected = Boolean(selected && sameDay(selected, viewYear, viewMonth, cell));
          const showSelected = isSelected && cellDate >= todayStart;

          return (
            <button
              key={`${viewYear}-${viewMonth}-${cell}`}
              type="button"
              className={teamStyles['date-pop-cell']}
              data-today={sameDay(today, viewYear, viewMonth, cell) ? '' : undefined}
              data-selected={showSelected ? '' : undefined}
              data-recur={recurHighlightDays.has(cell) ? '' : undefined}
              onClick={() => pickDisplay(toDisplay(cellDate))}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {showRecurrence && onRecurrenceChange ? (
        <div className={briefStyles['db-date-pop-recur']}>
          <label className={briefStyles['db-date-pop-recur-toggle']}>
            <input
              type="checkbox"
              checked={recurOn}
              onChange={(e) => setRecurrenceEnabled(e.target.checked)}
            />
            <span className={briefStyles['db-date-pop-recur-i']} aria-hidden>
              {Icons.repeat}
            </span>
            <span>Повторювана задача</span>
          </label>
          {recurOn ? (
            <DesignBriefRecurrenceRuleEditor
              rule={recurRule}
              deadlineIso={valueIso}
              onChange={setRecurrenceRuleValue}
            />
          ) : null}
          <p className={briefStyles['db-date-pop-recur-hint']}>Після виконання (Done) створиться нова копія з наступним дедлайном.</p>
        </div>
      ) : null}

      <div className={teamStyles['date-pop-foot']}>
        <button
          type="button"
          className={teamStyles['date-pop-link']}
          onClick={() => {
            onSelectIso(null);
            onClose();
          }}
        >
          Очистити
        </button>
        <button type="button" className={teamStyles['date-pop-link']} onClick={() => pickDisplay(toDisplay(new Date()))}>
          Сьогодні
        </button>
      </div>
    </div>,
    document.body,
  );
}
