import { RECURRENCE_KIND_OPTIONS, RECURRENCE_WEEKDAY_LABELS } from '../constants';
import { defaultRecurrenceRule } from '../recurrence';
import briefStyles from '../designBrief.module.css';
import type { DesignBriefRecurrenceRule, Weekday } from '../types';

interface DesignBriefRecurrenceRuleEditorProps {
  rule: DesignBriefRecurrenceRule;
  deadlineIso: string | null;
  onChange: (rule: DesignBriefRecurrenceRule) => void;
}

function toggleWeekday(list: Weekday[], day: Weekday): Weekday[] {
  if (list.includes(day)) {
    const next = list.filter((d) => d !== day);
    return next.length ? next : [day];
  }
  return [...list, day].sort((a, b) => a - b) as Weekday[];
}

export function DesignBriefRecurrenceRuleEditor({ rule, deadlineIso, onChange }: DesignBriefRecurrenceRuleEditorProps) {
  const setKind = (kind: DesignBriefRecurrenceRule['kind']) => {
    if (rule.kind === kind) return;
    onChange(defaultRecurrenceRule(kind, deadlineIso));
  };

  return (
    <div className={briefStyles['db-date-pop-recur-body']}>
      <select
        className={briefStyles['db-date-pop-recur-select']}
        value={rule.kind}
        aria-label="Інтервал повторення"
        onChange={(e) => setKind(e.target.value as DesignBriefRecurrenceRule['kind'])}
      >
        {RECURRENCE_KIND_OPTIONS.map((opt) => (
          <option key={opt.kind} value={opt.kind}>
            {opt.label}
          </option>
        ))}
      </select>

      {rule.kind === 'daily' ? (
        <div className={briefStyles['db-date-pop-recur-weekdays']} role="group" aria-label="Дні тижня">
          {RECURRENCE_WEEKDAY_LABELS.map((label, i) => {
            const day = i as Weekday;
            const on = rule.weekdays.includes(day);
            return (
              <button
                key={day}
                type="button"
                className={briefStyles['db-date-pop-recur-wd']}
                data-on={on ? '' : undefined}
                aria-pressed={on}
                onClick={() =>
                  onChange({ kind: 'daily', weekdays: toggleWeekday(rule.weekdays, day) })
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      {rule.kind === 'weekly' ? (
        <div className={briefStyles['db-date-pop-recur-weekdays']} role="group" aria-label="День тижня">
          {RECURRENCE_WEEKDAY_LABELS.map((label, i) => {
            const day = i as Weekday;
            const on = rule.weekday === day;
            return (
              <button
                key={day}
                type="button"
                className={briefStyles['db-date-pop-recur-wd']}
                data-on={on ? '' : undefined}
                aria-pressed={on}
                onClick={() => onChange({ kind: 'weekly', weekday: day })}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      {rule.kind === 'monthly' ? (
        <div className={briefStyles['db-date-pop-recur-monthly']}>
          <div className={briefStyles['db-date-pop-recur-mode']} role="radiogroup" aria-label="Режим щомісяця">
            <label className={briefStyles['db-date-pop-recur-mode-opt']}>
              <input
                type="radio"
                name="recur-monthly-mode"
                checked={rule.mode === 'dayOfMonth'}
                onChange={() => {
                  const base = defaultRecurrenceRule('monthly', deadlineIso);
                  onChange(
                    base.kind === 'monthly' && base.mode === 'dayOfMonth'
                      ? base
                      : { kind: 'monthly', mode: 'dayOfMonth', day: 1 },
                  );
                }}
              />
              <span>День місяця</span>
            </label>
            <label className={briefStyles['db-date-pop-recur-mode-opt']}>
              <input
                type="radio"
                name="recur-monthly-mode"
                checked={rule.mode === 'everyNDays'}
                onChange={() =>
                  onChange({ kind: 'monthly', mode: 'everyNDays', intervalDays: 7 })
                }
              />
              <span>Кожні N днів</span>
            </label>
          </div>
          {rule.mode === 'dayOfMonth' ? (
            <label className={briefStyles['db-date-pop-recur-num']}>
              <span>Число</span>
              <input
                type="number"
                min={1}
                max={31}
                value={rule.day}
                onChange={(e) => {
                  const day = Math.min(31, Math.max(1, Number(e.target.value) || 1));
                  onChange({ kind: 'monthly', mode: 'dayOfMonth', day });
                }}
              />
            </label>
          ) : (
            <label className={briefStyles['db-date-pop-recur-num']}>
              <span>Кожні</span>
              <input
                type="number"
                min={1}
                max={365}
                value={rule.intervalDays}
                onChange={(e) => {
                  const intervalDays = Math.min(365, Math.max(1, Number(e.target.value) || 1));
                  onChange({ kind: 'monthly', mode: 'everyNDays', intervalDays });
                }}
              />
              <span>дн.</span>
            </label>
          )}
        </div>
      ) : null}
    </div>
  );
}
