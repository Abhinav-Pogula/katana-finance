import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SectionList, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CrumpledPaper from '../components/CrumpledPaper';
import TransactionRow from '../components/TransactionRow';
import SearchField from '../components/SearchField';
import { Transaction } from '../utils/storage';

const AllTransactionsScreen = () => {
  const { colors } = useTheme();
  const { transactions, loading, refreshTransactions } = useTransactions();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      return tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [transactions, searchQuery]);

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

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>All Transactions</Text>
            {/* Empty view for flex balance */}
            <View style={{ width: 44 }} />
          </View>
          
          <SearchField value={searchQuery} onChangeText={setSearchQuery} />
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
                  No transactions found.
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
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40, // standard bottom padding since there's no tab bar here on the stack screen
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

export default AllTransactionsScreen;
