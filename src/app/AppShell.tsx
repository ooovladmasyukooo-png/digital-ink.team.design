import type { ReactNode } from 'react';
import type { FeatureId } from '../shared/types/common';
import { Sidebar } from '../shared/components/Sidebar';

interface AppShellProps {
  active: FeatureId;
  onNavigate: (id: FeatureId) => void;
  children: ReactNode;
}

export function AppShell({ active, onNavigate, children }: AppShellProps) {
  return (
    <div className="app">
      <Sidebar active={active} onChange={onNavigate} />
      <main className="main" data-screen-label={active}>
        {children}
      </main>
    </div>
  );
}
