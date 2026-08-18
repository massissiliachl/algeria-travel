import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandIcon } from '../components/icons';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(key.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Clé invalide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-brand">
          <div className="login-brand-icon">
            <BrandIcon size={28} />
          </div>
          <h1>Administration</h1>
          <p className="login-subtitle">
            Connectez-vous avec votre clé admin pour accéder au panneau de gestion.
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="key">Clé admin</label>
          <input
            id="key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Votre clé secrète"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
          disabled={loading}
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
