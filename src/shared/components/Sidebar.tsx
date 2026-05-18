import type { FeatureId } from '../types/common';
import { sidebarNavigation } from '../../app/navigation';
import brandMark from '../../assets/brand-mark.png';

interface SidebarProps {
  active: FeatureId;
  onChange: (id: FeatureId) => void;
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="sb">
      <div className="sb-logo" aria-label="Aurora CRM">
        <img src={brandMark} alt="" className="sb-logo-img" width={84} height={84} decoding="async" />
      </div>

      <nav className="sb-nav" aria-label="Головна навігація">
        {sidebarNavigation.map((entry) =>
          entry.kind === 'divider' ? (
            <div key={entry.id} className="sb-divider" role="presentation" />
          ) : (
            <button
              key={entry.id}
              className={`sb-item ${active === entry.id ? 'on' : ''}`}
              onClick={() => onChange(entry.id)}
              title={entry.label}
              type="button"
            >
              {entry.icon}
              <span className="sb-label">{entry.label}</span>
              {entry.badge ? <span className="sb-badge">{entry.badge}</span> : null}
              {entry.badge ? <span className="sb-badge-mini" /> : null}
            </button>
          ),
        )}
      </nav>
    </aside>
  );
}
