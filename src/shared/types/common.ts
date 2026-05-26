import type { ReactNode } from 'react';

export type FeatureId =
  | 'dashboard'
  | 'crm'
  | 'projects2'
  | 'analytics'
  | 'finance'
  | 'team'
  | 'tasks'
  | 'design-brief';

export type Tone =
  | 'gray'
  | 'green'
  | 'red'
  | 'amber'
  | 'orange'
  | 'blue'
  | 'purple'
  | 'hot'
  | 'warm'
  | 'new'
  | 'cold'
  | 'lost';

export interface NavigationItem {
  id: FeatureId;
  label: string;
  icon: ReactNode;
  badge?: number;
}

/** Елемент бічної панелі: посилання або горизонтальний роздільник. */
export type SidebarNavEntry =
  | { kind: 'link'; id: FeatureId; label: string; icon: ReactNode; badge?: number }
  | { kind: 'divider'; id: string };

export interface TopbarTabMenuItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  selected?: boolean;
  searchText?: string;
}

export interface TopbarTab<TId extends string = string> {
  id: TId;
  label: ReactNode;
  icon?: ReactNode;
  n?: number;
  menu?: TopbarTabMenuItem[];
  onMenuSelect?: (itemId: string) => void;
}
