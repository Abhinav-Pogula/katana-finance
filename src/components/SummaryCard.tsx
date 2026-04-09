import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
  onPress?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, onPress }) => {
  const { colors, isDark } = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'income': return 'trending-up';
      case 'expense': return 'trending-down';
      default: return 'wallet-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'income': return colors.income;
      case 'expense': return colors.expense;
      default: return colors.accent;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: !isDark ? '#FFFFFF' : '#1A1A1A', borderColor: colors.divider }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
        <Ionicons name={getIcon()} size={24} color={getIconColor()} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.secondaryText }]}>{title}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
});

export default SummaryCard;
