import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotifications } from '../context/NotificationContext';
import { getUserProfile } from '../utils/storage';


// Components
import TransactionRow from '../components/TransactionRow';
import AddTransactionModal from '../components/AddTransactionModal';


const DashboardScreen = () => {
  const { colors, isDark } = useTheme();
  const { transactions, refreshTransactions } = useTransactions();
  const { userName, uid } = useAuth();  const navigation = useNavigation<any>();
  const { s, wp, hp } = useResponsive();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setModalVisible] = React.useState(false);
  const [defaultTxType, setDefaultTxType] = React.useState<'income' | 'expense'>('expense');

  const [savingsGoal, setSavingsGoal] = useState(10000);

useEffect(() => {
  const loadGoal = async () => {
    if (!uid) return;
    const profile = await getUserProfile(uid);
    if (profile?.savingsGoal) setSavingsGoal(profile.savingsGoal);
  };
  loadGoal();
}, [uid]);
  
  const [showNotifications, setShowNotifications] = React.useState(false);

  // ✅ REAL notifications from Firestore
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const stats = React.useMemo(() => {
  let totalIncome = 0;
  let totalExpense = 0;
  let balance = 0;

  transactions.forEach(tx => {
    if (tx.type === 'income') {
      balance += tx.amount;
      totalIncome += tx.amount;
    } else {
      balance -= tx.amount;
      totalExpense += tx.amount;
    }
  });

  // Savings rate = how much of income is saved (not spent)
  const savingsRate = totalIncome > 0
    ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
    : 0;

  // Goal progress = % toward a $10,000 savings goal based on current balance
  const SAVINGS_GOAL = savingsGoal;
  const goalProgress = Math.min(100, Math.max(0, Math.round((Math.max(0, balance) / SAVINGS_GOAL) * 100)));

  return { balance, savingsRate, goalProgress };
}, [transactions]);

  const recentTransactions = transactions.slice(0, 4);
  
  // Animated balance counter
const [displayBalance, setDisplayBalance] = useState(0);
const balanceAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  // Animate from 0 to actual balance over 1.5 seconds
  balanceAnim.setValue(0);
  Animated.timing(balanceAnim, {
    toValue: 1,
    duration: 1500,
    useNativeDriver: false,
  }).start();
}, [stats.balance]);

