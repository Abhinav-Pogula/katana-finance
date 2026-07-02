import React, { useState } from 'react';
import {
  StyleSheet, View, Text, Modal, TouchableOpacity,
  TouchableWithoutFeedback, SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CalculatorModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { s } = useResponsive();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handlePress = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      setJustEvaluated(false);
      return;
    }

    if (val === '⌫') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
      return;
    }

    if (val === '=') {
      try {
        const expr = equation + display;
        // Safe evaluation — only allow numbers and operators
        const sanitized = expr.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        const resultStr = parseFloat(result.toFixed(10)).toString();
        setDisplay(resultStr);
        setEquation('');
        setJustEvaluated(true);
      } catch {
        setDisplay('Error');
        setEquation('');
      }
      return;
    }

    const operators = ['+', '-', '×', '÷'];
    const isOperator = operators.includes(val);
    const opMap: { [k: string]: string } = { '×': '*', '÷': '/' };
    const actualOp = opMap[val] || val;

    if (isOperator) {
      setEquation(equation + display + actualOp);
      setDisplay('0');
      setJustEvaluated(false);
      return;
    }

    if (val === '.') {
      if (display.includes('.')) return;
      setDisplay(display + '.');
      return;
    }

    if (justEvaluated) {
      setDisplay(val);
      setJustEvaluated(false);
      return;
    }

    setDisplay(display === '0' ? val : display + val);
  };

  const bg = isDark ? '#1A1A1A' : '#FFFFFF';
  const btnBg = isDark ? '#2C2C2C' : '#F0F0F0';
  const operatorBg = isDark ? '#3A2A4A' : '#EDE0F8';

  const Button = ({ label, flex = 1, type = 'normal' }: { label: string; flex?: number; type?: 'normal' | 'operator' | 'accent' | 'clear' }) => {
    const bgColor =
      type === 'accent' ? colors.accent :
      type === 'operator' ? operatorBg :
      type === 'clear' ? '#E74C3C' :
      btnBg;

    const textColor =
      type === 'accent' ? '#FFF' :
      type === 'clear' ? '#FFF' :
      type === 'operator' ? colors.accent :
      colors.text;

    return (
      <TouchableOpacity
        style={[styles.btn, { flex, backgroundColor: bgColor, borderRadius: s(16), margin: s(4), height: s(64) }]}
        onPress={() => handlePress(label)}
        activeOpacity={0.7}
      >
        <Text style={[styles.btnText, { color: textColor, fontSize: s(20) }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { backgroundColor: bg, borderTopLeftRadius: s(32), borderTopRightRadius: s(32), paddingBottom: s(32) }]}>
        {/* Header */}
        <View style={[styles.handle, { backgroundColor: colors.divider, marginTop: s(12), marginBottom: s(8) }]} />
        <View style={[styles.header, { paddingHorizontal: s(20), paddingVertical: s(8) }]}>
          <Text style={[styles.title, { color: colors.text, fontSize: s(16) }]}>Calculator</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[{ color: colors.secondaryText, fontSize: s(14) }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Display */}
        <View style={[styles.display, { paddingHorizontal: s(24), paddingVertical: s(16) }]}>
          {equation ? (
            <Text style={[styles.equation, { color: colors.secondaryText, fontSize: s(14) }]}>{equation}</Text>
          ) : null}
          <Text style={[styles.displayText, { color: colors.text, fontSize: s(48) }]} numberOfLines={1} adjustsFontSizeToFit>
            {display}
          </Text>
        </View>

        {/* Buttons */}
        <View style={[styles.buttons, { paddingHorizontal: s(12) }]}>
          <View style={styles.row}>
            <Button label="C" type="clear" />
            <Button label="⌫" type="operator" />
            <Button label="÷" type="operator" />
            <Button label="×" type="operator" />
          </View>
          <View style={styles.row}>
            <Button label="7" />
            <Button label="8" />
            <Button label="9" />
            <Button label="-" type="operator" />
          </View>
          <View style={styles.row}>
            <Button label="4" />
            <Button label="5" />
            <Button label="6" />
            <Button label="+" type="operator" />
          </View>
          <View style={styles.row}>
          <Button label="1" />
          <Button label="2" />
          <Button label="3" />
          <Button label="=" type="accent" />

        </View>
        <View style={styles.row}>
          <Button label="0" flex={2} />
          <Button label="." />
          <Button label="⌫" type="operator" />
        </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '700' },
  display: { alignItems: 'flex-end' },
  equation: { marginBottom: 4 },
  displayText: { fontWeight: '300' },
  buttons: {},
  row: { flexDirection: 'row', marginBottom: 0 },
  btn: { justifyContent: 'center', alignItems: 'center' },
  btnText: { fontWeight: '600' },
});

export default CalculatorModal;