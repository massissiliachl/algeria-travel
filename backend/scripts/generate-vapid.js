const webpush = require('web-push');

const keys = webpush.generateVAPIDKeys();

console.log('Ajoutez ces lignes dans backend/.env :\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('VAPID_SUBJECT=mailto:Algeria.travel@gmail.com');
