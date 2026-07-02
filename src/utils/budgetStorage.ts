import {
  collection, doc, getDocs, setDoc, deleteDoc,
  query, where, getDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  month: string; // YYYY-MM
  createdAt: number;
  updatedAt: number;
}

const budgetsCol = (uid: string) => collection(db, 'users', uid, 'budgets');
const flagsCol = (uid: string) => collection(db, 'users', uid, 'warningFlags');

export const getBudgets = async (uid: string, month: string): Promise<Budget[]> => {
  try {
    const q = query(budgetsCol(uid), where('month', '==', month));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Budget));
  } catch (e) {
    console.error('Failed to fetch budgets', e);
    return [];
  }
};

export const setBudget = async (
  uid: string,
  budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    const id = `${budget.categoryId}_${budget.month}`;
    const ref = doc(db, 'users', uid, 'budgets', id);
    const existing = await getDoc(ref);
    await setDoc(ref, {
      ...budget,
      createdAt: existing.exists() ? existing.data().createdAt : Date.now(),
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.error('Failed to set budget', e);
    throw e;
  }
};

export const deleteBudget = async (uid: string, categoryId: string, month: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', uid, 'budgets', `${categoryId}_${month}`));
  } catch (e) {
    console.error('Failed to delete budget', e);
    throw e;
  }
};

// Returns true if this is the first time the warning fires (should show alert)
export const checkAndSetWarningFlag = async (uid: string, flagKey: string): Promise<boolean> => {
  try {
    const ref = doc(db, 'users', uid, 'warningFlags', flagKey);
    const snap = await getDoc(ref);
    if (snap.exists()) return false;
    await setDoc(ref, { flaggedAt: Date.now() });
    return true;
  } catch (e) {
    console.error('Failed to check warning flag', e);
    return false;
  }
};