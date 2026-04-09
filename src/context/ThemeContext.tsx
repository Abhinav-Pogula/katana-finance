import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useColorScheme, Animated } from 'react-native';
import Colors from '../constants/Colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  colors: typeof Colors.light;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemColorScheme === 'light' ? 'light' : 'dark');
  const themeOpacity = useRef(new Animated.Value(1)).current;

  const toggleTheme = () => {
    // Start fade out
    Animated.timing(themeOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Toggle mode after fade out is half way or done
      setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
      
      // Fade back in
      Animated.timing(themeOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const colors = mode === 'light' ? Colors.light : Colors.dark;

  return (
    <ThemeContext.Provider value={{ isDark: mode === 'dark', colors, toggleTheme }}>
      <Animated.View style={{ flex: 1, opacity: themeOpacity }}>
        {children}
      </Animated.View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
