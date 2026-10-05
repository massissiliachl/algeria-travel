import { api, session } from '../api.js';
import { esc, icon, toast, showError, busy, fmtDateTime } from '../ui.js';

export async function renderProfile(view, onUpdated) {
  const { data: o } = await api.raw('/owner/me', {});
  session.setOwner(o);
  view.innerHTML = `
    <div class="page-head"><div><h1>Mon profil</h1><p>Vos coordonnées et votre mot de passe</p></div></div>
    <div class="grid-dash">
      <div class="stack">
        <form class="card" id="infoForm" novalidate>
          <div class="form-section">
            <h3>Coordonnées</h3>
            <div class="form-grid">
              <label class="field">Prénom<input type="text" value="${esc(o.firstName)}" disabled></label>
              <label class="field">Nom<input type="text" value="${esc(o.lastName)}" disabled></label>
              <label class="field full">Email <small>(identifiant de connexion — modifiable par Algeria Travel)</small><input type="email" value="${esc(o.email)}" disabled></label>
              <label class="field">Téléphone <span class="req">*</span><input type="tel" name="phone" value="${esc(o.phone || '')}" required pattern="[0-9+ .\\(\\)\\-]{8,20}"></label>
              <label class="field">WhatsApp<input type="tel" name="whatsapp" value="${esc(o.whatsapp || '')}" pattern="[0-9+ .\\(\\)\\-]{8,20}"></label>
              <label class="field full">Adresse<input type="text" name="address" value="${esc(o.address || '')}" maxlength="300"></label>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn--primary">${icon('check')} Enregistrer</button></div>
          </div>
        </form>
        <form class="card" id="pwdForm" novalidate>
          <div class="form-section">
            <h3>Changer de mot de passe</h3>
            <div class="form-grid">
              <label class="field full">Mot de passe actuel<input type="password" name="currentPassword" required autocomplete="current-password"></label>
              <label class="field">Nouveau mot de passe <small>8 caractères min., lettres et chiffres</small><input type="password" name="newPassword" required minlength="8" autocomplete="new-password"></label>
              <label class="field">Confirmer<input type="password" name="confirmPassword" required minlength="8" autocomplete="new-password"></label>
            </div>
            <div class="form-actions"><button type="submit" class="btn btn--primary">${icon('lock')} Mettre à jour</button></div>
          </div>
        </form>
      </div>
      <div class="card"><div class="card__head"><h2>Mon compte</h2></div><div class="card__body">
        <dl class="kv">
          <dt>Statut</dt><dd><span class="badge badge--active">Actif</span></dd>
          <dt>Membre depuis</dt><dd>${new Date(o.createdAt).toLocaleDateString('fr-FR')}</dd>
          <dt>Dernière connexion</dt><dd>${fmtDateTime(o.lastLogin)}</dd>
        </dl>
      </div></div>
    </div>`;

  const info = view.querySelector('#infoForm');
  info.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!info.reportValidity()) return;
    await busy(info.querySelector('[type=submit]'), async () => {
      try {
        await api.raw('/owner/me', { method: 'PUT', body: { phone: info.phone.value.trim(), whatsapp: info.whatsapp.value.trim(), address: info.address.value.trim() } });
        toast('Coordonnées enregistrées.');
        onUpdated?.();
      } catch (err) {
        showError(err);
      }
    });
  });

  const pwd = view.querySelector('#pwdForm');
  pwd.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!pwd.reportValidity()) return;
    if (pwd.newPassword.value !== pwd.confirmPassword.value) return showError({ message: 'Les mots de passe ne correspondent pas.' });
    await busy(pwd.querySelector('[type=submit]'), async () => {
      try {
        await api.raw('/owner/me', {
          method: 'PUT',
          body: { currentPassword: pwd.currentPassword.value, newPassword: pwd.newPassword.value, confirmPassword: pwd.confirmPassword.value },
        });
        pwd.reset();
        toast('Mot de passe modifié.');
      } catch (err) {
        showError(err);
      }
    });
  });
}
