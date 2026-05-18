import { useEffect, useState, type ReactNode } from 'react';
import type { TopbarTab } from '../types/common';
import { Avatar } from './Avatar';
import { Icons } from './Icon';

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

const notificationDotColor = (type: Notification['type']) =>
  ({
    lead: 'var(--blue)',
    win: 'var(--green)',
    call: 'var(--amber)',
    pay: 'var(--green)',
    team: 'var(--purple)',
  })[type];

interface TopbarProps<TTabId extends string = string> {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  tabs?: TopbarTab<TTabId>[];
  activeTab?: TTabId;
  onTab?: (tabId: TTabId) => void;
}

export function Topbar<TTabId extends string = string>({
  title,
  subtitle,
  right,
  tabs,
  activeTab,
  onTab,
}: TopbarProps<TTabId>) {
  const [openMenu, setOpenMenu] = useState<'notif' | 'me' | null>(null);
  const [notifications, setNotifications] = useState(notificationsInitial);
  const unread = notifications.filter((notification) => notification.unread).length;

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

  return (
    <header className="tb">
      <div className="tb-l">
        {title ? <h1 className="tb-title">{title}</h1> : null}
        {subtitle ? <div className="tb-sub">{subtitle}</div> : null}
        {tabs ? (
          <nav className="tb-tabs" aria-label="Вкладки">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tb-tab ${activeTab === tab.id ? 'on' : ''}`}
                onClick={() => onTab?.(tab.id)}
                type="button"
              >
                {tab.icon ? <span className="tb-tab-i">{tab.icon}</span> : null}
                <span>{tab.label}</span>
                {tab.n != null ? <span className="tb-tab-n">{tab.n}</span> : null}
              </button>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="tb-r">
        {right}

        <div className="pop-wrap">
          <button
            className="icon-btn round"
            data-pop-trigger
            title="Сповіщення"
            onClick={() => setOpenMenu(openMenu === 'notif' ? null : 'notif')}
            type="button"
          >
            {Icons.bell}
            {unread > 0 ? <span className="icon-dot" /> : null}
          </button>
          {openMenu === 'notif' ? (
            <div className="pop pop-notif">
              <div className="pop-h">
                <div>
                  <div className="pop-t">Сповіщення</div>
                  <div className="pop-sub">{unread} непрочитаних</div>
                </div>
                <button className="pop-link" onClick={() => setNotifications(notifications.map((item) => ({ ...item, unread: false })))} type="button">
                  Позначити всі
                </button>
              </div>
              <div className="pop-list">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`notif ${notification.unread ? 'unread' : ''}`}
                    onClick={() => setNotifications(notifications.map((item) => (item.id === notification.id ? { ...item, unread: false } : item)))}
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
            </div>
          ) : null}
        </div>

        <div className="pop-wrap">
          <button
            className={`tb-me ${openMenu === 'me' ? 'on' : ''}`}
            data-pop-trigger
            onClick={() => setOpenMenu(openMenu === 'me' ? null : 'me')}
            type="button"
          >
            <Avatar name="Андрій Мельник" hue={20} />
            <span className="tb-me-txt">
              <span className="tb-me-name">Андрій</span>
            </span>
            {Icons.chevD}
          </button>
          {openMenu === 'me' ? (
            <div className="pop pop-me">
              <div className="pop-me-h">
                <Avatar name="Андрій Мельник" hue={20} />
                <div>
                  <div className="pop-me-name">Андрій Мельник</div>
                  <div className="pop-me-mail mono">a.melnyk@aurora.co</div>
                </div>
                <span className="pop-presence" />
              </div>
              <div className="pop-me-list">
                <button className="pop-row" type="button"><span className="pop-row-i">{Icons.team}</span>Мій профіль</button>
                <button className="pop-row" type="button"><span className="pop-row-i">{Icons.settings}</span>Налаштування</button>
                <button className="pop-row danger" type="button"><span className="pop-row-i">{Icons.logout}</span>Вийти</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
