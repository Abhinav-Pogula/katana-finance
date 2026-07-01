import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useResponsive } from '../hooks/useResponsive';
import { Transaction } from '../utils/storage';
import EditTransactionModal from './EditTransactionModal';

interface TransactionRowProps {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  id, name, category, date, amount, type, icon, iconColor,
}) => {
  const { colors, isDark } = useTheme();
  const { deleteTransaction } = useTransactions();
  const { s } = useResponsive();
  const swipeableRef = useRef<Swipeable>(null);
  const [editVisible, setEditVisible] = useState(false);

  const transaction: Transaction = { id, name, category, date, amount, type, icon, iconColor };

  const handleDelete = () => {
    swipeableRef.current?.close();
    Alert.alert(
      'Delete Transaction',
      `Delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
            } catch {
              Alert.alert('Error', 'Failed to delete. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    swipeableRef.current?.close();
    setEditVisible(true);
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [120, 0],
    });

    return (
      <Animated.View style={[styles.actionsContainer, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3B82F6', borderRadius: s(14), marginRight: s(6) }]}
          onPress={handleEdit}
        >
          <Ionicons name="pencil" size={s(18)} color="#FFF" />
          <Text style={[styles.actionText, { fontSize: s(11) }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444', borderRadius: s(14) }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={s(18)} color="#FFF" />
          <Text style={[styles.actionText, { fontSize: s(11) }]}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        overshootRight={false}
      >
        <View style={[
          styles.container,
          {
            backgroundColor: isDark ? '#1C1C1C' : 'rgba(255,255,255,0.95)',
            paddingVertical: s(12),
            paddingHorizontal: s(16),
            borderRadius: s(16),
            marginBottom: s(12),
          }
        ]}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20', width: s(44), height: s(44), borderRadius: s(12) }]}>
            <Ionicons name={icon} size={s(24)} color={iconColor} />
          </View>

          <View style={[styles.detailsContainer, { marginLeft: s(12) }]}>
            <Text style={[styles.name, { color: colors.text, fontSize: s(15) }]} numberOfLines={1}>{name}</Text>
            <Text style={[styles.date, { color: colors.secondaryText, fontSize: s(11) }]}>{date}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: type === 'income' ? colors.income : colors.expense, fontSize: s(15) }]}>
              {type === 'income' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
            </Text>
            <Text style={[styles.categoryBadge, { color: colors.secondaryText, fontSize: s(9) }]}>
              {category.toUpperCase()}
            </Text>
          </View>
        </View>
      </Swipeable>

      <EditTransactionModal
        visible={editVisible}
        transaction={transaction}
        onClose={() => setEditVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { justifyContent: 'center', alignItems: 'center' },
  detailsContainer: { flex: 1.5 },
  name: { fontWeight: '700' },
  date: { marginTop: 2 },
  amountContainer: { flex: 1, alignItems: 'flex-end' },
  amount: { fontWeight: '800', fontFamily: 'System', marginBottom: 2 },
  categoryBadge: { fontWeight: '700', letterSpacing: 0.5 },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    marginBottom: 12,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: '100%',
    gap: 4,
  },
  actionText: { color: '#FFF', fontWeight: '700' },
});

export default TransactionRow;