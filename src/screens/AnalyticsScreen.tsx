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
import CrumpledPaper from '../components/CrumpledPaper';
import SummaryCard from '../components/SummaryCard';
import { Transaction } from '../utils/storage';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { colors, isDark } = useTheme();
  const { transactions, loading, refreshTransactions } = useTransactions();
  const navigation = useNavigation<any>();

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
    months.forEach(m => {
      const data = monthlyData[m];
      
      // Income Bar - gradient green
      barData.push({ 
        value: data.income, 
        label: m, 
        frontColor: colors.income,
        showGradient: true,
        gradientColor: '#69F0AE',
        spacing: 6, // Very small gap between income/expense pair
        labelTextStyle: { color: colors.text, fontSize: 12, fontWeight: '800', width: 44, textAlign: 'center' }, // Bold X-axis
        topRadius: 6,
        topLabelComponent: data.income > 0 ? () => (
          <Text style={{fontSize: 9, color: colors.secondaryText, marginBottom: 2, fontWeight: '600'}}>${data.income.toFixed(0)}</Text>
        ) : undefined,
      });
      
      // Expense Bar - gradient red
      barData.push({ 
        value: data.expense, 
        frontColor: colors.expense,
        showGradient: true,
        gradientColor: '#FF6B6B',
        spacing: 36, // Large gap before the next month group
        topRadius: 6,
        topLabelComponent: data.expense > 0 ? () => (
          <Text style={{fontSize: 9, color: colors.secondaryText, marginBottom: 2, fontWeight: '600'}}>${data.expense.toFixed(0)}</Text>
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

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
          <View style={[styles.chartCard, dynamicCardStyle]}>
            <Text style={[styles.chartTitle, { color: colors.text, textAlign: 'center' }]}>Spending Breakdown</Text>
            
            {/* Added container glow for a futuristic feel */}
            <View style={[styles.pieContainer, {
              shadowColor: !isDark ? '#000000' : colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: !isDark ? 0.05 : 0.35,
              shadowRadius: !isDark ? 15 : 25,
              elevation: !isDark ? 4 : 15,
              height: 250
            }]}>
              {stats.pieData.length > 0 ? (
                <PieChart
                  data={stats.pieData}
                  donut
                  radius={110}          // Much larger base scale
                  innerRadius={75}      // Leaves a thick 35pt ring and large center
                  innerCircleColor={!isDark ? '#FFF' : colors.cardBackground}
                  centerLabelComponent={() => (
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 26, color: colors.text, fontWeight: '900' }}>
                        ${stats.totalExpense.toFixed(0)}
                      </Text>
                    </View>
                  )}
                  strokeWidth={0}       // Stripping stroke ensures absolute edge-to-edge vibrant colors
                  focusOnPress
                />
              ) : (
                <Text style={{color: colors.secondaryText}}>No expenses this month</Text>
              )}
            </View>
            
            <View style={styles.legendContainer}>
              {stats.pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <View style={{flex: 1}}>
                    <Text style={[styles.legendText, { color: colors.secondaryText }]}>{item.text}</Text>
                    <Text style={[styles.legendValue, { color: colors.text }]}>${item.value.toFixed(0)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Bar Chart: Monthly Comparison */}
          <View style={[styles.chartCard, dynamicCardStyle]}>
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.chartTitle, { color: colors.text, textAlign: 'left', marginBottom: 12 }]}>Income vs Expense</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <View style={[styles.legendItem, { width: 'auto', marginRight: 20, marginBottom: 4 }]}>
                  <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
                  <Text style={[styles.legendText, { color: colors.secondaryText }]}>Income</Text>
                </View>
                <View style={[styles.legendItem, { width: 'auto', marginRight: 0, marginBottom: 4 }]}>
                  <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
                  <Text style={[styles.legendText, { color: colors.secondaryText }]}>Expense</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.barContainer}>
              <BarChart
                data={stats.barData}
                barWidth={18}
                initialSpacing={15}
                noOfSections={4}
                height={220}
                dashGap={4}
                backgroundColor="transparent"
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules={false}          
                rulesType="dashed"
                rulesColor={colors.divider} 
                yAxisLabelPrefix="$"
                yAxisTextStyle={{ color: colors.secondaryText, fontSize: 11, fontWeight: '700' }}
                isAnimated
              />
            </View>
          </View>
          
          <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  pieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  legendContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    marginBottom: 2,
  },
  legendValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  barContainer: {
    marginTop: 10,
    marginLeft: -20,
  },
  barLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
});

export default AnalyticsScreen;
