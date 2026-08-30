import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useLang } from '../../hooks/useLangHook';

const ITEMS = [
  { to: '/', labelKey: 'nav_home', icon: 'House', match: (pathname) => pathname === '/' },
  {
    to: '/hotels',
    labelKey: 'hotels_nav',
    icon: 'Hotel',
    match: (pathname, searchParams) =>
      pathname.startsWith('/hotels') && !searchParams.get('favorites'),
  },
  {
    to: '/hotels?favorites=1',
    labelKey: 'hotels_nav_favorites',
    icon: 'Heart',
    match: (pathname, searchParams) =>
      pathname.startsWith('/hotels') && searchParams.get('favorites') === '1',
  },
  { to: '/reservations', labelKey: 'hotels_nav_bookings', icon: 'Calendar', match: (pathname) => pathname === '/reservations' },
  { to: '/contact', labelKey: 'hotels_nav_account', icon: 'User', match: (pathname) => pathname === '/contact' },
];

export default function HotelsMobileNav() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLang();

  return (
    <nav className="htl-mobile-nav" aria-label="Navigation mobile">
      {ITEMS.map((item) => {
        const isActive = item.match(pathname, searchParams);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`htl-mobile-nav__item${isActive ? ' is-active' : ''}`}
          >
            <Icon name={item.icon} size={20} strokeWidth={1.75} />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
