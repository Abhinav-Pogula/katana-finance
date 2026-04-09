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
import { useResponsive } from '../hooks/useResponsive';
import CrumpledPaper from '../components/CrumpledPaper';
import TransactionRow from '../components/TransactionRow';
import SearchField from '../components/SearchField';
import { Transaction } from '../utils/storage';

const AllTransactionsScreen = () => {
  const { colors } = useTheme();
  const { transactions, loading, refreshTransactions } = useTransactions();
  const navigation = useNavigation<any>();
  const { s, wp } = useResponsive();
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
      <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingVertical: s(12) }]}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText, fontSize: s(12) }]}>{displayDate}</Text>
      </View>
    );
  };

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingHorizontal: wp(6), paddingTop: s(16), paddingBottom: s(24) }]}>
          <View style={[styles.titleRow, { marginBottom: s(20) }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={s(28)} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: s(22) }]}>All Transactions</Text>
            {/* Empty view for flex balance */}
            <View style={{ width: s(44) }} />
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
            contentContainerStyle={[styles.listContent, { paddingHorizontal: wp(6), paddingBottom: s(40) }]}
            stickySectionHeadersEnabled={true}
            ListEmptyComponent={
              <View style={[styles.emptyContainer, { marginTop: s(100), paddingHorizontal: s(40) }]}>
                <Text style={[styles.emptyText, { color: colors.secondaryText, fontSize: s(15) }]}>
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
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
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

export default AllTransactionsScreen;
