import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchField: React.FC<SearchFieldProps> = ({ value, onChangeText, placeholder = "Search transactions..." }) => {
  const { colors, isDark } = useTheme();
  const { s } = useResponsive();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: !isDark ? '#F5F5F5' : '#1A1A1A',
        borderColor: colors.divider,
        height: s(48),
        borderRadius: s(12),
        paddingHorizontal: s(12),
        marginVertical: s(16),
      }
    ]}>
      <Ionicons name="search-outline" size={s(20)} color={colors.secondaryText} style={[styles.icon, { marginRight: s(8) }]} />
      <TextInput
        style={[styles.input, { color: colors.text, fontSize: s(15) }]}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={s(18)} color={colors.secondaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  icon: {
  },
  input: {
    flex: 1,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchField;
