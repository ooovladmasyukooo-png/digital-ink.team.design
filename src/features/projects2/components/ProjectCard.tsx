import type { DragEvent, MouseEvent } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { ProjectAvatar } from './ProjectAvatar';
import { pathForProject2Profile } from '../project2Paths';
import { teamById } from '../../tasks/taskOptions';
import { cx } from '../../../shared/styles/cx';
import { countryFlagEmoji } from '../projectCountries';
import { ChurnRiskChip, churnRiskToneClass, normalizeChurnRisk } from '../projectChurnRisk';
import { memberTooltip, normalizeTeamAssignments, teamMemberIds } from '../projectTeam';
import styles from '../projects2.module.css';
import type { Project } from '../types';

const CARD_TEAM_VISIBLE = 5;

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  layout?: 'grid' | 'column';
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
  onDragEnd?: () => void;
}

export function ProjectCard({
  project,
  onSelect,
  layout = 'grid',
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: ProjectCardProps) {
  const assignments = normalizeTeamAssignments(project);
  const memberIds = teamMemberIds(assignments);
  const visibleMembers = memberIds.slice(0, CARD_TEAM_VISIBLE);
  const extraMembers = memberIds.length - visibleMembers.length;
  const churnLevel = normalizeChurnRisk(project.churnRisk);
  const churnToneClass = churnRiskToneClass(churnLevel);
  const profileHref = pathForProject2Profile(project.id, 'profile');

  const stopCardActivation = (event: MouseEvent) => {
    event.stopPropagation();
  };
  const teamAvatars =
    visibleMembers.length > 0 ? (
      <span className={cx(styles['tlp-team'], styles['tlp-team-meta'])} aria-label="Команда проєкту">
        {visibleMembers.map((memberId, index) => {
          const member = teamById[memberId];
          const name = member?.name ?? '—';
          return (
            <span
              key={memberId}
              className={styles['tlp-team-av']}
              style={{ zIndex: visibleMembers.length - index }}
            >
              <span className={styles['tlp-team-tip']} role="tooltip">
                {memberTooltip(memberId, assignments, name)}
              </span>
              <Avatar name={name} hue={member?.hue ?? 0} size="sm" />
            </span>
          );
        })}
        {extraMembers > 0 ? <span className={styles['tlp-team-more']}>+{extraMembers}</span> : null}
      </span>
    ) : null;

  return (
    <button
      className={cx(
        styles['tlp-card'],
        styles[churnToneClass],
        layout === 'column' && styles['tlp-card-column'],
        isDragging && styles['tlp-card-dragging'],
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(project.id)}
      type="button"
    >
      <span className={styles['tlp-av']}>
        <ProjectAvatar
          projectId={project.id}
          name={project.name}
          churnRisk={project.churnRisk}
        />
        <span className={cx(styles['tlp-online'], project.status === 'active' ? styles.on : styles.off)} />
      </span>
      <span className={styles['tlp-body']}>
        <span className={styles['tlp-name-row']}>
          <span className={styles['tlp-name']} title={project.name}>
            <span className={styles['tlp-name-text']}>{project.name}</span>
            <span
              className={styles['tlp-name-flag-emoji']}
              aria-label={`Країна: ${project.country}`}
              role="img"
            >
              {countryFlagEmoji(project.country)}
            </span>
          </span>
          <a
            className={styles['tlp-card-open']}
            href={profileHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Відкрити головну «${project.name}» у новій вкладці`}
            onClick={stopCardActivation}
            onMouseDown={stopCardActivation}
          >
            {Icons.openExternal}
          </a>
        </span>
        <span className={styles['tlp-card-meta']}>
          <ChurnRiskChip level={churnLevel} size="compact" showFlag={false} />
          {teamAvatars}
        </span>
      </span>
    </button>
  );
}
