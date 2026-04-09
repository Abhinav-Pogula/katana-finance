import { useWindowDimensions, PixelRatio } from 'react-native';

/**
 * A hook to provide responsive sizing utilities based on the current window dimensions.
 * Highly useful for Capacitor WebViews where dimensions may shift (e.g. keyboard open).
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  // Baseline 375px (iPhone 11/12 mini / standard small Android)
  const scale = width / 375;

  /**
   * Scaled size according to screen width.
   * Useful for fonts and fixed icon sizes.
   */
  const s = (size: number) => {
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  };

  /**
   * Percentage based width.
   */
  const wp = (percent: number) => {
    return (percent * width) / 100;
  };

  /**
   * Percentage based height.
   */
  const hp = (percent: number) => {
    return (percent * height) / 100;
  };

  return {
    width,
    height,
    s,
    wp,
    hp,
    isSmall: width < 360,
    isMedium: width >= 360 && width < 768,
    isLarge: width >= 768,
  };
};
