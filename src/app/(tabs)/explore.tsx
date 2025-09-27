// import { BlurView } from 'expo-blur';
// import { useEffect, useRef } from 'react';
// import {
//   Animated,
//   Dimensions,
//   PanResponder,
//   Platform,
//   Pressable,
//   StyleSheet,
//   Text,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// /**
//  * ModalBottomSheet
//  * - Slide up modal occupying 2/3 of the screen height
//  * - Backdrop: blurred + dimmed (glass effect)
//  * - Rounded top corners
//  * - Tap backdrop to close
//  * - Swipe down to dismiss
//  *
//  * Props:
//  *  - visible: boolean
//  *  - onClose: () => void
//  *  - children: ReactNode
//  *  - snap = 0.66 (fraction of screen height)
//  *  - closeOnBackdropPress = true
//  *
//  * Usage (Expo):
//  * <ModalBottomSheet visible={open} onClose={() => setOpen(false)}>
//  *   <YourContent />
//  * </ModalBottomSheet>
//  */

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// export default function ModalBottomSheet({
//   visible,
//   onClose,
//   children,
//   snap = 0.66,
//   closeOnBackdropPress = true,
// }) {
//   const sheetHeight = SCREEN_HEIGHT * snap;
//   const animY = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // sheet translateY
//   const backdropOpacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (visible) {
//       // open
//       Animated.parallel([
//         Animated.timing(backdropOpacity, {
//           toValue: 1,
//           duration: 250,
//           useNativeDriver: true,
//         }),
//         Animated.timing(animY, {
//           toValue: SCREEN_HEIGHT - sheetHeight,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       // close
//       Animated.parallel([
//         Animated.timing(backdropOpacity, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(animY, {
//           toValue: SCREEN_HEIGHT,
//           duration: 220,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [visible, animY, backdropOpacity, sheetHeight]);

//   // Swipe to dismiss
//   const pan = useRef(new Animated.Value(0)).current;
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => false,
//       onMoveShouldSetPanResponder: (_, gestureState) => {
//         // only start responder for vertical moves
//         return Math.abs(gestureState.dy) > 6;
//       },
//       onPanResponderMove: (_, gestureState) => {
//         if (gestureState.dy > 0) {
//           pan.setValue(gestureState.dy);
//         }
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         const shouldClose = gestureState.dy > sheetHeight * 0.25 || gestureState.vy > 1.2;
//         if (shouldClose) {
//           // animate out
//           Animated.parallel([
//             Animated.timing(backdropOpacity, {
//               toValue: 0,
//               duration: 180,
//               useNativeDriver: true,
//             }),
//             Animated.timing(animY, {
//               toValue: SCREEN_HEIGHT,
//               duration: 200,
//               useNativeDriver: true,
//             }),
//           ]).start(() => {
//             pan.setValue(0);
//             onClose && onClose();
//           });
//         } else {
//           // spring back
//           Animated.spring(pan, {
//             toValue: 0,
//             useNativeDriver: true,
//           }).start();
//         }
//       },
//     })
//   ).current;

//   // combined translate: base animY + pan
//   const translateY = Animated.add(
//     Animated.subtract(animY, SCREEN_HEIGHT - sheetHeight), // value 0 when opened
//     pan
//   ).interpolate({
//     inputRange: [0, sheetHeight],
//     outputRange: [SCREEN_HEIGHT - sheetHeight, SCREEN_HEIGHT],
//     extrapolate: 'clamp',
//   });

//   // backdrop style: blur + dim
//   const backdropStyle = {
//     opacity: backdropOpacity,
//   };

//   return (
//     <View pointerEvents={visible ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
//       {/* Backdrop */}
//       <Animated.View style={[styles.backdropWrap, backdropStyle]}>
//         <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
//         {/* dim overlay on top of blur */}
//         <Animated.View
//           style={[
//             StyleSheet.absoluteFill,
//             { backgroundColor: 'rgba(0,0,0,0.25)', opacity: backdropOpacity },
//           ]}
//         />
//         {/* touch catcher */}
//         {closeOnBackdropPress ? (
//           <TouchableWithoutFeedback onPress={() => onClose && onClose()}>
//             <View style={StyleSheet.absoluteFill} />
//           </TouchableWithoutFeedback>
//         ) : null}
//       </Animated.View>

//       {/* Sheet */}
//       <Animated.View
//         style={[
//           styles.sheet,
//           {
//             height: sheetHeight,
//             transform: [
//               {
//                 translateY: translateY,
//               },
//             ],
//           },
//         ]}
//         {...panResponder.panHandlers}
//       >
//         <SafeAreaView edges={["top"]} style={styles.safeArea}>
//           {/* drag indicator */}
//           <View style={styles.indicatorWrap} pointerEvents="none">
//             <View style={styles.indicator} />
//           </View>

//           {/* header with close button */}
//           <View style={styles.header}>
//             <View style={{ flex: 1 }} />
//             <Pressable onPress={() => onClose && onClose()} style={styles.closeBtn}>
//               <Text style={styles.closeText}>✕</Text>
//             </Pressable>
//           </View>

//           {/* content */}
//           <View style={styles.content}>{children}</View>
//         </SafeAreaView>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   backdropWrap: {
//     ...StyleSheet.absoluteFillObject,
//     zIndex: 10,
//   },
//   sheet: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     zIndex: 20,
//     bottom: 0,
//     backgroundColor: Platform.OS === 'android' ? '#111' : 'transparent',
//     borderTopLeftRadius: 18,
//     borderTopRightRadius: 18,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -6 },
//     shadowOpacity: 0.18,
//     shadowRadius: 12,
//     elevation: 20,
//   },
//   safeArea: {
//     flex: 1,
//     backgroundColor: 'rgba(255,255,255,0.06)', // slight glassy fill so contents readable over blur
//     paddingHorizontal: 16,
//   },
//   indicatorWrap: {
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 6,
//   },
//   indicator: {
//     width: 48,
//     height: 4,
//     borderRadius: 3,
//     backgroundColor: 'rgba(255,255,255,0.48)',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 6,
//   },
//   closeBtn: {
//     padding: 6,
//     borderRadius: 20,
//   },
//   closeText: {
//     fontSize: 18,
//     color: 'white',
//   },
//   content: {
//     flex: 1,
//     paddingBottom: 20,
//   },
// });
