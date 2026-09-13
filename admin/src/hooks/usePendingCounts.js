import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export function usePendingCounts(pollMs = 30000) {
  const [counts, setCounts] = useState({ reservations: 0, comments: 0 });

  const refresh = useCallback(async () => {
    const [reservationsResult, commentsResult] = await Promise.allSettled([
      api.getReservations('pending'),
      api.getCommentStats(),
    ]);

    setCounts({
      reservations:
        reservationsResult.status === 'fulfilled'
          ? (reservationsResult.value.reservations || []).length
          : 0,
      comments:
        commentsResult.status === 'fulfilled'
          ? commentsResult.value.pending || 0
          : 0,
    });
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh, pollMs]);

  return { ...counts, refresh };
}
