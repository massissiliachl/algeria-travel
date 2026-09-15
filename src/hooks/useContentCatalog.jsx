import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PLACES, getPlaceById as getStaticPlaceById } from '../data/places';
import { FEATURED_TOURS } from '../data/tours';
import { ACTIVITIES } from '../data/activities';
import { BLOG_POSTS } from '../data/blog';
import { filterStays as filterStaticStays, STAYS } from '../data/stays';
import { resolveTaghitPlace } from '../data/taghitPackages';
import { api } from '../services/api';
import {
  mergeCatalog,
  normalizeActivities,
  normalizeBlogPosts,
  normalizePlace,
  normalizePlaces,
  normalizeStays,
  normalizeTours,
} from '../utils/normalizeContent';

const ContentCatalogContext = createContext(null);

function buildTaghitPlace(apiPlace) {
  const base = { ...resolveTaghitPlace('hotel'), bookingOpen: true };
  if (!apiPlace) return base;
  const normalized = normalizePlace(apiPlace);
  return { ...base, ...normalized, bookingOpen: normalized.bookingOpen ?? true };
}

async function fetchContentCatalog() {
  const [toursRes, placesRes, activitiesRes, blogRes, staysRes] = await Promise.allSettled([
    api.getTours(),
    api.getPlaces(),
    api.getActivities(),
    api.getBlogPosts(),
    api.getStays(),
  ]);

  return {
    tours:
      toursRes.status === 'fulfilled' && Array.isArray(toursRes.value)
        ? mergeCatalog(FEATURED_TOURS, normalizeTours(toursRes.value))
        : null,
    places:
      placesRes.status === 'fulfilled' && Array.isArray(placesRes.value)
        ? mergeCatalog(PLACES, normalizePlaces(placesRes.value))
        : null,
    activities:
      activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value)
        ? mergeCatalog(ACTIVITIES, normalizeActivities(activitiesRes.value))
        : null,
    blogPosts:
      blogRes.status === 'fulfilled' && Array.isArray(blogRes.value)
        ? mergeCatalog(BLOG_POSTS, normalizeBlogPosts(blogRes.value), 'slug')
        : null,
    stays:
      staysRes.status === 'fulfilled' && Array.isArray(staysRes.value)
        ? mergeCatalog(STAYS, normalizeStays(staysRes.value))
        : null,
  };
}

export function ContentCatalogProvider({ children }) {
  const [tours, setTours] = useState(FEATURED_TOURS);
  const [places, setPlaces] = useState(PLACES);
  const [activities, setActivities] = useState(ACTIVITIES);
  const [blogPosts, setBlogPosts] = useState(BLOG_POSTS);
  const [stays, setStays] = useState(STAYS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applyCatalog = (catalog) => {
      if (catalog.tours) setTours(catalog.tours);
      if (catalog.places) setPlaces(catalog.places);
      if (catalog.activities) setActivities(catalog.activities);
      if (catalog.blogPosts) setBlogPosts(catalog.blogPosts);
      if (catalog.stays) setStays(catalog.stays);
      setLoaded(true);
    };

    const refresh = () => {
      fetchContentCatalog()
        .then((catalog) => {
          if (!cancelled) applyCatalog(catalog);
        })
        .catch(() => {
          if (!cancelled) setLoaded(true);
        });
    };

    refresh();

    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(refresh, 120_000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, []);

  const getPlace = useCallback(
    (id, pkg) => {
      if (!id) return undefined;
      if (id === 'taghit') {
        const apiPlace = places.find((p) => p.id === 'taghit');
        return buildTaghitPlace(apiPlace);
      }
      const fromCatalog = places.find((p) => p.id === id);
      if (fromCatalog) {
        return { ...fromCatalog, bookingOpen: fromCatalog.bookingOpen ?? false };
      }
      return getStaticPlaceById(id, pkg);
    },
    [places]
  );

  const getTour = useCallback(
    (id) => tours.find((t) => String(t.id) === String(id)),
    [tours]
  );

  const getActivity = useCallback(
    (id) => activities.find((a) => a.id === id),
    [activities]
  );

  const getBlogPost = useCallback(
    (slug) => blogPosts.find((p) => p.slug === slug) || null,
    [blogPosts]
  );

  const getRelatedBlogPosts = useCallback(
    (post, limit = 3) =>
      blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, limit),
    [blogPosts]
  );

  const getActivitiesForPlace = useCallback(
    (placeId) =>
      activities.filter((a) => Array.isArray(a.places) && a.places.includes(placeId)),
    [activities]
  );

  const filterStays = useCallback(
    (filters) => {
      const filtered = stays.filter((stay) => {
        const typeOk =
          !filters?.type ||
          filters.type === 'all' ||
          stay.type === filters.type;
        const placeOk =
          !filters?.place ||
          filters.place === 'all' ||
          stay.placeId === filters.place;
        return typeOk && placeOk;
      });
      if (filtered.length) return filtered;
      return filterStaticStays(filters);
    },
    [stays]
  );

  const value = useMemo(
    () => ({
      loaded,
      tours,
      places,
      activities,
      blogPosts,
      stays,
      getPlace,
      getTour,
      getActivity,
      getBlogPost,
      getRelatedBlogPosts,
      getActivitiesForPlace,
      filterStays,
    }),
    [
      loaded,
      tours,
      places,
      activities,
      blogPosts,
      stays,
      getPlace,
      getTour,
      getActivity,
      getBlogPost,
      getRelatedBlogPosts,
      getActivitiesForPlace,
      filterStays,
    ]
  );

  return (
    <ContentCatalogContext.Provider value={value}>{children}</ContentCatalogContext.Provider>
  );
}

export function useContentCatalog() {
  const ctx = useContext(ContentCatalogContext);
  if (!ctx) {
    throw new Error('useContentCatalog must be used within ContentCatalogProvider');
  }
  return ctx;
}
