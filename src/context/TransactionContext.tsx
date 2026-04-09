import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTransactions, saveTransactions, addTransaction as storageAddTransaction, Transaction, seedMockData } from '../utils/storage';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTransactions = useCallback(async () => {
    setLoading(true);
    let data = await getTransactions();
    
    // Seed data if first time
    if (data.length === 0) {
      await seedMockData();
      data = await getTransactions();
    }
    
    setTransactions(data);
    setLoading(false);
  }, []);

  const addNewTransaction = async (transaction: Transaction) => {
    // Optimistic update
    setTransactions(prev => [transaction, ...prev]);
    
    // Save to storage
    await storageAddTransaction(transaction);
    
    // Final sync to ensure integrity
    const freshData = await getTransactions();
    setTransactions(freshData);
  };

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      loading, 
      refreshTransactions, 
      addTransaction: addNewTransaction 
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
