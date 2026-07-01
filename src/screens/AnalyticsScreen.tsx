import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useResponsive } from '../hooks/useResponsive';
import CrumpledPaper from '../components/CrumpledPaper';
import SummaryCard from '../components/SummaryCard';
import { Transaction } from '../utils/storage';
import dayjs from 'dayjs';

const AnalyticsScreen = () => {
  const { colors, isDark } = useTheme();
  const { transactions, loading, refreshTransactions } = useTransactions();
  const navigation = useNavigation<any>();
  const { width, s, wp } = useResponsive();

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const stats = useMemo(() => {
    const now = dayjs();
    let totalIncome = 0;
    let totalExpense = 0;
    
    const categoryTotals: { [key: string]: { value: number, color: string } } = {};
    const lightColors = ['#FF6B6B', '#4ECDC4', '#F9A826', '#9B59B6', '#45B7D1', '#FF9F43', '#2ECC71', '#F78FB3'];
    const darkColors = ['#FF3366', '#20D2FF', '#FF9933', '#B833FF', '#33FF99', '#F9E231', '#FF3399', '#33CCFF'];
    const premiumColors = isDark ? darkColors : lightColors;
    let colorIdx = 0;

    // Build last 7 days structure
    const last7Days: { date: string; label: string; shortLabel: string; spent: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = now.subtract(i, 'day');
      last7Days.push({
        date: d.format('YYYY-MM-DD'),
        label: d.format('ddd'),
        shortLabel: d.format('DD'),
        spent: 0,
      });
    }

    transactions.forEach(tx => {
      const txDate = dayjs(tx.date);
      const isThisMonth = txDate.isSame(now, 'month');
      
      if (tx.type === 'income') {
        if (isThisMonth) totalIncome += tx.amount;
      } else {
        if (isThisMonth) totalExpense += tx.amount;

        // Pie chart
        if (!categoryTotals[tx.category]) {
          categoryTotals[tx.category] = { 
            value: 0, 
            color: premiumColors[colorIdx % premiumColors.length] 
          };
          colorIdx++;
        }
        categoryTotals[tx.category].value += tx.amount;

        // 7-day daily bar chart
        const txDateStr = txDate.format('YYYY-MM-DD');
        const dayEntry = last7Days.find(d => d.date === txDateStr);
        if (dayEntry) {
          dayEntry.spent += tx.amount;
        }
      }
    });

    // Pie data
    const pieData = Object.keys(categoryTotals).map(cat => ({
      value: categoryTotals[cat].value,
      color: categoryTotals[cat].color,
      text: cat,
    }));

    // 7-day bar data
    const dailyBarData = last7Days.map((day, idx) => ({
      value: day.spent,
      label: `${day.label}\n${day.shortLabel}`,
      frontColor: day.date === now.format('YYYY-MM-DD') ? colors.accent : colors.expense,
      showGradient: true,
      gradientColor: day.date === now.format('YYYY-MM-DD') ? colors.accent + '88' : '#FF6B6B',
      topRadius: s(8),
      labelTextStyle: { 
        color: colors.secondaryText, 
        fontSize: s(10), 
        fontWeight: '700' as const,
        textAlign: 'center' as const,
      },
      topLabelComponent: day.spent > 0 ? () => (
        <Text style={{ fontSize: s(8), color: colors.secondaryText, marginBottom: 2, fontWeight: '600' }}>
          ${day.spent.toFixed(0)}
        </Text>
      ) : undefined,
    }));

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pieData,
      dailyBarData,
    };
  }, [transactions, colors, isDark]);

  const dynamicCardStyle = useMemo(() => ({
    backgroundColor: !isDark ? '#FFFFFF' : colors.cardBackground,
    borderColor: colors.divider,
    shadowColor: !isDark ? '#000000' : colors.accent,
    shadowOffset: { width: 0, height: !isDark ? 4 : 0 },
    shadowOpacity: !isDark ? 0.05 : 0.25,
    shadowRadius: !isDark ? 12 : 18,
    elevation: !isDark ? 3 : 10,
  }), [isDark, colors]);

  if (loading) {
    return (
      <CrumpledPaper>
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      </CrumpledPaper>
    );
  }

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: wp(6), paddingTop: s(16) }]} 
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text, fontSize: s(28), marginBottom: s(24) }]}>Analytics</Text>

          <View style={styles.summaryContainer}>
            <SummaryCard 
              title="Income" 
              amount={stats.totalIncome} 
              type="income" 
              onPress={() => navigation.navigate('Budget', { filter: 'Income' })}
            />
            <SummaryCard 
              title="Expense" 
              amount={stats.totalExpense} 
              type="expense" 
              onPress={() => navigation.navigate('Budget', { filter: 'Expense' })}
            />
          </View>
          <View style={styles.summaryContainer}>
            <SummaryCard title="Savings" amount={stats.balance} type="balance" />
          </View>

          {/* Pie Chart: Spending by Category */}
          <View style={[styles.chartCard, dynamicCardStyle, { borderRadius: s(24), padding: s(16), marginBottom: s(24) }]}>
            <Text style={[styles.chartTitle, { color: colors.text, textAlign: 'center', fontSize: s(16), marginBottom: s(20) }]}>
              Spending Breakdown
            </Text>
            <View style={[styles.pieContainer, {
              shadowColor: !isDark ? '#000000' : colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: !isDark ? 0.05 : 0.35,
              shadowRadius: !isDark ? 15 : 25,
              elevation: !isDark ? 4 : 15,
              height: s(220),
              marginBottom: s(20)
            }]}>
              {stats.pieData.length > 0 ? (
                <PieChart
                  data={stats.pieData}
                  donut
                  radius={s(90)}
                  innerRadius={s(65)}
                  innerCircleColor={!isDark ? '#FFF' : colors.cardBackground}
                  centerLabelComponent={() => (
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: s(20), color: colors.text, fontWeight: '900' }}>
                        ${stats.totalExpense.toFixed(0)}
                      </Text>
                    </View>
                  )}
                  strokeWidth={0}
                  focusOnPress
                />
              ) : (
                <Text style={{ color: colors.secondaryText, fontSize: s(14) }}>No expenses this month</Text>
              )}
            </View>
            
            <View style={[styles.legendContainer, { paddingHorizontal: s(8) }]}>
              {stats.pieData.map((item, index) => (
                <View key={index} style={[styles.legendItem, { marginBottom: s(12), paddingRight: s(8) }]}>
                  <View style={[styles.legendDot, { backgroundColor: item.color, width: s(10), height: s(10), borderRadius: s(5), marginRight: s(8) }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.legendText, { color: colors.secondaryText, fontSize: s(12) }]} numberOfLines={1}>
                      {item.text}
                    </Text>
                    <Text style={[styles.legendValue, { color: colors.text, fontSize: s(13) }]}>
                      ${item.value.toFixed(0)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Bar Chart: Daily Spending (Last 7 Days) */}
            <View style={[styles.chartCard, dynamicCardStyle, { borderRadius: s(24), padding: s(20), marginBottom: s(24), overflow: 'hidden' }]}>
            <View style={{ marginBottom: s(16) }}>
              <Text style={[styles.chartTitle, { color: colors.text, fontSize: s(16), marginBottom: s(4) }]}>
                Daily Spending
              </Text>
              <Text style={[{ color: colors.secondaryText, fontSize: s(12) }]}>
                Last 7 days — today highlighted
              </Text>
            </View>

            {stats.dailyBarData.every(d => d.value === 0) ? (
              <View style={{ alignItems: 'center', paddingVertical: s(40) }}>
                <Text style={{ color: colors.secondaryText, fontSize: s(14) }}>No spending in the last 7 days</Text>
              </View>
            ) : (
              <View style={{ marginLeft: -s(4) }}>
                <BarChart
                  data={stats.dailyBarData}
                  barWidth={s(28)}
                  spacing={s(16)}
                  initialSpacing={s(10)}
                  noOfSections={4}
                  height={s(180)}
                  backgroundColor="transparent"
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules={false}
                  rulesType="dashed"
                  rulesColor={colors.divider}
                  yAxisLabelPrefix="$"
                  yAxisTextStyle={{ color: colors.secondaryText, fontSize: s(10), fontWeight: '700' }}
                  isAnimated
                />
              </View>
            )}
          </View>

          <View style={{ height: s(100) }} />
        </ScrollView>
      </SafeAreaView>
    </CrumpledPaper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  scrollContent: {},
  title: { fontWeight: '800' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  chartCard: { borderWidth: 1 },
  chartTitle: { fontWeight: '700' },
  pieContainer: { alignItems: 'center', justifyContent: 'center' },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  legendItem: { width: '48%', flexDirection: 'row', alignItems: 'center' },
  legendDot: {},
  legendText: {},
  legendValue: { fontWeight: '700' },
});

export default AnalyticsScreen;