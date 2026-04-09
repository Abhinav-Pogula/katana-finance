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
      <View style={styles.backgroundHeader}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1493119508027-2b584f234d6c?q=80&w=1000&auto=format&fit=crop' }} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        {/* Soft fade out to pure white */}
        <LinearGradient
          colors={['transparent', isDark ? 'rgba(13,13,13,0.6)' : 'rgba(255,255,255,0.6)', colors.background]}
          locations={[0, 0.6, 1]}
          style={styles.gradientOverlay}
        />
      </View>

      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="flower" size={26} color="#7B2FBE" style={{ marginRight: 12, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 }} />
            <View>
              <Text style={{ 
                fontSize: 10, 
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
                fontSize: 22, 
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
              <Ionicons name="notifications" size={24} color="#FFFFFF" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 }} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { marginLeft: 16 }]} onPress={() => navigation.navigate('Profile')}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Balance Card using expo-blur */}
          <View style={[styles.balanceCardContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
            <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={styles.balanceCardBlur}>
              <Text style={[styles.balanceTitle, { color: colors.secondaryText }]}>TOTAL BALANCE</Text>
              <Text style={[styles.balanceAmount, { color: colors.text }]}>
                ${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
              
              <View style={styles.actionButtonsRow}>
                <View style={styles.actionColumn}>
                  <TouchableOpacity style={styles.actionButtonLight} onPress={() => navigation.navigate('Budget', { filter: 'Income' })}>
                    <Ionicons name="arrow-up" size={20} color="#8D4C3A" />
                  </TouchableOpacity>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>INCOME</Text>
                </View>

                <View style={styles.actionColumn}>
                  <TouchableOpacity style={styles.actionButtonLight} onPress={() => navigation.navigate('Budget', { filter: 'Expense' })}>
                    <Ionicons name="arrow-down" size={20} color="#8D4C3A" />
                  </TouchableOpacity>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>SPENT</Text>
                </View>

                <View style={styles.actionColumn}>
                  <TouchableOpacity style={styles.actionButtonDark} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={[styles.actionLabel, { color: colors.text }]}>ADD</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Transaction Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
              <Text style={[styles.seeAll, { color: colors.secondaryText }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} {...tx} />
            ))}
          </View>

          {/* Bottom Grid Segment */}
          <View style={styles.bottomGridRow}>
            <View style={[styles.gridItemContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
               <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={styles.gridItemBlur}>
                 <Ionicons name="bar-chart" size={26} color="#8D4C3A" style={{ marginBottom: 16 }} />
                 <Text style={[styles.gridItemLabel, { color: colors.secondaryText }]}>SAVINGS RATE</Text>
                 <Text style={[styles.gridItemValue, { color: colors.text }]}>24%</Text>
               </BlurView>
            </View>
            
            <View style={[styles.gridItemContainer, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
               <BlurView intensity={isDark ? 40 : 60} tint={isDark ? 'dark' : 'light'} style={styles.gridItemBlur}>
                 <Ionicons name="lock-closed" size={26} color="#8D4C3A" style={{ marginBottom: 16 }} />
                 <Text style={[styles.gridItemLabel, { color: colors.secondaryText }]}>GOAL PROGRESS</Text>
                 <Text style={[styles.gridItemValue, { color: colors.text }]}>82%</Text>
               </BlurView>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>

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
    backgroundColor: '#FFFFFF',
  },
  backgroundHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
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
    height: '70%', // Fades from transparent 30% down the image to solid white at the bottom cut
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#333',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {},
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8A7B9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120, // Extra padding for the floating pill nav bar
  },
  balanceCardContainer: {
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
    borderColor: 'rgba(200,200,200,0.2)',
    borderWidth: 1.5,
  },
  balanceCardBlur: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: '#333',
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#444',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  listContainer: {
    marginBottom: 20,
  },
  bottomGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridItemContainer: {
    width: '47%',
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(200,200,200,0.2)',
    borderWidth: 1.5,
  },
  gridItemBlur: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  gridItemLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#666',
    marginBottom: 8,
  },
  gridItemValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
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
