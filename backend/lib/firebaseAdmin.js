const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging: getFcmMessaging } = require('firebase-admin/messaging');

let ready = false;

function initFirebaseAdmin() {
  if (ready) return true;

  const projectId = process.env.FIREBASE_PROJECT_ID || 'algeria-travel';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return false;
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  ready = true;
  return true;
}

function isFirebaseConfigured() {
  return ready || initFirebaseAdmin();
}

function getMessaging() {
  if (!isFirebaseConfigured()) return null;
  return getFcmMessaging();
}

module.exports = { isFirebaseConfigured, getMessaging };
