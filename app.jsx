const { useState, useMemo, useEffect } = React;

/* ─────────────────────────── ICONS ─────────────────────────── */
const Icon = ({ d, size = 18, sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const ICN = {
  crm:      <Icon d={<><path d="M3 7h18M3 12h18M3 17h12"/></>} />,
  projects: <Icon d={<><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></>} />,
  briefcase:<Icon d={<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>} size={13}/>,
  calendar: <Icon d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>} size={13}/>,
  analytics:<Icon d={<><path d="M4 19V5M10 19v-8M16 19v-4M22 19H2"/></>} />,
  finance:  <Icon d={<><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>} />,
  team:     <Icon d={<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="6.5" r="2.5"/><path d="M21.5 18a4.5 4.5 0 0 0-6-4.2"/></>} />,
  settings: <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.6.7 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>} />,
  logout:   <Icon d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>} />,
  search:   <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />,
  filter:   <Icon d={<><path d="M3 5h18M6 12h12M10 19h4"/></>} />,
  plus:     <Icon d={<><path d="M12 5v14M5 12h14"/></>} />,
  bell:     <Icon d={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/></>} />,
  chevD:    <Icon d={<><path d="m6 9 6 6 6-6"/></>} size={14}/>,
  arrowU:   <Icon d={<><path d="M12 19V5M5 12l7-7 7 7"/></>} size={14}/>,
  arrowD:   <Icon d={<><path d="M12 5v14M19 12l-7 7-7-7"/></>} size={14}/>,
  more:     <Icon d={<><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></>} />,
  call:     <Icon d={<><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></>} size={14}/>,
  mail:     <Icon d={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></>} size={14}/>,
  check:    <Icon d={<><path d="M20 6 9 17l-5-5"/></>} size={14}/>,
  spark:    <Icon d={<><path d="M12 2 14 9l7 1-5 5 2 7-6-4-6 4 2-7-5-5 7-1Z"/></>} size={14}/>,
  inbox:    <Icon d={<><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z"/></>} />,
  download: <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></>} size={14}/>,
  trend:    <Icon d={<><path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></>} size={14}/>,
};

/* ─────────────────────────── PRIMITIVES ─────────────────────────── */
const Avatar = ({ name, hue = 0, src }) => {
  const init = name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  const bg = `oklch(0.42 0.08 ${hue})`;
  const fg = `oklch(0.92 0.04 ${hue})`;
  if (src) return <img src={src} alt={name} className="av-img" />;
  return <div className="av" style={{ background: bg, color: fg }}>{init}</div>;
};

const Chip = ({ tone = 'gray', children, dot }) => (
  <span className={`chip chip-${tone}`}>
    {dot && <span className="chip-dot"/>}
    {children}
  </span>
);

const Stat = ({ label, value, delta, up, foot }) => (
  <div className="stat">
    <div className="stat-label">{label}</div>
    <div className="stat-row">
      <div className="stat-value">{value}</div>
      {delta != null && (
        <span className={`stat-delta ${up ? 'up' : 'down'}`}>
          {up ? ICN.arrowU : ICN.arrowD}
          {delta}
        </span>
      )}
    </div>
    {foot && <div className="stat-foot">{foot}</div>}
  </div>
);

/* ─────────────────────────── DATA ─────────────────────────── */
const LEADS = [
  { id:'L-0118', name:'Олена Кравченко',  status:'hot',     stage:'Переговори',  source:'Instagram', value:48200, owner:'AM', country:'🇺🇦', last:'2 хв тому',  email:'olena.k@studio.ua',     hue:20  },
  { id:'L-0117', name:'Marcus Reinhardt', status:'new',     stage:'Кваліфікація',source:'Referral',  value:124000,owner:'DV', country:'🇩🇪', last:'14 хв тому', email:'marcus@reinhardt.de',   hue:240 },
  { id:'L-0116', name:'Sofia Castellano', status:'warm',    stage:'Пропозиція',  source:'Webinar',   value:31500, owner:'AM', country:'🇮🇹', last:'1 год тому', email:'sofia.c@made-in.it',    hue:340 },
  { id:'L-0115', name:'Тарас Глущенко',   status:'hot',     stage:'Переговори',  source:'Direct',    value:67800, owner:'YA', country:'🇺🇦', last:'2 год тому', email:'taras@glushchenko.co',  hue:120 },
  { id:'L-0114', name:'Aiko Tanaka',      status:'new',     stage:'Кваліфікація',source:'LinkedIn',  value:92400, owner:'DV', country:'🇯🇵', last:'4 год тому', email:'aiko@kireihaus.jp',     hue:300 },
  { id:'L-0113', name:'Дмитро Білий',     status:'cold',    stage:'Розвідка',    source:'Outbound',  value:18900, owner:'YA', country:'🇺🇦', last:'1 день тому',email:'d.bilyi@northforge.ua', hue:200 },
  { id:'L-0112', name:'Petra Novak',      status:'warm',    stage:'Пропозиція',  source:'Instagram', value:52000, owner:'AM', country:'🇨🇿', last:'1 день тому',email:'petra@novak-studio.cz', hue:60  },
  { id:'L-0111', name:'Khalid Mansour',   status:'hot',     stage:'Контракт',    source:'Referral',  value:218400,owner:'DV', country:'🇦🇪', last:'2 дні тому', email:'k.mansour@oasis.ae',    hue:160 },
  { id:'L-0110', name:'Anya Volkova',     status:'lost',    stage:'Втрачений',   source:'Webinar',   value:0,     owner:'YA', country:'🇵🇱', last:'3 дні тому', email:'anya.v@volkovaco.pl',   hue:280 },
];

const PIPELINE = [
  { id:'recon',  title:'Розвідка',     count:42, value:'₴1.2M', tone:'gray' },
  { id:'qual',   title:'Кваліфікація', count:28, value:'₴2.8M', tone:'blue' },
  { id:'prop',   title:'Пропозиція',   count:19, value:'₴3.4M', tone:'amber'},
  { id:'nego',   title:'Переговори',   count:11, value:'₴4.1M', tone:'red'  },
  { id:'won',    title:'Виграні',      count:7,  value:'₴2.6M', tone:'green'},
];

const TEAM = [
  { name:'Андрій Мельник',   role:'Head of Sales',    hue:20,  stat:[214, 92, 38], online:true,  email:'a.melnyk@aurora.co',  phone:'+380 67 412 88 21' },
  { name:'Дарія Власенко',   role:'Senior AE',        hue:340, stat:[186, 81, 31], online:true,  email:'d.vlasenko@aurora.co',phone:'+380 63 221 70 04' },
  { name:'Ярослав Антонюк',  role:'Account Executive',hue:200, stat:[152, 76, 28], online:false, email:'y.antonyuk@aurora.co',phone:'+380 95 818 22 19' },
  { name:'Sofia Beaumont',   role:'BDR Lead',         hue:60,  stat:[122, 68, 22], online:true,  email:'sofia.b@aurora.co',   phone:'+33 6 18 24 90 11' },
  { name:'Олексій Ткач',     role:'Customer Success', hue:160, stat:[98,  64, 17], online:false, email:'o.tkach@aurora.co',   phone:'+380 50 412 09 88' },
  { name:'Mira Halvorsen',   role:'Revenue Ops',      hue:280, stat:[71,  58, 12], online:true,  email:'mira.h@aurora.co',    phone:'+47 92 14 30 11'   },
];

const TRANSACTIONS = [
  { id:'TX-3041', client:'Reinhardt GmbH',     type:'in',  amount:124000,  method:'Wire',      status:'cleared',  date:'15.05.2026 09:14' },
  { id:'TX-3040', client:'Aurora Co payroll',  type:'out', amount:-318400, method:'SEPA',      status:'cleared',  date:'15.05.2026 06:00' },
  { id:'TX-3039', client:'Mansour Holdings',   type:'in',  amount:218400,  method:'Wire',      status:'cleared',  date:'14.05.2026 17:42' },
  { id:'TX-3038', client:'Stripe payout',      type:'in',  amount:48230,   method:'Stripe',    status:'cleared',  date:'14.05.2026 12:08' },
  { id:'TX-3037', client:'AWS Infrastructure', type:'out', amount:-14820,  method:'Card',      status:'pending',  date:'14.05.2026 09:01' },
  { id:'TX-3036', client:'Castellano s.r.l.',  type:'in',  amount:31500,   method:'SEPA',      status:'cleared',  date:'13.05.2026 19:55' },
  { id:'TX-3035', client:'Figma annual',       type:'out', amount:-4200,   method:'Card',      status:'cleared',  date:'13.05.2026 11:30' },
  { id:'TX-3034', client:'Novak Studio',       type:'in',  amount:52000,   method:'Wire',      status:'pending',  date:'12.05.2026 22:17' },
];

const fmt = n => (n < 0 ? '−' : '') + '₴' + Math.abs(n).toLocaleString('uk-UA');

