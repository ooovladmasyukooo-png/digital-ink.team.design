import type { ReactNode } from 'react';
import type { Tone } from '../types/common';

interface ChipProps {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}

export function Chip({ tone = 'gray', dot, children }: ChipProps) {
  return (
    <span className={`chip chip-${tone}`}>
      {dot ? <span className="chip-dot" /> : null}
      {children}
    </span>
  );
}
