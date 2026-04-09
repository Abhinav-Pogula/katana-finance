import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const { colors, toggleTheme } = useTheme();
  
  // Always force dark mode palette for auth screen if we want it strictly dark
  // But let's respect the theme if possible, though user explicitly asked for "Dark black background",
  // so we hardcode the core colors to match the exact requirement, falling back to standard styles.
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    if (activeTab === 'signin') {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Missing Fields", "Please enter both email and password.");
        return;
      }
      // Use the part before @ in email if no explicit name is provided
      const signInName = email.split('@')[0];
      onLogin(signInName);
    } else {
      if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        Alert.alert("Missing Fields", "Please fill out all required fields.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Password Mismatch", "Passwords do not match.");
        return;
      }
      onLogin(fullName);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Brand Section */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>K</Text>
            </View>
            <Text style={styles.appName}>Katana Finance</Text>
            <Text style={styles.appSubtitle}>Take control of your wealth.</Text>
          </View>

          {/* Auth Card Container */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Get started</Text>

            {/* Toggle Switch */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleButton, activeTab === 'signin' && styles.toggleButtonActive]}
                onPress={() => setActiveTab('signin')}
              >
                <Text style={[styles.toggleText, activeTab === 'signin' && styles.toggleTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, activeTab === 'signup' && styles.toggleButtonActive]}
                onPress={() => setActiveTab('signup')}
              >
                <Text style={[styles.toggleText, activeTab === 'signup' && styles.toggleTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dynamic Form Fields */}
            {activeTab === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            {activeTab === 'signin' && (
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {activeTab === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0D0D0D',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'NotoSerifJP_900Black',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    paddingTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 100,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888888',
  },
  toggleTextActive: {
    color: '#0D0D0D',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#262626',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default AuthScreen;
