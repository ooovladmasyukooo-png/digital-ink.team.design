import { useEffect, useState } from 'react';
import { Icons } from '../../../shared/components/Icon';
import { cx } from '../../../shared/styles/cx';
import {
  buildClientReferralLink,
  emptyClientContact,
  normalizeClientContacts,
  syncClientContactsPatch,
} from '../projectClientContacts';
import type { Project, ProjectPatch } from '../types';
import styles from '../projects2.module.css';

interface ProjectClientContactsEditorProps {
  project: Project;
  onPatch: (patch: ProjectPatch) => void;
}

function telHref(phone: string): string | null {
  const normalized = phone.replace(/[^\d+]/g, '');
  return normalized ? `tel:${normalized}` : null;
}

export function ProjectClientContactsEditor({ project, onPatch }: ProjectClientContactsEditorProps) {
  const contacts = normalizeClientContacts(project);
  const primary = contacts[0] ?? { ...emptyClientContact(), id: 'contact-primary' };
  const referralCode = project.referralCode?.trim() ?? '';
  const [copyToast, setCopyToast] = useState<string | null>(null);

  useEffect(() => {
    if (!copyToast) return;
    const timer = window.setTimeout(() => setCopyToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copyToast]);

  const updatePrimary = (patch: Partial<(typeof primary)>) => {
    const nextPrimary = { ...primary, ...patch };
    onPatch(syncClientContactsPatch([nextPrimary]));
  };

  const copyReferralLink = async () => {
    const link = buildClientReferralLink(referralCode);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopyToast('Посилання скопійовано');
    } catch {
      setCopyToast('Не вдалося скопіювати');
    }
  };

  const primaryPhoneHref = telHref(primary.phone);

  return (
    <div className={styles['p2-settings-contacts']}>
      <div className={cx(styles.field, styles['p2-field'])}>
        <div className={styles['field-l']}>
          <span className={styles['field-i']}>{Icons.mail}</span>
          <span className={styles['field-k']}>Email</span>
        </div>
        <div className={styles['field-v-wrap']}>
          <input
            className={styles['field-in']}
            type="email"
            value={primary.email}
            placeholder="email@example.com"
            onChange={(event) => updatePrimary({ email: event.target.value })}
          />
        </div>
      </div>

      <div className={cx(styles.field, styles['p2-field'])}>
        <div className={styles['field-l']}>
          {primaryPhoneHref ? (
            <a
              href={primaryPhoneHref}
              className={styles['p2-field-tel-link']}
              aria-label={`Зателефонувати: ${primary.phone}`}
              title={primary.phone}
            >
              <span className={styles['field-i']}>{Icons.call}</span>
            </a>
          ) : (
            <span className={styles['field-i']}>{Icons.call}</span>
          )}
          <span className={styles['field-k']}>Телефон</span>
        </div>
        <div className={styles['field-v-wrap']}>
          <input
            className={styles['field-in']}
            type="tel"
            value={primary.phone}
            placeholder="+380 ..."
            onChange={(event) => updatePrimary({ phone: event.target.value })}
          />
        </div>
      </div>

      <div className={cx(styles.field, styles['p2-field'], styles['p2-settings-referral-field'])}>
        <div className={styles['field-l']}>
          <span className={styles['field-i']}>{Icons.link}</span>
          <span className={styles['field-k']}>Реф. код</span>
        </div>
        <div className={styles['field-v-wrap']}>
          <div className={styles['p2-settings-referral-row']}>
            <input
              className={cx(styles['field-in'], styles['p2-settings-referral-in'])}
              type="text"
              readOnly
              tabIndex={-1}
              value={referralCode}
              placeholder="INK0001"
              aria-readonly="true"
            />
            <button
              type="button"
              className={styles['p2-settings-referral-copy']}
              disabled={!referralCode}
              aria-label="Копіювати реферальне посилання"
              title="Копіювати посилання"
              onClick={copyReferralLink}
            >
              {Icons.duplicate}
            </button>
          </div>
        </div>
      </div>

      {copyToast ? (
        <div className={styles['p2-settings-copy-toast']} role="status" aria-live="polite">
          {copyToast}
        </div>
      ) : null}
    </div>
  );
}
