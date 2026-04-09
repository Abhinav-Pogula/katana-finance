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
import { useResponsive } from '../hooks/useResponsive';
import CrumpledPaper from '../components/CrumpledPaper';
import { clearAllData, Transaction } from '../utils/storage';
import dayjs from 'dayjs';

const ProfileScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { transactions, refreshTransactions } = useTransactions();
  const { userName } = useAuth();
  const { s, wp } = useResponsive();

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
    <View style={[styles.statItem, { borderBottomColor: colors.divider, paddingVertical: s(12) }]}>
      <Text style={[styles.statLabel, { color: colors.secondaryText, fontSize: s(15) }]}>{label}</Text>
      <Text style={[styles.statValue, { color, fontSize: s(15) }]}>{value}</Text>
    </View>
  );

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: wp(6) }]}>
          <Text style={[styles.title, { color: colors.text, fontSize: s(28), marginBottom: s(24) }]}>Settings</Text>

          <View style={[styles.profileHeader, { marginBottom: s(32) }]}>
            <View style={[styles.avatar, { backgroundColor: colors.accent, width: s(64), height: s(64), borderRadius: s(32) }]}>
              <Text style={[styles.avatarText, { fontSize: s(24) }]}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={[styles.profileInfo, { marginLeft: s(16) }]}>
              <Text style={[styles.userName, { color: colors.text, fontSize: s(20) }]}>{userName}</Text>
              <Text style={[styles.userStatus, { color: colors.secondaryText, fontSize: s(14) }]}>Pro Member</Text>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: !isDark ? '#FFF' : colors.cardBackground, borderColor: colors.divider, borderRadius: s(24), padding: s(20), marginBottom: s(24) }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(16) }]}>Financial Overview</Text>
            <StatItem label="Total Balance" value={`$${financialStats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color={colors.text} />
            <StatItem label="Income (This Month)" value={`$${financialStats.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color={colors.income} />
            <StatItem label="Spending (This Month)" value={`$${financialStats.monthlyExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color={colors.expense} />
          </View>

          <View style={[styles.section, { backgroundColor: !isDark ? '#FFF' : colors.cardBackground, borderColor: colors.divider, borderRadius: s(24), padding: s(20), marginBottom: s(24) }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(16) }]}>Preferences</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={s(22)} color={colors.accent} />
                <Text style={[styles.settingLabel, { color: colors.text, fontSize: s(16), marginLeft: s(12) }]}>Dark Mode</Text>
              </View>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme} 
                trackColor={{ false: colors.divider, true: colors.accent }} 
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.clearButton, { borderColor: isDark ? '#B30000' : colors.expense, height: s(56), borderRadius: s(16) }]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={s(20)} color={isDark ? '#B30000' : colors.expense} />
            <Text style={[styles.clearButtonText, { color: isDark ? '#B30000' : colors.expense, fontSize: s(16), marginLeft: s(8) }]}>Clear All Data</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.secondaryText, fontSize: s(12), marginTop: s(32) }]}>Version 1.0.0</Text>
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontWeight: '800',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
  },
  profileInfo: {
  },
  userName: {
    fontWeight: '700',
  },
  userStatus: {
    marginTop: 2,
  },
  section: {
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  statLabel: {
    fontWeight: '500',
  },
  statValue: {
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
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  clearButtonText: {
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
  },
});

export default ProfileScreen;
