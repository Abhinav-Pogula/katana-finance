import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB97Gt0EwmLOoOnjutiz5vvycNyP8_4yd4",
  authDomain: "katana-finance.firebaseapp.com",
  projectId: "katana-finance",
  storageBucket: "katana-finance.firebasestorage.app",
  messagingSenderId: "671647247985",
  appId: "1:671647247985:web:c23a846b4b0669c30675d0",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persist auth state across app restarts using AsyncStorage
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

export const db = getFirestore(app);
export default app;