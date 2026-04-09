import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const CreaseLine = ({ id }: { id: number }) => {
  const style = useMemo(() => {
    // Deterministic "randomness" based on id if we want, but simple random is fine for this
    const angle = (Math.random() * 30 - 15) + (id % 2 === 0 ? 45 : -45);
    const top = Math.random() * height;
    const left = -width * 0.5 + Math.random() * width;
    const opacity = 0.02 + Math.random() * 0.03;
    
    return {
      position: 'absolute' as const,
      top,
      left,
      width: width * 2,
      height: 1,
      backgroundColor: '#000000',
      opacity,
      transform: [{ rotate: `${angle}deg` }],
    };
  }, [id]);

  return <View style={style} pointerEvents="none" />;
};

const CrumpledPaper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const creases = useMemo(() => Array.from({ length: 12 }).map((_, i) => i), []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.textureContainer} pointerEvents="none">
        {creases.map((id) => (
          <CreaseLine key={id} id={id} />
        ))}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  textureContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});

export default CrumpledPaper;
