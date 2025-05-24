import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  interpolateColor,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { LetterBlock } from '../components/LetterBlock';
import { useGameLogic } from '../hooks/useGameLogic';
import { audioService } from '../services/audioService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Game'>;
  route: RouteProp<RootStackParamList, 'Game'>;
};

export default function GameScreen({ navigation, route }: Props) {
  const { category, startLevel } = route.params;
  const { 
    gameState, 
    selectBlock, 
    groupWord, 
    resetWord,
    startGame,
    ungroupWord,
    getHint,
    startNextLevel
  } = useGameLogic(category, startLevel);

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [lastFoundWord, setLastFoundWord] = useState('');
  const [hintBlockIds, setHintBlockIds] = useState<string[]>([]);
  const [hintActive, setHintActive] = useState(false);
  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: undefined,
    onCancel: undefined,
    onClose: undefined
  });

  // Get screen dimensions for responsive design
  const { width: screenWidth } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 480;
  const isTablet = screenWidth >= 480 && screenWidth < 768;
  const isLargeScreen = screenWidth >= 768;

  // Apply responsive styles based on screen size
  const containerStyle = isLargeScreen ? [styles.container, { maxWidth: 800, alignSelf: 'center' as const }] : styles.container;
  const gameAreaStyle = [
    styles.gameArea,
    isSmallScreen && { paddingHorizontal: SIZES.padding / 2 },
    isLargeScreen && { paddingHorizontal: SIZES.padding * 2 }
  ];
  
  // Pre-initialize all animation values at the component level
  const validationScaleValue = useSharedValue(1);
  const validationOpacityValue = useSharedValue(0);
  const wordContainerValue = useSharedValue(1);
  const wordFoundValue = useSharedValue(0);
  const timerValue = useSharedValue(0);
  const blockValue = useSharedValue(0);
  const hintPulseValue = useSharedValue(0);
  
  // Create a fixed array of shared values for word animations (max 20 words)
  // We use individual hooks to avoid dynamic hook creation
  const MAX_WORDS = 20;
  const word0Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word1Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word2Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word3Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word4Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word5Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word6Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word7Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word8Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word9Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word10Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word11Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word12Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word13Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word14Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word15Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word16Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word17Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word18Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };
  const word19Values = { scale: useSharedValue(0.8), opacity: useSharedValue(0), press: useSharedValue(1) };

  // Combine into an array for easy indexing
  const wordAnimationValues = [
    word0Values, word1Values, word2Values, word3Values, word4Values,
    word5Values, word6Values, word7Values, word8Values, word9Values,
    word10Values, word11Values, word12Values, word13Values, word14Values,
    word15Values, word16Values, word17Values, word18Values, word19Values
  ];

  // Animation pools for word items
  const wordsAnimations = useRef(wordAnimationValues);

  // Create animated styles
  const validationStyle = useAnimatedStyle(() => ({
    opacity: validationOpacityValue?.value ?? 0,
    transform: [{ scale: validationScaleValue?.value ?? 1 }],
    backgroundColor: feedbackType === 'success' ? COLORS.success : COLORS.error,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  }), [feedbackType]);

  const wordContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wordContainerValue?.value ?? 1 }],
  }));

  const wordFoundStyle = useAnimatedStyle(() => ({
    opacity: (wordFoundValue?.value ?? 0) > 0.3 ? 1 : 0,
    transform: [
      { scale: 1 + (wordFoundValue?.value ?? 0) * 0.2 },
      { translateY: (wordFoundValue?.value ?? 0) * -5 }
    ],
    backgroundColor: COLORS.block.green,
  }));

  const timerStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      timerValue?.value ?? 0,
      [0, 0.5, 1],
      [COLORS.text, COLORS.error, COLORS.text]
    ),
    fontWeight: (timerValue?.value ?? 0) > 0.5 ? 'bold' : 'normal',
  }));

  // Initialize animations for discovered words
  useEffect(() => {
    const updateWordAnimations = () => {
      // Update each animation value based on discovered words
      for (let i = 0; i < MAX_WORDS; i++) {
        if (i < gameState.discoveredWords.length) {
          wordAnimationValues[i].scale.value = withDelay(i * 100, withSpring(1, { damping: 12, stiffness: 100 }));
          wordAnimationValues[i].opacity.value = withDelay(i * 100, withSpring(1));
        } else {
          wordAnimationValues[i].scale.value = 0.8;
          wordAnimationValues[i].opacity.value = 0;
          wordAnimationValues[i].press.value = 1;
        }
      }
    };
    
    updateWordAnimations();
  }, [gameState.discoveredWords.length]);

  useEffect(() => {
    if (lastFoundWord && gameState.discoveredWords.includes(lastFoundWord)) {
      const triggerWordFoundAnimation = () => {
        wordFoundValue.value = withSequence(
          withTiming(1, { duration: 500, easing: Easing.elastic(1.2) }),
          withDelay(1500, withTiming(0, { duration: 200 }))
        );
      };
      
      triggerWordFoundAnimation();
    }
  }, [lastFoundWord, gameState.discoveredWords]);

  useEffect(() => {
    const triggerTimerAnimation = () => {
      if (gameState.timeRemaining <= 30 && gameState.timeRemaining > 0 && gameState.gameStatus === 'playing' && timerValue) {
        const pulseSpeed = Math.max(300, 1000 - (30 - gameState.timeRemaining) * 30);
        timerValue.value = withSequence(
          withTiming(1, { duration: pulseSpeed / 2 }),
          withTiming(0, { duration: pulseSpeed / 2 })
        );
      }
    };

    triggerTimerAnimation();
  }, [gameState.timeRemaining, gameState.gameStatus, timerValue]);

  // Create all word animation styles at the top level (React hooks rules compliant)
  const wordAnimationStyle0 = useAnimatedStyle(() => {
    const values = wordAnimationValues[0];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle1 = useAnimatedStyle(() => {
    const values = wordAnimationValues[1];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle2 = useAnimatedStyle(() => {
    const values = wordAnimationValues[2];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle3 = useAnimatedStyle(() => {
    const values = wordAnimationValues[3];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle4 = useAnimatedStyle(() => {
    const values = wordAnimationValues[4];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle5 = useAnimatedStyle(() => {
    const values = wordAnimationValues[5];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle6 = useAnimatedStyle(() => {
    const values = wordAnimationValues[6];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle7 = useAnimatedStyle(() => {
    const values = wordAnimationValues[7];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle8 = useAnimatedStyle(() => {
    const values = wordAnimationValues[8];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle9 = useAnimatedStyle(() => {
    const values = wordAnimationValues[9];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle10 = useAnimatedStyle(() => {
    const values = wordAnimationValues[10];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle11 = useAnimatedStyle(() => {
    const values = wordAnimationValues[11];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle12 = useAnimatedStyle(() => {
    const values = wordAnimationValues[12];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle13 = useAnimatedStyle(() => {
    const values = wordAnimationValues[13];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle14 = useAnimatedStyle(() => {
    const values = wordAnimationValues[14];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle15 = useAnimatedStyle(() => {
    const values = wordAnimationValues[15];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle16 = useAnimatedStyle(() => {
    const values = wordAnimationValues[16];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle17 = useAnimatedStyle(() => {
    const values = wordAnimationValues[17];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle18 = useAnimatedStyle(() => {
    const values = wordAnimationValues[18];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  const wordAnimationStyle19 = useAnimatedStyle(() => {
    const values = wordAnimationValues[19];
    const scaleValue = (values.scale?.value ?? 1) * (values.press?.value ?? 1);
    const opacityValue = values.opacity?.value ?? 0;
    return {
      transform: [{ scale: typeof scaleValue === 'number' ? scaleValue : 1 }],
      opacity: typeof opacityValue === 'number' ? opacityValue : 0,
    };
  });

  // Array of all animation styles for easy access
  const wordAnimationStyles = [
    wordAnimationStyle0, wordAnimationStyle1, wordAnimationStyle2, wordAnimationStyle3, wordAnimationStyle4,
    wordAnimationStyle5, wordAnimationStyle6, wordAnimationStyle7, wordAnimationStyle8, wordAnimationStyle9,
    wordAnimationStyle10, wordAnimationStyle11, wordAnimationStyle12, wordAnimationStyle13, wordAnimationStyle14,
    wordAnimationStyle15, wordAnimationStyle16, wordAnimationStyle17, wordAnimationStyle18, wordAnimationStyle19
  ];

  // Animation for custom alert
  const alertOpacity = useSharedValue(0);
  const alertScale = useSharedValue(0.8);

  const alertStyle = useAnimatedStyle(() => ({
    opacity: alertOpacity.value,
    transform: [{ scale: alertScale.value }],
  }));

  const showCustomAlert = useCallback((title: string, message: string, onClose?: () => void) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type: 'info',
      onClose: onClose || (() => {})
    });
    
    // Animate in
    alertOpacity.value = withTiming(1, { duration: 300 });
    alertScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const showCustomConfirm = useCallback((title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type: 'confirm',
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {})
    });
    
    // Animate in
    alertOpacity.value = withTiming(1, { duration: 300 });
    alertScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const hideCustomAlert = useCallback(() => {
    // Animate out
    alertOpacity.value = withTiming(0, { duration: 200 });
    alertScale.value = withTiming(0.8, { duration: 200 });
    
    setTimeout(() => {
      setCustomAlert(prev => ({ ...prev, visible: false }));
      if (customAlert.onClose) {
        customAlert.onClose();
      }
    }, 200);
  }, [customAlert.onClose]);

  // Custom Alert Component
  const renderCustomAlert = () => {
    if (!customAlert.visible) return null;

    const handleConfirm = () => {
      audioService.playSoundEffect('buttonClick');
      hideCustomAlert();
      if (customAlert.onConfirm) {
        customAlert.onConfirm();
      }
    };

    const handleCancel = () => {
      audioService.playSoundEffect('buttonClick');
      hideCustomAlert();
      if (customAlert.onCancel) {
        customAlert.onCancel();
      }
    };

    const handleInfoClose = () => {
      audioService.playSoundEffect('buttonClick');
      hideCustomAlert();
      if (customAlert.onClose) {
        customAlert.onClose();
      }
    };

    return (
      <View style={styles.alertOverlay}>
        <Animated.View style={[styles.alertContainer, alertStyle]}>
          <LinearGradient
            colors={[COLORS.background, COLORS.block.pink]}
            style={styles.alertGradient}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>{customAlert.title}</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertMessage}>{customAlert.message}</Text>
            </View>
            
            {customAlert.type === 'info' ? (
              <TouchableOpacity
                style={styles.alertButton}
                onPress={handleInfoClose}
                activeOpacity={0.8}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.alertButtonContainer}>
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonSecondary]}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.alertButtonText, styles.alertButtonTextSecondary]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.alertButton, styles.alertButtonPrimary]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={styles.alertButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };

  // Calculate responsive block size
  const getLetterBlockStyle = useCallback(() => {
    if (isSmallScreen) {
      return { width: 36, height: 36, margin: 2 };
    } else if (isTablet) {
      return { width: 45, height: 45, margin: 3 };
    }
    return {}; // Use default size for large screens
  }, [isSmallScreen, isTablet]);

  const handleGroupWord = useCallback(async () => {
    // Make sure all animation values are valid numbers first
    if (wordContainerValue) {
      wordContainerValue.value = withSequence(
        withTiming(0.92, { duration: 80 }),
        withTiming(1.08, { duration: 120 }),
        withTiming(1, { duration: 100, easing: Easing.elastic(1.2) })
      );
    }
    
    if (blockValue) {
      blockValue.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400, easing: Easing.elastic(2) })
      );
    }

    const result = await groupWord();

    if (result.success) {
      // Check if we need to show validation alert
      if (result.needsValidation && result.invalidWords) {
        showCustomAlert(
          'Invalid Words Found! 🤔',
          `You've used all blocks, but some words are incorrect:\n\n${result.invalidWords.map(word => `• ${word.toUpperCase()}`).join('\n')}\n\nPlease ungroup and fix these words to win the game! ✨`
        );
        setFeedbackType('error');
        setFeedbackMessage('Some words are incorrect - check the message!');
      } else {
        setFeedbackType('success');
        setFeedbackMessage('Word grouped!');
        setLastFoundWord(gameState.currentWord.blocks.map(b => b.letter).join('').toLowerCase());
      }
      
      if (wordFoundValue) {
        wordFoundValue.value = withSequence(
          withTiming(0, { duration: 10 }),
          withTiming(1, { duration: 600, easing: Easing.elastic(1) }),
          withDelay(2000, withTiming(0, { duration: 300 }))
        );
      }
      
      if (validationScaleValue) {
        validationScaleValue.value = withSequence(
          withSpring(1.3, { damping: 6 }),
          withSpring(1, { damping: 10 })
        );
      }
      
      if (validationOpacityValue) {
        validationOpacityValue.value = withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(1500, withTiming(0, { duration: 200 }))
        );
      }

      if (result.isGameFinished) {
        console.log('=== GAME FINISHED - NAVIGATING TO RESULTS ===');
        console.log('result.isLevelComplete:', result.isLevelComplete);
        console.log('result.wordsFound:', result.wordsFound);
        console.log('result.totalWords:', result.totalWords);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigation.replace('Results', {
          player: result.player,
          category: gameState.category,
          wordsFound: result.wordsFound,
          totalWords: result.totalWords,
          timeLeft: result.timeLeft,
          level: gameState.level,
          isLevelComplete: result.isLevelComplete || false
        });
      }
    } else {
      setFeedbackType('error');
      setFeedbackMessage(result.message || 'Try again!');
      
      if (validationScaleValue) {
        validationScaleValue.value = withSequence(
          withSpring(1.1),
          withSpring(1)
        );
      }
      
      if (validationOpacityValue) {
        validationOpacityValue.value = withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(1500, withTiming(0, { duration: 200 }))
        );
      }
      
      setTimeout(() => {
        try {
          resetWord();
        } catch (error) {
          console.error('Error resetting word:', error);
          if (validationOpacityValue) {
            validationOpacityValue.value = withTiming(0, { duration: 200 });
          }
        }
      }, 1800);
    }
  }, [groupWord, gameState.currentWord.blocks, navigation, resetWord]);

  const handleUngroupWord = useCallback((word: string, index: number) => {
    // Use the scalable animation system
    if (index < wordAnimationValues.length && wordAnimationValues[index]?.press) {
      wordAnimationValues[index].press.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
    
    ungroupWord(word);
    
    setFeedbackType('success');
    setFeedbackMessage(`Returned "${word}" to blocks`);
    
    if (validationOpacityValue) {
      validationOpacityValue.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1500, withTiming(0, { duration: 200 }))
      );
    }
  }, [ungroupWord]);

  // Hint function to highlight one correct word
  const handleHint = useCallback(() => {
    // Clear any previous hint
    setHintBlockIds([]);
    setHintActive(false);
    
    const hint = getHint();
    
    if (!hint) {
      showCustomAlert(
        'No Hints Available! 🤔',
        'No valid words can be formed with the current available blocks. Try ungrouping some words or continue playing!'
      );
      return;
    }

    // Set hint state
    setHintBlockIds(hint.blockIds);
    setHintActive(true);
    
    // Show hint message
    setFeedbackType('success');
    setFeedbackMessage(`Hint: Try forming "${hint.word.toUpperCase()}"! ✨`);
    
    // Animate feedback
    if (validationOpacityValue) {
      validationOpacityValue.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(3000, withTiming(0, { duration: 300 }))
      );
    }

    // Animate hint blocks with pulsing effect
    hintPulseValue.value = withSequence(
      withTiming(1, { duration: 500 }),
      withDelay(3000, withTiming(0, { duration: 300 }))
    );

    // Clear hint after 3.5 seconds
    setTimeout(() => {
      setHintBlockIds([]);
      setHintActive(false);
    }, 3500);
  }, [getHint, showCustomAlert]);

  // Start the game when component mounts
  useEffect(() => {
    startGame();
  }, [startGame]);

  // Navigate to results when timer reaches zero
  useEffect(() => {
    if (gameState.timeRemaining === 0 && gameState.gameStatus === 'finished') {
      setTimeout(() => {
        navigation.replace('Results', {
          player: gameState.player,
          category: gameState.category,
          wordsFound: gameState.discoveredWords.length,
          totalWords: gameState.targetWords.length,
          timeLeft: 0,
          level: gameState.level,
          isLevelComplete: false // Time ran out, so level wasn't completed
        });
      }, 1000);
    }
  }, [gameState.timeRemaining, gameState.gameStatus, navigation, gameState.player, 
      gameState.category, gameState.discoveredWords.length, gameState.targetWords.length]);

  // Render functions
  const renderSelectedBlocks = useCallback(() => (
    <Animated.View style={[styles.selectedBlocksContainer, wordContainerStyle]}>
      {gameState.currentWord.blocks.map((block, index) => (
        <LetterBlock
          key={block.id}
          letter={block.letter}
          colorIndex={index}
          isSelected={true}
          style={getLetterBlockStyle()}
        />
      ))}
    </Animated.View>
  ), [gameState.currentWord.blocks, wordContainerStyle, getLetterBlockStyle]);

  const renderAvailableBlocks = useCallback(() => (
    <View style={styles.availableBlocksContainer}>
      {gameState.availableBlocks.map((block, index) => {
        if (block.isUsed) return null;
        
        const isHintBlock = hintActive && hintBlockIds.includes(block.id);
        const blockStyle = getLetterBlockStyle();
        const hintStyle = isHintBlock ? {
          shadowColor: '#FFD700',
          shadowOpacity: 0.8,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
          borderWidth: 2,
          borderColor: '#FFD700',
        } : {};
        
        return (
          <LetterBlock
            key={block.id}
            letter={block.letter}
            colorIndex={index}
            onPress={() => selectBlock(block)}
            style={{ ...blockStyle, ...hintStyle }}
          />
        );
      })}
    </View>
  ), [gameState.availableBlocks, selectBlock, getLetterBlockStyle, hintActive, hintBlockIds]);



  const renderGroupedWords = useCallback(() => (
    <View style={styles.wordsFound}>
      <Text style={styles.sectionTitle}>Words Grouped (tap to return to blocks): {gameState.discoveredWords.length}</Text>
      <ScrollView 
        style={styles.wordsList}
        contentContainerStyle={{
          paddingVertical: 4,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {gameState.discoveredWords.length === 0 ? (
          <Text style={styles.emptyGroupedText}>
            Find words to see them here!
          </Text>
        ) : (
          gameState.discoveredWords.map((word, index) => {
            return (
              <TouchableOpacity
                key={word}
                onPress={() => handleUngroupWord(word, index)}
                activeOpacity={0.7}
                style={styles.groupedWordContainer}
              >
                <View style={styles.groupedWordItem}>
                  <View style={styles.letterBlocksRow}>
                    {word.toUpperCase().split('').map((letter, letterIndex) => {
                      const blockColors = Object.values(COLORS.block);
                      const blockColor = blockColors[letterIndex % blockColors.length];
                      return (
                        <View key={letterIndex} style={[styles.miniLetterBlock, { backgroundColor: blockColor }]}>
                          <Text style={styles.miniLetterText}>{letter}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={styles.ungroupHint}>↺</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  ), [gameState.discoveredWords, handleUngroupWord]);

  return (
    <SafeAreaView style={containerStyle}>
      <LinearGradient
        colors={[COLORS.background, COLORS.block.blue]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={() => {
              audioService.playSoundEffect('buttonClick');
              showCustomConfirm(
                'End Game? 🏠',
                'Are you sure you want to end the game and return home?',
                () => navigation.navigate('Home')
              );
            }}
          >
            <Text style={styles.homeButtonText}>⌂</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.gameInfoContainer}>
              <Text style={styles.categoryText}>Category: {category}</Text>
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Level {gameState.level}</Text>
                <Text style={styles.levelProgressText}>
                  {gameState.discoveredWords.length}/{gameState.wordsPerLevel} words
                </Text>
              </View>
            </View>
            <View style={styles.timerContainer}>
              <Animated.Text style={[
                styles.timerText, 
                gameState.timeRemaining < 30 ? styles.timerWarning : {},
                gameState.timeRemaining <= 30 ? timerStyle : {}
              ]}>
                Time: {Math.floor(gameState.timeRemaining / 60)}:
                {(gameState.timeRemaining % 60).toString().padStart(2, '0')}
              </Animated.Text>
            </View>
          </View>
        </View>

        <View style={[styles.gameArea, gameAreaStyle]}>
          
          {lastFoundWord && (
            <Animated.View style={[styles.lastFoundWordContainer, wordFoundStyle]}>
              <Text style={styles.lastFoundWordText}>+ {lastFoundWord}</Text>
            </Animated.View>
          )}

          {renderGroupedWords()}

          <View style={styles.currentWordArea}>
            {renderSelectedBlocks()}
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Select letters to form one of the target words
              </Text>
              <Text style={styles.instructionText}>
                Then click "Group Word" to add it to your collection
              </Text>
              <Text style={styles.instructionText}>
                Win by finding all target words or using all blocks
              </Text>
            </View>
            <Animated.View style={[styles.validationFeedback, validationStyle]}>
              <Text style={[
                styles.validationText,
                { color: feedbackType === 'success' ? COLORS.text : '#FFF' }
              ]}>
                {feedbackMessage}
              </Text>
            </Animated.View>
          </View>

          <View style={styles.blocksArea}>
            {renderAvailableBlocks()}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]}
              onPress={() => {
                audioService.playSoundEffect('buttonClick');
                resetWord();
              }}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.hintButton]}
              onPress={() => {
                audioService.playSoundEffect('buttonClick');
                handleHint();
              }}
            >
              <Text style={styles.buttonText}>💡 Hint</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.groupButton]}
              onPress={() => {
                audioService.playSoundEffect('buttonClick');
                handleGroupWord();
              }}
            >
              <Text style={styles.buttonText}>Group Word</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Custom Alert */}
        {renderCustomAlert()}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: SIZES.padding,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SIZES.padding,
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  homeButtonText: {
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  categoryText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  gameInfoContainer: {
    flex: 1,
  },
  levelContainer: {
    backgroundColor: COLORS.block.purple,
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: SIZES.padding / 4,
    borderRadius: SIZES.radius / 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.background,
    textAlign: 'center',
  },
  levelProgressText: {
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
    color: COLORS.background,
    textAlign: 'center',
    marginTop: 2,
  },
  gameArea: {
    flex: 1,
    padding: SIZES.padding,
  },
  wordsFound: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    minHeight: 160,
    maxHeight: 280,
    borderWidth: 1,
    borderColor: COLORS.block.pink,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.padding / 2,
  },
  wordsList: {
    flex: 1,
  },
  wordItem: {
    backgroundColor: COLORS.block.pink,
    padding: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding / 2,
  },
  wordText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyGroupedText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  groupedWordContainer: {
    marginBottom: SIZES.padding / 2,
  },
  groupedWordItem: {
    backgroundColor: COLORS.block.pink,
    padding: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  letterBlocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniLetterBlock: {
    borderRadius: 6,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  miniLetterText: {
    color: COLORS.text,
    fontSize: SIZES.small,
    fontFamily: FONTS.bold,
    textAlign: 'center',
  },
  ungroupHint: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    fontFamily: FONTS.bold,
  },
  currentWordArea: {
    minHeight: 80,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  selectedBlocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableBlocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.margin,
  },
  blocksArea: {
    flex: 0.6,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.margin,
  },
  button: {
    flex: 1,
    paddingVertical: SIZES.padding / 1.5,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.margin / 4,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.block.orange,
  },
  hintButton: {
    backgroundColor: COLORS.block.purple,
  },
  submitButton: {
    backgroundColor: COLORS.block.green,
  },
  groupButton: {
    backgroundColor: COLORS.block.green,
  },
  buttonText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  validationFeedback: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: SIZES.padding,
  },
  validationText: {
    color: COLORS.success,
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
  },
  timerContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    minWidth: 80,
    alignItems: 'center',
  },
  timerText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  timerWarning: {
    color: COLORS.error,
    fontFamily: FONTS.bold,
  },
  instructionContainer: {
    marginTop: 8,
    marginBottom: 4,
    padding: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    alignSelf: 'center',
  },
  instructionText: {
    fontSize: SIZES.small,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
  },
  targetWordsContainer: {
    marginVertical: SIZES.margin / 2,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    maxHeight: '25%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  targetWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  targetWordItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  targetWordFound: {
    backgroundColor: COLORS.block.green,
  },
  targetWordText: {
    fontSize: SIZES.small - 2,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  targetWordTextFound: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  lastFoundWordContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: COLORS.block.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  lastFoundWordText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: '#fff',
    textAlign: 'center',
  },
  clickHintText: {
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginLeft: 4,
  },
  // Custom Alert Styles
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: SIZES.radius * 2,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  alertGradient: {
    padding: SIZES.padding * 1.5,
  },
  alertHeader: {
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  alertTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  alertBody: {
    marginBottom: SIZES.margin * 1.5,
  },
  alertMessage: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: SIZES.medium * 1.4,
  },
  alertButton: {
    backgroundColor: COLORS.block.green,
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  alertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.margin,
  },
  alertButtonPrimary: {
    backgroundColor: COLORS.block.green,
    flex: 1,
  },
  alertButtonSecondary: {
    backgroundColor: COLORS.gray,
    flex: 1,
  },
  alertButtonText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  alertButtonTextSecondary: {
    color: COLORS.background,
  },
});
