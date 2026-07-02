import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  linkWithCredential,
  EmailAuthProvider,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  User,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  userName: string;
  isAuthenticated: boolean;
  uid: string | null;
  authReady: boolean;
  login: (name: string) => void;
  logout: () => void;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState('Katana User');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: '671647247985-1akbphsib0p8d7ibu5gompfnr7ga0eq6.apps.googleusercontent.com',
  androidClientId: '671647247985-t4bm0h4d19s1qe0178f7biaod6jfa3dr.apps.googleusercontent.com',
});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUid(user.uid);
        setAuthReady(true);
        if (!user.isAnonymous) {
          setIsAuthenticated(true);
          if (user.displayName) {
            setUserName(user.displayName);
          } else if (user.email) {
            setUserName(user.email.split('@')[0]);
          }
        }
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous sign-in failed:', err);
        });
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          const user = result.user;
          setUid(user.uid);
          const name = user.displayName || user.email?.split('@')[0] || 'Katana User';
          setUserName(name);
          setIsAuthenticated(true);
          setAuthReady(true);
        })
        .catch((err) => console.error('Google sign-in failed:', err));
    }
  }, [response]);

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const current = auth.currentUser;
    let firebaseUser;

    if (current && current.isAnonymous) {
      const credential = EmailAuthProvider.credential(email, password);
      const result = await linkWithCredential(current, credential);
      firebaseUser = result.user;
    } else {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
    }

    const displayName = name.trim() || email.split('@')[0];
    await updateProfile(firebaseUser, { displayName });

    setUid(firebaseUser.uid);
    setUserName(displayName);
    setIsAuthenticated(true);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUid(result.user.uid);
    const name = result.user.displayName || email.split('@')[0];
    setUserName(name);
    setIsAuthenticated(true);
  };

 const signInWithGoogle = async () => {
  Alert.alert(
    'Google Sign-In',
    'Google sign-in is available in the full app build. Please use email/password sign-in for now.',
    [{ text: 'OK' }]
  );
};

  const login = (name: string) => {
    setUserName(name.trim() || 'Katana User');
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setUserName('Katana User');
    setUid(null);
    setAuthReady(false);
  };

  return (
    <AuthContext.Provider value={{
      userName, isAuthenticated, uid, authReady,
      login, logout, signUpWithEmail, signInWithEmail, signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};