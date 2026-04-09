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
    console.log('🚀 Form Submission: Starting...', data);
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

      console.log('📦 Form Submission: Object prepared', newTx);
      await addTransaction(newTx);
      console.log('✨ Form Submission: Success!');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('🔥 Form Submission: Failed', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.handle, { backgroundColor: colors.divider }]} />
              
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Transaction</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Type Toggle */}
                <View style={[styles.typeToggle, { backgroundColor: !isDark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' }]}>
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton, 
                      activeType === 'expense' && { backgroundColor: colors.expense }
                    ]}
                    onPress={() => setValue('type', 'expense')}
                  >
                    <Text style={[
                      styles.toggleText, 
                      { color: activeType === 'expense' ? '#FFF' : colors.secondaryText }
                    ]}>Expense</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton, 
                      activeType === 'income' && { backgroundColor: colors.income }
                    ]}
                    onPress={() => setValue('type', 'income')}
                  >
                    <Text style={[
                      styles.toggleText, 
                      { color: activeType === 'income' ? '#FFF' : colors.secondaryText }
                    ]}>Income</Text>
                  </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>Amount</Text>
                  <Controller
                    control={control}
                    name="amount"
                    rules={{ required: 'Amount is required', pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Invalid amount' } }}
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.amountInputContainer}>
                        <Text style={[styles.currency, { color: colors.text }]}>$</Text>
                        <TextInput
                          style={[styles.amountInput, { color: colors.text }]}
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
                  {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
                </View>

                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.secondaryText }]}>What was it for?</Text>
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
                            backgroundColor: isDark ? '#1C1C1C' : '#F9F9F9',
                            borderColor: isDark ? '#333' : colors.divider,
                            borderWidth: 1,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
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
                  style={[styles.saveButton, { backgroundColor: colors.accent }]}
                  onPress={handleSubmit(onSubmit, (errors) => {
                    console.log('⚠️ Validation Errors:', errors);
                  })}
                >
                  <Text style={styles.saveButtonText}>Save Transaction</Text>
                </TouchableOpacity>
                
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    flex: 1,
  },
  textInput: {
    fontSize: 16,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
});

export default AddTransactionModal;
