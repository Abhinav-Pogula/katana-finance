import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getTransactions,
  addTransaction as storageAddTransaction,
  deleteTransaction as storageDeleteTransaction,
  updateTransaction as storageUpdateTransaction,
  Transaction,
} from '../utils/storage';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uid, authReady } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTransactions = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const data = await getTransactions(uid);
    setTransactions(data);
    setLoading(false);
  }, [uid]);

  const addNewTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!uid) return;
    const tempId = `temp-${Date.now()}`;
    setTransactions(prev => [{ ...transaction, id: tempId }, ...prev]);
    await storageAddTransaction(uid, transaction);
    const freshData = await getTransactions(uid);
    setTransactions(freshData);
  };

  const deleteTransaction = async (id: string) => {
    if (!uid) return;
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    await storageDeleteTransaction(uid, id);
  };

  const updateTransaction = async (id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    if (!uid) return;
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...data } : tx))
    );
    await storageUpdateTransaction(uid, id, data);
  };

  useEffect(() => {
    if (authReady && uid) {
      refreshTransactions();
    }
  }, [authReady, uid, refreshTransactions]);

  return (
    <TransactionContext.Provider value={{
      transactions,
      loading,
      refreshTransactions,
      addTransaction: addNewTransaction,
      deleteTransaction,
      updateTransaction,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};