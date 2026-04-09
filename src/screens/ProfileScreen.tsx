import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import CrumpledPaper from '../components/CrumpledPaper';
import { clearAllData, Transaction } from '../utils/storage';
import dayjs from 'dayjs';

const ProfileScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { transactions, refreshTransactions } = useTransactions();
  const { userName } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const financialStats = useMemo(() => {
    const now = dayjs();
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let totalBalance = 0;

    transactions.forEach(tx => {
      const txAmount = tx.amount;
      const isThisMonth = dayjs(tx.date).isSame(now, 'month');

      if (tx.type === 'income') {
        totalBalance += txAmount;
        if (isThisMonth) monthlyIncome += txAmount;
      } else {
        totalBalance -= txAmount;
        if (isThisMonth) monthlyExpense += txAmount;
      }
    });

    return { totalBalance, monthlyIncome, monthlyExpense };
  }, [transactions]);

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all transactions? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: async () => {
            await clearAllData();
            await refreshTransactions();
            Alert.alert("Success", "All data has been cleared.");
          }
        }
      ]
    );
  };

  const StatItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <View style={[styles.statItem, { borderBottomColor: colors.divider }]}>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
              <Text style={[styles.userStatus, { color: colors.secondaryText }]}>Pro Member</Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: !isDark ? '#FFF' : colors.cardBackground, borderColor: colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Financial Overview</Text>
            <StatItem label="Total Balance" value={`$${financialStats.totalBalance.toFixed(2)}`} color={colors.text} />
            <StatItem label="Income (This Month)" value={`$${financialStats.monthlyIncome.toFixed(2)}`} color={colors.income} />
            <StatItem label="Spending (This Month)" value={`$${financialStats.monthlyExpense.toFixed(2)}`} color={colors.expense} />
          </View>

          <View style={[styles.section, { backgroundColor: !isDark ? '#FFF' : colors.cardBackground, borderColor: colors.divider }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>Preferences</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={colors.accent} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme} 
                trackColor={{ false: colors.divider, true: colors.accent }} 
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.clearButton, { borderColor: isDark ? '#B30000' : colors.expense }]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={20} color={isDark ? '#B30000' : colors.expense} />
            <Text style={[styles.clearButtonText, { color: isDark ? '#B30000' : colors.expense }]}>Clear All Data</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.secondaryText }]}>Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </CrumpledPaper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  userStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 12,
  },
});

export default ProfileScreen;
