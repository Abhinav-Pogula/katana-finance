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
import { useResponsive } from '../hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const { colors, toggleTheme } = useTheme();
  const { s, wp, hp } = useResponsive();
  const insets = useSafeAreaInsets();
  
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
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: wp(6), paddingVertical: hp(5) }]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Top Brand Section */}
          <View style={[styles.brandContainer, { marginBottom: hp(5) }]}>
            <View style={[styles.logoBox, { width: s(64), height: s(64), borderRadius: s(16), marginBottom: s(20) }]}>
              <Text style={[styles.logoText, { fontSize: s(40) }]}>K</Text>
            </View>
            <Text style={[styles.appName, { fontSize: s(28), marginBottom: s(8) }]}>Katana Finance</Text>
            <Text style={[styles.appSubtitle, { fontSize: s(14) }]}>Take control of your wealth.</Text>
          </View>

          {/* Auth Card Container */}
          <View style={[styles.cardContainer, { borderRadius: s(32), padding: s(24) }]}>
            <Text style={[styles.cardTitle, { fontSize: s(22), marginBottom: s(24) }]}>Get started</Text>

            {/* Toggle Switch */}
            <View style={[styles.toggleContainer, { padding: s(4), marginBottom: s(32) }]}>
              <TouchableOpacity 
                style={[styles.toggleButton, { paddingVertical: s(12) }, activeTab === 'signin' && styles.toggleButtonActive]}
                onPress={() => setActiveTab('signin')}
              >
                <Text style={[styles.toggleText, { fontSize: s(14) }, activeTab === 'signin' && styles.toggleTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, { paddingVertical: s(12) }, activeTab === 'signup' && styles.toggleButtonActive]}
                onPress={() => setActiveTab('signup')}
              >
                <Text style={[styles.toggleText, { fontSize: s(14) }, activeTab === 'signup' && styles.toggleTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dynamic Form Fields */}
            {activeTab === 'signup' && (
              <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
                <Text style={[styles.inputLabel, { fontSize: s(13), marginBottom: s(8) }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { paddingHorizontal: s(16), paddingVertical: s(14), fontSize: s(15), borderRadius: s(16) }]}
                  placeholder="John Doe"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
              <Text style={[styles.inputLabel, { fontSize: s(13), marginBottom: s(8) }]}>Email</Text>
              <TextInput
                style={[styles.input, { paddingHorizontal: s(16), paddingVertical: s(14), fontSize: s(15), borderRadius: s(16) }]}
                placeholder="you@example.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
              <Text style={[styles.inputLabel, { fontSize: s(13), marginBottom: s(8) }]}>Password</Text>
              <View style={[styles.passwordContainer, { borderRadius: s(16) }]}>
                <TextInput
                  style={[styles.passwordInput, { paddingHorizontal: s(16), paddingVertical: s(14), fontSize: s(15) }]}
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={s(20)} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            {activeTab === 'signin' && (
              <TouchableOpacity style={[styles.forgotPasswordContainer, { marginBottom: s(24) }]}>
                <Text style={[styles.forgotPasswordText, { fontSize: s(13) }]}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {activeTab === 'signup' && (
              <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
                <Text style={[styles.inputLabel, { fontSize: s(13), marginBottom: s(8) }]}>Confirm Password</Text>
                <View style={[styles.passwordContainer, { borderRadius: s(16) }]}>
                  <TextInput
                    style={[styles.passwordInput, { paddingHorizontal: s(16), paddingVertical: s(14), fontSize: s(15) }]}
                    placeholder="••••••••"
                    placeholderTextColor="#666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                    <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={s(20)} color="#888" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity style={[styles.submitButton, { paddingVertical: s(16), borderRadius: s(100), marginTop: s(12) }]} onPress={handleSubmit}>
              <Text style={[styles.submitButtonText, { fontSize: s(16) }]}>
                {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

          </View>
          <View style={{ height: hp(5) }} />
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
  },
  brandContainer: {
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '900',
    color: '#0D0D0D',
  },
  appName: {
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'NotoSerifJP_900Black',
  },
  appSubtitle: {
    color: '#888888',
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 100,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 100,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontWeight: '700',
    color: '#888888',
  },
  toggleTextActive: {
    color: '#0D0D0D',
  },
  inputGroup: {
  },
  inputLabel: {
    fontWeight: '600',
    color: '#CCCCCC',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#262626',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#888888',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#0D0D0D',
    fontWeight: '800',
  },
});

export default AuthScreen;
