import { Chip } from '../../shared/components/Chip';
import { Icons } from '../../shared/components/Icon';
import { Topbar } from '../../shared/components/Topbar';
import { cx } from '../../shared/styles/cx';
import { transactions } from './data';
import styles from './finance.module.css';

const formatCurrency = (value: number) => `${value < 0 ? '-' : ''}₴${Math.abs(value).toLocaleString('uk-UA')}`;

export function FinancePage() {
  const cashIn = transactions.filter((tx) => tx.type === 'in').reduce((sum, tx) => sum + tx.amount, 0);
  const cashOut = transactions.filter((tx) => tx.type === 'out').reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="page-shell">
      <Topbar title="Фінанси" subtitle="Травень 2026 · 2 рахунки під'єднано" right={<button className="prim-btn" type="button">{Icons.plus} Транзакція</button>} />
      <div className="page">
        <div className={styles['fin-top']}>
          <div className={cx('card', styles.balance)}>
            <div className={styles['balance-l']}>
              <div className="micro">Загальний баланс</div>
              <div className={styles['balance-v']}>₴4 218 940<span>.18</span></div>
              <div className={styles['balance-foot']}>
                <Chip tone="green" dot>+12.4% цього місяця</Chip>
                <span className="muted">Оновлено 09:42</span>
              </div>
            </div>
            <div className={styles['balance-r']}>
              <div className={styles['fin-mini']}><div className="micro">Надходження</div><div className={cx(styles['fin-mini-v'], styles.up)}>{formatCurrency(cashIn)}</div><div className={styles['fin-mini-bar']}><span className={styles.up} style={{ width: '72%' }} /></div></div>
              <div className={styles['fin-mini']}><div className="micro">Витрати</div><div className={cx(styles['fin-mini-v'], styles.down)}>{formatCurrency(cashOut)}</div><div className={styles['fin-mini-bar']}><span className={styles.down} style={{ width: '48%' }} /></div></div>
              <div className={styles['fin-mini']}><div className="micro">Чистий потік</div><div className={cx(styles['fin-mini-v'], styles.up)}>{formatCurrency(cashIn - cashOut)}</div><div className={styles['fin-mini-bar']}><span className={styles.up} style={{ width: '58%' }} /></div></div>
            </div>
          </div>

          <div className="card invoices">
            <div className="card-h2">
              <div>
                <div className="card-t">Інвойси</div>
                <div className="card-sub">в обробці</div>
              </div>
              <button className="ghost-btn sm" type="button">Усі</button>
            </div>
            <div className={styles['inv-list']}>
              {['INV-0218', 'INV-0217', 'INV-0216', 'INV-0215'].map((id, index) => (
                <div key={id} className={styles['inv-row']}>
                  <div><div className={cx(styles['inv-id'], 'mono')}>{id}</div><div className="muted xs">{transactions[index]?.client ?? 'Aurora client'}</div></div>
                  <Chip tone={index === 2 ? 'red' : index === 3 ? 'green' : 'amber'} dot>{index === 3 ? 'Сплачено' : index === 2 ? 'Прострочено' : 'Очікує'}</Chip>
                  <div className="mono">{formatCurrency(Math.abs(transactions[index]?.amount ?? 52000))}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h2">
            <div>
              <div className="card-t">Транзакції</div>
              <div className="card-sub">останні 7 днів · {transactions.length} операцій</div>
            </div>
            <div className="card-h-r">
              <button className="ghost-btn" type="button">{Icons.filter} Фільтр</button>
              <button className="ghost-btn" type="button">{Icons.download} CSV</button>
            </div>
          </div>
          <div className={cx('tbl', styles['tbl-tx'])}>
            <div className="tbl-h"><div>ID</div><div>Контрагент</div><div>Метод</div><div>Статус</div><div className="num">Сума</div><div>Дата</div></div>
            {transactions.map((tx) => (
              <div key={tx.id} className="tbl-r">
                <div className="mono muted">{tx.id}</div>
                <div className={styles['tx-client']}><span className={cx(styles['tx-arrow'], styles[tx.type])}>{tx.type === 'in' ? Icons.arrowD : Icons.arrowU}</span>{tx.client}</div>
                <div><Chip tone="gray">{tx.method}</Chip></div>
                <div><Chip tone={tx.status === 'cleared' ? 'green' : 'amber'} dot>{tx.status === 'cleared' ? 'Проведено' : 'В обробці'}</Chip></div>
                <div className={`num mono ${tx.type === 'in' ? 'pos' : 'neg'}`}>{tx.type === 'in' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}</div>
                <div className="muted mono">{tx.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
