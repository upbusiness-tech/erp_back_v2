import dotenv from 'dotenv';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
dotenv.config();

export function initFirebaseApp() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT não encontrada!');

  const serviceAccount = JSON.parse(raw);

  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      '\n',
    );
  }

  const app =
    getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
  return app;
}

export const firebaseAuth = getAuth(initFirebaseApp());
