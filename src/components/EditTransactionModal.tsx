import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useResponsive } from '../hooks/useResponsive';
import { Transaction } from '../utils/storage';

interface EditTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ visible, transaction, onClose }) => {
  const { colors, isDark } = useTheme();
  const { updateTransaction } = useTransactions();
  const { s, wp, hp } = useResponsive();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    if (transaction) {
      setName(transaction.name);
      setAmount(transaction.amount.toString());
      setType(transaction.type);
      setNameError('');
      setAmountError('');
    }
  }, [transaction]);

  const handleSave = async () => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Please fill this in');
      valid = false;
    } else {
      setNameError('');
    }
    const parsed = parseFloat(amount);
    if (!amount.trim() || isNaN(parsed) || parsed <= 0) {
      setAmountError('Enter a valid amount');
      valid = false;
    } else {
      setAmountError('');
    }
    if (!valid || !transaction) return;

    setLoading(true);
    try {
      await updateTransaction(transaction.id, {
        name: name.trim(),
        amount: parsed,
        type,
      });
      onClose();
    } catch (e) {
      console.error('Failed to update transaction', e);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          pointerEvents="box-none"
        >
          <View style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              width: wp(90),
              maxWidth: 400,
              maxHeight: hp(80),
              borderRadius: s(32),
              paddingHorizontal: s(24),
              paddingBottom: s(20),
            }
          ]}>
            <View style={[styles.handle, { backgroundColor: colors.divider, width: s(40), height: s(4), borderRadius: s(2), marginTop: s(12), marginBottom: s(16) }]} />

            <View style={[styles.header, { marginBottom: s(20) }]}>
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: s(20) }]}>Edit Transaction</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={s(24)} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Type Toggle */}
              <View style={[styles.typeToggle, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderRadius: s(16), padding: s(4), marginBottom: s(20)
              }]}>
                <TouchableOpacity
                  style={[styles.toggleButton, { paddingVertical: s(12), borderRadius: s(12) },
                    type === 'expense' && { backgroundColor: colors.expense }]}
                  onPress={() => setType('expense')}
                >
                  <Text style={[styles.toggleText, { color: type === 'expense' ? '#FFF' : colors.secondaryText, fontSize: s(14) }]}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, { paddingVertical: s(12), borderRadius: s(12) },
                    type === 'income' && { backgroundColor: colors.income }]}
                  onPress={() => setType('income')}
                >
                  <Text style={[styles.toggleText, { color: type === 'income' ? '#FFF' : colors.secondaryText, fontSize: s(14) }]}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={{ marginBottom: s(20) }}>
                <Text style={[styles.label, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(8) }]}>Amount</Text>
                <View style={styles.amountRow}>
                  <Text style={[styles.currency, { color: colors.text, fontSize: s(32) }]}>$</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.text, fontSize: s(40) }]}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.divider}
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
                {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
              </View>

              {/* Name */}
              <View style={{ marginBottom: s(24) }}>
                <Text style={[styles.label, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(8) }]}>What was it for?</Text>
                <TextInput
                  style={[styles.textInput, {
                    color: colors.text,
                    fontSize: s(16),
                    backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9',
                    borderColor: nameError ? '#E74C3C' : (isDark ? '#333' : colors.divider),
                    borderWidth: 1,
                    borderRadius: s(12),
                    paddingHorizontal: s(12),
                    paddingVertical: s(12),
                  }]}
                  placeholder="e.g. Weekly Groceries"
                  placeholderTextColor={colors.secondaryText}
                  value={name}
                  onChangeText={setName}
                />
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.accent, height: s(56), borderRadius: s(16) }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.saveButtonText, { fontSize: s(16) }]}>Save Changes</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: s(20) }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  keyboardView: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  handle: { alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontWeight: '800' },
  closeButton: { padding: 4 },
  typeToggle: { flexDirection: 'row' },
  toggleButton: { flex: 1, alignItems: 'center' },
  toggleText: { fontWeight: '700' },
  label: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline' },
  currency: { fontWeight: '800', marginRight: 4 },
  amountInput: { fontWeight: '800', flex: 1 },
  textInput: {},
  saveButton: { justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: '700' },
  errorText: { color: '#E74C3C', fontSize: 12, marginTop: 4 },
});

export default EditTransactionModal;