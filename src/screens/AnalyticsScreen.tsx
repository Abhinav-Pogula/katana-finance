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
    // Theme aware color palettes
    const lightColors = ['#FF6B6B', '#4ECDC4', '#F9A826', '#9B59B6', '#45B7D1', '#FF9F43', '#2ECC71', '#F78FB3'];
    const darkColors = ['#FF3366', '#20D2FF', '#FF9933', '#B833FF', '#33FF99', '#F9E231', '#FF3399', '#33CCFF'];
    const premiumColors = isDark ? darkColors : lightColors;
    let colorIdx = 0;
    
    // Initialize last 6 months with realistic dummy data
    const months: string[] = [];
    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    for (let i = 5; i >= 0; i--) {
      const d = dayjs().subtract(i, 'month');
      const m = d.format('MMM');
      months.push(m);
      
      // Create deterministic dummy data based on the month name's character codes
      // This prevents the chart from wildly changing values every time it re-renders
      const seed = m.charCodeAt(0) + m.charCodeAt(1) + m.charCodeAt(2);
      
      // Income ranges between ~$3000 and ~$7000
      const dummyIncome = 3000 + (seed % 41) * 100; 
      
      // Expense ranges between ~$500 and ~$2500
      const dummyExpense = 500 + (seed % 21) * 100;
      
      monthlyData[m] = { income: dummyIncome, expense: dummyExpense };
    }

    transactions.forEach(tx => {
      const txDate = dayjs(tx.date);
      const isThisMonth = txDate.isSame(now, 'month');
      
      if (tx.type === 'income') {
        if (isThisMonth) totalIncome += tx.amount;
      } else {
        if (isThisMonth) totalExpense += tx.amount;
        
        // Pie Chart processing (Expenses by category)
        if (!categoryTotals[tx.category]) {
           categoryTotals[tx.category] = { 
             value: 0, 
             color: premiumColors[colorIdx % premiumColors.length] 
           };
           colorIdx++;
        }
        categoryTotals[tx.category].value += tx.amount;
      }

      // Bar Chart processing (Check if transaction month is within our initialized 6 months)
      const monthKey = txDate.format('MMM');
      if (monthlyData[monthKey] !== undefined && txDate.isAfter(now.subtract(6, 'month').startOf('month').subtract(1, 'second'))) {
        if (tx.type === 'income') monthlyData[monthKey].income += tx.amount;
        else monthlyData[monthKey].expense += tx.amount;
      }
    });

    // Prepare Pie Data
    const pieData = Object.keys(categoryTotals).map(cat => ({
      value: categoryTotals[cat].value,
      color: categoryTotals[cat].color,
      text: cat, // Retain FULL text, no truncation
    }));

    // Prepare Bar Data (Sorted by time)
    const barData: any[] = [];
    
    // Calculate responsive bar dimensions to avoid overflow
    const chartContentWidth = width - wp(12) - 40; // Horizontal padding + Y-axis allowance
    const totalBars = months.length * 2;
    const dynamicBarWidth = (chartContentWidth / totalBars) * 0.6;
    const dynamicSpacing = (chartContentWidth / months.length) * 0.4;

    months.forEach((m, idx) => {
      const data = monthlyData[m];
      
      // Income Bar - gradient green
      barData.push({ 
        value: data.income, 
        label: m, 
        frontColor: colors.income,
        showGradient: true,
        gradientColor: '#69F0AE',
        spacing: s(4), // Minimal gap between income/expense
        labelTextStyle: { color: colors.text, fontSize: s(10), fontWeight: '800', width: s(40), textAlign: 'center' },
        topRadius: s(6),
        topLabelComponent: data.income > 0 ? () => (
          <Text style={{fontSize: s(8), color: colors.secondaryText, marginBottom: 2, fontWeight: '600'}}>${data.income.toFixed(0)}</Text>
        ) : undefined,
      });
      
      // Expense Bar - gradient red
      barData.push({ 
        value: data.expense, 
        frontColor: colors.expense,
        showGradient: true,
        gradientColor: '#FF6B6B',
        spacing: dynamicSpacing, // Dynamic spacing to fill chart width perfectly
        topRadius: s(6),
        topLabelComponent: data.expense > 0 ? () => (
          <Text style={{fontSize: s(8), color: colors.secondaryText, marginBottom: 2, fontWeight: '600'}}>${data.expense.toFixed(0)}</Text>
        ) : undefined,
      });
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pieData,
      barData
    };
  }, [transactions, colors, isDark]);

  const dynamicCardStyle = useMemo(() => ({
    backgroundColor: !isDark ? '#FFFFFF' : colors.cardBackground,
    borderColor: colors.divider,
    shadowColor: !isDark ? '#000000' : colors.accent,
    shadowOffset: { width: 0, height: !isDark ? 4 : 0 },
    shadowOpacity: !isDark ? 0.05 : 0.25, // Cyberpunk neon glow effect in dark mode
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
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: wp(6), paddingTop: s(16) }]} showsVerticalScrollIndicator={false}>
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
            <Text style={[styles.chartTitle, { color: colors.text, textAlign: 'center', fontSize: s(16), marginBottom: s(20) }]}>Spending Breakdown</Text>
            
            {/* Added container glow for a futuristic feel */}
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
                <Text style={{color: colors.secondaryText, fontSize: s(14)}}>No expenses this month</Text>
              )}
            </View>
            
            <View style={[styles.legendContainer, { paddingHorizontal: s(8) }]}>
              {stats.pieData.map((item, index) => (
                <View key={index} style={[styles.legendItem, { marginBottom: s(12), paddingRight: s(8) }]}>
                  <View style={[styles.legendDot, { backgroundColor: item.color, width: s(10), height: s(10), borderRadius: s(5), marginRight: s(8) }]} />
                  <View style={{flex: 1}}>
                    <Text style={[styles.legendText, { color: colors.secondaryText, fontSize: s(12) }]} numberOfLines={1}>{item.text}</Text>
                    <Text style={[styles.legendValue, { color: colors.text, fontSize: s(13) }]}>${item.value.toFixed(0)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Bar Chart: Monthly Comparison */}
          <View style={[styles.chartCard, dynamicCardStyle, { borderRadius: s(24), padding: s(20), marginBottom: s(24) }]}>
            <View style={{ marginBottom: s(20) }}>
              <Text style={[styles.chartTitle, { color: colors.text, textAlign: 'left', marginBottom: s(12), fontSize: s(16) }]}>Income vs Expense</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <View style={[styles.legendItem, { width: 'auto', marginRight: s(20), marginBottom: s(4) }]}>
                  <View style={[styles.legendDot, { backgroundColor: colors.income, width: s(12), height: s(12), borderRadius: s(6), marginRight: s(8) }]} />
                  <Text style={[styles.legendText, { color: colors.secondaryText, fontSize: s(14) }]}>Income</Text>
                </View>
                <View style={[styles.legendItem, { width: 'auto', marginRight: 0, marginBottom: s(4) }]}>
                  <View style={[styles.legendDot, { backgroundColor: colors.expense, width: s(12), height: s(12), borderRadius: s(6), marginRight: s(8) }]} />
                  <Text style={[styles.legendText, { color: colors.secondaryText, fontSize: s(14) }]}>Expense</Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.barContainer, { marginLeft: -s(20) }]}>
              <BarChart
                data={stats.barData}
                barWidth={s(18)}
                initialSpacing={s(15)}
                noOfSections={4}
                height={s(200)}
                dashGap={s(4)}
                backgroundColor="transparent"
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules={false}          
                rulesType="dashed"
                rulesColor={colors.divider} 
                yAxisLabelPrefix="$"
                yAxisTextStyle={{ color: colors.secondaryText, fontSize: s(11), fontWeight: '700' }}
                isAnimated
              />
            </View>
          </View>
          
          <View style={{ height: s(100) }} />
        </ScrollView>
      </SafeAreaView>
    </CrumpledPaper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContent: {
  },
  title: {
    fontWeight: '800',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartCard: {
    borderWidth: 1,
  },
  chartTitle: {
    fontWeight: '700',
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
  },
  legendText: {
  },
  legendValue: {
    fontWeight: '700',
  },
  barContainer: {
  },
});

export default AnalyticsScreen;
