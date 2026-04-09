import React from 'react';
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
  Keyboard,
  ScrollView
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { useResponsive } from '../hooks/useResponsive';
import CategoryPicker from '../components/CategoryPicker';
import { Transaction } from '../utils/storage';
import dayjs from 'dayjs';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, onSuccess }) => {
  const { colors, isDark } = useTheme();
  const { addTransaction } = useTransactions();
  const { s, wp, hp } = useResponsive();
  
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      type: 'expense' as 'income' | 'expense',
      amount: '',
      name: '',
      category: 'Food',
      date: dayjs().format('YYYY-MM-DD'),
    }
  });

  const activeType = watch('type');
  const activeCategory = watch('category');

  const onSubmit = async (data: any) => {
    try {
      const newTx: Transaction = {
        id: Date.now().toString(),
        name: data.name,
        amount: parseFloat(data.amount),
        type: data.type,
        category: data.category,
        date: data.date,
        icon: 'help-circle-outline',
        iconColor: colors.accent,
      };

      await addTransaction(newTx);
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Form Submission Failed', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={[
                styles.modalContainer, 
                { backgroundColor: colors.cardBackground, width: wp(90), maxWidth: 400, borderRadius: s(32), paddingHorizontal: s(24), paddingBottom: s(20) }
              ]}>
                <View style={[styles.handle, { backgroundColor: colors.divider, width: s(40), height: s(4), borderRadius: s(2), marginTop: s(12), marginBottom: s(16) }]} />
                
                <View style={[styles.header, { marginBottom: s(20) }]}>
                  <Text style={[styles.headerTitle, { color: colors.text, fontSize: s(20) }]}>New Transaction</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={s(24)} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: s(20) }]}>
                  {/* Type Toggle */}
                  <View style={[styles.typeToggle, { backgroundColor: !isDark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', borderRadius: s(16), padding: s(4), marginBottom: s(20) }]}>
                    <TouchableOpacity 
                      style={[
                        styles.toggleButton, 
                        { paddingVertical: s(12), borderRadius: s(12) },
                        activeType === 'expense' && { backgroundColor: colors.expense }
                      ]}
                      onPress={() => setValue('type', 'expense')}
                    >
                      <Text style={[
                        styles.toggleText, 
                        { color: activeType === 'expense' ? '#FFF' : colors.secondaryText, fontSize: s(14) }
                      ]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.toggleButton, 
                        { paddingVertical: s(12), borderRadius: s(12) },
                        activeType === 'income' && { backgroundColor: colors.income }
                      ]}
                      onPress={() => setValue('type', 'income')}
                    >
                      <Text style={[
                        styles.toggleText, 
                        { color: activeType === 'income' ? '#FFF' : colors.secondaryText, fontSize: s(14) }
                      ]}>Income</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Amount Input */}
                  <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
                    <Text style={[styles.label, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(8) }]}>Amount</Text>
                    <Controller
                      control={control}
                      name="amount"
                      rules={{ required: 'Amount is required', pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Invalid amount' } }}
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.amountInputContainer}>
                          <Text style={[styles.currency, { color: colors.text, fontSize: s(32) }]}>$</Text>
                          <TextInput
                            style={[styles.amountInput, { color: colors.text, fontSize: s(40) }]}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={colors.divider}
                            value={value}
                            onChangeText={onChange}
                            autoFocus={true}
                          />
                        </View>
                      )}
                    />
                    {errors.amount && <Text style={[styles.errorText, { fontSize: s(12) }]}>{errors.amount.message}</Text>}
                  </View>

                  {/* Name Input */}
                  <View style={[styles.inputGroup, { marginBottom: s(20) }]}>
                    <Text style={[styles.label, { color: colors.secondaryText, fontSize: s(12), marginBottom: s(8) }]}>What was it for?</Text>
                    <Controller
                      control={control}
                      name="name"
                      rules={{ required: 'Description is required' }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={[
                            styles.textInput, 
                            { 
                              color: colors.text, 
                              fontSize: s(16),
                              backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9',
                              borderColor: isDark ? '#333' : colors.divider,
                              borderWidth: 1,
                              borderRadius: s(12),
                              paddingHorizontal: s(12),
                              paddingVertical: s(12),
                            }
                          ]}
                        placeholder="e.g. Weekly Groceries"
                        placeholderTextColor={colors.secondaryText}
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>

                {/* Category Picker */}
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { value } }) => (
                    <CategoryPicker 
                      selectedId={value} 
                      onSelect={(cat) => setValue('category', cat.id)} 
                    />
                  )}
                />

                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.accent, height: s(56), borderRadius: s(16), marginTop: s(16) }]}
                  onPress={handleSubmit(onSubmit, (errors) => {
                    console.log('⚠️ Validation Errors:', errors);
                  })}
                >
                  <Text style={[styles.saveButtonText, { fontSize: s(16) }]}>Save Transaction</Text>
                </TouchableOpacity>
                
                <View style={{ height: s(40) }} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  handle: {
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '800',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
  },
  typeToggle: {
    flexDirection: 'row',
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '700',
  },
  inputGroup: {
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    fontWeight: '800',
    flex: 1,
  },
  textInput: {
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#E74C3C',
    marginTop: 4,
  },
});

export default AddTransactionModal;
