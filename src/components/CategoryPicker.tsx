import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.secondaryText }]}>Select Category</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              selectedId === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
            ]}
            onPress={() => onSelect(cat)}
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.color + '15' }]}>
              <Ionicons name={cat.icon as any} size={24} color={cat.color} />
            </View>
            <Text style={[
              styles.categoryName, 
              { color: selectedId === cat.id ? cat.color : colors.text }
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
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CategoryPicker;
