import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

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
  const { s } = useResponsive();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isDark ? '#1C1C1C' : 'rgba(255, 255, 255, 0.85)',
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
        <Text
          style={[
            styles.amount,
            { color: type === 'income' ? colors.income : colors.expense, fontSize: s(15), fontWeight: '800' },
          ]}
        >
          {type === 'income' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
        </Text>
        <Text style={[styles.categoryBadge, { color: colors.secondaryText, fontSize: s(9) }]}>
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
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1.5,
  },
  name: {
    fontWeight: '700',
  },
  date: {
    marginTop: 2,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: 'System',
    marginBottom: 2,
  },
  categoryBadge: {
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});

export default TransactionRow;
