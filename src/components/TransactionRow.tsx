import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface TransactionRowProps {
  name: string;
  category: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  name,
  category,
  date,
  amount,
  type,
  icon,
  iconColor,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1C' : 'rgba(255, 255, 255, 0.85)' }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.date, { color: colors.secondaryText }]}>{date}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            { color: type === 'income' ? colors.income : colors.expense, fontWeight: '800' },
          ]}
        >
          {type === 'income' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
        </Text>
        <Text style={[styles.categoryBadge, { color: colors.secondaryText }]}>
          {category.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'System',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});

export default TransactionRow;
