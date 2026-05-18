import { useMemo, useState } from 'react';
import { Avatar } from '../../shared/components/Avatar';
import { Chip } from '../../shared/components/Chip';
import { Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import { cx } from '../../shared/styles/cx';
import { leads, pipeline } from './data';
import styles from './crm.module.css';
import type { CrmView, LeadStatus } from './types';

const leadStatusLabels: Record<LeadStatus, string> = {
  hot: 'Гарячий',
  warm: 'Теплий',
  new: 'Новий',
  cold: 'Холодний',
  lost: 'Втрачений',
};

const formatCurrency = (value: number) => `₴${value.toLocaleString('uk-UA')}`;

export function CrmPage() {
  const [tab, setTab] = useState<LeadStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState(leads[0].id);
  const [view, setView] = useState<CrmView>('list');

  const filteredLeads = useMemo(() => {
    if (tab === 'all') return leads;
    return leads.filter((lead) => lead.status === tab);
  }, [tab]);

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0];

  const tabs = [
    { id: 'all' as const, label: 'Усі', n: leads.length },
    ...(['hot', 'warm', 'new', 'cold', 'lost'] as LeadStatus[]).map((status) => ({
      id: status,
      label: leadStatusLabels[status],
      n: leads.filter((lead) => lead.status === status).length,
    })),
  ];

  return (
    <div className="crm">
      <Topbar
        title="Воронка продажів"
        subtitle="227 угод · оновлено щойно"
        right={
          <div className="seg">
            <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} type="button">
              Список
            </button>
            <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')} type="button">
              Дошка
            </button>
          </div>
        }
      />

      <div className="page">
        <div className={styles.pipe}>
          {pipeline.map((stage) => (
            <div key={stage.id} className={cx(styles['pipe-cell'], styles[`tone-${stage.tone}`])}>
              <div className={styles['pipe-bar']} />
              <div className="pipe-meta">
                <div className={styles['pipe-title']}>{stage.title}</div>
                <div className={styles['pipe-row']}>
                  <span className={styles['pipe-count']}>{stage.count}</span>
                  <span className={styles['pipe-value']}>{stage.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles['crm-grid']}>
          <div className="card">
            <div className="card-h">
              <div className="tabs">
                {tabs.map((item) => (
                  <button key={item.id} className={`tab ${tab === item.id ? 'on' : ''}`} onClick={() => setTab(item.id)} type="button">
                    {item.label}
                    <span className="tab-n">{item.n}</span>
                  </button>
                ))}
              </div>
              <div className="card-h-r">
                <button className="ghost-btn" type="button">{Icons.filter} Фільтр</button>
                <button className="ghost-btn" type="button">{Icons.download} Експорт</button>
                <button className="prim-btn" type="button">{Icons.plus} Новий лід</button>
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
                {filteredLeads.map((lead) => (
                  <button key={lead.id} className={`tbl-r ${selectedId === lead.id ? 'on' : ''}`} onClick={() => setSelectedId(lead.id)} type="button">
                    <span className={styles['cell-lead']}>
                      <Avatar name={lead.name} hue={lead.hue} />
                      <span>
                        <span className={styles['lead-name']}>
                          <span className="flag">{lead.country}</span>
                          {lead.name}
                        </span>
                        <span className={styles['lead-meta']}>
                          <span className="mono">{lead.id}</span>
                          <Chip tone={lead.status}>{leadStatusLabels[lead.status]}</Chip>
                        </span>
                      </span>
                    </span>
                    <span><Chip tone="gray">{lead.stage}</Chip></span>
                    <span className="muted mono">{lead.source}</span>
                    <span className="num mono">{lead.value ? formatCurrency(lead.value) : '-'}</span>
                    <span><span className={styles['owner-pill']} style={{ background: `oklch(0.45 0.1 ${lead.hue * 1.7})` }}>{lead.owner}</span></span>
                    <span className="muted">{lead.last}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.board}>
                {pipeline.map((stage) => {
                  const cards = leads.filter((lead) => lead.stage === stage.title);
                  return (
                    <div key={stage.id} className={cx(styles.col, styles[`tone-${stage.tone}`])}>
                      <div className={styles['col-h']}>
                        <div className={styles['col-t']}><span className={styles['col-dot']} />{stage.title}<span className={styles['col-n']}>{cards.length || stage.count}</span></div>
                        <button className={styles['col-add']} type="button">{Icons.plus}</button>
                      </div>
                      <div className={styles['col-body']}>
                        {cards.map((lead) => (
                          <button key={lead.id} className={cx(styles.bcard, selectedId === lead.id && styles.on)} onClick={() => setSelectedId(lead.id)} type="button">
                            <span className={styles['bcard-h']}><span className="mono muted">{lead.id}</span><span className="flag">{lead.country}</span></span>
                            <span className={styles['bcard-name']}>{lead.name}</span>
                            <span className={styles['bcard-val']}>{lead.value ? formatCurrency(lead.value) : '-'}</span>
                            <span className={styles['bcard-f']}><span className={cx(styles['owner-pill'], styles.sm)}>{lead.owner}</span><span className="muted">{lead.last}</span></span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className={styles.rail}>
            <div className="card">
              <div className={styles['rail-h']}>
                <Avatar name={selectedLead.name} hue={selectedLead.hue} />
                <div>
                  <div className={styles['rail-name']}>{selectedLead.name}</div>
                  <div className={cx(styles['rail-sub'], 'mono')}>{selectedLead.id} · {selectedLead.country} · {selectedLead.source}</div>
                </div>
                <button className="icon-btn sm" type="button">{Icons.more}</button>
              </div>
              <div className={styles['rail-actions']}>
                <button className="ghost-btn" type="button">{Icons.call} Дзвінок</button>
                <button className="ghost-btn" type="button">{Icons.mail} Email</button>
                <button className="prim-btn" type="button">{Icons.spark} Дія</button>
              </div>
              <div className={styles['rail-grid']}>
                <div><div className="micro">Вартість</div><div className={styles['rail-val']}>{formatCurrency(selectedLead.value)}</div></div>
                <div><div className="micro">Ймовірність</div><div className={styles['rail-val']}>82%</div></div>
                <div><div className="micro">Стадія</div><div className={styles['rail-val']}>{selectedLead.stage}</div></div>
                <div><div className="micro">Закриття</div><div className={styles['rail-val']}>28.05</div></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
