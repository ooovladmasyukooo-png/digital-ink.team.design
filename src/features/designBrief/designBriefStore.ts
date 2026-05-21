import { initialDesignBriefs } from './data';
import type { DesignBrief } from './types';

let briefsState: DesignBrief[] = initialDesignBriefs;
let nextBriefId = 100;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getDesignBriefs(): DesignBrief[] {
  return briefsState;
}

export function setDesignBriefs(
  updater: DesignBrief[] | ((prev: DesignBrief[]) => DesignBrief[]),
): void {
  briefsState = typeof updater === 'function' ? updater(briefsState) : updater;
  emit();
}

export function allocateDesignBriefId(): string {
  return `db${nextBriefId++}`;
}

export function subscribeDesignBriefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
