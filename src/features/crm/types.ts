import type { Tone } from '../../shared/types/common';

export type LeadStatus = 'hot' | 'warm' | 'new' | 'cold' | 'lost';
export type CrmView = 'list' | 'board';

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
  stage: string;
  source: string;
  value: number;
  owner: string;
  country: string;
  last: string;
  email: string;
  hue: number;
}

export interface PipelineStage {
  id: string;
  title: string;
  count: number;
  value: string;
  tone: Tone;
}
