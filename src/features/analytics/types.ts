export interface MetricSeries {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  foot: string;
  data: number[];
  color?: string;
}

export interface ChannelShare {
  key: string;
  value: number;
  color: string;
}
