import { getNames } from 'country-list';

export function getCountryList() {
  return getNames()
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }));
}
