import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandIcon } from '../components/icons';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-login">
      <div className="partner-login__bg" aria-hidden="true" />
      <form className="partner-login__card" onSubmit={onSubmit}>
        <div className="partner-login__brand">
          <div className="partner-login__logo">
            <BrandIcon size={28} />
          </div>
          <h1>Espace Hôtel</h1>
          <p>Gérez disponibilités, tarifs et photos en toute simplicité.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@votre-hotel.dz"
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Connexion…' : 'Accéder au tableau de bord'}
        </button>

        <p className="partner-login__hint">
          Identifiants fournis par Algeria Travel après création de votre compte.
        </p>
      </form>
    </div>
  );
}
