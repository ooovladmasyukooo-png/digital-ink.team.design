import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { applyTheme, getStoredTheme, type Theme } from '../theme/theme';
import { Avatar } from './Avatar';
import { Icons } from './Icon';

function SidebarAnchoredPop({
  open,
  anchorRef,
  className,
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}) {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.bottom,
        left: rect.right + 10,
        top: 'auto',
        right: 'auto',
        zIndex: 400,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      className={`pop sb-foot-pop-portal${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>,
    document.body,
  );
}

interface Notification {
  id: number;
  type: 'lead' | 'win' | 'call' | 'pay' | 'team';
  title: string;
  body: string;
  ago: string;
  unread: boolean;
}

const notificationsInitial: Notification[] = [
  { id: 1, type: 'lead', title: 'Новий лід', body: 'Маркус Райнхардт → воронка Reinhardt Group', ago: '2 хв', unread: true },
  { id: 2, type: 'win', title: 'Угода виграна', body: 'Mansour Holdings · ₴ 218 400', ago: '14 хв', unread: true },
  { id: 3, type: 'call', title: 'Заплановано дзвінок', body: 'Софія Кастельяно · 16.05 в 11:00', ago: '1 год', unread: true },
  { id: 4, type: 'pay', title: 'Оплату проведено', body: 'INV-0215 · ₴ 31 500 отримано', ago: '3 год', unread: false },
  { id: 5, type: 'team', title: 'Дарія додала нотатку', body: 'Клієнт просить знижку 5%', ago: '5 год', unread: false },
];

type MenuId = 'notif' | 'inbox' | 'me';

const notificationDotColor = (type: Notification['type']) =>
  ({
    lead: 'var(--blue)',
    win: 'var(--green)',
    call: 'var(--amber)',
    pay: 'var(--green)',
    team: 'var(--purple)',
  })[type];

interface TopbarActionsProps {
  layout?: 'topbar' | 'sidebar';
}

export function TopbarActions({ layout = 'topbar' }: TopbarActionsProps) {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [notifications, setNotifications] = useState(notificationsInitial);
  const unread = notifications.filter((notification) => notification.unread).length;
  const isSidebar = layout === 'sidebar';
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const inboxTriggerRef = useRef<HTMLButtonElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  useEffect(() => {
    if (!openMenu) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.pop') && !target.closest('[data-pop-trigger]')) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [openMenu]);

  const toggleMenu = (id: MenuId) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const markAllRead = () => {
    setNotifications(notifications.map((item) => ({ ...item, unread: false })));
  };

  const markRead = (id: number) => {
    setNotifications(
      notifications.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  };

  const notificationPanelContent = (title: string) => (
    <>
      <div className="pop-h">
        <div>
          <div className="pop-t">{title}</div>
          <div className="pop-sub">{unread} непрочитаних</div>
        </div>
        <button className="pop-link" onClick={markAllRead} type="button">
          Позначити всі
        </button>
      </div>
      <div className="pop-list">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            className={`notif ${notification.unread ? 'unread' : ''}`}
            onClick={() => markRead(notification.id)}
            type="button"
          >
            <span className="notif-dot" style={{ background: notificationDotColor(notification.type) }} />
            <span className="notif-body">
              <span className="notif-t">{notification.title}</span>
              <span className="notif-b">{notification.body}</span>
            </span>
            <span className="notif-ago mono">{notification.ago}</span>
          </button>
        ))}
      </div>
    </>
  );

  const profilePanelContent = (
    <>
      <div className="pop-me-h">
        <Avatar name="Андрій Мельник" hue={20} />
        <div>
          <div className="pop-me-name">Андрій Мельник</div>
          <div className="pop-me-mail mono">a.melnyk@aurora.co</div>
        </div>
        <span className="pop-presence" />
      </div>
      <div className="pop-me-list">
        <button className="pop-row" type="button">
          <span className="pop-row-i">{Icons.team}</span>Мій профіль
        </button>
        <button className="pop-row" type="button">
          <span className="pop-row-i">{Icons.settings}</span>Налаштування
        </button>
        <button className="pop-row danger" type="button">
          <span className="pop-row-i">{Icons.logout}</span>Вийти
        </button>
      </div>
    </>
  );

  const notificationPanel = (menuId: MenuId, title: string) =>
    openMenu === menuId ? (
      <div className="pop pop-notif">{notificationPanelContent(title)}</div>
    ) : null;

  const profilePanel =
    openMenu === 'me' ? <div className="pop pop-me">{profilePanelContent}</div> : null;

  if (isSidebar) {
    return (
      <>
        <div className="sb-foot-actions">
          <button
            type="button"
            className="sb-item sb-foot-action sb-foot-theme"
            title={theme === 'dark' ? 'Світла тема' : 'Темна тема'}
            aria-label={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
            onClick={toggleTheme}
          >
            <span className="sb-foot-action-slot" aria-hidden>
              {theme === 'dark' ? Icons.sun : Icons.moon}
            </span>
            <span className="sb-label">{theme === 'dark' ? 'Світла тема' : 'Темна тема'}</span>
          </button>

          <div className="pop-wrap sb-foot-pop">
            <button
              ref={inboxTriggerRef}
              className="sb-item sb-foot-action"
              data-pop-trigger
              title="Вхідні"
              onClick={() => toggleMenu('inbox')}
              type="button"
            >
              <span className="sb-foot-action-slot" aria-hidden>
                {Icons.inbox}
                {unread > 0 ? <span className="sb-foot-badge" /> : null}
              </span>
              <span className="sb-label">Вхідні</span>
            </button>
          </div>

          <div className="pop-wrap sb-foot-pop">
            <button
              ref={profileTriggerRef}
              className={`sb-item sb-foot-action sb-foot-profile ${openMenu === 'me' ? 'on' : ''}`}
              data-pop-trigger
              title="Профіль"
              onClick={() => toggleMenu('me')}
              type="button"
            >
              <span className="sb-foot-action-slot sb-foot-action-slot--avatar" aria-hidden>
                <Avatar name="Андрій Мельник" hue={20} size="sm" />
              </span>
              <span className="sb-label">Андрій</span>
            </button>
          </div>
        </div>

        <SidebarAnchoredPop
          open={openMenu === 'inbox'}
          anchorRef={inboxTriggerRef}
          className="pop-notif"
        >
          {notificationPanelContent('Вхідні')}
        </SidebarAnchoredPop>

        <SidebarAnchoredPop open={openMenu === 'me'} anchorRef={profileTriggerRef} className="pop-me">
          {profilePanelContent}
        </SidebarAnchoredPop>
      </>
    );
  }

  return (
    <>
      <div className="pop-wrap">
        <button
          className="icon-btn round"
          data-pop-trigger
          title="Сповіщення"
          onClick={() => toggleMenu('notif')}
          type="button"
        >
          {Icons.bell}
          {unread > 0 ? <span className="icon-dot" /> : null}
        </button>
        {notificationPanel('notif', 'Сповіщення')}
      </div>

      <div className="pop-wrap">
        <button
          className={`tb-me ${openMenu === 'me' ? 'on' : ''}`}
          data-pop-trigger
          onClick={() => toggleMenu('me')}
          type="button"
        >
          <Avatar name="Андрій Мельник" hue={20} />
          <span className="tb-me-txt">
            <span className="tb-me-name">Андрій</span>
          </span>
          {Icons.chevD}
        </button>
        {profilePanel}
      </div>
    </>
  );
}
