import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../ui/Icon';
import { WILAYAS, WILAYA_ALL } from '../../data/wilayas';

const WilayaSearchFilter = ({ layout = 'compact', value, onChange, counts, total, t, pick }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const isSidebar = layout === 'sidebar';

  const activeWilaya =
    value !== 'all' ? WILAYAS.find((w) => w.key === value) : null;

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (w) => {
      if (!q) return true;
      const label = pick(w.fr, w.en, w.ar).toLowerCase();
      return (
        label.includes(q) ||
        w.code.includes(q) ||
        w.key.includes(q)
      );
    };

    const allOption = {
      key: 'all',
      code: '',
      label: pick(WILAYA_ALL.fr, WILAYA_ALL.en, WILAYA_ALL.ar),
      count: total,
    };

    const wilayaOptions = WILAYAS.filter(matches).map((w) => ({
      key: w.key,
      code: w.code,
      label: pick(w.fr, w.en, w.ar),
      count: counts[w.key] || 0,
    }));

    wilayaOptions.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return a.label.localeCompare(b.label, 'fr');
    });

    if (!q || allOption.label.toLowerCase().includes(q) || 'toutes'.includes(q)) {
      return [allOption, ...wilayaOptions];
    }
    return wilayaOptions;
  }, [query, counts, total, pick]);

  useEffect(() => {
    if (isSidebar) return undefined;
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDocClick);
    return () => document.removeEventListener('pointerdown', onDocClick);
  }, [isSidebar]);

  const select = (key) => {
    onChange(key);
    setOpen(false);
    setQuery('');
  };

  const selectedLabel =
    value === 'all'
      ? pick(WILAYA_ALL.fr, WILAYA_ALL.en, WILAYA_ALL.ar)
      : activeWilaya
        ? `${activeWilaya.code} — ${pick(activeWilaya.fr, activeWilaya.en, activeWilaya.ar)}`
        : pick(WILAYA_ALL.fr, WILAYA_ALL.en, WILAYA_ALL.ar);

  const panelOpen = isSidebar || open;

  return (
    <div
      className={`wilaya-filter wilaya-filter--${layout}`}
      ref={wrapRef}
    >
      <p className="wilaya-filter__label">{t('hotels_wilaya_label')}</p>

      {!isSidebar && (
        <button
          type="button"
          className={`wilaya-filter__trigger ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Icon name="MapPin" size={18} />
          <span className="wilaya-filter__trigger-text">{selectedLabel}</span>
          <Icon name="ChevronRight" size={16} className="wilaya-filter__chevron" />
        </button>
      )}

      {value !== 'all' && (
        <button
          type="button"
          className="wilaya-filter__clear"
          onClick={() => onChange('all')}
        >
          <Icon name="X" size={14} />
          {t('hotels_wilaya_clear')}
        </button>
      )}

      <div className={`wilaya-filter__panel ${panelOpen ? 'is-open' : ''}`}>
        <div className="wilaya-filter__search">
          <Icon name="Search" size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('hotels_wilaya_search_ph')}
            aria-label={t('hotels_wilaya_search_ph')}
            autoComplete="off"
            onFocus={() => !isSidebar && setOpen(true)}
          />
          {query && (
            <button
              type="button"
              className="wilaya-filter__search-clear"
              onClick={() => setQuery('')}
              aria-label={t('hotels_wilaya_clear_search')}
            >
              <Icon name="X" size={16} />
            </button>
          )}
        </div>

        <ul className="wilaya-filter__list" role="listbox" aria-label={t('hotels_wilaya_label')}>
          {options.length === 0 ? (
            <li className="wilaya-filter__empty">{t('hotels_wilaya_no_match')}</li>
          ) : (
            options.map((opt) => {
              const isActive = value === opt.key;
              const disabled = opt.key !== 'all' && opt.count === 0;
              return (
                <li key={opt.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    disabled={disabled}
                    className={`wilaya-filter__option ${isActive ? 'is-active' : ''} ${
                      disabled ? 'is-disabled' : ''
                    }`}
                    onClick={() => !disabled && select(opt.key)}
                  >
                    <span className="wilaya-filter__option-label">
                      {opt.code ? (
                        <>
                          <span className="wilaya-filter__code">{opt.code}</span>
                          {opt.label}
                        </>
                      ) : (
                        opt.label
                      )}
                    </span>
                    <span className="wilaya-filter__option-count">{opt.count}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default WilayaSearchFilter;
