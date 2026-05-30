import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
};

console.log('[Firebase InitConfig Debug]', {
  apiKey: firebaseConfig.apiKey ? `PRESENT (len: ${firebaseConfig.apiKey.length})` : 'MISSING',
  projectId: firebaseConfig.projectId ? `"${firebaseConfig.projectId}" (len: ${firebaseConfig.projectId.length})` : 'MISSING',
  appId: firebaseConfig.appId ? `PRESENT (len: ${firebaseConfig.appId.length})` : 'MISSING'
});

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

const app = getApps().length 
  ? getApps()[0] 
  : initializeApp(
      isConfigValid 
        ? firebaseConfig 
        : {
            apiKey: "mock-api-key-for-build-purposes-only",
            authDomain: "mock-auth-domain",
            projectId: "tonet-paris",
            appId: "mock-app-id"
          }
    );

export const auth = getAuth(app);
export const db   = getFirestore(app);
