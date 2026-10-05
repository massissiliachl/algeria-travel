/**
 * Auth admin — sessionStorage
 * Identifiant : admin. Mot de passe : la clé ADMIN_API_KEY du backend (vérifiée par le serveur).
 * Si le backend est injoignable, l’ancien mot de passe local ouvre l’admin en mode local (sans publication).
 */
(function (global) {
  const AUTH_KEY = 'at_admin_auth';
  const CREDENTIALS = {
    user: 'admin',
    pass: 'AlgeriaTravel2026',
  };

  function open(pass, online) {
    sessionStorage.setItem(AUTH_KEY, '1');
    sessionStorage.setItem('at_admin_pass', pass);
    if (online) sessionStorage.setItem(global.AT_API.ADMIN_KEY, pass);
    else sessionStorage.removeItem(global.AT_API.ADMIN_KEY);
  }

  const Auth = {
    isLoggedIn() {
      return sessionStorage.getItem(AUTH_KEY) === '1';
    },
    /** Résout { ok, online } */
    async login(user, pass) {
      pass = String(pass || '').trim().replace(/^["']|["']$/g, '');
      if (user.trim().toLowerCase() !== CREDENTIALS.user || !pass) return { ok: false };
      try {
        const { ok, status } = await global.AT_API.request('/admin/auth/verify', {
          method: 'POST',
          body: { key: pass },
          timeout: 70000,
        });
        if (ok) {
          open(pass, true);
          return { ok: true, online: true };
        }
        if (status === 401) return { ok: false };
      } catch {
        /* backend injoignable : mode local */
      }
      if (pass !== CREDENTIALS.pass) return { ok: false };
      open(pass, false);
      return { ok: true, online: false };
    },
    logout() {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem('at_admin_pass');
      sessionStorage.removeItem(global.AT_API.ADMIN_KEY);
    },
  };

  global.ATAuth = Auth;
})(window);
