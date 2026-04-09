import AsyncStorage from '@react-native-async-storage/async-storage';

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

const STORAGE_KEYS = {
  TRANSACTIONS: '@katana_transactions',
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to fetch transactions', e);
    return [];
  }
};

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(transactions);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, jsonValue);
    console.log('✅ Storage: Successfully saved', transactions.length, 'transactions');
  } catch (e) {
    console.error('❌ Storage: Failed to save transactions', e);
  }
};

export const addTransaction = async (transaction: Transaction): Promise<void> => {
  const current = await getTransactions();
  await saveTransactions([transaction, ...current]);
};

// Clear all transaction data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  } catch (e) {
    console.error('Failed to clear transactions', e);
  }
};

// Seed data for initial look
export const seedMockData = async () => {
  const mockData: Transaction[] = [
    { id: '1', name: 'Netflix Subscription', category: 'Entertainment', date: '2026-04-08', amount: 15.99, type: 'expense', icon: 'film-outline', iconColor: '#E74C3C' },
    { id: '2', name: 'Whole Foods Market', category: 'Food', date: '2026-04-08', amount: 145.20, type: 'expense', icon: 'fast-food-outline', iconColor: '#2ECC71' },
    { id: '3', name: 'Salary Deposit', category: 'Income', date: '2026-04-07', amount: 5000.00, type: 'income', icon: 'cash-outline', iconColor: '#9B59B6' },
    { id: '4', name: 'Amazon Shopping', category: 'Shopping', date: '2026-04-07', amount: 84.50, type: 'expense', icon: 'cart-outline', iconColor: '#F39C12' },
    { id: '5', name: 'Upwork Payment', category: 'Income', date: '2026-04-05', amount: 1200.00, type: 'income', icon: 'briefcase-outline', iconColor: '#3498DB' },
    { id: '6', name: 'Starbucks Coffee', category: 'Food', date: '2026-04-05', amount: 5.50, type: 'expense', icon: 'cafe-outline', iconColor: '#1E824C' },
    { id: '7', name: 'Gym Membership', category: 'Health', date: '2026-04-01', amount: 50.00, type: 'expense', icon: 'fitness-outline', iconColor: '#E67E22' },
  ];
  await saveTransactions(mockData);
};
