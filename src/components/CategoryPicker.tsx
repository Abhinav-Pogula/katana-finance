import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

export const CATEGORIES = [
  { id: 'Food', name: 'Food', icon: 'fast-food-outline', color: '#2ECC71' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'film-outline', color: '#E74C3C' },
  { id: 'Shopping', name: 'Shopping', icon: 'cart-outline', color: '#F39C12' },
  { id: 'Income', name: 'Salary', icon: 'cash-outline', color: '#9B59B6' },
  { id: 'Health', name: 'Health', icon: 'fitness-outline', color: '#E67E22' },
  { id: 'Travel', name: 'Travel', icon: 'airplane-outline', color: '#3498DB' },
  { id: 'Other', name: 'Other', icon: 'help-circle-outline', color: '#95A5A6' },
];

interface CategoryPickerProps {
  selectedId: string;
  onSelect: (category: any) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ selectedId, onSelect }) => {
  const { colors, isDark } = useTheme();
  const { s } = useResponsive();

  return (
    <View style={[styles.container, { marginVertical: s(16) }]}>
      <Text style={[styles.label, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(12) }]}>Select Category</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              { borderRadius: s(16), padding: s(8) },
              selectedId === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
            ]}
            onPress={() => onSelect(cat)}
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.color + '15', width: s(44), height: s(44), borderRadius: s(22), marginBottom: s(6) }]}>
              <Ionicons name={cat.icon as any} size={s(22)} color={cat.color} />
            </View>
            <Text style={[
              styles.categoryName, 
              { color: selectedId === cat.id ? cat.color : colors.text, fontSize: s(10) }
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.6%',
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CategoryPicker;
