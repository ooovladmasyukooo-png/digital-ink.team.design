import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { TopbarTab } from '../types/common';
import { Icons } from './Icon';
import { TopbarActions } from './TopbarActions';

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
  const [openTabMenu, setOpenTabMenu] = useState<TTabId | null>(null);
  const [tabMenuSearch, setTabMenuSearch] = useState('');
  const tabMenuSearchRef = useRef<HTMLInputElement>(null);

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
    if (!openTabMenu) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('.pop') &&
        !target.closest('[data-pop-trigger]') &&
        !target.closest('[data-tab-pop-trigger]')
      ) {
        setOpenTabMenu(null);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [openTabMenu]);

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
        <TopbarActions />
      </div>
    </header>
  );
}
