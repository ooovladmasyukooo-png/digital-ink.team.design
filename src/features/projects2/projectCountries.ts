export type CountryCode = string;

export interface CountryOption {
  code: CountryCode;
  label: string;
}

/** ISO 3166-1 alpha-2 → прапор (emoji). */
export function countryFlagEmoji(code: string): string {
  const c = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return '🏳️';
  const points = [...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65);
  return String.fromCodePoint(...points);
}

export const PROJECT_COUNTRIES: CountryOption[] = [
  { code: 'UA', label: 'Україна' },
  { code: 'PL', label: 'Польща' },
  { code: 'DE', label: 'Німеччина' },
  { code: 'CZ', label: 'Чехія' },
  { code: 'IT', label: 'Італія' },
  { code: 'ES', label: 'Іспанія' },
  { code: 'FR', label: 'Франція' },
  { code: 'GB', label: 'Велика Британія' },
  { code: 'US', label: 'США' },
  { code: 'CA', label: 'Канада' },
  { code: 'AE', label: 'ОАЕ' },
  { code: 'JP', label: 'Японія' },
  { code: 'TR', label: 'Туреччина' },
  { code: 'GE', label: 'Грузія' },
  { code: 'LT', label: 'Литва' },
  { code: 'LV', label: 'Латвія' },
  { code: 'EE', label: 'Естонія' },
];

export function countryLabel(code: string): string {
  return PROJECT_COUNTRIES.find((c) => c.code === code)?.label ?? code;
}

export function parseCountryFromCity(city: string): CountryCode | null {
  const m = city.match(/,\s*([A-Za-z]{2})\s*$/);
  return m ? m[1].toUpperCase() : null;
}

export function cityWithoutCountrySuffix(city: string): string {
  return city.replace(/,\s*[A-Za-z]{2}\s*$/i, '').trim();
}
