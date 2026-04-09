import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Image,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Components
import TransactionRow from '../components/TransactionRow';
import AddTransactionModal from '../components/AddTransactionModal';

interface DummyNotification {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
}

const DUMMY_NOTIFS: DummyNotification[] = [
  { id: '4', title: 'Unusual spending detected', subtitle: 'Your food spending is 40% higher than last month.', time: '12 mins ago', read: false },
  { id: '5', title: 'Salary Credited', subtitle: 'Your account was credited with $4,500.00.', time: '1 hour ago', read: false },
  { id: '6', title: 'Auto-savings triggered', subtitle: '$200 has been securely moved to your vault.', time: '1 hour ago', read: false },
  { id: '1', title: 'Monthly budget limit reached', subtitle: 'You have spent 100% of your budget for this month.', time: '2 hours ago', read: false },
  { id: '2', title: 'New transaction added', subtitle: 'Your recent purchase at Starbucks was recorded.', time: '5 hours ago', read: false },
  { id: '3', title: 'Savings goal 80% complete', subtitle: 'You are almost there!', time: '1 day ago', read: false }
];

const DashboardScreen = () => {
  const { colors, isDark } = useTheme();
  const { transactions, refreshTransactions } = useTransactions();
  const { userName } = useAuth();
  const navigation = useNavigation<any>();
  const { s, wp, hp } = useResponsive();
  const insets = useSafeAreaInsets();

  const [isModalVisible, setModalVisible] = React.useState(false);
  const [notifications, setNotifications] = React.useState<DummyNotification[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  React.useEffect(() => {
    const loadNotifs = async () => {
      try {
        const stored = await AsyncStorage.getItem('dummy_notifs');
        if (stored) {
          const parsed = JSON.parse(stored);
          const existingIds = new Set(parsed.map((n: DummyNotification) => n.id));
          const newNotifs = DUMMY_NOTIFS.filter(n => !existingIds.has(n.id));
          
          if (newNotifs.length > 0) {
            const merged = [...newNotifs, ...parsed];
            setNotifications(merged);
            await AsyncStorage.setItem('dummy_notifs', JSON.stringify(merged));
          } else {
            setNotifications(parsed);
          }
        } else {
          setNotifications(DUMMY_NOTIFS);
          await AsyncStorage.setItem('dummy_notifs', JSON.stringify(DUMMY_NOTIFS));
        }
      } catch (e) {}
    };
    loadNotifs();
  }, []);

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    await AsyncStorage.setItem('dummy_notifs', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useFocusEffect(
    React.useCallback(() => {
      refreshTransactions();
    }, [refreshTransactions])
  );

  const stats = React.useMemo(() => {
    let balance = 0;
    transactions.forEach(tx => {
      if (tx.type === 'income') balance += tx.amount;
      else balance -= tx.amount;
    });
    return { balance };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 4);

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
              <Text style={[styles.balanceAmount, { color: colors.text, fontSize: s(42) }]}>
                ${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
              
              <View style={styles.actionButtonsRow}>
                <View style={styles.actionColumn}>
                  <TouchableOpacity style={[styles.actionButtonLight, { width: s(56), height: s(56), borderRadius: s(28) }]} onPress={() => navigation.navigate('Budget', { filter: 'Income' })}>
                    <Ionicons name="arrow-up" size={s(20)} color="#8D4C3A" />
                  </TouchableOpacity>
                  <Text style={[styles.actionLabel, { color: colors.text, fontSize: s(10) }]}>INCOME</Text>
                </View>

                <View style={styles.actionColumn}>
                  <TouchableOpacity style={[styles.actionButtonLight, { width: s(56), height: s(56), borderRadius: s(28) }]} onPress={() => navigation.navigate('Budget', { filter: 'Expense' })}>
                    <Ionicons name="arrow-down" size={s(20)} color="#8D4C3A" />
                  </TouchableOpacity>
                  <Text style={[styles.actionLabel, { color: colors.text, fontSize: s(10) }]}>SPENT</Text>
                </View>

                <View style={styles.actionColumn}>
                  <TouchableOpacity style={[styles.actionButtonDark, { width: s(64), height: s(64), borderRadius: s(32) }]} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={s(28)} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={[styles.actionLabel, { color: colors.text, fontSize: s(10) }]}>ADD</Text>
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
                 <Text style={[styles.gridItemValue, { color: colors.text, fontSize: s(24) }]}>24%</Text>
               </BlurView>
            </View>
            
            <View style={[styles.gridItemContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)', borderRadius: s(24) }]}>
               <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={[styles.gridItemBlur, { paddingVertical: s(24), paddingHorizontal: s(20) }]}>
                 <Ionicons name="lock-closed" size={s(26)} color="#8D4C3A" style={{ marginBottom: s(16) }} />
                 <Text style={[styles.gridItemLabel, { color: colors.secondaryText, fontSize: s(9) }]}>GOAL PROGRESS</Text>
                 <Text style={[styles.gridItemValue, { color: colors.text, fontSize: s(24) }]}>82%</Text>
               </BlurView>
            </View>
          </View>

          <View style={{ height: s(150) }} />
        </ScrollView>
      </View>

      <AddTransactionModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        onSuccess={() => refreshTransactions()}
      />

      <Modal visible={showNotifications} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotifications(false)}>
          <View style={[styles.notificationCard, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: colors.divider }]}>
            <Text style={[styles.notificationHeader, { color: colors.text }]}>Notifications</Text>
            {notifications.length === 0 ? (
              <Text style={{ color: colors.secondaryText, padding: 16 }}>No notifications</Text>
            ) : (
              notifications.map((n) => (
                <TouchableOpacity 
                  key={n.id} 
                  style={[styles.notificationItem, !n.read && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]} 
                  onPress={() => markAsRead(n.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>{n.title}</Text>
                    <Text style={[styles.notificationSubtitle, { color: colors.secondaryText }]}>{n.subtitle}</Text>
                    <Text style={[styles.notificationTime, { color: colors.accent }]}>{n.time}</Text>
                  </View>
                  {!n.read && <View style={styles.unreadDot} />}
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
  balanceAmount: {
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 36,
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
