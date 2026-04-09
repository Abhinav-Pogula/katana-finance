import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({ value, onChangeText, placeholder = "Search interactions..." }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: !isDark ? '#F5F5F5' : '#1A1A1A',
        borderColor: colors.divider 
      }
    ]}>
      <Ionicons name="search-outline" size={20} color={colors.secondaryText} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 16,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchField;
