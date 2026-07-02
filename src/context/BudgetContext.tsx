import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getBudgets, setBudget, deleteBudget, Budget } from '../utils/budgetStorage';
import { useAuth } from './AuthContext';
import dayjs from 'dayjs';

interface BudgetContextType {
  budgets: Budget[];
  loading: boolean;
  currentMonth: string;
  refreshBudgets: () => Promise<void>;
  saveBudget: (categoryId: string, categoryName: string, limitAmount: number) => Promise<void>;
  removeBudget: (categoryId: string) => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uid, authReady } = useAuth();
  const currentMonth = dayjs().format('YYYY-MM');
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshBudgets = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    const data = await getBudgets(uid, currentMonth);
    setBudgetsState(data);
    setLoading(false);
  }, [uid, currentMonth]);

  const saveBudget = async (categoryId: string, categoryName: string, limitAmount: number) => {
    if (!uid) return;
    await setBudget(uid, { categoryId, categoryName, limitAmount, month: currentMonth });
    await refreshBudgets();
  };

  const removeBudget = async (categoryId: string) => {
    if (!uid) return;
    await deleteBudget(uid, categoryId, currentMonth);
    await refreshBudgets();
  };

  useEffect(() => {
    if (authReady && uid) refreshBudgets();
  }, [authReady, uid, refreshBudgets]);

  return (
    <BudgetContext.Provider value={{ budgets, loading, currentMonth, refreshBudgets, saveBudget, removeBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudgets must be used within a BudgetProvider');
  return context;
};