import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

const PETAL_COUNT = 15;

const Petal = ({ index }: { index: number }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = 4000 + Math.random() * 4000;
    const delay = Math.random() * 5000;

    const startAnimation = () => {
      moveAnim.setValue(0);
      rotateAnim.setValue(0);
      swayAnim.setValue(0);

      Animated.parallel([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: duration * 0.5,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(swayAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(swayAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => startAnimation());
    };

    const timeout = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeout);
  }, []);

  const xPos = useMemo(() => Math.random() * width, []);
  const opacity = useMemo(() => Math.random() * 0.4 + 0.3, []);

  const animatedStyle = {
    transform: [
      {
        translateY: moveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, height + 20],
        }),
      },
      {
        translateX: swayAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 40],
        }),
      },
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
    left: xPos,
    opacity,
  };

  return <Animated.View style={[styles.petal, animatedStyle]} />;
};

const PetalSystem: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PETAL_COUNT }).map((_, i) => (
        <Petal key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  petal: {
    position: 'absolute',
    width: 8,
    height: 10,
    backgroundColor: '#FFB7C5',
    borderRadius: 4,
    borderTopLeftRadius: 8,
  },
});

export default PetalSystem;
