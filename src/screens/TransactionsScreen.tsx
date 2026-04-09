import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SectionList, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import CrumpledPaper from '../components/CrumpledPaper';
import TransactionRow from '../components/TransactionRow';
import SearchField from '../components/SearchField';
import { Transaction } from '../utils/storage';

type FilterType = 'All' | 'Income' | 'Expense';

const TransactionsScreen = () => {
  const { isDark, colors } = useTheme();
  const { transactions, loading, refreshTransactions } = useTransactions();
  const route = useRoute<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  useEffect(() => {
    if (route.params?.filter) {
      setActiveFilter(route.params.filter as FilterType);
    }
  }, [route.params?.filter]);

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || 
                           (activeFilter === 'Income' && tx.type === 'income') ||
                           (activeFilter === 'Expense' && tx.type === 'expense');
      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchQuery, activeFilter]);

  const sections = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    filteredData.forEach(tx => {
      const date = dayjs(tx.date).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });

    return Object.keys(groups)
      .sort((a, b) => dayjs(b).unix() - dayjs(a).unix())
      .map(date => ({
        title: date,
        data: groups[date],
      }));
  }, [filteredData]);

  const renderSectionHeader = ({ section: { title } }: any) => {
    const displayDate = dayjs(title).isSame(dayjs(), 'day') 
      ? 'Today' 
      : dayjs(title).isSame(dayjs().subtract(1, 'day'), 'day')
      ? 'Yesterday'
      : dayjs(title).format('MMMM D, YYYY');

    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{displayDate}</Text>
      </View>
    );
  };

  const FilterButton = ({ type }: { type: FilterType }) => (
    <TouchableOpacity 
      style={[
        styles.filterButton, 
        activeFilter === type && { backgroundColor: !isDark ? colors.accent : colors.accent }
      ]}
      onPress={() => setActiveFilter(type)}
    >
      <Text style={[
        styles.filterText, 
        { color: activeFilter === type ? '#FFFFFF' : colors.secondaryText }
      ]}>
        {type}
      </Text>
    </TouchableOpacity>
  );

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
          
          <SearchField value={searchQuery} onChangeText={setSearchQuery} />
          
          <View style={styles.filterContainer}>
            <FilterButton type="All" />
            <FilterButton type="Income" />
            <FilterButton type="Expense" />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionRow {...item} />}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                  No transactions found matching your criteria.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </CrumpledPaper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});

export default TransactionsScreen;
