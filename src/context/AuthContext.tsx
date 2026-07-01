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
  User,
} from 'firebase/auth';
import { auth } from '../utils/firebase';

interface AuthContextType {
  userName: string;
  isAuthenticated: boolean;
  uid: string | null;
  authReady: boolean;
  login: (name: string) => void;
  logout: () => void;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState('Katana User');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUid(user.uid);
        setAuthReady(true);
        if (!user.isAnonymous) {
          setIsAuthenticated(true);
          // Restore displayName from Firebase Auth profile on every app restart
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

    // Persist the display name to Firebase Auth profile
    const displayName = name.trim() || email.split('@')[0];
    await updateProfile(firebaseUser, { displayName });

    setUid(firebaseUser.uid);
    setUserName(displayName);
    setIsAuthenticated(true);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUid(result.user.uid);
    // Use saved displayName if available, otherwise fall back to email prefix
    const name = result.user.displayName || email.split('@')[0];
    setUserName(name);
    setIsAuthenticated(true);
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
      login, logout, signUpWithEmail, signInWithEmail,
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