/* ─────────────────────────── SIDEBAR ─────────────────────────── */
const Sidebar = ({ active, onChange }) => {
  const items = [
    { id:'crm',       label:'СРМ',       icon:ICN.crm,       badge:227 },
    { id:'projects',  label:'Проєкти',   icon:ICN.projects  },
    { id:'analytics', label:'Аналітика', icon:ICN.analytics },
    { id:'finance',   label:'Фінанси',   icon:ICN.finance   },
    { id:'team',      label:'Команда',   icon:ICN.team      },
  ];
  return (
    <aside className="sb">
      <div className="sb-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 3 8v8l9 6 9-6V8l-9-6Z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M12 7v10M7.5 9.5 12 12l4.5-2.5M7.5 14.5 12 17l4.5-2.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <nav className="sb-nav">
        {items.map(it => (
          <button key={it.id}
                  className={`sb-item ${active === it.id ? 'on' : ''}`}
                  onClick={() => onChange(it.id)}
                  title={it.label}>
            {it.icon}
            <span className="sb-label">{it.label}</span>
            {it.badge && <span className="sb-badge">{it.badge}</span>}
            {it.badge && <span className="sb-badge-mini"/>}
          </button>
        ))}
      </nav>
      <div className="sb-foot">
        <button className="sb-item" title="Налаштування">{ICN.settings}<span className="sb-label">Налашт.</span></button>
        <button className="sb-item" title="Вийти">{ICN.logout}<span className="sb-label">Вийти</span></button>
      </div>
    </aside>
  );
};

/* ─────────────────────────── TOPBAR ─────────────────────────── */
const NOTIFS_INIT = [
  { id:1, type:'lead', title:'Новий лід',          body:'Маркус Райнхардт → воронка «Reinhardt Group»', ago:'2 хв',   unread:true  },
  { id:2, type:'win',  title:'Угода виграна',      body:'Mansour Holdings · ₴ 218 400',                  ago:'14 хв',  unread:true  },
  { id:3, type:'call', title:'Заплановано дзвінок',body:'Софія Кастельяно · 16.05 в 11:00',             ago:'1 год',  unread:true  },
  { id:4, type:'pay',  title:'Оплату проведено',   body:'INV-0215 · ₴ 31 500 отримано',                  ago:'3 год',  unread:false },
  { id:5, type:'team', title:'Дарія додала нотатку',body:'«Клієнт просить знижку 5%»',                   ago:'5 год',  unread:false },
  { id:6, type:'lead', title:'Лід відкрив пропозицію',body:'Petra Novak · "Aurora Pro"',                 ago:'вчора',  unread:false },
];

const notifDotColor = t => ({
  lead:'var(--blue)', win:'var(--green)', call:'var(--amber)',
  pay:'var(--green)', team:'var(--purple)'
}[t] || 'var(--txt-3)');

