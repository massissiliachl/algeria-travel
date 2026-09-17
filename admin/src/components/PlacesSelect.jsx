import React, { useMemo } from 'react';
import { parseJsonField } from './ui';

export default function PlacesSelect({ value, onChange, options, allPlaces = [] }) {
  const places = parseJsonField(value ?? '[]', []);
  const selected = Array.isArray(places) && places.length ? places[0] : '';

  const selectOptions = useMemo(() => {
    const list = [...options];
    if (!selected || list.some((place) => place.id === selected)) return list;

    const current = allPlaces.find((place) => place.id === selected);
    if (current) {
      list.unshift({ ...current, name: `${current.name} (non publiée)` });
    } else {
      list.unshift({ id: selected, name: `${selected} (inconnue)` });
    }
    return list;
  }, [options, allPlaces, selected]);

  if (!options.length && !selected) {
    return <p className="field-hint">Aucune destination publiée — publiez d’abord une fiche destination.</p>;
  }

  return (
    <select
      value={selected}
      onChange={(e) => {
        const slug = e.target.value;
        onChange(JSON.stringify(slug ? [slug] : []));
      }}
    >
      <option value="">— Choisir une destination —</option>
      {selectOptions.map((place) => (
        <option key={place.id} value={place.id}>
          {place.name}
        </option>
      ))}
    </select>
  );
}
