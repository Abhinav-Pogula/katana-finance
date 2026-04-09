import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
  onPress?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, onPress }) => {
  const { colors, isDark } = useTheme();
  const { s } = useResponsive();

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
        { 
          backgroundColor: !isDark ? '#FFFFFF' : '#1A1A1A', 
          borderColor: colors.divider,
          padding: s(16),
          borderRadius: s(16),
          marginHorizontal: s(4),
          marginBottom: s(12),
        }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15', width: s(48), height: s(48), borderRadius: s(12) }]}>
        <Ionicons name={getIcon()} size={s(24)} color={getIconColor()} />
      </View>
      <View style={[styles.textContainer, { marginLeft: s(12) }]}>
        <Text style={[styles.title, { color: colors.secondaryText, fontSize: s(10) }]}>{title}</Text>
        <Text style={[styles.amount, { color: colors.text, fontSize: s(16) }]}>
          ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontWeight: '800',
    marginTop: 2,
  },
});

export default SummaryCard;
