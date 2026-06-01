import { useEffect, useRef, useState, type RefObject } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icon, Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { teamById } from '../../tasks/taskOptions';
import { TaskPickerPopover } from '../../tasks/components/TaskPickerPopover';
import { countryFlagEmoji, PROJECT_COUNTRIES } from '../projectCountries';
import {
  ChurnRiskChip,
  churnRiskPickerItems,
  normalizeChurnRisk,
  type ProjectChurnRiskLevel,
} from '../projectChurnRisk';
import {
  memberTooltip,
  normalizeTeamAssignments,
  teamMemberIds,
} from '../projectTeam';
import type { Project, ProjectPatch } from '../types';
import { ProjectTeamPopover } from './ProjectTeamPopover';
import styles from '../projects2.module.css';

type ProfilePicker = 'country' | 'churn' | 'team' | null;

interface ProjectProfileHeaderProps {
  project: Project;
  avatarSrc?: string | null;
  onPickAvatar: () => void;
  onSave: (field: keyof ProjectPatch, value: string) => void;
  onPatch: (patch: ProjectPatch) => void;
}

function useCloseOnOutside(open: boolean, onClose: () => void, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (ref.current?.contains(event.target as Node)) return;
      onClose();
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open, onClose, ref]);
}

export function ProjectProfileHeader({
  project,
  avatarSrc,
  onPickAvatar,
  onSave,
  onPatch,
}: ProjectProfileHeaderProps) {
  const [nameDraft, setNameDraft] = useState(project.name);
  const [picker, setPicker] = useState<ProfilePicker>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const churnRef = useRef<HTMLButtonElement>(null);
  const teamRef = useRef<HTMLButtonElement>(null);

  const churnLevel = normalizeChurnRisk(project.churnRisk);
  const teamAssignments = normalizeTeamAssignments(project);
  const memberIds = teamMemberIds(teamAssignments);
  const countryOpen = picker === 'country';
  const churnOpen = picker === 'churn';
  const teamOpen = picker === 'team';

  useEffect(() => {
    setNameDraft(project.name);
  }, [project.name]);

  useCloseOnOutside(countryOpen, () => setPicker(null), countryRef);

  const commitName = () => {
    if (nameDraft.trim() && nameDraft !== project.name) onSave('name', nameDraft.trim());
    else setNameDraft(project.name);
  };

  const pickCountry = (code: string) => {
    onPatch({ country: code });
    setPicker(null);
  };

  const pickChurn = (level: ProjectChurnRiskLevel) => {
    onPatch({ churnRisk: level });
    setPicker(null);
  };

  const togglePicker = (next: ProfilePicker) => {
    setPicker((current) => (current === next ? null : next));
  };

  const visibleMembers = memberIds.slice(0, 6);
  const extraMembers = memberIds.length - visibleMembers.length;

  return (
    <header className={styles['p2-profile-head']}>
      <button
        type="button"
        className={styles['p2-profile-av-btn']}
        onClick={onPickAvatar}
        aria-label="Змінити аватар проєкту"
      >
        {avatarSrc ? (
          <Avatar name={project.name} hue={project.hue} src={avatarSrc} size="lg" />
        ) : (
          <span className={styles['p2-profile-av-fallback']} aria-hidden>
            <Icon
              d={
                <>
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </>
              }
              size={24}
              sw={1.35}
            />
          </span>
        )}
        <span className={styles['p2-profile-av-overlay']} aria-hidden>
          {Icons.camera}
        </span>
      </button>

      <div className={styles['p2-profile-head-main']}>
        <div className={styles['p2-profile-title-row']}>
          <input
            className={styles['p2-profile-title']}
            value={nameDraft}
            aria-label="Назва проєкту"
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setNameDraft(project.name);
                e.currentTarget.blur();
              }
            }}
          />

          <div className={styles['p2-profile-flag-wrap']} ref={countryRef}>
            <button
              type="button"
              className={cx(styles['p2-profile-flag-btn'], countryOpen && styles['p2-profile-flag-btn-on'])}
              aria-label={`Країна: ${project.country}`}
              aria-expanded={countryOpen}
              onClick={() => togglePicker('country')}
            >
              <span className={styles['p2-profile-flag-emoji']} aria-hidden>
                {countryFlagEmoji(project.country)}
              </span>
            </button>
            {countryOpen ? (
              <ul className={styles['p2-profile-picker-menu']} role="listbox">
                {PROJECT_COUNTRIES.map((item) => (
                  <li key={item.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={item.code === project.country}
                      className={cx(
                        styles['p2-profile-picker-opt'],
                        item.code === project.country && styles['p2-profile-picker-opt-on'],
                      )}
                      onClick={() => pickCountry(item.code)}
                    >
                      <span className={styles['p2-profile-flag-emoji']}>{countryFlagEmoji(item.code)}</span>
                      <span>{item.label}</span>
                      <span className={styles['p2-profile-picker-code']}>{item.code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {project.phone.trim() ? (
            <a
              href={`tel:${project.phone.replace(/\s/g, '')}`}
              className={styles['p2-profile-phone-link']}
              aria-label={`Телефон: ${project.phone}`}
              title={project.phone}
            >
              <span className={styles['p2-profile-phone-ico']} aria-hidden>
                {Icons.call}
              </span>
            </a>
          ) : (
            <span className={styles['p2-profile-phone-ico']} aria-hidden title="Телефон не вказано">
              {Icons.call}
            </span>
          )}
        </div>

        <button
          ref={teamRef}
          type="button"
          className={cx(styles['p2-profile-team-btn'], teamOpen && styles['p2-profile-team-btn-on'])}
          aria-label="Команда проєкту"
          aria-expanded={teamOpen}
          onClick={() => togglePicker('team')}
        >
          <span className={styles['p2-profile-team']} aria-hidden>
            {visibleMembers.map((memberId, index) => {
              const member = teamById[memberId];
              const name = member?.name ?? '—';
              return (
                <span
                  key={memberId}
                  className={styles['p2-profile-team-av']}
                  style={{ zIndex: visibleMembers.length - index }}
                >
                  <span className={styles['p2-profile-team-tip']} role="tooltip">
                    {memberTooltip(memberId, teamAssignments, name)}
                  </span>
                  <Avatar name={name} hue={member?.hue ?? 0} size="sm" />
                </span>
              );
            })}
            {extraMembers > 0 ? (
              <span className={styles['p2-profile-team-more']}>+{extraMembers}</span>
            ) : null}
            <span className={styles['p2-profile-team-add']} aria-hidden>
              {Icons.plus}
            </span>
          </span>
        </button>
      </div>

      <div className={styles['p2-profile-head-metrics']}>
        <div className={styles['p2-profile-churn-stack']}>
          <span className={styles['p2-profile-churn-k']}>Critical risk score</span>
          <button
            ref={churnRef}
            type="button"
            className={cx(styles['p2-profile-churn-btn'], churnOpen && styles['p2-profile-churn-btn-on'])}
            aria-label={`Critical risk score: ${churnLevel}`}
            aria-expanded={churnOpen}
            onClick={() => togglePicker('churn')}
          >
            <ChurnRiskChip level={churnLevel} size="compact" />
          </button>
        </div>
      </div>

      {churnOpen ? (
        <TaskPickerPopover
          open
          anchorRef={churnRef}
          items={churnRiskPickerItems(churnLevel)}
          width={200}
          onClose={() => setPicker(null)}
          onSelect={(id) => pickChurn(id as ProjectChurnRiskLevel)}
        />
      ) : null}

      {teamOpen ? (
        <ProjectTeamPopover
          open
          anchorRef={teamRef}
          assignments={teamAssignments}
          onClose={() => setPicker(null)}
          onChange={(next) => onPatch({ teamAssignments: next })}
        />
      ) : null}
    </header>
  );
}
