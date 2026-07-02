import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Alert
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import CategoryPicker, { CATEGORIES } from '../components/CategoryPicker';import { Transaction } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useBudgets } from '../context/BudgetContext';
import { useTransactions } from '../context/TransactionContext';
import { checkAndSetWarningFlag } from '../utils/budgetStorage';
import dayjs from 'dayjs';

import {
  checkAndAddBudgetWarning,
  addHighSpendingNotification,
  addSavingsMilestoneNotification,
  addIncomeCreditedNotification,
  addMonthEndSummaryNotification,
} from '../utils/notificationStorage';



interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'income' | 'expense';  // ← THIS LINE MUST EXIST
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, onSuccess, defaultType = 'expense' }) => {
  const { colors, isDark } = useTheme();
  const { addTransaction, transactions } = useTransactions();
  const { s, wp, hp } = useResponsive();
  const { uid } = useAuth();
  const { budgets } = useBudgets();
 
  
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = 
  useForm({
    defaultValues: {
      type: defaultType,
      amount: '',
      name: '',
      category: 'Food',
      date: dayjs().format('YYYY-MM-DD'),
    }
  });

  React.useEffect(() => {
  if (visible) {
    setValue('type', defaultType);
  }
}, [visible, defaultType, setValue]);

  const activeType = watch('type');
  const activeCategory = watch('category');
  const HIGH_SPENDING_THRESHOLD = 5000;
  const SAVINGS_MILESTONES = [25, 50, 75];

  // Helper: Get current month's income & expense totals
const getMonthTotals = (allTransactions: Transaction[]) => {
  const currentMonth = dayjs().format('YYYY-MM');
  let income = 0;
  let expense = 0;

  allTransactions.forEach((tx) => {
    if (dayjs(tx.date).format('YYYY-MM') === currentMonth) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
  });

  return { income, expense };
};

// Helper: Check savings milestones and write notification
const checkAndNotifySavingsMilestone = async (
  uid: string,
  allTransactions: Transaction[],
  newTx: Omit<Transaction, 'id'>
) => {
  const { income, expense } = getMonthTotals(allTransactions);
  
  // Include the new transaction in the calculation
  const finalIncome = newTx.type === 'income' ? income + newTx.amount : income;
  const finalExpense = newTx.type === 'expense' ? expense + newTx.amount : expense;

  if (finalIncome <= 0) return;

  const savingsRate = ((finalIncome - finalExpense) / finalIncome) * 100;
  const month = dayjs().format('YYYY-MM');

  // Check milestones in descending order (fire highest one only)
  for (const milestone of [...SAVINGS_MILESTONES].reverse()) {
    if (savingsRate >= milestone) {
      const flagKey = `savings_${milestone}_${month}`;
      const shouldNotify = await checkAndSetWarningFlag(uid, flagKey);
      if (shouldNotify) {
        await addSavingsMilestoneNotification(uid, savingsRate);
      }
      break; // Only fire the highest milestone
    }
  }
};

const onSubmit = async (data: any) => {
  try {
    const selectedCategory = CATEGORIES.find((c) => c.id === data.category) || CATEGORIES[CATEGORIES.length - 1];

    const newTx: Omit<Transaction, 'id'> = {
      name: data.name,
      amount: parseFloat(data.amount),
      type: data.type,
      category: data.category,
      date: data.date,
      icon: selectedCategory.icon,
      iconColor: selectedCategory.color,
    };

    await addTransaction(newTx);
    reset();
    onSuccess();
    onClose();

    // ═══════════════════════════════════════════════════════════════
    // SMART NOTIFICATIONS — triggered after transaction is saved
    // ═══════════════════════════════════════════════════════════════
    if (uid) {
      
      // 1️⃣ INCOME CREDITED notification
      if (newTx.type === 'income') {
        await addIncomeCreditedNotification(uid, newTx.name, newTx.amount);
      }

      // 2️⃣ HIGH SPENDING alert (single expense > ₹5000)
      if (newTx.type === 'expense' && newTx.amount > HIGH_SPENDING_THRESHOLD) {
        await addHighSpendingNotification(uid, newTx.name, newTx.amount, newTx.category);
      }

      // 3️⃣ BUDGET WARNINGS (existing logic + Firestore write)
      if (newTx.type === 'expense') {
        const budget = budgets.find((b) => b.categoryId === newTx.category);
        if (budget) {
          const month = dayjs().format('YYYY-MM');
          const currentSpent =
            transactions
              .filter(
                (tx) =>
                  tx.type === 'expense' &&
                  tx.category === newTx.category &&
                  dayjs(tx.date).isSame(dayjs(), 'month')
              )
              .reduce((sum, tx) => sum + tx.amount, 0) + newTx.amount;

          const percentage = (currentSpent / budget.limitAmount) * 100;

          if (percentage >= 100) {
            const flagKey = `exceeded_${newTx.category}_${month}`;
            const shouldWarn = await checkAndSetWarningFlag(uid, flagKey);
            if (shouldWarn) {
              Alert.alert(
                '🚨 Budget Exceeded!',
                `You've exceeded your ${newTx.category} budget for this month!`
              );
              // 🔥 NEW: Write to Firestore notifications
              await checkAndAddBudgetWarning(uid, newTx.category, percentage, month);
            }
          } else if (percentage >= 80) {
            const flagKey = `warn80_${newTx.category}_${month}`;
            const shouldWarn = await checkAndSetWarningFlag(uid, flagKey);
            if (shouldWarn) {
              Alert.alert(
                '⚠️ Budget Warning',
                `You've used ${Math.round(percentage)}% of your ${newTx.category} budget this month.`
              );
              // 🔥 NEW: Write to Firestore notifications
              await checkAndAddBudgetWarning(uid, newTx.category, percentage, month);
            }
          }
        }
      }

      // 4️⃣ SAVINGS MILESTONE check
      await checkAndNotifySavingsMilestone(uid, transactions, newTx);

      // 5️⃣ MONTH-END SUMMARY (only on last day of month or first day of new month)
      const today = dayjs();
      const isLastDayOfMonth = today.isSame(today.endOf('month'), 'day');
      const isFirstDayOfMonth = today.date() === 1;

      if (isLastDayOfMonth || isFirstDayOfMonth) {
        const targetMonth = isFirstDayOfMonth
          ? today.subtract(1, 'month').format('YYYY-MM')
          : today.format('YYYY-MM');

        const flagKey = `month_end_summary_${targetMonth}`;
        const shouldSend = await checkAndSetWarningFlag(uid, flagKey);

        if (shouldSend) {
          const monthTxs = transactions.filter(
            (tx) => dayjs(tx.date).format('YYYY-MM') === targetMonth
          );
          const totalIncome = monthTxs
            .filter((tx) => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);
          const totalExpense = monthTxs
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

          // Find top spending category
          const catTotals: Record<string, number> = {};
          monthTxs
            .filter((tx) => tx.type === 'expense')
            .forEach((tx) => {
              catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
            });

          let topCategory = 'None';
          let topAmount = 0;
          Object.entries(catTotals).forEach(([cat, amt]) => {
            if (amt > topAmount) {
              topCategory = cat;
              topAmount = amt;
            }
          });

          await addMonthEndSummaryNotification(
            uid,
            targetMonth,
            totalIncome,
            totalExpense,
            topCategory
          );
        }
      }
    }
  } catch (error) {
    console.error('Form Submission Failed', error);
  }
};

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop: absolutely-positioned, sibling to content, NOT a wrapper around it */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          pointerEvents="box-none"
        >
          <View style={[
            styles.modalContainer, 
            { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', width: wp(90), maxWidth: 400, maxHeight: hp(85), borderRadius: s(32), paddingHorizontal: s(24), paddingBottom: s(20) }
          ]}>
            <View style={[styles.handle, { backgroundColor: colors.divider, width: s(40), height: s(4), borderRadius: s(2), marginTop: s(12), marginBottom: s(16) }]} />
            
            <View style={[styles.header, { marginBottom: s(20) }]}>
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: s(20) }]}>New Transaction</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={s(24)} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={[styles.scrollContent, { paddingBottom: s(20) }]}
              keyboardShouldPersistTaps="handled"
            >
              {/* Type Toggle */}
              <View style={[styles.typeToggle, { backgroundColor: !isDark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', borderRadius: s(16), padding: s(4), marginBottom: s(20) }]}>
                <TouchableOpacity 
                  style={[
                    styles.toggleButton, 
                    { paddingVertical: s(12), borderRadius: s(12) },
                    activeType === 'expense' && { backgroundColor: colors.expense }
                  ]}
                  onPress={() => setValue('type', 'expense')}
                >
                  <Text style={[
                    styles.toggleText, 
                    { color: activeType === 'expense' ? '#FFF' : colors.secondaryText, fontSize: s(14) }
                  ]}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.toggleButton, 
                    { paddingVertical: s(12), borderRadius: s(12) },
                    activeType === 'income' && { backgroundColor: colors.income }
                  ]}
                  onPress={() => setValue('type', 'income')}
                >
                  <Text style={[
                    styles.toggleText, 
                    { color: activeType === 'income' ? '#FFF' : colors.secondaryText, fontSize: s(14) }
                  ]}>Income</Text>
                </TouchableOpacity>
              </View>

              {/* Amount Input */}
              <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
                <Text style={[styles.label, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(8) }]}>Amount</Text>
                <Controller
                  control={control}
                  name="amount"
                  rules={{ required: 'Amount is required', pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Invalid amount' } }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.amountInputContainer}>
                      <Text style={[styles.currency, { color: colors.text, fontSize: s(32) }]}>₹</Text>
                      <TextInput
                        style={[styles.amountInput, { color: colors.text, fontSize: s(40) }]}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={colors.divider}
                        value={value}
                        onChangeText={onChange}
                        autoFocus={true}
                      />
                    </View>
                  )}
                />
                {errors.amount && <Text style={[styles.errorText, { fontSize: s(12) }]}>{errors.amount.message}</Text>}
              </View>

              {/* Name Input */}
              <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
                <Text style={[styles.label, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(8) }]}>What was it for?</Text>
                <Controller
                  control={control}
                  name="name"
                  rules={{ required: 'Please fill this in' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[
                        styles.textInput, 
                        { 
                          color: colors.text, 
                          fontSize: s(16),
                          backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9',
                          borderColor: errors.name ? '#E74C3C' : (isDark ? '#333' : colors.divider),
                          borderWidth: 1,
                          borderRadius: s(12),
                          paddingHorizontal: s(12),
                          paddingVertical: s(12),
                        }
                      ]}
                      placeholder="e.g. Weekly Groceries"
                      placeholderTextColor={colors.secondaryText}
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
                {errors.name && <Text style={[styles.errorText, { fontSize: s(12) }]}>{errors.name.message}</Text>}
              </View>

              {/* Category Picker */}
              <Controller
                control={control}
                name="category"
                render={({ field: { value } }) => (
                  <CategoryPicker 
                    selectedId={value} 
                    onSelect={(cat) => setValue('category', cat.id)} 
                  />
                )}
              />

              <TouchableOpacity 
                 style={[styles.saveButton, { backgroundColor: '#df3c96', height: s(56), borderRadius: s(16), marginTop: s(16) }]}
                onPress={handleSubmit(onSubmit, (errors) => {
                  console.log('⚠️ Validation Errors:', errors);
                })}
              >
                <Text style={[styles.saveButtonText, { fontSize: s(16) }]}>Save Transaction</Text>
              </TouchableOpacity>
              
              <View style={{ height: s(40) }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
  },
  typeToggle: {
    flexDirection: 'row',
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '700',
  },
  inputGroup: {
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    fontWeight: '800',
    flex: 1,
  },
  textInput: {
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#E74C3C',
    marginTop: 4,
  },
});

export default AddTransactionModal;