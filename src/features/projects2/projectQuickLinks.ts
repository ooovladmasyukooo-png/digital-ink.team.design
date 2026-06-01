import { BUILTIN_LINK_KEYS, BUILTIN_LINK_LABELS, quickLinksWithUrl } from './projectLinks';
import type { ProjectQuickLinks } from './types';

export { quickLinksWithUrl };

export const PROJECT_QUICK_LINK_MENU = BUILTIN_LINK_KEYS.map((key) => ({
  key,
  label: BUILTIN_LINK_LABELS[key],
})) satisfies { key: keyof ProjectQuickLinks; label: string }[];
