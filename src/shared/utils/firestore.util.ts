import admin from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}'
);
console.log('serviceAccount', serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert({
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
    ...serviceAccount,
  }),
});

const firestore = admin.firestore();

export default firestore;
