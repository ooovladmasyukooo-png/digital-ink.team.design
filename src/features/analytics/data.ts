import type { ChannelShare, MetricSeries } from './types';

const revenue = [14, 18, 16, 22, 28, 24, 32, 38, 34, 42, 46, 52, 58, 55, 62];
const leads = [22, 20, 28, 32, 30, 38, 42, 40, 48, 54, 58, 52, 60, 68, 72];
const conversion = [12, 18, 14, 22, 20, 28, 26, 32, 30, 38, 36, 42, 45, 52, 58];

export const metrics: MetricSeries[] = [
  { label: 'Виручка', value: '₴1.84M', delta: '18.2%', up: true, foot: 'vs ₴1.56M минулого періоду', data: revenue },
  { label: 'Нові ліди', value: '1 248', delta: '12.4%', up: true, foot: '227 кваліфікованих', data: leads, color: '#10b981' },
  { label: 'Конверсія', value: '32.4%', delta: '2.1%', up: false, foot: 'Q2 ціль · 36%', data: conversion, color: '#3b82f6' },
  { label: 'Сер. чек', value: '₴48 200', delta: '8.6%', up: true, foot: 'по 184 угодах', data: revenue.map((item) => item * 0.7 + 10), color: '#f59e0b' },
];

export const weeklyBars = [
  { label: 'Пн', value: 62 },
  { label: 'Вт', value: 88 },
  { label: 'Ср', value: 74 },
  { label: 'Чт', value: 96 },
  { label: 'Пт', value: 108 },
  { label: 'Сб', value: 42 },
  { label: 'Нд', value: 28 },
];

export const channels: ChannelShare[] = [
  { key: 'Instagram', value: 38, color: '#ef4444' },
  { key: 'Direct', value: 22, color: '#f59e0b' },
  { key: 'Referral', value: 18, color: '#10b981' },
  { key: 'Webinar', value: 12, color: '#3b82f6' },
  { key: 'LinkedIn', value: 10, color: '#a855f7' },
];
