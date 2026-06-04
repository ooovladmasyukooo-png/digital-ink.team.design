import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import { teamById } from '../../tasks/taskOptions';
import { PROJECT_PIPELINE_STATUS_GROUPS } from '../projectPipelineStatus';
import {
  activeFilterCount,
  collectAllListMemberIds,
  DEFAULT_PROJECT_LIST_FILTERS,
  hasActiveFilters,
  pipelineStatusFiltersDifferFromDefault,
  PROJECT_LIST_POSITION_GROUP_OPTIONS,
  type ProjectListFilters,
  type ProjectListGroupBy,
  type ProjectListLayout,
} from '../projectListView';
import styles from '../projects2.module.css';
import type { Project } from '../types';

interface ProjectListToolbarProps {
  projects: Project[];
  filteredCount: number;
  layout: ProjectListLayout;
  groupBy: ProjectListGroupBy;
  filters: ProjectListFilters;
  query: string;
  onQueryChange: (value: string) => void;
  onLayoutChange: (value: ProjectListLayout) => void;
  onGroupByChange: (value: ProjectListGroupBy) => void;
  onFiltersChange: (value: ProjectListFilters) => void;
}

type FilterPanel = 'status' | 'people' | null;

function toggleHidden<T extends string>(hidden: T[], id: T, visible: boolean): T[] {
  if (visible) return hidden.filter((item) => item !== id);
  if (hidden.includes(id)) return hidden;
  return [...hidden, id];
}

function toggleMember(memberIds: string[], id: string): string[] {
  if (memberIds.includes(id)) return memberIds.filter((item) => item !== id);
  return [...memberIds, id];
}

