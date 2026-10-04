/**
 * Contenus publiés par l’admin (galerie, circuits, destinations, activités) : lus dans Supabase
 * (backend Render) avant que les pages ne lisent localStorage. Si le serveur dort ou ne répond pas,
 * on garde les dernières données connues et la mise à jour finit en arrière-plan pour la visite suivante.
 */

const WAIT_MS = 4000;

const syncAll = async () => {
  const api = window.AT_API;
  if (!api) return;
  await Promise.all(
    Object.entries(api.RESOURCES).map(async ([key, { path, type }]) => {
      const { ok, data } = await api.request(`/${path}`);
      if (!ok || !Array.isArray(data)) return;
      localStorage.setItem(key, JSON.stringify(api.toLocal[type](data)));
    })
  );
};

const sync = syncAll().catch(() => {
  /* serveur indisponible : on garde les données locales */
});
await Promise.race([sync, new Promise((resolve) => setTimeout(resolve, WAIT_MS))]);
