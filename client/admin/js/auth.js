/**
 * Auth admin — sessionStorage
 * Identifiants par défaut : admin / AlgeriaTravel2026
 */
(function (global) {
  const AUTH_KEY = 'at_admin_auth';
  const CREDENTIALS = {
    user: 'admin',
    pass: 'AlgeriaTravel2026',
  };

  const Auth = {
    isLoggedIn() {
      return sessionStorage.getItem(AUTH_KEY) === '1';
    },
    login(user, pass) {
      if (
        user.trim().toLowerCase() === CREDENTIALS.user &&
        pass === CREDENTIALS.pass
      ) {
        sessionStorage.setItem(AUTH_KEY, '1');
        sessionStorage.setItem('at_admin_pass', pass);
        return true;
      }
      return false;
    },
    logout() {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem('at_admin_pass');
    },
  };

  global.ATAuth = Auth;
})(window);
