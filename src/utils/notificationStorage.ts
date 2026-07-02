import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import dayjs from 'dayjs';

export interface AppNotification {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'weekly_report' | 'income_credited' | 'general' | 'high_spending' | 'savings_milestone' | 'month_end_summary';
  title: string;
  subtitle: string;
  createdAt: number;
  read: boolean;
  metadata?: {
    categoryId?: string;
    percentage?: number;
    month?: string;
    transactionAmount?: number;
    savingsRate?: number;
  };
}

const notifCol = (uid: string) => collection(db, 'users', uid, 'notifications');

export const addNotification = async (
  uid: string,
  notif: Omit<AppNotification, 'id'>
): Promise<string> => {
  const docRef = await addDoc(notifCol(uid), notif);
  return docRef.id;
};

export const markNotificationRead = async (
  uid: string,
  notifId: string
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid, 'notifications', notifId), { read: true });
};

export const markAllNotificationsRead = async (uid: string): Promise<void> => {
  const q = query(notifCol(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const batch = writeBatch(db);

  snap.docs.forEach((d) => {
    if (!d.data().read) {
      batch.update(doc(db, 'users', uid, 'notifications', d.id), { read: true });
    }
  });

  await batch.commit();
};

export const deleteNotification = async (
  uid: string,
  notifId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'users', uid, 'notifications', notifId));
};

export const clearAllNotifications = async (uid: string): Promise<void> => {
  const q = query(notifCol(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const batch = writeBatch(db);

  snap.docs.forEach((d) => {
    batch.delete(doc(db, 'users', uid, 'notifications', d.id));
  });

  await batch.commit();
};

export const subscribeToNotifications = (
  uid: string,
  callback: (notifications: AppNotification[]) => void
) => {
  const q = query(notifCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as AppNotification[];
    callback(notifs);
  });
};

// ── Smart notification helpers ──────────────────────────────────────────────

export const checkAndAddBudgetWarning = async (
  uid: string,
  category: string,
  percentage: number,
  month: string
): Promise<void> => {
  if (percentage >= 100) {
    await addNotification(uid, {
      type: 'budget_exceeded',
      title: '🚨 Budget Exceeded!',
      subtitle: `You've exceeded your ${category} budget for ${month}.`,
      createdAt: Date.now(),
      read: false,
      metadata: { categoryId: category, percentage: Math.round(percentage), month },
    });
  } else if (percentage >= 80) {
    await addNotification(uid, {
      type: 'budget_warning',
      title: '⚠️ Budget Warning',
      subtitle: `You've used ${Math.round(percentage)}% of your ${category} budget for ${month}.`,
      createdAt: Date.now(),
      read: false,
      metadata: { categoryId: category, percentage: Math.round(percentage), month },
    });
  }
};

export const addHighSpendingNotification = async (
  uid: string,
  transactionName: string,
  amount: number,
  category: string
): Promise<void> => {
  await addNotification(uid, {
    type: 'high_spending',
    title: '💸 High Spending Alert',
    subtitle: `You spent ₹${amount.toFixed(2)} on ${transactionName} (${category}). That's unusually high!`,
    createdAt: Date.now(),
    read: false,
    metadata: { categoryId: category, transactionAmount: amount },
  });
};

export const addSavingsMilestoneNotification = async (
  uid: string,
  savingsRate: number
): Promise<void> => {
  let title = '';
  let subtitle = '';

  if (savingsRate >= 75) {
    title = '🏆 Savings Milestone: 75%';
    subtitle = `Incredible! You're saving ${savingsRate.toFixed(1)}% of your income this month.`;
  } else if (savingsRate >= 50) {
    title = '🎯 Savings Milestone: 50%';
    subtitle = `Great job! You're saving ${savingsRate.toFixed(1)}% of your income this month.`;
  } else if (savingsRate >= 25) {
    title = '✨ Savings Milestone: 25%';
    subtitle = `Nice work! You're saving ${savingsRate.toFixed(1)}% of your income this month.`;
  }

  if (title) {
    await addNotification(uid, {
      type: 'savings_milestone',
      title,
      subtitle,
      createdAt: Date.now(),
      read: false,
      metadata: { savingsRate: Math.round(savingsRate) },
    });
  }
};

export const addIncomeCreditedNotification = async (
  uid: string,
  transactionName: string,
  amount: number
): Promise<void> => {
  await addNotification(uid, {
    type: 'income_credited',
    title: '💰 Income Credited',
    subtitle: `₹${amount.toFixed(2)} credited from ${transactionName}.`,
    createdAt: Date.now(),
    read: false,
  });
};

export const addWeeklyReportNotification = async (
  uid: string,
  totalIncome: number,
  totalExpense: number,
  topCategory: string
): Promise<void> => {
  const netSavings = totalIncome - totalExpense;
  const netLabel = netSavings >= 0 ? 'saved' : 'overspent';

  await addNotification(uid, {
    type: 'weekly_report',
    title: '📊 Weekly Report Ready',
    subtitle: `Income: ₹${totalIncome.toFixed(2)} | Expenses: ₹${totalExpense.toFixed(2)} | Net ${netLabel}: ₹${Math.abs(netSavings).toFixed(2)}. Top category: ${topCategory}.`,
    createdAt: Date.now(),
    read: false,
    metadata: { month: dayjs().format('YYYY-MM') },
  });
};

export const addMonthEndSummaryNotification = async (
  uid: string,
  month: string,
  totalIncome: number,
  totalExpense: number,
  topCategory: string
): Promise<void> => {
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100) : 0;

  await addNotification(uid, {
    type: 'month_end_summary',
    title: '📅 Month-End Summary',
    subtitle: `${month}: Income ₹${totalIncome.toFixed(2)}, Expenses ₹${totalExpense.toFixed(2)}, Savings ₹${netSavings.toFixed(2)} (${savingsRate.toFixed(1)}%). Top: ${topCategory}.`,
    createdAt: Date.now(),
    read: false,
    metadata: { month, savingsRate: Math.round(savingsRate) },
  });
};