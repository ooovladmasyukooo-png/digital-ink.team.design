import { Topbar } from '../../shared/components/Topbar';

export function DashboardPage() {
  return (
    <div className="page-shell">
      <Topbar title="Дашборд" subtitle="Огляд ключових показників · сьогодні" />
      <div className="page">
        <div className="card">
          <div className="card-h2">
            <div>
              <div className="card-t">Швидкий огляд</div>
              <div className="card-sub">Тут згодом зʼявляться віджети з CRM, задач та фінансів.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
