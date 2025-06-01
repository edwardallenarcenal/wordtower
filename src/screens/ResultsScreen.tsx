import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { audioService } from '../services/audioService';
import appodealService from '../services/appodealService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route }: Props) {
  const { player, category, wordsFound, totalWords, timeLeft, level, isLevelComplete } = route.params;
  const isSuccess = wordsFound === totalWords;

  console.log('=== RESULTS SCREEN DEBUG ===');
  console.log('Route params:', route.params);
  console.log('isLevelComplete:', isLevelComplete);
  console.log('isSuccess:', isSuccess);
  console.log('Words found/total:', wordsFound, '/', totalWords);

  useEffect(() => {
    // Play appropriate sound when results screen loads
    if (isSuccess) {
      audioService.playSoundEffect('gameComplete');
    } else {
      audioService.playSoundEffect('error');
    }
  }, [isSuccess]);

  // Show banner ad when results screen loads
  useEffect(() => {
    const showBanner = async () => {
      try {
        console.log('📄 ResultsScreen: Showing banner ad...');
        await appodealService.showBanner('bottom');
      } catch (error) {
        console.log('❌ ResultsScreen: Failed to show banner:', error);
      }
    };

    showBanner();

    // Cleanup: hide banner when component unmounts
    return () => {
      appodealService.hideBanner().catch(console.error);
    };
  }, []);

  const handlePlayAgain = () => {
    audioService.playSoundEffect('buttonClick');
    navigation.replace('Game', {
      category
    });
  };

  const handleNextLevel = () => {
    audioService.playSoundEffect('buttonClick');
    navigation.replace('Game', {
      category,
      startLevel: level + 1 // Pass the next level to start at
    });
  };

  const handleGoHome = () => {
    audioService.playSoundEffect('buttonClick');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBackground, {backgroundColor: isSuccess ? COLORS.success : COLORS.error}]}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isLevelComplete ? '🎉 Level Complete!' : '⏰ Time\'s Up!'}
          </Text>
          <Text style={styles.categoryText}>
            {category.charAt(0).toUpperCase() + category.slice(1)} - Level {level}
          </Text>
          
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.achievementHeader}>
              <View style={[styles.statsCard, {backgroundColor: COLORS.white}]}>
                <Text style={styles.statsTitle}>📊 Game Stats</Text>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Words Found:</Text>
                  <Text style={[styles.statValue, {color: COLORS.success}]}>
                    {wordsFound} / {totalWords}
                  </Text>
                </View>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Time Remaining:</Text>
                  <Text style={[styles.statValue, {color: timeLeft > 30 ? COLORS.success : COLORS.error}]}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
                
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Completion:</Text>
                  <Text style={[styles.statValue, {color: isSuccess ? COLORS.success : COLORS.warning}]}>
                    {Math.round((wordsFound / totalWords) * 100)}%
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Score:</Text>
                  <Text style={[styles.statValue, {color: COLORS.primary}]}>
                    {((player?.words?.length || 0) * 100).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {player?.words && player.words.length > 0 && (
              <View style={styles.wordsSection}>
                <View style={[styles.wordsSectionHeader, {backgroundColor: COLORS.accent}]}>
                  <Text style={styles.wordsSectionTitle}>🎯 Words Collected</Text>
                </View>
                <View style={styles.wordsGrid}>
                  {(player?.words || []).map((word) => (
                    <View
                      key={word.id}
                      style={[styles.wordCard, {backgroundColor: COLORS.block.pink}]}
                    >
                      <Text style={styles.wordCardText}>{word.word.toUpperCase()}</Text>
                      <View style={styles.wordCardBlocks}>
                        {word.blocks.map((block, index) => (
                          <View key={index} style={styles.miniBlock}>
                            <Text style={styles.miniBlockText}>{block.letter}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            {isLevelComplete ? (
              // Level completed - show Next Level and Home buttons
              <>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleNextLevel}
                >
                  <View style={[styles.buttonBackground, {backgroundColor: COLORS.success}]}>
                    <Text style={styles.buttonText}>🚀 Next Level</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleGoHome}
                >
                  <View style={[styles.buttonBackground, {backgroundColor: COLORS.primary}]}>
                    <Text style={styles.buttonText}>🏠 Home</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              // Time ran out - show Play Again and Home buttons
              <>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={handlePlayAgain}
                >
                  <View style={[styles.buttonBackground, {backgroundColor: COLORS.secondary}]}>
                    <Text style={styles.buttonText}>🔄 Try Again</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleGoHome}
                >
                  <View style={[styles.buttonBackground, {backgroundColor: COLORS.primary}]}>
                    <Text style={styles.buttonText}>🏠 Home</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBackground: {
    flex: 1,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  categoryText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
    opacity: 0.9,
  },
  scrollContent: {
    flex: 1,
  },
  achievementHeader: {
    marginBottom: SIZES.margin,
  },
  statsCard: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    ...SIZES.shadowMedium,
  },
  statsTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin / 2,
  },
  statLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  statValue: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
  },
  wordsSection: {
    marginBottom: SIZES.margin * 2,
  },
  wordsSectionHeader: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 2,
    marginBottom: SIZES.margin,
    alignItems: 'center',
    ...SIZES.shadowSmall,
  },
  wordsSectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordCard: {
    width: '48%',
    borderRadius: SIZES.radius,
    padding: SIZES.padding / 2,
    marginBottom: SIZES.margin / 2,
    alignItems: 'center',
    ...SIZES.shadowSmall,
  },
  wordCardText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SIZES.margin / 4,
  },
  wordCardBlocks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  miniBlock: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniBlockText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.margin,
  },
  button: {
    flex: 1,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.margin / 2,
    overflow: 'hidden',
    ...SIZES.shadowMedium,
  },
  buttonBackground: {
    padding: SIZES.padding,
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  buttonText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
});
