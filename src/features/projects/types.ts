export type ProjectStatus = 'active' | 'paused' | 'archived';

export interface Project {
  name: string;
  loc: string;
  country: string;
  open: number;
  sched: number;
  total: number;
  status: ProjectStatus;
  hue: number;
}
