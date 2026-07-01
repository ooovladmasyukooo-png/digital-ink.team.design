import type { Project, ProjectClientContact, ProjectPatch } from './types';

export const CLIENT_REFERRAL_LINK_BASE = 'https://digital-ink.agency/?R=';

export function buildClientReferralLink(referralCode: string): string {
  const code = referralCode.trim();
  if (!code) return '';
  return `${CLIENT_REFERRAL_LINK_BASE}${encodeURIComponent(code)}`;
}

export function newClientContactId(): string {
  return `contact-${Date.now().toString(36)}`;
}

export function emptyClientContact(): ProjectClientContact {
  return {
    id: newClientContactId(),
    label: '',
    email: '',
    phone: '',
  };
}

export function normalizeClientContacts(
  project: Pick<Project, 'clientContacts' | 'email' | 'phone'>,
): ProjectClientContact[] {
  if (project.clientContacts?.length) {
    return project.clientContacts.map((contact, index) => ({
      id: contact.id || `contact-${index}`,
      label: contact.label ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
    }));
  }

  if (project.email.trim() || project.phone.trim()) {
    return [
      {
        id: 'contact-primary',
        label: '',
        email: project.email,
        phone: project.phone,
      },
    ];
  }

  return [];
}

export function syncClientContactsPatch(
  contacts: ProjectClientContact[],
): Pick<ProjectPatch, 'clientContacts' | 'email' | 'phone'> {
  const primary = contacts[0];
  return {
    clientContacts: contacts,
    email: primary?.email.trim() ?? '',
    phone: primary?.phone.trim() ?? '',
  };
}
