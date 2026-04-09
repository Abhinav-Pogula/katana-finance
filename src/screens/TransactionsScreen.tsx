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
import { useResponsive } from '../hooks/useResponsive';
import CrumpledPaper from '../components/CrumpledPaper';
import TransactionRow from '../components/TransactionRow';
import SearchField from '../components/SearchField';
import { Transaction } from '../utils/storage';

type FilterType = 'All' | 'Income' | 'Expense';

const TransactionsScreen = () => {
  const { isDark, colors } = useTheme();
  const { transactions, loading, refreshTransactions } = useTransactions();
  const route = useRoute<any>();
  const { s, wp } = useResponsive();
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
      <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingVertical: s(12) }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText, fontSize: s(12) }]}>{displayDate}</Text>
      </View>
    );
  };

  const FilterButton = ({ type }: { type: FilterType }) => (
    <TouchableOpacity 
      style={[
        styles.filterButton, 
        { paddingHorizontal: s(20), paddingVertical: s(8), borderRadius: s(20), marginRight: s(8) },
        activeFilter === type && { backgroundColor: !isDark ? colors.accent : colors.accent }
      ]}
      onPress={() => setActiveFilter(type)}
    >
      <Text style={[
        styles.filterText, 
        { color: activeFilter === type ? '#FFFFFF' : colors.secondaryText, fontSize: s(14) }
      ]}>
        {type}
      </Text>
    </TouchableOpacity>
  );

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingHorizontal: wp(6), paddingTop: s(16) }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: s(26), marginBottom: s(12) }]}>Transactions</Text>
          
          <SearchField value={searchQuery} onChangeText={setSearchQuery} />
          
          <View style={[styles.filterContainer, { marginTop: s(16), marginBottom: s(8) }]}>
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
            contentContainerStyle={[styles.listContent, { paddingHorizontal: wp(6), paddingBottom: s(100) }]}
            stickySectionHeadersEnabled={true}
            ListEmptyComponent={
              <View style={[styles.emptyContainer, { marginTop: s(100) }]}>
                <Text style={[styles.emptyText, { color: colors.secondaryText, fontSize: s(15) }]}>
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
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: 'transparent',
  },
  filterText: {
    fontWeight: '600',
  },
  listContent: {
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TransactionsScreen;