export function ProjectListToolbar({
  projects,
  filteredCount,
  layout,
  groupBy,
  filters,
  query,
  onQueryChange,
  onLayoutChange,
  onGroupByChange,
  onFiltersChange,
}: ProjectListToolbarProps) {
  const [groupOpen, setGroupOpen] = useState(false);
  const [filtersBarOpen, setFiltersBarOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<FilterPanel>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const filtersAreaRef = useRef<HTMLDivElement>(null);

  const peopleMemberIds = useMemo(() => collectAllListMemberIds(projects), [projects]);

  const groupLabel =
    PROJECT_LIST_POSITION_GROUP_OPTIONS.find((option) => option.id === groupBy)?.label ??
    (groupBy === 'status' ? 'Статус' : 'Групування');

  const filterCount = activeFilterCount(filters);
  const filtersActive = hasActiveFilters(filters);

  const statusFilterActive = pipelineStatusFiltersDifferFromDefault(filters);
  const peopleFilterActive = filters.memberIds.length > 0;

  useEffect(() => {
    if (!groupOpen && !filtersBarOpen && !openPanel) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (groupOpen && !groupRef.current?.contains(target)) setGroupOpen(false);
      if (!filtersAreaRef.current?.contains(target)) {
        setOpenPanel(null);
        setFiltersBarOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGroupOpen(false);
        setFiltersBarOpen(false);
        setOpenPanel(null);
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [groupOpen, filtersBarOpen, openPanel]);

  const patchFilters = (patch: Partial<ProjectListFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const resetFilters = () => {
    onFiltersChange({ ...DEFAULT_PROJECT_LIST_FILTERS });
  };

  const openFilterPanel = (panel: Exclude<FilterPanel, null>) => {
    setOpenPanel(panel);
  };

  return (
    <div className={styles['tlp-toolbar-wrap']} ref={filtersAreaRef}>
      <div className={styles['tlp-filter']}>
        <div className={styles['tlp-search']}>
          {Icons.search}
          <input
            placeholder="Пошук проєктів..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>

        <div className={cx(styles['tlp-role-filter'], styles['tlp-group-filter'])} ref={groupRef}>
          <button
            className={cx(styles['tlp-group-btn'], groupOpen && styles.on)}
            type="button"
            aria-expanded={groupOpen}
            aria-label={`Групування: ${groupLabel}`}
            onClick={(event) => {
              event.stopPropagation();
              setGroupOpen((open) => !open);
              setFiltersBarOpen(false);
              setOpenPanel(null);
            }}
          >
            <span className={styles['tlp-group-inline']}>
              <span className={styles['tlp-group-k']}>Груп.</span>
              <span className={styles['tlp-group-v']}>{groupLabel}</span>
            </span>
            <span className={styles['tlp-group-chev']}>{Icons.chevD}</span>
          </button>
          {groupOpen ? (
            <div
              className={cx(styles['tlp-role-menu'], styles['tlp-group-menu'])}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles['tlp-group-menu-section']}>
                <div className={styles['tlp-group-menu-t']}>Статус</div>
                <button
                  type="button"
                  className={cx(styles['tlp-group-pick'], groupBy === 'status' && styles.on)}
                  onClick={() => onGroupByChange('status')}
                >
                  <span>Статус проєкту</span>
                  {groupBy === 'status' ? <span className={styles['tlp-group-pick-mark']}>✓</span> : null}
                </button>
              </div>

              <div className={styles['tlp-group-menu-section']}>
                <div className={styles['tlp-group-menu-t']}>Позиція</div>
                {PROJECT_LIST_POSITION_GROUP_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={cx(styles['tlp-group-pick'], groupBy === option.id && styles.on)}
                    onClick={() => onGroupByChange(option.id)}
                  >
                    <span>{option.label}</span>
                    {groupBy === option.id ? (
                      <span className={styles['tlp-group-pick-mark']}>✓</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles['tlp-toolbar-end']}>
          <div className="seg">
            <button
              type="button"
              className={layout === 'cards' ? 'on' : ''}
              onClick={() => onLayoutChange('cards')}
            >
              Картки
            </button>
            <button
              type="button"
              className={layout === 'crm' ? 'on' : ''}
              onClick={() => onLayoutChange('crm')}
            >
              Kanban
            </button>
          </div>

          <div className={cx(styles['tlp-role-filter'], styles['tlp-filter-icon-wrap'])}>
            <button
              className={cx(
                'icon-btn',
                filtersBarOpen && styles.on,
                filtersActive && styles['tlp-filter-active'],
              )}
              type="button"
              aria-expanded={filtersBarOpen}
              aria-label={`Фільтри, ${filteredCount} проєктів`}
              onClick={() => {
                setFiltersBarOpen((open) => !open);
                setOpenPanel(null);
                setGroupOpen(false);
              }}
            >
              {Icons.filter}
              {filterCount > 0 ? (
                <span className={styles['tlp-filter-badge-icon']} aria-hidden />
              ) : null}
            </button>
          </div>
        </div>
      </div>

      {filtersBarOpen ? (
        <div
          className={styles['tlp-filter-bar']}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles['tlp-filter-chips']}>
            <div
              className={styles['tlp-filter-chip-wrap']}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={cx(
                  styles['tlp-filter-chip'],
                  openPanel === 'status' && styles.on,
                  statusFilterActive && styles.active,
                )}
                aria-expanded={openPanel === 'status'}
                onClick={(event) => {
                  event.stopPropagation();
                  openFilterPanel('status');
                }}
              >
                <span>Статус</span>
                {Icons.chevD}
              </button>
              {openPanel === 'status' ? (
                <div className={styles['tlp-filter-chip-menu']}>
                  <p className={styles['tlp-filters-hint']}>
                    Зніміть галочку, щоб приховати статус у списку та на дошці.
                  </p>
                  {PROJECT_PIPELINE_STATUS_GROUPS.map((group) => (
                    <div key={group.label} className={styles['tlp-filters-pipeline-group']}>
                      <div className={styles['tlp-filters-pipeline-group-t']}>{group.label}</div>
                      <div className={styles['tlp-filters-checks']}>
                        {group.statuses.map((status) => {
                          const visible = !filters.hiddenPipelineStatuses.includes(status);
                          return (
                            <label key={status} className={styles['tlp-filter-check']}>
                              <input
                                type="checkbox"
                                checked={visible}
                                onChange={() =>
                                  patchFilters({
                                    hiddenPipelineStatuses: toggleHidden(
                                      filters.hiddenPipelineStatuses,
                                      status,
                                      !visible,
                                    ),
                                  })
                                }
                              />
                              <span className={styles['tlp-filter-status-t']}>{status}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div
              className={styles['tlp-filter-chip-wrap']}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={cx(
                  styles['tlp-filter-chip'],
                  openPanel === 'people' && styles.on,
                  peopleFilterActive && styles.active,
                )}
                aria-expanded={openPanel === 'people'}
                onClick={(event) => {
                  event.stopPropagation();
                  openFilterPanel('people');
                }}
              >
                <span>Люди</span>
                {Icons.chevD}
              </button>
              {openPanel === 'people' ? (
                <div className={styles['tlp-filter-chip-menu']}>
                  <p className={styles['tlp-filters-hint']}>
                    Показуються проєкти, де обрана людина є в команді.
                  </p>
                  {peopleMemberIds.length > 0 ? (
                    <div className={styles['tlp-filters-checks']}>
                      {peopleMemberIds.map((memberId) => {
                        const member = teamById[memberId];
                        if (!member) return null;
                        const selected = filters.memberIds.includes(memberId);
                        return (
                          <label key={memberId} className={styles['tlp-filter-check']}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                patchFilters({
                                  memberIds: toggleMember(filters.memberIds, memberId),
                                })
                              }
                            />
                            <span className={styles['tlp-filter-check-person']}>
                              <Avatar name={member.name} hue={member.hue} size="sm" />
                              <span className={styles['tlp-filter-status-t']}>{member.name}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles['tlp-filters-hint']}>Немає людей у проєктах</p>
                  )}
                  {filters.memberIds.length > 0 ? (
                    <button
                      type="button"
                      className={styles['tlp-filters-reset-inline']}
                      onClick={() => patchFilters({ memberIds: [] })}
                    >
                      Показати всіх
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {filtersActive ? (
            <button className={styles['tlp-filters-reset']} type="button" onClick={resetFilters}>
              Скинути фільтри
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
