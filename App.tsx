import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import { TransactionProvider } from './src/context/TransactionContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, NotoSerifJP_400Regular, NotoSerifJP_900Black } from '@expo-google-fonts/noto-serif-jp';

export default function App() {
  let [fontsLoaded] = useFonts({
    NotoSerifJP_400Regular,
    NotoSerifJP_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TransactionProvider>
          <ThemeProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <StatusBar style="auto" />
          </ThemeProvider>
        </TransactionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
