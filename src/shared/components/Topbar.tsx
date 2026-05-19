import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  const [openTabMenu, setOpenTabMenu] = useState<TTabId | null>(null);
  const [tabMenuSearch, setTabMenuSearch] = useState('');
  const tabMenuSearchRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState(notificationsInitial);
  const unread = notifications.filter((notification) => notification.unread).length;

  useEffect(() => {
    if (!openTabMenu) {
      setTabMenuSearch('');
      return;
    }
    tabMenuSearchRef.current?.focus();
  }, [openTabMenu]);

  useEffect(() => {
    setOpenTabMenu(null);
  }, [activeTab]);

  useEffect(() => {
    if (!openMenu && !openTabMenu) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('.pop') &&
        !target.closest('[data-pop-trigger]') &&
        !target.closest('[data-tab-pop-trigger]')
      ) {
        setOpenMenu(null);
        setOpenTabMenu(null);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [openMenu, openTabMenu]);

  return (
    <header className="tb">
      <div className="tb-l">
        {title ? <h1 className="tb-title">{title}</h1> : null}
        {subtitle ? <div className="tb-sub">{subtitle}</div> : null}
        {tabs ? (
          <nav className="tb-tabs" aria-label="Вкладки">
            {tabs.map((tab) => {
              const hasMenu = Boolean(tab.menu?.length);
              const isOpen = openTabMenu === tab.id;
              const searchQuery = isOpen ? tabMenuSearch.trim().toLowerCase() : '';
              const filteredMenu =
                !searchQuery || !tab.menu
                  ? (tab.menu ?? [])
                  : tab.menu.filter((item) => {
                      const haystack =
                        item.searchText ?? (typeof item.label === 'string' ? item.label : '');
                      return haystack.toLowerCase().includes(searchQuery);
                    });

              return (
                <div key={tab.id} className="tb-tab-wrap">
                  {hasMenu ? (
                    <div className={`tb-tab ${activeTab === tab.id ? 'on' : ''} has-menu`}>
                      <button
                        className="tb-tab-main"
                        onClick={() => {
                          if (activeTab !== tab.id) {
                            setOpenTabMenu(null);
                            onTab?.(tab.id);
                            return;
                          }
                          setOpenTabMenu(isOpen ? null : tab.id);
                          setOpenMenu(null);
                        }}
                        type="button"
                      >
                        {tab.icon ? <span className="tb-tab-i">{tab.icon}</span> : null}
                        <span>{tab.label}</span>
                        {tab.n != null ? <span className="tb-tab-n">{tab.n}</span> : null}
                      </button>
                      <button
                        className="tb-tab-chev-btn"
                        data-tab-pop-trigger
                        aria-expanded={isOpen}
                        aria-haspopup="menu"
                        aria-label="Обрати учасника"
                        onClick={() => {
                          setOpenTabMenu(isOpen ? null : tab.id);
                          setOpenMenu(null);
                        }}
                        type="button"
                      >
                        {Icons.chevD}
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`tb-tab ${activeTab === tab.id ? 'on' : ''}`}
                      onClick={() => {
                        setOpenTabMenu(null);
                        onTab?.(tab.id);
                      }}
                      type="button"
                    >
                      {tab.icon ? <span className="tb-tab-i">{tab.icon}</span> : null}
                      <span>{tab.label}</span>
                      {tab.n != null ? <span className="tb-tab-n">{tab.n}</span> : null}
                    </button>
                  )}
                  {hasMenu && isOpen ? (
                    <div className="pop pop-tab-menu" role="menu">
                      <div className="pop-tab-menu-search">
                        <label className="pop-tab-menu-search-in">
                          <span className="pop-tab-menu-search-i">{Icons.search}</span>
                          <input
                            ref={tabMenuSearchRef}
                            type="search"
                            value={tabMenuSearch}
                            onChange={(event) => setTabMenuSearch(event.target.value)}
                            placeholder="Пошук..."
                            aria-label="Пошук учасників"
                          />
                        </label>
                      </div>
                      <div className="pop-tab-list">
                        {filteredMenu.length > 0 ? (
                          filteredMenu.map((item) => (
                            <button
                              key={item.id}
                              className={`pop-row ${item.selected ? 'on' : ''}`}
                              role="menuitem"
                              type="button"
                              onClick={() => {
                                tab.onMenuSelect?.(item.id);
                                setOpenTabMenu(null);
                              }}
                            >
                              {item.icon ? <span className="pop-row-i">{item.icon}</span> : null}
                              <span className="pop-row-t">{item.label}</span>
                            </button>
                          ))
                        ) : (
                          <div className="pop-tab-empty">Нікого не знайдено</div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
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
