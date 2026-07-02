import React, { useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useBudgets } from '../context/BudgetContext';
import { useResponsive } from '../hooks/useResponsive';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { EXPENSE_CATEGORIES } from '../components/CategoryPicker';
import CrumpledPaper from '../components/CrumpledPaper';
import dayjs from 'dayjs';

const BudgetLimitsScreen = () => {
  const { colors, isDark } = useTheme();
  const { transactions, refreshTransactions } = useTransactions();
  const { budgets, loading, currentMonth, refreshBudgets, saveBudget, removeBudget } = useBudgets();
  const { s, wp } = useResponsive();
  const navigation = useNavigation<any>();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<typeof EXPENSE_CATEGORIES[0] | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
      refreshBudgets();
    }, [refreshTransactions, refreshBudgets])
  );

  // Calculate spent per expense category for current month
  const spentByCategory = useMemo(() => {
    const now = dayjs();
    const result: { [key: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.type === 'expense' && dayjs(tx.date).isSame(now, 'month')) {
        result[tx.category] = (result[tx.category] || 0) + tx.amount;
      }
    });
    return result;
  }, [transactions]);

  const openSetBudget = (cat: typeof EXPENSE_CATEGORIES[0]) => {
    const existing = budgets.find(b => b.categoryId === cat.id);
    setSelectedCategory(cat);
    setLimitInput(existing ? existing.limitAmount.toString() : '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedCategory) return;
    const amount = parseFloat(limitInput);
    if (!limitInput || isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid limit amount.');
      return;
    }
    setSaving(true);
    try {
      await saveBudget(selectedCategory.id, selectedCategory.name, amount);
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedCategory) return;
    Alert.alert(
      'Remove Budget',
      `Remove the budget limit for ${selectedCategory.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            await removeBudget(selectedCategory.id);
            setModalVisible(false);
          }
        }
      ]
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#EF4444';
    if (percentage >= 75) return '#F97316';
    return '#22C55E';
  };

  const monthDisplay = dayjs(currentMonth).format('MMMM YYYY');

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: wp(6) }]} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={[styles.header, { marginTop: s(16), marginBottom: s(8) }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: s(12) }}>
              <Ionicons name="arrow-back" size={s(24)} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: colors.text, fontSize: s(26) }]}>Budget Limits</Text>
              <Text style={[{ color: colors.secondaryText, fontSize: s(13) }]}>{monthDisplay}</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: s(60) }} />
          ) : (
            EXPENSE_CATEGORIES.map(cat => {
              const budget = budgets.find(b => b.categoryId === cat.id);
              const spent = spentByCategory[cat.id] || 0;
              const percentage = budget ? Math.round((spent / budget.limitAmount) * 100) : 0;
              const progressColor = getProgressColor(percentage);
              const hasBudget = !!budget;

              return (
                <View
                  key={cat.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                      borderRadius: s(20),
                      padding: s(16),
                      marginBottom: s(12),
                      borderWidth: 1,
                      borderColor: colors.divider,
                    }
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <View style={[styles.iconBox, { backgroundColor: cat.color + '20', width: s(44), height: s(44), borderRadius: s(12) }]}>
                        <Ionicons name={cat.icon as any} size={s(22)} color={cat.color} />
                      </View>
                      <View style={{ marginLeft: s(12), flex: 1 }}>
                        <Text style={[styles.catName, { color: colors.text, fontSize: s(15) }]}>{cat.name}</Text>
                        {hasBudget ? (
                          <Text style={[{ color: colors.secondaryText, fontSize: s(12) }]}>
                            ₹{spent.toFixed(0)} / ₹{budget!.limitAmount.toFixed(0)}
                          </Text>
                        ) : (
                          <Text style={[{ color: colors.secondaryText, fontSize: s(12) }]}>No limit set</Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => openSetBudget(cat)}
                      style={[styles.editBtn, { backgroundColor: colors.accent + '20', borderRadius: s(10), paddingHorizontal: s(12), paddingVertical: s(6) }]}
                    >
                      <Text style={[{ color: colors.accent, fontSize: s(12), fontWeight: '700' }]}>
                        {hasBudget ? 'Edit' : 'Set limit'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {hasBudget && (
                    <View style={{ marginTop: s(12) }}>
                      {/* Progress bar track */}
                      <View style={[styles.progressTrack, { backgroundColor: isDark ? '#333' : '#F0F0F0', borderRadius: s(4), height: s(6) }]}>
                        <View style={[styles.progressFill, {
                          width: `${Math.min(100, percentage)}%`,
                          backgroundColor: progressColor,
                          borderRadius: s(4),
                          height: s(6),
                        }]} />
                      </View>
                      <View style={[styles.progressLabels, { marginTop: s(6) }]}>
                        <Text style={[{ color: progressColor, fontSize: s(11), fontWeight: '700' }]}>
                          {percentage}% used
                          {percentage >= 100 ? ' 🚨' : percentage >= 75 ? ' ⚠️' : ''}
                        </Text>
                        <Text style={[{ color: colors.secondaryText, fontSize: s(11) }]}>
                          ₹{Math.max(0, budget!.limitAmount - spent).toFixed(0)} left
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}

          <View style={{ height: s(120) }} />
        </ScrollView>
      </SafeAreaView>

      {/* Set Budget Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)} />
        <View style={[styles.sheet, {
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderTopLeftRadius: s(32),
          borderTopRightRadius: s(32),
          padding: s(24),
          paddingBottom: s(40),
        }]}>
          <View style={[styles.handle, { backgroundColor: colors.divider, marginBottom: s(20) }]} />

          <Text style={[styles.modalTitle, { color: colors.text, fontSize: s(18), marginBottom: s(6) }]}>
            {selectedCategory?.name} Budget
          </Text>
          <Text style={[{ color: colors.secondaryText, fontSize: s(13), marginBottom: s(24) }]}>
            Set a monthly spending limit
          </Text>

          <Text style={[{ color: colors.secondaryText, fontSize: s(12), fontWeight: '700', letterSpacing: 1, marginBottom: s(8) }]}>
            MONTHLY LIMIT (₹)
          </Text>
          <TextInput
            style={[styles.input, {
              color: colors.text,
              fontSize: s(32),
              borderColor: colors.divider,
              backgroundColor: isDark ? '#262626' : '#F9F9F9',
              borderRadius: s(16),
              paddingHorizontal: s(16),
              paddingVertical: s(12),
              marginBottom: s(24),
            }]}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.secondaryText}
            value={limitInput}
            onChangeText={setLimitInput}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.accent, borderRadius: s(16), height: s(54), marginBottom: s(12) }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : (
              <Text style={[{ color: '#FFF', fontSize: s(16), fontWeight: '700' }]}>Save Budget</Text>
            )}
          </TouchableOpacity>

          {budgets.find(b => b.categoryId === selectedCategory?.id) && (
            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: '#EF4444', borderRadius: s(16), height: s(54) }]}
              onPress={handleRemove}
            >
              <Text style={[{ color: '#EF4444', fontSize: s(16), fontWeight: '700' }]}>Remove Budget</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </CrumpledPaper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '800' },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { justifyContent: 'center', alignItems: 'center' },
  catName: { fontWeight: '700', marginBottom: 2 },
  editBtn: {},
  progressTrack: { width: '100%', overflow: 'hidden' },
  progressFill: {},
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
  modalTitle: { fontWeight: '800' },
  input: { borderWidth: 1, fontWeight: '700' },
  saveBtn: { justifyContent: 'center', alignItems: 'center' },
  removeBtn: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
});

export default BudgetLimitsScreen;