const Topbar = ({ title, subtitle, right, tabs, activeTab, onTab }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [notifs, setNotifs] = useState(NOTIFS_INIT);
  const unread = notifs.filter(n => n.unread).length;

  useEffect(() => {
    if (!openMenu) return;
    const h = (e) => {
      if (!e.target.closest('.pop') && !e.target.closest('[data-pop-trigger]')) setOpenMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [openMenu]);

  return (
    <header className="tb">
      <div className="tb-l">
        {title && <h1 className="tb-title">{title}</h1>}
        {subtitle && <div className="tb-sub">{subtitle}</div>}
        {tabs && (
          <nav className="tb-tabs">
            {tabs.map(t => (
              <button key={t.id}
                      className={`tb-tab ${activeTab===t.id?'on':''}`}
                      onClick={() => onTab && onTab(t.id)}>
                {t.icon && <span className="tb-tab-i">{t.icon}</span>}
                <span>{t.label}</span>
                {t.n != null && <span className="tb-tab-n">{t.n}</span>}
              </button>
            ))}
          </nav>
        )}
      </div>
      <div className="tb-r">
        {right}

        <div className="pop-wrap">
          <button
            className="icon-btn round"
            data-pop-trigger
            title="Сповіщення"
            onClick={() => setOpenMenu(openMenu === 'notif' ? null : 'notif')}>
            {ICN.bell}
            {unread > 0 && <span className="icon-dot"/>}
          </button>
          {openMenu === 'notif' && (
            <div className="pop pop-notif">
              <div className="pop-h">
                <div>
                  <div className="pop-t">Сповіщення</div>
                  <div className="pop-sub">{unread} непрочитаних</div>
                </div>
                <button className="pop-link"
                        onClick={() => setNotifs(notifs.map(n => ({...n, unread:false})))}>
                  Позначити всі
                </button>
              </div>
              <div className="pop-tabs">
                <button className="pop-tab on">Усі<span className="tab-n">{notifs.length}</span></button>
                <button className="pop-tab">Непрочитані<span className="tab-n">{unread}</span></button>
                <button className="pop-tab">Згадки</button>
              </div>
              <div className="pop-list">
                {notifs.map(n => (
                  <div key={n.id}
                       className={`notif ${n.unread ? 'unread' : ''}`}
                       onClick={() => setNotifs(notifs.map(x => x.id===n.id ? {...x, unread:false} : x))}>
                    <span className="notif-dot" style={{ background: notifDotColor(n.type) }}/>
                    <div className="notif-body">
                      <div className="notif-t">{n.title}</div>
                      <div className="notif-b">{n.body}</div>
                    </div>
                    <div className="notif-ago mono">{n.ago}</div>
                  </div>
                ))}
              </div>
              <div className="pop-f">
                <button className="pop-link">Відкрити всі сповіщення →</button>
              </div>
            </div>
          )}
        </div>

        <div className="pop-wrap">
          <div className={`tb-me ${openMenu==='me' ? 'on' : ''}`}
               data-pop-trigger
               onClick={() => setOpenMenu(openMenu === 'me' ? null : 'me')}>
            <Avatar name="Андрій Мельник" hue={20}/>
            <div className="tb-me-txt"><div className="tb-me-name">Андрій</div></div>
            {ICN.chevD}
          </div>
          {openMenu === 'me' && (
            <div className="pop pop-me">
              <div className="pop-me-h">
                <Avatar name="Андрій Мельник" hue={20}/>
                <div>
                  <div className="pop-me-name">Андрій Мельник</div>
                  <div className="pop-me-mail mono">a.melnyk@aurora.co</div>
                </div>
                <span className="pop-presence"/>
              </div>
              <div className="pop-me-stats">
                <div>
                  <div className="micro">Посада</div>
                  <div className="pop-me-v">Head of Sales</div>
                </div>
                <div>
                  <div className="micro">Організація</div>
                  <div className="pop-me-v">Aurora · Owner</div>
                </div>
              </div>
              <div className="pop-me-stats">
                <div>
                  <div className="micro">Угод цього місяця</div>
                  <div className="pop-me-v big">214</div>
                </div>
                <div>
                  <div className="micro">Win-rate</div>
                  <div className="pop-me-v big">92%</div>
                </div>
              </div>
              <div className="pop-me-list">
                <button className="pop-row"><span className="pop-row-i">{ICN.team}</span>Мій профіль<span className="pop-row-k mono">⌘P</span></button>
                <button className="pop-row"><span className="pop-row-i">{ICN.settings}</span>Налаштування<span className="pop-row-k mono">⌘,</span></button>
                <button className="pop-row"><span className="pop-row-i">{ICN.analytics}</span>Моя активність</button>
                <button className="pop-row"><span className="pop-row-i">{ICN.inbox}</span>Запрошення команди</button>
              </div>
              <div className="pop-me-foot">
                <button className="pop-row danger"><span className="pop-row-i">{ICN.logout}</span>Вийти</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/* ─────────────────────────── CRM ─────────────────────────── */
const CRM = () => {
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState('L-0118');
  const [view, setView] = useState('list');

  const filtered = useMemo(() => {
    if (tab === 'all') return LEADS;
    return LEADS.filter(l => l.status === tab);
  }, [tab]);

  const tabs = [
    { id:'all',  label:'Усі',         n:LEADS.length },
    { id:'hot',  label:'Гарячі',      n:LEADS.filter(l=>l.status==='hot').length },
    { id:'warm', label:'Теплі',       n:LEADS.filter(l=>l.status==='warm').length },
    { id:'new',  label:'Нові',        n:LEADS.filter(l=>l.status==='new').length },
    { id:'cold', label:'Холодні',     n:LEADS.filter(l=>l.status==='cold').length },
    { id:'lost', label:'Втрачені',    n:LEADS.filter(l=>l.status==='lost').length },
  ];

  const detail = LEADS.find(l => l.id === selected) || LEADS[0];

  return (
    <div className="crm">
      <Topbar
        title="Воронка продажів"
        subtitle="227 угод · оновлено щойно"
        right={
          <div className="seg">
            <button className={view==='list'?'on':''} onClick={()=>setView('list')}>
              <Icon d={<><path d="M3 6h18M3 12h18M3 18h18"/></>} size={15}/>
              Список
            </button>
            <button className={view==='board'?'on':''} onClick={()=>setView('board')}>
              <Icon d={<><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="10" rx="1"/><rect x="17" y="4" width="4" height="13" rx="1"/></>} size={15}/>
              Дошка
            </button>
          </div>
        }
      />

      <div className="page">
        {/* pipeline strip */}
        <div className="pipe">
          {PIPELINE.map(p => (
            <div key={p.id} className={`pipe-cell tone-${p.tone}`}>
              <div className="pipe-bar"/>
              <div className="pipe-meta">
                <div className="pipe-title">{p.title}</div>
                <div className="pipe-row">
                  <span className="pipe-count">{p.count}</span>
                  <span className="pipe-value">{p.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="crm-grid">
          {/* main column */}
          <div className="card">
            <div className="card-h">
              <div className="tabs">
                {tabs.map(t => (
                  <button key={t.id}
                          className={`tab ${tab===t.id?'on':''}`}
                          onClick={()=>setTab(t.id)}>
                    {t.label}<span className="tab-n">{t.n}</span>
                  </button>
                ))}
              </div>
              <div className="card-h-r">
                <button className="ghost-btn">{ICN.filter} Фільтр</button>
                <button className="ghost-btn">{ICN.download} Експорт</button>
                <button className="prim-btn">{ICN.plus} Новий лід</button>
              </div>
            </div>

            {view === 'list' ? (
              <div className="tbl">
                <div className="tbl-h">
                  <div>Лід</div>
                  <div>Стадія</div>
                  <div>Джерело</div>
                  <div className="num">Вартість</div>
                  <div>Менеджер</div>
                  <div>Активність</div>
                </div>
                {filtered.map(l => (
                  <div key={l.id}
                       className={`tbl-r ${selected===l.id?'on':''}`}
                       onClick={()=>setSelected(l.id)}>
                    <div className="cell-lead">
                      <Avatar name={l.name} hue={l.hue}/>
                      <div>
                        <div className="lead-name">
                          <span className="flag">{l.country}</span>
                          {l.name}
                        </div>
                        <div className="lead-meta">
                          <span className="mono">{l.id}</span>
                          <Chip tone={l.status}>
                            {{hot:'Гарячий',warm:'Теплий',new:'Новий',cold:'Холодний',lost:'Втрачений'}[l.status]}
                          </Chip>
                        </div>
                      </div>
                    </div>
                    <div><Chip tone="gray">{l.stage}</Chip></div>
                    <div className="muted mono">{l.source}</div>
                    <div className="num mono">{l.value ? fmt(l.value) : '—'}</div>
                    <div>
                      <div className="owner">
                        <span className="owner-pill" style={{background:`oklch(0.45 0.1 ${l.hue*1.7})`}}>{l.owner}</span>
                      </div>
                    </div>
                    <div className="muted">{l.last}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="board">
                {PIPELINE.map(p => {
                  const cards = LEADS.filter(l => l.stage === p.title || (p.title==='Розвідка' && l.stage==='Розвідка') || (p.title==='Виграні' && false));
                  return (
                    <div key={p.id} className={`col tone-${p.tone}`}>
                      <div className="col-h">
                        <div className="col-t">
                          <span className="col-dot"/>
                          {p.title}
                          <span className="col-n">{cards.length || p.count}</span>
                        </div>
                        <button className="col-add">{ICN.plus}</button>
                      </div>
                      <div className="col-body">
                        {cards.map(c => (
                          <div key={c.id} className={`bcard ${selected===c.id?'on':''}`} onClick={()=>setSelected(c.id)}>
                            <div className="bcard-h">
                              <span className="mono muted">{c.id}</span>
                              <span className="flag">{c.country}</span>
                            </div>
                            <div className="bcard-name">{c.name}</div>
                            <div className="bcard-val">{c.value ? fmt(c.value) : '—'}</div>
                            <div className="bcard-f">
                              <span className="owner-pill sm" style={{background:`oklch(0.45 0.1 ${c.hue*1.7})`}}>{c.owner}</span>
                              <span className="muted">{c.last}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* detail rail */}
          <aside className="rail">
            <div className="card">
              <div className="rail-h">
                <Avatar name={detail.name} hue={detail.hue}/>
                <div>
                  <div className="rail-name">{detail.name}</div>
                  <div className="rail-sub mono">{detail.id} · {detail.country} {detail.source}</div>
                </div>
                <button className="icon-btn sm">{ICN.more}</button>
              </div>

              <div className="rail-actions">
                <button className="ghost-btn">{ICN.call} Дзвінок</button>
                <button className="ghost-btn">{ICN.mail} Email</button>
                <button className="prim-btn">{ICN.spark} Дія</button>
              </div>

              <div className="rail-grid">
                <div>
                  <div className="micro">Вартість</div>
                  <div className="rail-val">{fmt(detail.value)}</div>
                </div>
                <div>
                  <div className="micro">Ймовірність</div>
                  <div className="rail-val">82%</div>
                </div>
                <div>
                  <div className="micro">Стадія</div>
                  <div className="rail-val">{detail.stage}</div>
                </div>
                <div>
                  <div className="micro">Закриття</div>
                  <div className="rail-val">28.05</div>
                </div>
              </div>

              <div className="rail-section">
                <div className="rail-section-t">Активність</div>
                <ul className="timeline">
                  <li><i className="dot red"/>Менеджер залишив нотатку <em>2 хв тому</em></li>
                  <li><i className="dot green"/>Лід відкрив пропозицію <em>32 хв тому</em></li>
                  <li><i className="dot blue"/>Запланований дзвінок · 16.05 11:00</li>
                  <li><i className="dot gray"/>Створено з {detail.source} <em>14.05</em></li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── ANALYTICS ─────────────────────────── */
const Spark = ({ data, h = 60, w = 220, fill = true, color = '#ef4444' }) => {
  const min = Math.min(...data), max = Math.max(...data);
  const norm = v => h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i*step},${norm(v)}`).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="spark">
      {fill && <polygon points={area} fill={color} opacity="0.12"/>}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
};

const Analytics = () => {
  const revenue = [14,18,16,22,28,24,32,38,34,42,46,52,58,55,62];
  const leads   = [22,20,28,32,30,38,42,40,48,54,58,52,60,68,72];
  const conv    = [12,18,14,22,20,28,26,32,30,38,36,42,45,52,58];

  const bars = [
    {l:'Пн',v:62},{l:'Вт',v:88},{l:'Ср',v:74},{l:'Чт',v:96},
    {l:'Пт',v:108},{l:'Сб',v:42},{l:'Нд',v:28},
  ];
  const maxBar = Math.max(...bars.map(b=>b.v));

  const channels = [
    { k:'Instagram', v: 38, c:'#ef4444' },
    { k:'Direct',    v: 22, c:'#f59e0b' },
    { k:'Referral',  v: 18, c:'#10b981' },
    { k:'Webinar',   v: 12, c:'#3b82f6' },
    { k:'LinkedIn',  v: 10, c:'#a855f7' },
  ];
  let acc = 0;
  const total = channels.reduce((a,c)=>a+c.v,0);

  return (
    <div className="page-shell">
      <Topbar
        title="Аналітика"
        subtitle="Останні 30 днів · реальний час"
        right={
          <div className="seg">
            <button>7d</button>
            <button className="on">30d</button>
            <button>90d</button>
            <button>Рік</button>
          </div>
        }
      />
      <div className="page">
        <div className="stats">
          <div className="card stat-card">
            <Stat label="Виручка" value="₴1.84M" delta="18.2%" up foot="vs ₴1.56M минулого періоду"/>
            <Spark data={revenue}/>
          </div>
          <div className="card stat-card">
            <Stat label="Нові ліди" value="1 248" delta="12.4%" up foot="227 кваліфікованих"/>
            <Spark data={leads} color="#10b981"/>
          </div>
          <div className="card stat-card">
            <Stat label="Конверсія" value="32.4%" delta="2.1%" up={false} foot="Q2 ціль · 36%"/>
            <Spark data={conv} color="#3b82f6"/>
          </div>
          <div className="card stat-card">
            <Stat label="Сер. чек" value="₴48 200" delta="8.6%" up foot="по 184 угодах"/>
            <Spark data={revenue.map(x=>x*0.7+10)} color="#f59e0b"/>
          </div>
        </div>

        <div className="an-grid">
          <div className="card big-chart">
            <div className="card-h2">
              <div>
                <div className="card-t">Виручка по тижнях</div>
                <div className="card-sub">Травень 2026 · {fmt(1840000)} закрито</div>
              </div>
              <div className="legend">
                <span><i className="lg-dot red"/>Закрито</span>
                <span><i className="lg-dot gray"/>Прогноз</span>
              </div>
            </div>
            <div className="bars">
              {bars.map((b,i)=>(
                <div key={i} className="bar-col">
                  <div className="bar-stack">
                    <div className="bar bar-forecast" style={{height: `${(b.v*1.18/maxBar)*100*1.18/2}%`}}/>
                    <div className="bar bar-real" style={{height: `${(b.v/maxBar)*100*1.18/2}%`}}/>
                  </div>
                  <div className="bar-lab">{b.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h2">
              <div>
                <div className="card-t">Джерела лідів</div>
                <div className="card-sub">1 248 за 30 днів</div>
              </div>
            </div>
            <div className="donut-wrap">
              <svg viewBox="0 0 120 120" className="donut">
                {channels.map((c,i) => {
                  const start = acc / total * 360;
                  acc += c.v;
                  const end = acc / total * 360;
                  const r = 50, cx = 60, cy = 60;
                  const a1 = (start-90) * Math.PI/180;
                  const a2 = (end-90)   * Math.PI/180;
                  const large = end - start > 180 ? 1 : 0;
                  const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
                  const x2 = cx + r*Math.cos(a2), y2 = cy + r*Math.sin(a2);
                  return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`} fill={c.c} opacity="0.85"/>;
                })}
                <circle cx="60" cy="60" r="32" fill="#0d0d0e"/>
                <text x="60" y="56" textAnchor="middle" className="donut-n">1 248</text>
                <text x="60" y="72" textAnchor="middle" className="donut-l">лідів</text>
              </svg>
              <ul className="legend-list">
                {channels.map(c=>(
                  <li key={c.k}>
                    <i className="lg-square" style={{background:c.c}}/>
                    <span className="lg-k">{c.k}</span>
                    <span className="lg-v mono">{Math.round(c.v/total*100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card span-2">
            <div className="card-h2">
              <div>
                <div className="card-t">Лідерборд менеджерів</div>
                <div className="card-sub">за виручкою · травень</div>
              </div>
              <button className="ghost-btn sm">Всі звіти</button>
            </div>
            <div className="leader">
              {TEAM.slice(0,5).map((t,i) => {
                const pct = (t.stat[1]/95)*100;
                return (
                  <div key={t.name} className="leader-row">
                    <div className="leader-rank">{String(i+1).padStart(2,'0')}</div>
                    <Avatar name={t.name} hue={t.hue}/>
                    <div className="leader-name">
                      <div>{t.name}</div>
                      <div className="muted xs">{t.role}</div>
                    </div>
                    <div className="leader-bar"><span style={{width:`${pct}%`}}/></div>
                    <div className="mono leader-v">{t.stat[0]} угод</div>
                    <div className="mono leader-r">{fmt(t.stat[1]*12000)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── FINANCE ─────────────────────────── */
const Finance = () => {
  const cashIn  = TRANSACTIONS.filter(t=>t.type==='in').reduce((a,t)=>a+t.amount,0);
  const cashOut = TRANSACTIONS.filter(t=>t.type==='out').reduce((a,t)=>a+Math.abs(t.amount),0);

  return (
    <div className="page-shell">
      <Topbar
        title="Фінанси"
        subtitle="Травень 2026 · 2 рахунки під'єднано"
        right={<button className="prim-btn">{ICN.plus} Транзакція</button>}
      />
      <div className="page">
        <div className="fin-top">
          <div className="card balance">
            <div className="balance-l">
              <div className="micro">Загальний баланс</div>
              <div className="balance-v">₴4 218 940<span>.18</span></div>
              <div className="balance-foot">
                <Chip tone="green" dot>+12.4% цього місяця</Chip>
                <span className="muted">Оновлено 09:42</span>
              </div>
            </div>
            <div className="balance-r">
              <div className="fin-mini">
                <div className="micro">Надходження</div>
                <div className="fin-mini-v up">{fmt(cashIn)}</div>
                <div className="fin-mini-bar"><span className="up" style={{width:'72%'}}/></div>
              </div>
              <div className="fin-mini">
                <div className="micro">Витрати</div>
                <div className="fin-mini-v down">{fmt(cashOut)}</div>
                <div className="fin-mini-bar"><span className="down" style={{width:'48%'}}/></div>
              </div>
              <div className="fin-mini">
                <div className="micro">Чистий потік</div>
                <div className="fin-mini-v up">{fmt(cashIn - cashOut)}</div>
                <div className="fin-mini-bar"><span className="up" style={{width:'58%'}}/></div>
              </div>
            </div>
          </div>

          <div className="card invoices">
            <div className="card-h2">
              <div>
                <div className="card-t">Інвойси</div>
                <div className="card-sub">в обробці</div>
              </div>
              <button className="ghost-btn sm">Усі</button>
            </div>
            <div className="inv-list">
              <div className="inv-row">
                <div><div className="inv-id mono">INV-0218</div><div className="muted xs">Reinhardt GmbH</div></div>
                <Chip tone="amber" dot>Очікує</Chip>
                <div className="mono">{fmt(124000)}</div>
              </div>
              <div className="inv-row">
                <div><div className="inv-id mono">INV-0217</div><div className="muted xs">Novak Studio</div></div>
                <Chip tone="amber" dot>Очікує</Chip>
                <div className="mono">{fmt(52000)}</div>
              </div>
              <div className="inv-row">
                <div><div className="inv-id mono">INV-0216</div><div className="muted xs">Mansour Holdings</div></div>
                <Chip tone="red" dot>Прострочено</Chip>
                <div className="mono">{fmt(86200)}</div>
              </div>
              <div className="inv-row">
                <div><div className="inv-id mono">INV-0215</div><div className="muted xs">Castellano s.r.l.</div></div>
                <Chip tone="green" dot>Сплачено</Chip>
                <div className="mono">{fmt(31500)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h2">
            <div>
              <div className="card-t">Транзакції</div>
              <div className="card-sub">останні 7 днів · 8 операцій</div>
            </div>
            <div className="card-h-r">
              <button className="ghost-btn">{ICN.filter} Фільтр</button>
              <button className="ghost-btn">{ICN.download} CSV</button>
            </div>
          </div>
          <div className="tbl tbl-tx">
            <div className="tbl-h">
              <div>ID</div>
              <div>Контрагент</div>
              <div>Метод</div>
              <div>Статус</div>
              <div className="num">Сума</div>
              <div>Дата</div>
            </div>
            {TRANSACTIONS.map(t => (
              <div key={t.id} className="tbl-r">
                <div className="mono muted">{t.id}</div>
                <div className="tx-client">
                  <span className={`tx-arrow ${t.type}`}>{t.type==='in'?ICN.arrowD:ICN.arrowU}</span>
                  {t.client}
                </div>
                <div><Chip tone="gray">{t.method}</Chip></div>
                <div>
                  <Chip tone={t.status==='cleared'?'green':'amber'} dot>
                    {t.status==='cleared'?'Проведено':'В обробці'}
                  </Chip>
                </div>
                <div className={`num mono ${t.type==='in'?'pos':'neg'}`}>
                  {t.type==='in'?'+':'−'}{fmt(Math.abs(t.amount)).replace('₴','₴')}
                </div>
                <div className="muted mono">{t.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── TEAM ─────────────────────────── */
const TEAM_FULL = [
  { id:'andrii',   username:'a.melnyk',  name:'Андрій Мельник',   role:'Owner',                  hue:20,  status:'active', city:'Київ, UA',   birthday:'12.03.1989', joined:'01.01.2022', conditions:'Партнер · 28%. Доступний для стратегічних сесій і ревʼю ключових угод.', dream:'Вивести Aurora на ринок EU за 18 місяців', hobby:'Кросфіт, гірський велосипед', email:'a.melnyk@aurora.co',  phone:'+380 67 412 88 21', telegram:'@a_melnyk', telegramId:'74218821', comments:'Фокус на стратегічних клієнтах і партнерських інтеграціях.' },
  { id:'daria',    username:'d.vlasenko',name:'Дарія Власенко',   role:'Senior Media Buyer',     hue:340, status:'active', city:'Львів, UA',  birthday:'28.07.1994', joined:'03.04.2022', conditions:'FTE · бонуси по KPI. Веде складні performance-кампанії.', dream:'Закрити перший deal на $1M', hobby:'Йога, кераміка', email:'d.vlasenko@aurora.co',phone:'+380 63 221 70 04', telegram:'@d_vlasenko', telegramId:'632217004', comments:'Потребує раннього доступу до нових рекламних кабінетів.' },
  { id:'yaroslav', username:'y.antonyuk',name:'Ярослав Антонюк',  role:'Media Buyer',            hue:200, status:'active', city:'Одеса, UA',  birthday:'09.11.1996', joined:'17.08.2023', conditions:'FTE. Працює з холодними запусками та тестами креативів.', dream:'Подорож у Патагонію', hobby:'Серфінг, фото', email:'y.antonyuk@aurora.co',phone:'+380 95 818 22 19', telegram:'@y_antonyuk', telegramId:'958182219', comments:'Добре закриває задачі з короткими дедлайнами.' },
  { id:'sofia',    username:'s.beaumont',name:'Sofia Beaumont',   role:'Project Manager',        hue:60,  status:'active', city:'Paris, FR',  birthday:'02.05.1992', joined:'12.01.2023', conditions:'Контракт · part-time. Координує міжнародні проєкти й клієнтські апдейти.', dream:'Запустити свій pod-cast', hobby:'Гастро-блогінг', email:'sofia.b@aurora.co',   phone:'+33 6 18 24 90 11', telegram:'@s_beaumont', telegramId:'618249011', comments:'Комунікація англійською та французькою.' },
  { id:'oleksii',  username:'o.tkach',   name:'Олексій Ткач',     role:'Booking Manager',        hue:160, status:'paused', city:'Дніпро, UA', birthday:'17.02.1990', joined:'22.11.2022', conditions:'FTE. На паузі до завершення внутрішнього переходу.', dream:'Збудувати домик біля Карпат', hobby:'Туризм, шахи', email:'o.tkach@aurora.co',   phone:'+380 50 412 09 88', telegram:'@o_tkach', telegramId:'504120988', comments:'Повернути доступи після зміни статусу на active.' },
  { id:'mira',     username:'m.halvorsen',name:'Mira Halvorsen',  role:'Head of Project Manager',hue:280, status:'active', city:'Oslo, NO',   birthday:'24.09.1993', joined:'09.05.2024', conditions:'FTE · стек. Відповідає за процеси, документацію та ритм команди.', dream:'PhD у economics', hobby:'Бігова дорога, нотатки', email:'mira.h@aurora.co',    phone:'+47 92 14 30 11', telegram:'@m_halvorsen', telegramId:'92143011', comments:'Підтримує onboarding і стандарти delivery.' },
];

const ROLE_OPTIONS = [
  'Assistant',
  'Booking Manager',
  'Designer',
  'Head of Project Manager',
  'Junior Media Buyer',
  'Media Buyer',
  'Owner',
  'Project Manager',
  'Senior Media Buyer',
  'Team Lead',
];

const Field = ({ icon, label, value, fieldKey, onSave, multiline }) => {
  const [v, setV] = useState(value || '');
  const [focused, setFocused] = useState(false);
  useEffect(() => { setV(value || ''); }, [value]);

  const commit = () => {
    setFocused(false);
    if (onSave && v !== (value || '')) onSave(fieldKey, v);
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); e.target.blur(); }
    if (e.key === 'Escape') { setV(value || ''); e.target.blur(); }
  };

  const inputEl = multiline ? (
    <textarea
      className={`field-in ${focused?'focus':''} ${!v?'empty':''}`}
      value={v}
      placeholder="—"
      onChange={(e)=>setV(e.target.value)}
      onFocus={()=>setFocused(true)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      rows={3}
    />
  ) : (
    <input
      type="text"
      className={`field-in ${focused?'focus':''} ${!v?'empty':''}`}
      value={v}
      placeholder="—"
      onChange={(e)=>setV(e.target.value)}
      onFocus={()=>setFocused(true)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );

  return (
    <div className={`field ${multiline ? 'field-long' : ''}`}>
      <div className="field-l">
        <span className="field-i">{icon}</span>
        <span className="field-k">{label}</span>
      </div>
      <div className="field-v-wrap">
        {inputEl}
      </div>
    </div>
  );
};

const SelectField = ({ icon, label, value, fieldKey, onSave, options }) => (
  <div className="field">
    <div className="field-l">
      <span className="field-i">{icon}</span>
      <span className="field-k">{label}</span>
    </div>
    <div className="field-v-wrap select-wrap">
      <select className="field-in field-select" value={value || ''} onChange={(e)=>onSave?.(fieldKey, e.target.value)}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      <span className="select-chev">{ICN.chevD}</span>
    </div>
  </div>
);

const PhotoUploadField = ({ label, src, onPick, children }) => (
  <div className="photo-upload">
    <div className="photo-upload-preview">
      {children || (src ? <img src={src} alt={label}/> : <span>{ICN.team}</span>)}
    </div>
    <div className="photo-upload-body">
      <div className="photo-upload-title">{label}</div>
      <div className="photo-upload-sub">Фото, яке можна показувати як частину команди</div>
    </div>
    <button className="ghost-btn sm" type="button" onClick={onPick}>Завантажити</button>
  </div>
);

/* sub-tab views */
const TeamActivity = ({ me }) => {
  const events = [
    { type:'deal',  ago:'2 хв',   text:'Виграно угоду', strong:'Mansour Holdings', meta:'₴ 218 400' },
    { type:'call',  ago:'48 хв',  text:'Дзвінок з лідом', strong:'Marcus Reinhardt', meta:'14:32 → 14:58' },
    { type:'note',  ago:'2 год',  text:'Додано нотатку до', strong:'Sharda Shekhar', meta:'«Бюджет підтверджено»' },
    { type:'email', ago:'5 год',  text:'Надіслано пропозицію', strong:'Petra Novak', meta:'Aurora Pro · 30%' },
    { type:'login', ago:'8 год',  text:'Вхід у систему', strong:'Київ · macOS Safari', meta:'IP 91.234.x.x' },
    { type:'deal',  ago:'вчора',  text:'Створено угоду', strong:'Sofia Castellano', meta:'воронка «Crimson»' },
    { type:'meet',  ago:'12.05',  text:'Зустріч на 30хв з', strong:'Khalid Mansour', meta:'Zoom · протокол' },
    { type:'edit',  ago:'10.05',  text:'Оновлено умови у',  strong:'Olena Kravchenko', meta:'+5% знижка' },
  ];
  const colors = { deal:'var(--green)', call:'var(--amber)', note:'var(--purple)', email:'var(--blue)', login:'var(--txt-3)', meet:'var(--red)', edit:'var(--txt-3)' };
  return (
    <section className="td-sect td-activity">
      <div className="td-sect-h">
        <h3 className="td-sect-t">Останні дії · 28 за тиждень</h3>
        <div className="seg">
          <button className="on">Тиждень</button>
          <button>Місяць</button>
          <button>Все</button>
        </div>
      </div>
      <ul className="act-list">
        {events.map((e,i) => (
          <li key={i} className="act-i">
            <span className="act-dot" style={{ background: colors[e.type] }}/>
            <div className="act-body">
              <div className="act-t">
                {e.text} <strong>{e.strong}</strong>
              </div>
              <div className="act-m mono">{e.meta}</div>
            </div>
            <div className="act-ago mono">{e.ago}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

const TeamDeals = ({ me }) => {
  const deals = [
    { id:'D-0218', client:'Mansour Holdings',  stage:'Виграно',     value:218400, prob:100, close:'14.05' },
    { id:'D-0214', client:'Reinhardt GmbH',    stage:'Переговори',  value:124000, prob:82,  close:'28.05' },
    { id:'D-0211', client:'Sofia Castellano',  stage:'Пропозиція',  value:31500,  prob:62,  close:'02.06' },
    { id:'D-0207', client:'Petra Novak',       stage:'Пропозиція',  value:52000,  prob:54,  close:'10.06' },
    { id:'D-0205', client:'Tarsi Foundation',  stage:'Кваліфікація',value:18900,  prob:34,  close:'18.06' },
    { id:'D-0199', client:'Volkova Co',        stage:'Втрачено',    value:0,      prob:0,   close:'08.05' },
  ];
  return (
    <section className="td-sect">
      <div className="td-sect-h">
        <h3 className="td-sect-t">Угоди · 38 загалом · ₴ 1.84M</h3>
        <div className="card-h-r">
          <button className="ghost-btn">{ICN.filter} Стадія</button>
          <button className="red-out-btn">{ICN.plus} Нова угода</button>
        </div>
      </div>
      <div className="dl-tbl">
        <div className="dl-h">
          <div>ID</div>
          <div>Клієнт</div>
          <div>Стадія</div>
          <div className="num">Сума</div>
          <div>Ймовірність</div>
          <div>Закриття</div>
        </div>
        {deals.map(d => (
          <div key={d.id} className="dl-r">
            <div className="mono muted">{d.id}</div>
            <div className="dl-c">{d.client}</div>
            <div><Chip tone={d.stage==='Виграно'?'green':d.stage==='Втрачено'?'lost':'gray'}>{d.stage}</Chip></div>
            <div className={`num mono ${d.stage==='Виграно'?'pos':d.stage==='Втрачено'?'muted':''}`}>{d.value?fmt(d.value):'—'}</div>
            <div className="dl-prob">
              <div className="dl-bar"><span style={{width:`${d.prob}%`}}/></div>
              <span className="mono dl-prob-v">{d.prob}%</span>
            </div>
            <div className="muted mono">{d.close}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TeamPayouts = ({ me }) => {
  const rows = [
    { period:'Травень 2026', status:'pending',  base:120000, bonus:48200,  total:168200, paid:'—' },
    { period:'Квітень 2026', status:'paid',     base:120000, bonus:62400,  total:182400, paid:'01.05.2026' },
    { period:'Березень 2026',status:'paid',     base:120000, bonus:39800,  total:159800, paid:'01.04.2026' },
    { period:'Лютий 2026',   status:'paid',     base:120000, bonus:21000,  total:141000, paid:'01.03.2026' },
    { period:'Січень 2026',  status:'paid',     base:120000, bonus:32700,  total:152700, paid:'01.02.2026' },
  ];
  return (
    <section className="td-sect">
      <div className="td-sect-h">
        <h3 className="td-sect-t">Виплати · YTD ₴ 804K</h3>
        <button className="ghost-btn">{ICN.download} Експорт</button>
      </div>
      <div className="po-grid">
        <div className="po-stat">
          <div className="micro">База / міс</div>
          <div className="po-v">₴ 120 000</div>
        </div>
        <div className="po-stat">
          <div className="micro">Партнерська</div>
          <div className="po-v">28%</div>
        </div>
        <div className="po-stat">
          <div className="micro">Бонус Q2</div>
          <div className="po-v">₴ 150 400</div>
        </div>
        <div className="po-stat">
          <div className="micro">Наступна виплата</div>
          <div className="po-v">01.06.2026</div>
        </div>
      </div>
      <div className="dl-tbl po-tbl">
        <div className="dl-h">
          <div>Період</div>
          <div>Статус</div>
          <div className="num">База</div>
          <div className="num">Бонус</div>
          <div className="num">Разом</div>
          <div>Дата виплати</div>
        </div>
        {rows.map(r => (
          <div key={r.period} className="dl-r">
            <div>{r.period}</div>
            <div><Chip tone={r.status==='paid'?'green':'amber'} dot>{r.status==='paid'?'Сплачено':'Очікує'}</Chip></div>
            <div className="num mono">{fmt(r.base)}</div>
            <div className="num mono pos">+{fmt(r.bonus)}</div>
            <div className="num mono"><strong>{fmt(r.total)}</strong></div>
            <div className="muted mono">{r.paid}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TeamAccess = ({ me }) => {
  const groups = [
    { title:'Загальні', perms:[
      { k:'Доступ до CRM',         v:'Усі ліди + кампанії',    on:true, level:'admin' },
      { k:'Створення лідів',       v:'Без обмежень',            on:true, level:'write' },
      { k:'Експорт даних',         v:'CSV / Excel / API',       on:true, level:'write' },
    ]},
    { title:'Фінанси', perms:[
      { k:'Перегляд балансу',      v:'Усі рахунки',             on:true,  level:'read'  },
      { k:'Створення транзакцій',  v:'Wire, SEPA, Stripe',      on:true,  level:'write' },
      { k:'Затвердження >₴100K',   v:'Потрібен 2FA',            on:false, level:'lock'  },
    ]},
    { title:'Команда', perms:[
      { k:'Запрошення учасників',  v:'Owner / Admin only',      on:true,  level:'admin' },
      { k:'Редагування ролей',     v:'Окрім Owner',             on:true,  level:'admin' },
      { k:'Видалення акаунтів',    v:'Тільки заархівувати',     on:false, level:'lock'  },
    ]},
  ];
  return (
    <>
      {groups.map(g => (
        <section key={g.title} className="td-sect">
          <h3 className="td-sect-t">{g.title}</h3>
          {g.perms.map(p => (
            <div key={p.k} className="acc-row">
              <div className="acc-l">
                <div className="acc-k">{p.k}</div>
                <div className="acc-v">{p.v}</div>
              </div>
              <span className={`acc-tag ${p.level}`}>{p.level}</span>
              <button className={`tog ${p.on?'on':''}`}><span/></button>
            </div>
          ))}
        </section>
      ))}
    </>
  );
};

const TeamNotes = ({ me }) => {
  const notes = [
    { author:'Дарія', when:'14.05 · 18:22', text:'Андрій просить підготувати презентацію для Mansour до п\'ятниці. Бюджет до ₴250K.' },
    { author:'Ярослав', when:'12.05 · 09:11', text:'Дзвонив клієнт із Volkov — переходять на партнерську модель. Треба переписати договір.' },
    { author:'Sofia', when:'08.05 · 15:40', text:'Зустріч пройшла добре, але треба ще раз показати кейс із Reinhardt. Завтра скину.' },
  ];
  return (
    <section className="td-sect">
      <div className="td-sect-h">
        <h3 className="td-sect-t">Нотатки · 3</h3>
        <button className="red-out-btn">{ICN.plus} Нова нотатка</button>
      </div>
      <div className="note-list">
        {notes.map((n,i)=>(
          <div key={i} className="note">
            <div className="note-h">
              <div className="note-a">{n.author}</div>
              <div className="note-w mono">{n.when}</div>
            </div>
            <div className="note-b">{n.text}</div>
          </div>
        ))}
        <textarea className="note-input" placeholder="Додати нотатку..."/>
      </div>
    </section>
  );
};

const TeamEditProfile = ({ me }) => {
  const [form, setForm] = useState({
    name: me.name,
    username: me.username,
    role: me.role,
    city: me.city,
    birthday: me.birthday,
    dream: me.dream,
    hobby: me.hobby,
    email: me.email,
    phone: me.phone,
  });
  useEffect(() => {
    setForm({
      name: me.name, username: me.username, role: me.role, city: me.city,
      birthday: me.birthday, dream: me.dream, hobby: me.hobby,
      email: me.email, phone: me.phone,
    });
  }, [me.id]);

  const FIn = ({ k, label, type='text', full }) => (
    <label className={`form-f ${full?'full':''}`}>
      <span className="form-l">{label}</span>
      <input type={type} value={form[k]} onChange={e=>setForm({...form, [k]: e.target.value})}/>
    </label>
  );

  return (
    <section className="td-sect">
      <div className="td-sect-h">
        <h3 className="td-sect-t">Редагувати профіль</h3>
        <div className="card-h-r">
          <button className="ghost-btn">Скасувати</button>
          <button className="prim-btn">{ICN.check} Зберегти</button>
        </div>
      </div>

      <div className="form-grid">
        <FIn k="name"     label="Повне ім'я"/>
        <FIn k="username" label="Username"/>
        <FIn k="role"     label="Посада"/>
        <FIn k="city"     label="Місто"/>
        <FIn k="birthday" label="День народження"/>
        <FIn k="email"    label="Email" type="email"/>
        <FIn k="phone"    label="Телефон"/>
        <label className="form-f">
          <span className="form-l">Аватар</span>
          <div className="form-av">
            <Avatar name={form.name} hue={me.hue}/>
            <button className="ghost-btn sm">Завантажити</button>
            <button className="ghost-btn sm">Видалити</button>
          </div>
        </label>
        <label className="form-f full">
          <span className="form-l">Мрія</span>
          <textarea value={form.dream} onChange={e=>setForm({...form, dream: e.target.value})}/>
        </label>
        <label className="form-f full">
          <span className="form-l">Хобі</span>
          <textarea value={form.hobby} onChange={e=>setForm({...form, hobby: e.target.value})}/>
        </label>
      </div>
    </section>
  );
};

const TeamSettings = ({ me }) => (
  <>
    <section className="td-sect">
      <h3 className="td-sect-t">Сповіщення</h3>
      <div className="acc-row">
        <div className="acc-l">
          <div className="acc-k">Email-сповіщення</div>
          <div className="acc-v">Угоди, виплати, нагадування</div>
        </div>
        <button className="tog on"><span/></button>
      </div>
      <div className="acc-row">
        <div className="acc-l">
          <div className="acc-k">Push-сповіщення</div>
          <div className="acc-v">У браузері та на mobile</div>
        </div>
        <button className="tog on"><span/></button>
      </div>
      <div className="acc-row">
        <div className="acc-l">
          <div className="acc-k">Дайджест по понеділках</div>
          <div className="acc-v">Зведення активності за тиждень</div>
        </div>
        <button className="tog"><span/></button>
      </div>
    </section>

    <section className="td-sect">
      <h3 className="td-sect-t">Безпека</h3>
      <div className="acc-row">
        <div className="acc-l">
          <div className="acc-k">Двофакторна автентифікація</div>
          <div className="acc-v">Активна · Authenticator</div>
        </div>
        <Chip tone="green" dot>Enabled</Chip>
        <button className="ghost-btn sm">Налаштувати</button>
      </div>
      <div className="acc-row">
        <div className="acc-l">
          <div className="acc-k">Активні сесії</div>
          <div className="acc-v">3 пристрої · Київ, Львів</div>
        </div>
        <button className="ghost-btn sm">Переглянути</button>
      </div>
    </section>

    <section className="td-sect">
      <h3 className="td-sect-t">Зона небезпеки</h3>
      <div className="acc-row danger-row">
        <div className="acc-l">
          <div className="acc-k">Заархівувати акаунт</div>
          <div className="acc-v">Доступ обмежиться, дані збережуться</div>
        </div>
        <button className="del-btn">Заархівувати</button>
      </div>
    </section>
  </>
);

const Team = () => {
  const [filter, setFilter] = useState('all');
  const [roleOpen, setRoleOpen] = useState(false);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null); // null = list view
  const [editing, setEditing] = useState(false);
  const [subtab, setSubtab] = useState('profile');
  const [overrides, setOverrides] = useState({}); // { [id]: { field: value, ... } }
  const [avatars, setAvatars]     = useState({}); // { [id]: dataURL }
  const [teamPhotos, setTeamPhotos] = useState({}); // { [id]: dataURL }
  const fileRef = React.useRef(null);

  const saveField = (id) => (key, value) => {
    setOverrides(o => ({ ...o, [id]: { ...(o[id]||{}), [key]: value } }));
  };
  const pickAvatar = (id) => {
    if (!fileRef.current) return;
    fileRef.current.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setAvatars(a => ({ ...a, [id]: reader.result }));
      reader.readAsDataURL(file);
    };
    fileRef.current.click();
  };
  const pickTeamPhoto = (id) => {
    if (!fileRef.current) return;
    fileRef.current.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setTeamPhotos(a => ({ ...a, [id]: reader.result }));
      reader.readAsDataURL(file);
      e.target.value = '';
    };
    fileRef.current.click();
  };

  const roles = useMemo(() => {
    const map = {};
    TEAM_FULL.forEach(t => { map[t.role] = (map[t.role] || 0) + 1; });
    return Object.entries(map).map(([role, n]) => ({ role, n }));
  }, []);

  const filtered = TEAM_FULL.filter(t => {
    if (filter !== 'all' && t.role !== filter) return false;
    if (q && !t.name.toLowerCase().includes(q.toLowerCase()) && !t.username.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const activeMembers = filtered.filter(t => t.status === 'active');
  const inactiveMembers = filtered.filter(t => t.status !== 'active');
  const roleLabel = filter === 'all' ? 'Усі ролі' : filter;

  const renderMemberCard = (t) => (
    <div key={t.id} className="tlp-card" onClick={()=>{ setSelected(t.id); setSubtab('profile'); }}>
      <div className="tlp-av">
        <Avatar name={t.name} hue={t.hue}/>
        <span className={`tlp-online ${t.status==='active'?'on':'off'}`}/>
      </div>
      <div className="tlp-body">
        <div className="tlp-name-row">
          <div className="tlp-name mono">{t.username}</div>
          {t.status==='active'
            ? <span className="tlp-tag active">Active</span>
            : <span className="tlp-tag paused">Paused</span>}
        </div>
        <div className="tlp-role">{t.role}</div>
      </div>
    </div>
  );

  const meBase = TEAM_FULL.find(t => t.id === selected);
  const me = meBase ? { ...meBase, ...(overrides[meBase.id] || {}) } : null;
  const avatarSrc = me ? avatars[me.id] : null;
  const teamPhotoSrc = me ? teamPhotos[me.id] : null;

  const profileTabIcon = me ? (
    <Avatar name={me.name} hue={me.hue} src={avatarSrc}/>
  ) : null;

  const shortName = me ? me.name.split(' ').map((s,i)=>i===0?s[0]+'.':s).join(' ') : '';

  const subtabs = [
    { id:'profile',  label: shortName,
      icon: profileTabIcon, isAvatar: true },
    { id:'activity', label:'Активність', n: 24,
      icon: <Icon d={<><path d="M22 12h-4l-3 8-6-16-3 8H2"/></>} size={14}/> },
    { id:'deals',    label:'Угоди', n: 38,
      icon: <Icon d={<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>} size={14}/> },
    { id:'payouts',  label:'Виплати',
      icon: <Icon d={<><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>} size={14}/> },
    { id:'access',   label:'Доступи', n: 8,
      icon: <Icon d={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} size={14}/> },
    { id:'notes',    label:'Нотатки', n: 3,
      icon: <Icon d={<><path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M14 4v6h6"/></>} size={14}/> },
    { id:'settings', label:'Налаштування',
      icon: <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8 7 17M17 7l2.8-2.8"/></>} size={14}/> },
  ];

  /* ─────── LIST VIEW ─────── */
  if (!me) {
    return (
      <div className="team-shell">
        <Topbar
          title={<span className="tb-title-row">Команда<span className="tb-title-n">{TEAM_FULL.length}</span></span>}
        />
        <div className="team-list-page">
          <div className="tlp-filter">
            <div className="tlp-search">
              {ICN.search}
              <input placeholder="Пошук учасників..." value={q} onChange={e=>setQ(e.target.value)}/>
            </div>
            <div className="tlp-role-filter">
              <button className={`tlp-role-btn ${roleOpen?'on':''}`} onClick={()=>setRoleOpen(v=>!v)}>
                {ICN.filter}
                <span>{roleLabel}</span>
                <span className="team-chip-n">{filter === 'all' ? TEAM_FULL.length : filtered.length}</span>
                {ICN.chevD}
              </button>
              {roleOpen && (
                <div className="tlp-role-menu">
                  <button className={`tlp-role-option ${filter==='all'?'on':''}`} onClick={()=>{ setFilter('all'); setRoleOpen(false); }}>
                    <span>Усі ролі</span><span className="team-chip-n">{TEAM_FULL.length}</span>
                  </button>
                  {roles.map(r => (
                    <button key={r.role}
                            className={`tlp-role-option ${filter===r.role?'on':''}`}
                            onClick={()=>{ setFilter(r.role); setRoleOpen(false); }}>
                      <span>{r.role}</span><span className="team-chip-n">{r.n}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="red-out-btn">{ICN.plus} Запросити</button>
          </div>

          <div className="tlp-groups">
            {activeMembers.length > 0 && (
              <section className="tlp-group">
                <div className="tlp-group-h">Активні<span>{activeMembers.length}</span></div>
                <div className="tlp-grid">{activeMembers.map(renderMemberCard)}</div>
              </section>
            )}
            {inactiveMembers.length > 0 && (
              <section className="tlp-group">
                <div className="tlp-group-h">Неактивні<span>{inactiveMembers.length}</span></div>
                <div className="tlp-grid">{inactiveMembers.map(renderMemberCard)}</div>
              </section>
            )}
            {filtered.length === 0 && (
              <div className="tlp-empty">
                <div className="tlp-empty-i">{ICN.team}</div>
                <div>Нікого не знайдено</div>
                <div className="muted xs">Спробуй змінити фільтри</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────── DETAIL VIEW ─────── */
  return (
    <div className="team-shell">
      <Topbar
        title={
          <button className="back-icn" onClick={()=>setSelected(null)} title="Назад до списку">
            <Icon d={<><path d="M19 12H5M12 19l-7-7 7-7"/></>} size={16}/>
          </button>
        }
        tabs={subtabs}
        activeTab={subtab}
        onTab={setSubtab}
      />
      <main className="team-main team-main-full">
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}/>

        <div className="td-body td-body-wide">
          {subtab === 'profile' && (<>
          <section className="td-sect td-sect-hero">
            <div className="prof-media-grid">
              <PhotoUploadField label="Аватарка" src={avatarSrc} onPick={()=>pickAvatar(me.id)}>
                <Avatar name={me.name} hue={me.hue} src={avatarSrc}/>
              </PhotoUploadField>
              <PhotoUploadField label="Фото для команди" src={teamPhotoSrc} onPick={()=>pickTeamPhoto(me.id)}/>
            </div>
          </section>

          <section className="td-sect">
            <h3 className="td-sect-t">Особисте</h3>
            <Field label="Name" value={me.name} fieldKey="name" onSave={saveField(me.id)} icon={<Icon d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} size={15}/>}/>
            <Field icon={ICN.mail} label="Email" value={me.email} fieldKey="email" onSave={saveField(me.id)}/>
            <Field icon={ICN.call} label="Телефон" value={me.phone} fieldKey="phone" onSave={saveField(me.id)}/>
            <Field icon={ICN.calendar}  label="День народження"  value={me.birthday} fieldKey="birthday" onSave={saveField(me.id)}/>
            <Field icon={<Icon d={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></>} size={15}/>}
                   label="Місто" value={me.city} fieldKey="city" onSave={saveField(me.id)}/>
            <Field icon={<Icon d={<><path d="M12 2 14 9l7 1-5 5 2 7-6-4-6 4 2-7-5-5 7-1Z"/></>} size={15}/>}
                   label="Мрія" value={me.dream} fieldKey="dream" onSave={saveField(me.id)} multiline/>
            <Field icon={<Icon d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} size={15}/>}
                   label="Хобі" value={me.hobby} fieldKey="hobby" onSave={saveField(me.id)} multiline/>
          </section>

          <section className="td-sect">
            <h3 className="td-sect-t">Робота</h3>
            <Field icon={ICN.calendar} label="В команді з" value={me.joined} fieldKey="joined" onSave={saveField(me.id)}/>
            <SelectField icon={ICN.briefcase} label="Посада" value={me.role} fieldKey="role" onSave={saveField(me.id)} options={ROLE_OPTIONS}/>
            <Field label="Instagram" value={me.username} fieldKey="username" onSave={saveField(me.id)} icon={<Icon d={<><path d="M4 4h16v16H4z"/><path d="m9 9 6 6M15 9l-6 6"/></>} size={15}/>}/>
            <Field icon={<Icon d={<><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 8h20"/></>} size={15}/>}
                   label="Telegram" value={me.telegram} fieldKey="telegram" onSave={saveField(me.id)}/>
            <Field icon={<Icon d={<><path d="M4 4h16v16H4z"/><path d="M8 8h8v8H8z"/></>} size={15}/>}
                   label="Telegram ID" value={me.telegramId} fieldKey="telegramId" onSave={saveField(me.id)}/>
            <Field icon={<Icon d={<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 11h18"/></>} size={15}/>}
                   label="Умови роботи" value={me.conditions} fieldKey="conditions" onSave={saveField(me.id)} multiline/>
            <Field icon={ICN.mail} label="Коментарі" value={me.comments} fieldKey="comments" onSave={saveField(me.id)} multiline/>
          </section>

          <section className="td-sect">
            <div className="acc-row danger-row">
              <div className="acc-l">
                <div className="acc-k">Видалити спеціаліста</div>
                <div className="acc-v">Цю дію не можна скасувати</div>
              </div>
              <button className="del-btn">
                <Icon d={<><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>} size={14}/>
                Delete
              </button>
            </div>
          </section>
          </>)}

          {subtab === 'activity' && <TeamActivity me={me}/>}
          {subtab === 'deals' && <TeamDeals me={me}/>}
          {subtab === 'payouts' && <TeamPayouts me={me}/>}
          {subtab === 'access' && <TeamAccess me={me}/>}
          {subtab === 'notes' && <TeamNotes me={me}/>}
          {subtab === 'settings' && <TeamSettings me={me}/>}
        </div>
      </main>
    </div>
  );
};

/* ─────────────────────────── PROJECTS ─────────────────────────── */
const PROJECTS = [
  { name:'Aurora Atlas',         loc:'Київ, UA',       country:'🇺🇦', open:14, sched:3, total:35, status:'active',   hue:20  },
  { name:'Northwind Studios',    loc:'Berlin, DE',     country:'🇩🇪', open:0,  sched:0, total:22, status:'paused',   hue:240 },
  { name:'Crimson Atelier',      loc:'Milano, IT',     country:'🇮🇹', open:16, sched:0, total:17, status:'active',   hue:340 },
  { name:'Northforge Labs',      loc:'—',              country:'',    open:0,  sched:0, total:52, status:'archived', hue:120 },
  { name:'Volkov Holdings',      loc:'Warszawa, PL',   country:'🇵🇱', open:71, sched:11,total:47, status:'active',   hue:300 },
  { name:'Lumen Capital',        loc:'Zurich, CH',     country:'🇨🇭', open:0,  sched:0, total:23, status:'paused',   hue:60  },
  { name:'Halvorsen & Co.',      loc:'Oslo, NO',       country:'🇳🇴', open:5,  sched:0, total:22, status:'active',   hue:200 },
  { name:'Castellano s.r.l.',    loc:'Roma, IT',       country:'🇮🇹', open:0,  sched:0, total:12, status:'paused',   hue:160 },
  { name:'Reinhardt Group',      loc:'München, DE',    country:'🇩🇪', open:1,  sched:0, total:13, status:'active',   hue:280 },
  { name:'Yamamoto Press',       loc:'Tokyo, JP',      country:'🇯🇵', open:0,  sched:0, total:15, status:'paused',   hue:0   },
  { name:'Mansour Oasis',        loc:'Dubai, AE',      country:'🇦🇪', open:45, sched:6, total:25, status:'active',   hue:80  },
  { name:'Beaumont & Fils',      loc:'Paris, FR',      country:'🇫🇷', open:14, sched:0, total:15, status:'active',   hue:140 },
  { name:'ZUKO Collective',      loc:'New York, US',   country:'🇺🇸', open:5,  sched:0, total:17, status:'active',   hue:320 },
  { name:'Kropka Works',         loc:'Lodz, PL',       country:'🇵🇱', open:1,  sched:0, total:20, status:'paused',   hue:40  },
  { name:'Stupin Industries',    loc:'Los Angeles, US',country:'🇺🇸', open:53, sched:0, total:20, status:'active',   hue:260 },
  { name:'Kizyma Build',         loc:'Oakville, CA',   country:'🇨🇦', open:6,  sched:0, total:16, status:'active',   hue:100 },
  { name:'Inkistry',             loc:'Odense, DK',     country:'🇩🇰', open:0,  sched:0, total:9,  status:'paused',   hue:220 },
  { name:'Koral Studio',         loc:'New York, US',   country:'🇺🇸', open:110,sched:4, total:15, status:'active',   hue:180 },
];

const Projects = () => {
  const [filter, setFilter] = useState('all');
  const filtered = PROJECTS.filter(p => filter === 'all' || p.status === filter);
  const stats = {
    all: PROJECTS.length,
    active: PROJECTS.filter(p => p.status === 'active').length,
    paused: PROJECTS.filter(p => p.status === 'paused').length,
    archived: PROJECTS.filter(p => p.status === 'archived').length,
  };

  return (
    <div className="page-shell">
      <Topbar
        title="Усі проєкти"
        subtitle={`${PROJECTS.length} проєктів · ${stats.active} активних`}
        right={
          <>
            <button className="red-out-btn">{ICN.plus} Додати слот</button>
            <button className="prim-btn">{ICN.plus} Новий проєкт</button>
          </>
        }
      />
      <div className="page">
        <div className="card-h" style={{ background:'var(--bg-1)', border:'1px solid var(--line)', borderRadius:'14px', borderBottom:'1px solid var(--line)' }}>
          <div className="tabs">
            <button className={`tab ${filter==='all'?'on':''}`}      onClick={()=>setFilter('all')}>Усі<span className="tab-n">{stats.all}</span></button>
            <button className={`tab ${filter==='active'?'on':''}`}   onClick={()=>setFilter('active')}>Активні<span className="tab-n">{stats.active}</span></button>
            <button className={`tab ${filter==='paused'?'on':''}`}   onClick={()=>setFilter('paused')}>На паузі<span className="tab-n">{stats.paused}</span></button>
            <button className={`tab ${filter==='archived'?'on':''}`} onClick={()=>setFilter('archived')}>Архів<span className="tab-n">{stats.archived}</span></button>
          </div>
          <div className="card-h-r">
            <button className="ghost-btn">{ICN.filter} Регіон</button>
            <button className="ghost-btn">{ICN.download} Експорт</button>
          </div>
        </div>

        <div className="prj-grid">
          {filtered.map(p => (
            <div key={p.name} className="prj-card">
              <div className="prj-thumb" style={{ background:`oklch(0.32 0.08 ${p.hue})`, color:`oklch(0.92 0.05 ${p.hue})` }}>
                {p.name.split(' ').map(s=>s[0]).slice(0,2).join('')}
                <div className="prj-thumb-overlay"/>
                <span className={`prj-status ${p.status}`}/>
              </div>

              <div className="prj-body">
                <div className="prj-name">{p.name}</div>
                <div className="prj-loc">
                  {p.loc} {p.country && <span className="flag">{p.country}</span>}
                </div>
                <div className="prj-foot mono">{p.total} робіт</div>
              </div>

              <div className="prj-metrics">
                <span className={`prj-pill ${p.open ? 'has' : ''}`} title="Активні угоди">
                  {ICN.briefcase}{p.open}
                </span>
                <span className={`prj-pill ${p.sched ? 'has-purple' : ''}`} title="Заплановано">
                  {ICN.calendar}{p.sched}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── APP ─────────────────────────── */
const App = () => {
  const [active, setActive] = useState('crm');
  return (
    <div className="app">
      <Sidebar active={active} onChange={setActive}/>
      <main className="main" data-screen-label={active}>
        {active === 'crm'       && <CRM/>}
        {active === 'projects'  && <Projects/>}
        {active === 'analytics' && <Analytics/>}
        {active === 'finance'   && <Finance/>}
        {active === 'team'      && <Team/>}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
