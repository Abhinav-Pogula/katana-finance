import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useResponsive } from '../hooks/useResponsive';
import CrumpledPaper from '../components/CrumpledPaper';
import { clearAllData, getUserProfile, saveUserProfile } from '../utils/storage';
import { updateProfile } from 'firebase/auth';
import { auth } from '../utils/firebase';
import dayjs from 'dayjs';

const AVATAR_COLORS = [
  '#7B2FBE', '#E74C3C', '#2ECC71', '#3498DB',
  '#F39C12', '#1ABC9C', '#E91E63', '#FF5722',
];

const ProfileScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { transactions, refreshTransactions } = useTransactions();
  const { userName, uid, logout, login } = useAuth();
  const { s, wp } = useResponsive();
  const navigation = useNavigation<any>();

  // Profile state
  const [displayName, setDisplayName] = useState(userName);
  const [avatarColor, setAvatarColor] = useState('#7B2FBE');
  const [savingsGoal, setSavingsGoal] = useState(10000);
  const [profileLoading, setProfileLoading] = useState(true);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#7B2FBE');
  const [editGoal, setEditGoal] = useState('');
  const [saving, setSaving] = useState(false);

  // Load profile from Firestore on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return;
      const profile = await getUserProfile(uid);
      if (profile) {
        if (profile.displayName) setDisplayName(profile.displayName);
        if (profile.avatarColor) setAvatarColor(profile.avatarColor);
        if (profile.savingsGoal) setSavingsGoal(profile.savingsGoal);
      }
      setProfileLoading(false);
    };
    loadProfile();
  }, [uid]);

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const financialStats = useMemo(() => {
    const now = dayjs();
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let totalBalance = 0;

    transactions.forEach(tx => {
      const txAmount = tx.amount;
      const isThisMonth = dayjs(tx.date).isSame(now, 'month');
      if (tx.type === 'income') {
        totalBalance += txAmount;
        if (isThisMonth) monthlyIncome += txAmount;
      } else {
        totalBalance -= txAmount;
        if (isThisMonth) monthlyExpense += txAmount;
      }
    });

    return { totalBalance, monthlyIncome, monthlyExpense };
  }, [transactions]);

  const openEditModal = () => {
    setEditName(displayName);
    setEditColor(avatarColor);
    setEditGoal(savingsGoal.toString());
    setEditVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!uid) return;
    if (!editName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a display name.');
      return;
    }
    const goalAmount = parseFloat(editGoal);
    if (!editGoal || isNaN(goalAmount) || goalAmount <= 0) {
      Alert.alert('Invalid Goal', 'Please enter a valid savings goal amount.');
      return;
    }

    setSaving(true);
    try {
      // Save to Firestore
      await saveUserProfile(uid, {
        displayName: editName.trim(),
        avatarColor: editColor,
        savingsGoal: goalAmount,
      });

      // Also update Firebase Auth displayName
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: editName.trim() });
      }

      // Update local state
      setDisplayName(editName.trim());
      setAvatarColor(editColor);
      setSavingsGoal(goalAmount);
      login(editName.trim()); // sync userName across all screens
      setEditVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all transactions? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            if (!uid) {
              Alert.alert("Error", "You're not signed in yet. Please try again in a moment.");
              return;
            }
            try {
              await clearAllData(uid);
              await refreshTransactions();
              Alert.alert("Success", "All data has been cleared.");
            } catch (e) {
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  const StatItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <View style={[styles.statItem, { borderBottomColor: colors.divider, paddingVertical: s(12) }]}>
      <Text style={[styles.statLabel, { color: colors.secondaryText, fontSize: s(15) }]}>{label}</Text>
      <Text style={[styles.statValue, { color, fontSize: s(15) }]}>{value}</Text>
    </View>
  );

  return (
    <CrumpledPaper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: wp(6) }]}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: s(24) }}>
            <Text style={[styles.title, { color: colors.text, fontSize: s(28), marginBottom: 0 }]}>Settings</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={{ backgroundColor: colors.cardBackground, borderRadius: s(12), padding: s(10) }}
            >
              <Ionicons name="home-outline" size={s(22)} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Profile Header */}
          <View style={[styles.profileHeader, { marginBottom: s(24) }]}>
            {profileLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <>
                <View style={[styles.avatar, { backgroundColor: avatarColor, width: s(64), height: s(64), borderRadius: s(32) }]}>
                  <Text style={[styles.avatarText, { fontSize: s(24) }]}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.profileInfo, { marginLeft: s(16), flex: 1 }]}>
                  <Text style={[styles.userName, { color: colors.text, fontSize: s(20) }]}>{displayName}</Text>
                  <Text style={[styles.userStatus, { color: colors.secondaryText, fontSize: s(14) }]}>Pro Member</Text>
                </View>
                <TouchableOpacity
                  onPress={openEditModal}
                  style={[{ backgroundColor: colors.accent + '20', borderRadius: s(10), paddingHorizontal: s(12), paddingVertical: s(8) }]}
                >
                  <Text style={[{ color: colors.accent, fontSize: s(13), fontWeight: '700' }]}>Edit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Savings Goal Display */}
          <View style={[styles.section, { backgroundColor: !isDark ? '#FFF' : colors.cardBackground, borderColor: colors.divider, borderRadius: s(24), padding: s(20), marginBottom: s(24) }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(16) }]}>Savings Goal</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[{ color: colors.text, fontSize: s(15), fontWeight: '500' }]}>Monthly Target</Text>
              <Text style={[{ color: colors.accent, fontSize: s(15), fontWeight: '800' }]}>₹{savingsGoal.toLocaleString()}</Text>
            </View>
          </View>

          {/* Financial Overview */}
          <View style={[styles.section, { backgroundColor: !isDark ? '#FFF' : colors.cardBackground, borderColor: colors.divider, borderRadius: s(24), padding: s(20), marginBottom: s(24) }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(16) }]}>Financial Overview</Text>
            <StatItem label="Total Balance" value={`₹${financialStats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color={colors.text} />
            <StatItem label="Income (This Month)" value={`₹${financialStats.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color={colors.income} />
            <StatItem label="Spending (This Month)" value={`₹${financialStats.monthlyExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color={colors.expense} />
          </View>

          {/* Preferences */}
          <View style={[styles.section, { backgroundColor: !isDark ? '#FFF' : colors.cardBackground, borderColor: colors.divider, borderRadius: s(24), padding: s(20), marginBottom: s(24) }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(16) }]}>Preferences</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={s(22)} color={colors.accent} />
                <Text style={[styles.settingLabel, { color: colors.text, fontSize: s(16), marginLeft: s(12) }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.divider, true: colors.accent }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: isDark ? '#B30000' : colors.expense, height: s(56), borderRadius: s(16) }]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={s(20)} color={isDark ? '#B30000' : colors.expense} />
            <Text style={[styles.clearButtonText, { color: isDark ? '#B30000' : colors.expense, fontSize: s(16), marginLeft: s(8) }]}>Clear All Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.divider, height: s(56), borderRadius: s(16), marginTop: s(12) }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={s(20)} color={colors.text} />
            <Text style={[styles.clearButtonText, { color: colors.text, fontSize: s(16), marginLeft: s(8) }]}>Log Out</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.secondaryText, fontSize: s(12), marginTop: s(32) }]}>Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditVisible(false)} />
        <View style={[styles.sheet, {
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderTopLeftRadius: s(32),
          borderTopRightRadius: s(32),
          padding: s(24),
          paddingBottom: s(40),
        }]}>
          <View style={[styles.handle, { backgroundColor: colors.divider, marginBottom: s(20) }]} />

          <Text style={[{ color: colors.text, fontSize: s(18), fontWeight: '800', marginBottom: s(24) }]}>Edit Profile</Text>

          {/* Name Input */}
          <Text style={[styles.inputLabel, { color: colors.secondaryText, marginBottom: s(8) }]}>DISPLAY NAME</Text>
          <TextInput
            style={[styles.input, {
              color: colors.text,
              backgroundColor: isDark ? '#262626' : '#F9F9F9',
              borderColor: colors.divider,
              borderRadius: s(12),
              paddingHorizontal: s(14),
              paddingVertical: s(12),
              fontSize: s(16),
              marginBottom: s(20),
            }]}
            value={editName}
            onChangeText={setEditName}
            placeholder="Your name"
            placeholderTextColor={colors.secondaryText}
          />

          {/* Savings Goal Input */}
          <Text style={[styles.inputLabel, { color: colors.secondaryText, marginBottom: s(8) }]}>SAVINGS GOAL (₹)</Text>
          <TextInput
            style={[styles.input, {
              color: colors.text,
              backgroundColor: isDark ? '#262626' : '#F9F9F9',
              borderColor: colors.divider,
              borderRadius: s(12),
              paddingHorizontal: s(14),
              paddingVertical: s(12),
              fontSize: s(16),
              marginBottom: s(20),
            }]}
            value={editGoal}
            onChangeText={setEditGoal}
            placeholder="10000"
            placeholderTextColor={colors.secondaryText}
            keyboardType="decimal-pad"
          />

          {/* Avatar Color Picker */}
          <Text style={[styles.inputLabel, { color: colors.secondaryText, marginBottom: s(12) }]}>AVATAR COLOR</Text>
          <View style={[styles.colorGrid, { marginBottom: s(24) }]}>
            {AVATAR_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                onPress={() => setEditColor(color)}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: color,
                    width: s(40),
                    height: s(40),
                    borderRadius: s(20),
                    margin: s(6),
                    borderWidth: editColor === color ? 3 : 0,
                    borderColor: '#FFFFFF',
                  }
                ]}
              >
                {editColor === color && (
                  <Ionicons name="checkmark" size={s(18)} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview */}
          <View style={[styles.preview, { marginBottom: s(24) }]}>
            <View style={[styles.avatar, { backgroundColor: editColor, width: s(48), height: s(48), borderRadius: s(24), marginRight: s(12) }]}>
              <Text style={[styles.avatarText, { fontSize: s(18) }]}>
                {editName.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={[{ color: colors.text, fontSize: s(16), fontWeight: '700' }]}>{editName || 'Your Name'}</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[{ backgroundColor: colors.accent, borderRadius: s(16), height: s(54), justifyContent: 'center', alignItems: 'center' }]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[{ color: '#FFF', fontSize: s(16), fontWeight: '700' }]}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </CrumpledPaper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingBottom: 100 },
  title: { fontWeight: '800' },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800' },
  profileInfo: {},
  userName: { fontWeight: '700' },
  userStatus: { marginTop: 2 },
  section: { borderWidth: 1 },
  sectionTitle: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  statItem: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1 },
  statLabel: { fontWeight: '500' },
  statValue: { fontWeight: '700' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabelGroup: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontWeight: '600' },
  clearButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', marginTop: 8 },
  clearButtonText: { fontWeight: '700' },
  versionText: { textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderWidth: 1 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  colorSwatch: { justifyContent: 'center', alignItems: 'center' },
  preview: { flexDirection: 'row', alignItems: 'center' },
});

export default ProfileScreen;