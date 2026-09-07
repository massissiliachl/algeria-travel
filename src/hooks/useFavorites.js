import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const FavoritesContext = createContext(null);

const LEGACY_HOTEL_KEY = 'hotel_favorites';
const LOCAL_ITEMS_KEY = 'at_favorite_items';

export function favoriteKey(itemType, itemId) {
  return `${itemType}:${String(itemId)}`;
}

function readLocalItems() {
  try {
    const raw = localStorage.getItem(LOCAL_ITEMS_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalItems(items) {
  try {
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(items));
  } catch {
    /* quota / private mode */
  }
}

function normalizeItems(items) {
  return (items || [])
    .filter((item) => item?.itemType && item?.itemId)
    .map((item) => ({
      itemType: item.itemType,
      itemId: String(item.itemId),
      createdAt: item.createdAt || new Date().toISOString(),
    }));
}

async function syncLocalItemsToApi(localItems, remoteItems) {
  const remoteKeys = new Set(remoteItems.map((item) => favoriteKey(item.itemType, item.itemId)));
  let synced = [...remoteItems];

  for (const item of localItems) {
    const key = favoriteKey(item.itemType, item.itemId);
    if (remoteKeys.has(key)) continue;
    try {
      const result = await api.addFavorite(item.itemType, item.itemId);
      synced = normalizeItems(result.items);
      synced.forEach((entry) => remoteKeys.add(favoriteKey(entry.itemType, entry.itemId)));
    } catch {
      synced.push(item);
      remoteKeys.add(key);
    }
  }

  return synced;
}

async function migrateLegacyHotelFavorites(currentItems) {
  const raw = localStorage.getItem(LEGACY_HOTEL_KEY);
  if (!raw) return currentItems;

  let ids = [];
  try {
    ids = JSON.parse(raw);
  } catch {
    localStorage.removeItem(LEGACY_HOTEL_KEY);
    return currentItems;
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    localStorage.removeItem(LEGACY_HOTEL_KEY);
    return currentItems;
  }

  const existing = new Set(
    currentItems.filter((item) => item.itemType === 'hotel').map((item) => item.itemId)
  );

  let items = [...currentItems];
  for (const id of ids) {
    const itemId = String(id);
    if (existing.has(itemId)) continue;
    try {
      const result = await api.addFavorite('hotel', itemId);
      items = normalizeItems(result.items);
      existing.add(itemId);
    } catch {
      items = [
        { itemType: 'hotel', itemId, createdAt: new Date().toISOString() },
        ...items,
      ];
      existing.add(itemId);
    }
  }

  localStorage.removeItem(LEGACY_HOTEL_KEY);
  writeLocalItems(items);
  return items;
}

export function FavoritesProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const localItems = normalizeItems(readLocalItems());
        let loaded = [];
        try {
          const data = await api.getFavorites();
          loaded = normalizeItems(data.items);
          if (localItems.length) {
            loaded = await syncLocalItemsToApi(localItems, loaded);
          }
          writeLocalItems(loaded);
        } catch {
          loaded = localItems;
        }
        if (cancelled) return;
        const migrated = await migrateLegacyHotelFavorites(loaded);
        if (!cancelled) {
          setItems(migrated);
          writeLocalItems(migrated);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const favoriteSet = useMemo(
    () => new Set(items.map((item) => favoriteKey(item.itemType, item.itemId))),
    [items]
  );

  const isFavorite = useCallback(
    (itemType, itemId) => favoriteSet.has(favoriteKey(itemType, itemId)),
    [favoriteSet]
  );

  const toggleFavorite = useCallback(async (itemType, itemId) => {
    const key = favoriteKey(itemType, itemId);
    const normalizedId = String(itemId);
    const wasFavorite = favoriteSet.has(key);

    let nextItems = items;
    setItems((prev) => {
      nextItems = wasFavorite
        ? prev.filter((item) => !(item.itemType === itemType && item.itemId === normalizedId))
        : [{ itemType, itemId: normalizedId, createdAt: new Date().toISOString() }, ...prev];
      writeLocalItems(nextItems);
      return nextItems;
    });

    try {
      const result = wasFavorite
        ? await api.removeFavorite(itemType, normalizedId)
        : await api.addFavorite(itemType, normalizedId);
      const synced = normalizeItems(result.items);
      setItems(synced);
      writeLocalItems(synced);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[favorites] API indisponible, sauvegarde locale:', err.message);
      }
    }
  }, [favoriteSet, items]);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.length,
      isFavorite,
      toggleFavorite,
    }),
    [items, ready, isFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
