import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import { TransactionProvider } from './src/context/TransactionContext';
import { AuthProvider } from './src/context/AuthContext';
import { BudgetProvider } from './src/context/BudgetContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts, NotoSerifJP_400Regular, NotoSerifJP_900Black } from '@expo-google-fonts/noto-serif-jp';
import { NotificationProvider } from './src/context/NotificationContext';

export default function App() {
  let [fontsLoaded] = useFonts({
    NotoSerifJP_400Regular,
    NotoSerifJP_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <TransactionProvider>
            <BudgetProvider>
              <NotificationProvider>
              <ThemeProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
                <StatusBar style="auto" />
              </ThemeProvider>
              </NotificationProvider>
            </BudgetProvider>
          </TransactionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}