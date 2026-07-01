import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string; // ISO string or specific format
  amount: number;
  type: 'income' | 'expense';
  icon: any; // Ionicons glyph name
  iconColor: string;
}

const txCollection = (uid: string) => collection(db, 'users', uid, 'transactions');

export const getTransactions = async (uid: string): Promise<Transaction[]> => {
  try {
    const q = query(txCollection(uid), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
  } catch (e) {
    console.error('Failed to fetch transactions', e);
    return [];
  }
};

export const addTransaction = async (
  uid: string,
  transaction: Omit<Transaction, 'id'>
): Promise<string> => {
  try {
    const ref = await addDoc(txCollection(uid), transaction);
    console.log('✅ Storage: Added transaction', ref.id);
    return ref.id;
  } catch (e) {
    console.error('❌ Storage: Failed to add transaction', e);
    throw e;
  }
};

export const deleteTransaction = async (uid: string, id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', uid, 'transactions', id));
  } catch (e) {
    console.error('Failed to delete transaction', e);
    throw e;
  }
};

export const updateTransaction = async (
  uid: string,
  id: string,
  data: Partial<Omit<Transaction, 'id'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid, 'transactions', id), data);
  } catch (e) {
    console.error('Failed to update transaction', e);
    throw e;
  }
};

// Clear all transaction data for this user
export const clearAllData = async (uid: string): Promise<void> => {
  try {
    const snap = await getDocs(txCollection(uid));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch (e) {
    console.error('Failed to clear transactions', e);
  }
};