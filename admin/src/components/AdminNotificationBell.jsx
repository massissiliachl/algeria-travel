import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AdminNotificationBell() {
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = useCallback(() => {
    api
      .getReservations('pending')
      .then((data) => setPendingCount((data.reservations || []).length))
      .catch(() => setPendingCount(0));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return (
    <Link to="/reservations" className="admin-notif-bell" title="Réservations en attente">
      🔔
      {pendingCount > 0 && (
        <span className="admin-notif-bell__count">{pendingCount > 9 ? '9+' : pendingCount}</span>
      )}
    </Link>
  );
}
