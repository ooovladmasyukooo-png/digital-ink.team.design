import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '../../../shared/components/Avatar';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import styles from '../team.module.css';
import type { TeamMember, TeamSubtabId } from '../types';

const DETAIL_TABS: { id: TeamSubtabId; label: string; icon: ReactNode }[] = [
  { id: 'profile', label: 'Головна', icon: Icons.dashboard },
  { id: 'tasks', label: 'Задачі', icon: Icons.tasks },
  { id: 'payouts', label: 'Виплати', icon: Icons.finance },
  { id: 'effectiveness', label: 'Ефективність', icon: Icons.analytics },
  { id: 'settings', label: 'Налаштування', icon: Icons.settings },
];

interface TeamDetailHeaderProps {
  member: TeamMember;
  activeMembers: TeamMember[];
  memberAvatars: Record<string, string>;
  avatarSrc?: string | null;
  activeSubtab: TeamSubtabId;
  onBack: () => void;
  onSubtabChange: (tab: TeamSubtabId) => void;
  onSwitchMember: (memberId: string) => void;
}

export function TeamDetailHeader({
  member,
  activeMembers,
  memberAvatars,
  avatarSrc,
  activeSubtab,
  onBack,
  onSubtabChange,
  onSwitchMember,
}: TeamDetailHeaderProps) {
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [memberMenuSearch, setMemberMenuSearch] = useState('');
  const memberMenuSearchRef = useRef<HTMLInputElement>(null);
  const memberMenuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!memberMenuOpen) {
      setMemberMenuSearch('');
      return;
    }
    const id = requestAnimationFrame(() => memberMenuSearchRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [memberMenuOpen]);

  useEffect(() => {
    setMemberMenuOpen(false);
  }, [member.id]);

  useEffect(() => {
    if (!memberMenuOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        memberMenuWrapRef.current?.contains(target) ||
        target.closest('.pop') ||
        target.closest('[data-team-member-trigger]')
      ) {
        return;
      }
      setMemberMenuOpen(false);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [memberMenuOpen]);

  const searchQuery = memberMenuSearch.trim().toLowerCase();
  const filteredMembers = activeMembers.filter((item) => {
    if (!searchQuery) return true;
    const haystack = `${item.name} ${item.username} ${item.role}`.toLowerCase();
    return haystack.includes(searchQuery);
  });

  return (
    <header className={styles['team-stacked-header']}>
      <div className={styles['team-stacked-top']}>
        <nav className={styles['team-crumb']} aria-label="Навігація">
          <button
            type="button"
            className={cx(styles['team-crumb-text'], styles['team-crumb-root'])}
            onClick={onBack}
          >
            Команда
          </button>
          <span className={cx(styles['team-crumb-text'], styles['team-crumb-sep'])} aria-hidden>
            /
          </span>
          <div ref={memberMenuWrapRef} className={styles['team-crumb-member-wrap']}>
            <button
              type="button"
              className={cx(styles['team-crumb-member'], memberMenuOpen && styles.on)}
              data-team-member-trigger
              aria-expanded={memberMenuOpen}
              aria-haspopup="menu"
              onClick={() => setMemberMenuOpen((open) => !open)}
            >
              <Avatar name={member.name} hue={member.hue} src={avatarSrc} size="sm" />
              <span className={cx(styles['team-crumb-text'], styles['team-crumb-label'])} title={member.name}>
                {member.name}
              </span>
              <span className={styles['team-crumb-chev']} aria-hidden>
                {Icons.chevD}
              </span>
            </button>
            {memberMenuOpen ? (
              <div className={cx('pop', 'pop-tab-menu', styles['team-member-menu'])} role="menu">
                <div className="pop-tab-menu-search">
                  <label className="pop-tab-menu-search-in">
                    <span className="pop-tab-menu-search-i">{Icons.search}</span>
                    <input
                      ref={memberMenuSearchRef}
                      type="search"
                      value={memberMenuSearch}
                      onChange={(event) => setMemberMenuSearch(event.target.value)}
                      placeholder="Пошук..."
                      aria-label="Пошук учасників"
                    />
                  </label>
                </div>
                <div className="pop-tab-list">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((item) => (
                      <button
                        key={item.id}
                        className={cx('pop-row', item.id === member.id && 'on')}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          onSwitchMember(item.id);
                          setMemberMenuOpen(false);
                        }}
                      >
                        <span className="pop-row-i">
                          <Avatar
                            name={item.name}
                            hue={item.hue}
                            src={memberAvatars[item.id]}
                            size="sm"
                          />
                        </span>
                        <span className="pop-row-t">{item.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="pop-tab-empty">Нікого не знайдено</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
      <nav className={styles['team-stacked-tabs']} aria-label="Розділи профілю">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={cx(styles['team-tab'], activeSubtab === tab.id && styles.on)}
            onClick={() => onSubtabChange(tab.id)}
          >
            <span className={styles['team-tab-i']}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
