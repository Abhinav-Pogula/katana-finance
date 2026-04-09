import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {!isDark ? (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.75)']}
          style={styles.innerContainer}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.innerContainer, { backgroundColor: '#1A1A1A' }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  innerContainer: {
    padding: 24,
    borderRadius: 24,
  },
});

export default GlassCard;
