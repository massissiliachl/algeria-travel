import React from 'react';
import { Link } from 'react-router-dom';
import { usePendingCounts } from '../hooks/usePendingCounts';

function BellLink({ to, count, title, emoji }) {
  return (
    <Link to={to} className="admin-notif-bell" title={title}>
      {emoji}
      {count > 0 && (
        <span className="admin-notif-bell__count">{count > 9 ? '9+' : count}</span>
      )}
    </Link>
  );
}

export default function AdminNotificationBell() {
  const { reservations, comments } = usePendingCounts();

  return (
    <div className="admin-notif-group">
      <BellLink
        to="/reservations"
        count={reservations}
        title="Réservations en attente"
        emoji="📋"
      />
      <BellLink
        to="/comments"
        count={comments}
        title="Commentaires en attente de modération"
        emoji="💬"
      />
    </div>
  );
}
