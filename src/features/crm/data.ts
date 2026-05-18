import type { Lead, PipelineStage } from './types';

export const leads: Lead[] = [
  { id: 'L-0118', name: 'Олена Кравченко', status: 'hot', stage: 'Переговори', source: 'Instagram', value: 48200, owner: 'AM', country: 'UA', last: '2 хв тому', email: 'olena.k@studio.ua', hue: 20 },
  { id: 'L-0117', name: 'Marcus Reinhardt', status: 'new', stage: 'Кваліфікація', source: 'Referral', value: 124000, owner: 'DV', country: 'DE', last: '14 хв тому', email: 'marcus@reinhardt.de', hue: 240 },
  { id: 'L-0116', name: 'Sofia Castellano', status: 'warm', stage: 'Пропозиція', source: 'Webinar', value: 31500, owner: 'AM', country: 'IT', last: '1 год тому', email: 'sofia.c@made-in.it', hue: 340 },
  { id: 'L-0115', name: 'Тарас Глущенко', status: 'hot', stage: 'Переговори', source: 'Direct', value: 67800, owner: 'YA', country: 'UA', last: '2 год тому', email: 'taras@glushchenko.co', hue: 120 },
  { id: 'L-0114', name: 'Aiko Tanaka', status: 'new', stage: 'Кваліфікація', source: 'LinkedIn', value: 92400, owner: 'DV', country: 'JP', last: '4 год тому', email: 'aiko@kireihaus.jp', hue: 300 },
  { id: 'L-0113', name: 'Дмитро Білий', status: 'cold', stage: 'Розвідка', source: 'Outbound', value: 18900, owner: 'YA', country: 'UA', last: '1 день тому', email: 'd.bilyi@northforge.ua', hue: 200 },
  { id: 'L-0112', name: 'Petra Novak', status: 'warm', stage: 'Пропозиція', source: 'Instagram', value: 52000, owner: 'AM', country: 'CZ', last: '1 день тому', email: 'petra@novak-studio.cz', hue: 60 },
  { id: 'L-0111', name: 'Khalid Mansour', status: 'hot', stage: 'Контракт', source: 'Referral', value: 218400, owner: 'DV', country: 'AE', last: '2 дні тому', email: 'k.mansour@oasis.ae', hue: 160 },
  { id: 'L-0110', name: 'Anya Volkova', status: 'lost', stage: 'Втрачений', source: 'Webinar', value: 0, owner: 'YA', country: 'PL', last: '3 дні тому', email: 'anya.v@volkovaco.pl', hue: 280 },
];

export const pipeline: PipelineStage[] = [
  { id: 'recon', title: 'Розвідка', count: 42, value: '₴1.2M', tone: 'gray' },
  { id: 'qual', title: 'Кваліфікація', count: 28, value: '₴2.8M', tone: 'blue' },
  { id: 'prop', title: 'Пропозиція', count: 19, value: '₴3.4M', tone: 'amber' },
  { id: 'nego', title: 'Переговори', count: 11, value: '₴4.1M', tone: 'red' },
  { id: 'won', title: 'Виграні', count: 7, value: '₴2.6M', tone: 'green' },
];