useEffect(() => {
  const listener = balanceAnim.addListener(({ value }) => {
    const current = stats.balance * value;
    setDisplayBalance(current);
  });
  return () => balanceAnim.removeListener(listener);
}, [stats.balance, balanceAnim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background Image restricted to top 45% */}
      <View style={[styles.backgroundHeader, { height: hp(45) }]}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1493119508027-2b584f234d6c?q=80&w=1000&auto=format&fit=crop' }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Soft fade out to pure white */}
        <LinearGradient
          colors={['transparent', isDark ? 'rgba(13,13,13,0.6)' : 'rgba(255,255,255,0.6)', colors.background]}
          locations={[0, 0.6, 1]}
          style={[styles.gradientOverlay, { height: hp(32) }]}
        />
      </View>

      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        
        {/* Top Header */}
        <View style={[styles.topBar, { paddingHorizontal: wp(6), paddingVertical: s(16) }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flower" size={s(26)} color="#7B2FBE" style={{ marginRight: s(12), textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 }} />
            <View>
              <Text style={{ 
                fontSize: s(10), 
                color: '#FFFFFF', 
                fontWeight: '700', 
                letterSpacing: 2, 
                marginBottom: 2,
                textShadowColor: 'rgba(0,0,0,0.5)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 4,
                fontFamily: 'NotoSerifJP_400Regular' 
              }}>WELCOME BACK</Text>
              <Text style={[styles.headerTitle, { 
                color: '#FFFFFF', 
                fontSize: s(22), 
                letterSpacing: 0, 
                textTransform: 'capitalize',
                textShadowColor: 'rgba(0,0,0,0.5)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 4,
                fontFamily: 'NotoSerifJP_900Black'
              }]}>{userName}</Text>
            </View>
          </View>
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowNotifications(true)}>
              <Ionicons name="notifications" size={s(24)} color="#FFFFFF" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 }} />
              {unreadCount > 0 && (
                <View style={[styles.badge, { minWidth: s(16), height: s(16), borderRadius: s(8) }]}>
                  <Text style={[styles.badgeText, { fontSize: s(9) }]}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { marginLeft: s(16) }]} onPress={() => navigation.navigate('Profile')}>
              <View style={[styles.avatarPlaceholder, { width: s(32), height: s(32), borderRadius: s(16) }]}>
                <Ionicons name="person" size={s(16)} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: wp(6), paddingTop: s(12) }]}>
          
          {/* Main Balance Card using expo-blur */}
          <View style={[styles.balanceCardContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', borderRadius: s(30), marginBottom: s(32) }]}>
            <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={[styles.balanceCardBlur, { paddingVertical: s(32), paddingHorizontal: s(20) }]}>
              <Text style={[styles.balanceTitle, { color: colors.secondaryText, fontSize: s(11) }]}>TOTAL BALANCE</Text>

                {/* Cool Balance Display */}
                <View style={{ alignItems: 'center', marginBottom: s(36) }}>

                  {/* Balance amount with gradient-like effect */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Text style={{
                    color: stats.balance >= 0 ? '#7B2FBE' : '#E74C3C',
                    fontSize: s(24),
                    fontWeight: '700',
                    marginTop: s(8),
                    marginRight: s(4),
                    opacity: 0.8,
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                  }}>
                    ₹
                  </Text>
                    <Text style={{
                    color: colors.text,
                    fontSize: s(48),
                    fontWeight: '900',
                    letterSpacing: -1,
                    textShadowOffset: { width: 0, height: 3 },
                    textShadowRadius: 15,
                  }}>
                    {Math.abs(displayBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  </View>
  
  {/* Balance status label */}
  <Text style={{
    color: stats.balance >= 0 ? '#27AE6080' : '#E74C3C80',
    fontSize: s(11),
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: s(6),
    textTransform: 'uppercase',
  }}>
    {stats.balance >= 0 ? 'In Good Standing' : 'Over Budget'}
  </Text>
</View>
              
              <View style={styles.actionButtonsRow}>
              {/* INCOME — opens transaction modal with Income tab */}
              <View style={styles.actionColumn}>
                <TouchableOpacity 
                  style={[styles.actionButtonLight, { width: s(56), height: s(56), borderRadius: s(28) }]} 
                  onPress={() => {
                    setDefaultTxType('income');
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="arrow-up" size={s(20)} color="#27AE60" />
                </TouchableOpacity>
                <Text style={[styles.actionLabel, { color: colors.text, fontSize: s(10) }]}>INCOME</Text>
              </View>

              {/* SPENT — opens transaction modal with Expense tab */}
              <View style={styles.actionColumn}>
                <TouchableOpacity 
                  style={[styles.actionButtonLight, { width: s(56), height: s(56), borderRadius: s(28) }]} 
                  onPress={() => {
                    setDefaultTxType('expense');
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="arrow-down" size={s(20)} color="#E74C3C" />
                </TouchableOpacity>
                <Text style={[styles.actionLabel, { color: colors.text, fontSize: s(10) }]}>SPENT</Text>
              </View>
            </View>

            </BlurView>
          </View>

          {/* Transaction Section */}
          <View style={[styles.sectionHeader, { marginBottom: s(16) }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: s(20) }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
              <Text style={[styles.seeAll, { color: colors.secondaryText, fontSize: s(13) }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} {...tx} />
            ))}
          </View>

          {/* Bottom Grid Segment */}
            <View style={[styles.bottomGridRow, { marginTop: s(8) }]}>
              <View style={[styles.gridItemContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', borderRadius: s(24) }]}>
                <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={[styles.gridItemBlur, { paddingVertical: s(24), paddingHorizontal: s(20) }]}>
                  <Ionicons name="bar-chart" size={s(26)} color="#8D4C3A" style={{ marginBottom: s(16) }} />
                  <Text style={[styles.gridItemLabel, { color: colors.secondaryText, fontSize: s(9) }]}>SAVINGS RATE</Text>
                  <Text style={[styles.gridItemValue, { color: colors.text, fontSize: s(24) }]}>
                    {stats.savingsRate}%
                  </Text>
                </BlurView>
              </View>

              <View style={[styles.gridItemContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', borderRadius: s(24) }]}>
                <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={[styles.gridItemBlur, { paddingVertical: s(24), paddingHorizontal: s(20) }]}>
                  <Ionicons name="lock-closed" size={s(26)} color="#8D4C3A" style={{ marginBottom: s(16) }} />
                  <Text style={[styles.gridItemLabel, { color: colors.secondaryText, fontSize: s(9) }]}>GOAL PROGRESS</Text>
                  <Text style={[styles.gridItemValue, { color: colors.text, fontSize: s(24) }]}>
                    {stats.goalProgress}%
                  </Text>
                </BlurView>
              </View>
            </View>

            {/* Budget Limits Button */}
              <TouchableOpacity
                style={[
                  styles.budgetButton,
                  {
                    backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                    borderColor: colors.divider,
                    borderRadius: s(20),
                    marginTop: s(12),
                    paddingVertical: s(18),
                    paddingHorizontal: s(20),
                  }
                ]}
                onPress={() => navigation.navigate('BudgetLimits')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[{ backgroundColor: colors.accent + '20', borderRadius: s(10), padding: s(8), marginRight: s(14) }]}>
                    <Ionicons name="pie-chart-outline" size={s(22)} color={colors.accent} />
                  </View>
    <View style={{ flex: 1 }}>
      <Text style={[{ color: colors.text, fontSize: s(15), fontWeight: '700' }]}>Budget Limits</Text>
      <Text style={[{ color: colors.secondaryText, fontSize: s(12) }]}>Set monthly spending limits per category</Text>
    </View>
    <Ionicons name="chevron-forward" size={s(18)} color={colors.secondaryText} />
  </View>
</TouchableOpacity>

          <View style={{ height: s(150) }} />
        </ScrollView>
      </View>

      <AddTransactionModal 
      visible={isModalVisible} 
      onClose={() => setModalVisible(false)} 
      onSuccess={() => refreshTransactions()}
      defaultType={defaultTxType}
    />

      {/* ✅ REAL Notification Modal */}
<Modal visible={showNotifications} transparent animationType="fade">
  <TouchableOpacity 
    style={styles.modalOverlay} 
    activeOpacity={1} 
    onPress={() => setShowNotifications(false)}
  >
    <View style={[styles.notificationCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: colors.divider }]}>
      
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={[styles.notificationHeader, { color: colors.text }]}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '600' }}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="notifications-off-outline" size={40} color={colors.secondaryText} />
          <Text style={{ color: colors.secondaryText, marginTop: 8, fontSize: 13 }}>No notifications yet</Text>
        </View>
      ) : (
        notifications.map((n) => (
          <TouchableOpacity 
            key={n.id} 
            style={[
              styles.notificationItem, 
              !n.read && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }
            ]} 
            onPress={() => markAsRead(n.id)}
          >
            {/* Icon based on notification type */}
            <View style={{ marginRight: 12, marginTop: 2 }}>
              <Ionicons 
                name={
                  n.type === 'budget_exceeded' ? 'alert-circle' :
                  n.type === 'budget_warning' ? 'warning' :
                  n.type === 'income_credited' ? 'cash' :
                  n.type === 'high_spending' ? 'trending-up' :
                  n.type === 'savings_milestone' ? 'trophy' :
                  n.type === 'weekly_report' ? 'bar-chart' :
                  n.type === 'month_end_summary' ? 'calendar' :
                  'notifications'
                } 
                size={20} 
                color={
                  n.type === 'budget_exceeded' ? '#E74C3C' :
                  n.type === 'budget_warning' ? '#F39C12' :
                  n.type === 'income_credited' ? '#27AE60' :
                  n.type === 'high_spending' ? '#E67E22' :
                  n.type === 'savings_milestone' ? '#9B59B6' :
                  '#3498DB'
                } 
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>{n.title}</Text>
              <Text style={[styles.notificationSubtitle, { color: colors.secondaryText }]}>{n.subtitle}</Text>
              <Text style={[styles.notificationTime, { color: colors.accent }]}>
                {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>

            {!n.read && <View style={styles.unreadDot} />}
            
            {/* Delete button */}
            <TouchableOpacity 
              onPress={() => removeNotification(n.id)} 
              style={{ padding: 4, marginLeft: 8 }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.secondaryText} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </View>
  </TouchableOpacity>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  
  budgetButton: {
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },


  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {},
  avatarPlaceholder: {
    backgroundColor: '#E8A7B9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
  },
  balanceCardContainer: {
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  balanceCardBlur: {
    alignItems: 'center',
  },
  balanceTitle: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  actionButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  actionColumn: {
    alignItems: 'center',
  },
  actionButtonLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionButtonDark: {
    backgroundColor: '#8D4C3A', // Deep rose wood color matching reference
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8D4C3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  actionLabel: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '800',
  },
  seeAll: {
    fontWeight: '600',
  },
  listContainer: {
    marginBottom: 20,
  },
  bottomGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItemContainer: {
    width: '47%',
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  gridItemBlur: {
    alignItems: 'flex-start',
  },
  gridItemLabel: {
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  gridItemValue: {
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 100,
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  notificationCard: {
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  notificationHeader: {
    fontSize: 16,
    fontWeight: '800',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginLeft: 12,
  },
});

export default DashboardScreen;
