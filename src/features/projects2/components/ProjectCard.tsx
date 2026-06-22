import { useRef, type DragEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { ProjectAvatar } from './ProjectAvatar';
import { pathForProject2Profile } from '../project2Paths';
import { teamById } from '../../tasks/taskOptions';
import { cx } from '../../../shared/styles/cx';
import { countryFlagEmoji } from '../projectCountries';
import { churnRiskToneClass, normalizeChurnRisk, type ProjectChurnRiskLevel } from '../projectChurnRisk';
import { ProjectCardChurnPicker } from './ProjectCardChurnPicker';
import { normalizePipelineStatus, pipelineStatusTone } from '../projectPipelineStatus';
import { memberTooltip, normalizeTeamAssignments, teamMemberIds } from '../projectTeam';
import { ProjectTeamAvatarTip } from './ProjectTeamAvatarTip';
import styles from '../projects2.module.css';
import type { Project } from '../types';

const CARD_TEAM_VISIBLE = 5;

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  onChurnRiskChange?: (level: ProjectChurnRiskLevel) => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}

export function ProjectCard({
  project,
  onSelect,
  onChurnRiskChange,
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
  const pipelineToneClass = `tone-${pipelineStatusTone(normalizePipelineStatus(project.pipelineStatus))}`;
  const profileHref = pathForProject2Profile(project.id, 'profile');
  const ignoreCardClickRef = useRef(false);

  const stopCardActivation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const openLink = (
    <a
      className={cx(styles['tlp-card-open'], styles['tlp-card-open-corner'])}
      href={profileHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Відкрити головну «${project.name}» у новій вкладці`}
      onClick={stopCardActivation}
      onMouseDown={stopCardActivation}
    >
      {Icons.openExternal}
    </a>
  );

  const teamAvatars =
    visibleMembers.length > 0 ? (
      <span className={cx(styles['tlp-team'], styles['tlp-team-meta'])} aria-label="Команда проєкту">
        {visibleMembers.map((memberId, index) => {
          const member = teamById[memberId];
          const name = member?.name ?? '—';
          return (
            <ProjectTeamAvatarTip
              key={memberId}
              name={name}
              hue={member?.hue ?? 0}
              stack={visibleMembers.length - index}
              tip={memberTooltip(memberId, assignments, name)}
            />
          );
        })}
        {extraMembers > 0 ? <span className={styles['tlp-team-more']}>+{extraMembers}</span> : null}
      </span>
    ) : null;

  const openProject = () => {
    if (ignoreCardClickRef.current) return;
    onSelect(project.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cx(
        styles['tlp-card'],
        styles['tlp-card-column'],
        styles[churnToneClass],
        isDragging && styles['tlp-card-dragging'],
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={openProject}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openProject();
        }
      }}
    >
      {openLink}
      <span className={styles['tlp-av']}>
        <ProjectAvatar
          projectId={project.id}
          name={project.name}
          churnRisk={project.churnRisk}
        />
        <span className={cx(styles['tlp-online'], styles[pipelineToneClass])} />
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
        </span>
        <span className={styles['tlp-card-meta']}>
          {onChurnRiskChange ? (
            <ProjectCardChurnPicker
              churnRisk={project.churnRisk}
              onChange={(level) => {
                ignoreCardClickRef.current = true;
                onChurnRiskChange(level);
                window.setTimeout(() => {
                  ignoreCardClickRef.current = false;
                }, 0);
              }}
            />
          ) : null}
          {teamAvatars}
        </span>
      </span>
    </div>
  );
}
