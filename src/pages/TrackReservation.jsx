import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import { useLang } from '../hooks/useLangHook';
import { api } from '../services/api';
import './TrackReservation.css';

const STATUS_KEYS = {
  pending: 'track_status_pending',
  reviewed: 'track_status_reviewed',
  confirmed: 'track_status_confirmed',
  rejected: 'track_status_rejected',
  cancelled: 'track_status_cancelled',
};

const TrackReservation = () => {
  const { t } = useLang();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [ref, setRef] = useState(searchParams.get('ref') || '');
  const [token, setToken] = useState(location.state?.token || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const paramRef = searchParams.get('ref');
    if (paramRef) setRef(paramRef.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    if (location.state?.token) setToken(location.state.token);
  }, [location.state?.token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const normalizedRef = ref.trim().toUpperCase();
    const normalizedToken = token.trim();

    if (!normalizedRef || !normalizedToken) {
      setError(t('track_error_required'));
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.trackReservation(normalizedRef, normalizedToken);
      setResult(data);
    } catch (err) {
      setError(err.message || t('track_error_not_found'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusKey = result ? STATUS_KEYS[result.status] || 'track_status_pending' : '';

  return (
    <div className="track-page">
      <Navbar />

      <section className="track-hero">
        <div className="track-hero__inner">
          <p className="track-hero__eyebrow">{t('track_eyebrow')}</p>
          <h1>{t('track_title')}</h1>
          <p className="track-hero__lead">{t('track_lead')}</p>

          <form className="track-bar" onSubmit={onSubmit}>
            <div className="track-bar__fields">
              <label className="track-bar__field">
                <span>{t('track_ref_label')}</span>
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => setRef(e.target.value.toUpperCase())}
                  placeholder="AT-XXXXXX"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <label className="track-bar__field track-bar__field--token">
                <span>{t('track_token_label')}</span>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t('track_token_ph')}
                  autoComplete="off"
                />
              </label>
              <button type="submit" className="track-bar__btn" disabled={loading}>
                {loading ? t('track_loading') : t('track_submit')}
                {!loading && <Icon name="Search" size={18} />}
              </button>
            </div>
          </form>

          {error && (
            <p className="track-alert track-alert--error" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      {result && (
        <section className="track-result" data-reveal>
          <div className="track-result__card">
            <div className="track-result__head">
              <div>
                <p className="track-result__label">{t('track_result_ref')}</p>
                <h2>{result.referenceCode}</h2>
              </div>
              <span className={`track-status track-status--${result.status}`}>
                {t(statusKey)}
              </span>
            </div>

            <dl className="track-result__grid">
              <div>
                <dt>{t('track_field_destination')}</dt>
                <dd>{result.itemName}</dd>
              </div>
              <div>
                <dt>{t('track_field_date')}</dt>
                <dd>{formatDate(result.travelDate)}</dd>
              </div>
              <div>
                <dt>{t('track_field_travelers')}</dt>
                <dd>{result.travelers}</dd>
              </div>
              <div>
                <dt>{t('track_field_submitted')}</dt>
                <dd>{formatDate(result.createdAt)}</dd>
              </div>
            </dl>

            <p className="track-result__hint">{t(`track_hint_${result.status}`)}</p>

            <Link to="/contact" className="track-result__contact">
              {t('track_contact')} <Icon name="ArrowRight" size={16} />
            </Link>
          </div>
        </section>
      )}

      <section className="track-help">
        <div className="track-help__inner">
          <Icon name="MessageCircle" size={22} />
          <div>
            <h3>{t('track_help_title')}</h3>
            <p>{t('track_help_text')}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackReservation;
