import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { audioService } from '../services/audioService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route }: Props) {
  const { player, category, wordsFound, totalWords, timeLeft, level } = route.params;
  const isSuccess = wordsFound === totalWords;

  useEffect(() => {
    // Play appropriate sound when results screen loads
    if (isSuccess) {
      audioService.playSoundEffect('gameComplete');
    } else {
      audioService.playSoundEffect('error');
    }
  }, [isSuccess]);

  const handlePlayAgain = () => {
    audioService.playSoundEffect('buttonClick');
    navigation.replace('Game', {
      category
    });
  };

  const handleGoHome = () => {
    audioService.playSoundEffect('buttonClick');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, isSuccess ? COLORS.block.green : COLORS.block.orange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.title}>{isSuccess ? 'Success!' : 'Game Over!'}</Text>
        <Text style={styles.categoryText}>Category: {category}</Text>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.playerCard, isSuccess && styles.winnerCard]}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Level Reached:</Text>
                <Text style={styles.statValue}>{level}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Words Found:</Text>
                <Text style={styles.statValue}>{wordsFound}/{totalWords}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time Left:</Text>
                <Text style={styles.statValue}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            </View>
            <View style={styles.wordsContainer}>
              <Text style={styles.wordsTitle}>Words Grouped:</Text>
              <View style={styles.wordsList}>
                {player.words.map((word) => (
                  <View key={word.id} style={styles.wordItem}>
                    <Text style={styles.wordText}>{word.word}</Text>
                    <View style={styles.letterBlocks}>
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
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.playAgainButton]}
            onPress={handlePlayAgain}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleGoHome}
          >
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SIZES.margin,
  },
  categoryText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
  },
  content: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
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
  winnerCard: {
    backgroundColor: COLORS.block.green,
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
  },
  statItem: {
    alignItems: 'center',
    padding: SIZES.padding / 2,
  },
  statLabel: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.padding / 4,
  },
  statValue: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  wordsContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  wordsTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.padding / 2,
  },
  wordsList: {
    gap: SIZES.padding / 2,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding / 2,
    borderRadius: SIZES.radius / 2,
  },
  wordText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  letterBlocks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
    gap: 2,
  },
  miniBlock: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.block.blue,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  miniBlockText: {
    fontSize: SIZES.xSmall,
    fontFamily: FONTS.bold,
    color: COLORS.background,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.margin,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.margin / 2,
  },
  playAgainButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
});
