import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const SakuraTree: React.FC = () => {
  const branchPath1 = "M0,0 Q50,100 0,200 T0,400";
  const branchPath2 = "M" + width + ",0 Q" + (width-50) + ",100 " + width + ",200 T" + width + ",400";

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        <Path
          d={branchPath1}
          stroke="#3E2723"
          strokeWidth="4"
          fill="none"
        />
        <Path
          d={branchPath2}
          stroke="#3E2723"
          strokeWidth="4"
          fill="none"
        />
      </Svg>
    </View>
  );
};

export default SakuraTree;
