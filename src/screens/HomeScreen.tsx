import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { CategoryCard } from '../components/CategoryCard';
import { CATEGORIES } from '../services/categories';
import { audioService } from '../services/audioService';
import appodealService from '../services/appodealService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('animals');

  useEffect(() => {
    // Start background music when home screen loads
    audioService.playBackgroundMusic();
    
    // Show banner ad at bottom of home screen
    const showBannerAd = async () => {
      try {
        if (appodealService.isReady()) {
          await appodealService.showBanner('bottom');
        }
      } catch (error) {
        console.log('Banner ad failed to show:', error);
      }
    };
    
    showBannerAd();
    
    // Cleanup banner when leaving screen
    return () => {
      appodealService.hideBanner();
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    audioService.playSoundEffect('buttonClick');
    setSelectedCategory(category);
  };

  const handleStartGame = () => {
    audioService.playSoundEffect('buttonClick');
    navigation.navigate('Game', {
      category: selectedCategory,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>🏗️ Word Tower</Text>
          <Text style={styles.subtitle}>Build words, level up, conquer challenges!</Text>
        </View>

        <View style={styles.gameInfoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.gameInfoTitle}>🎯 Mission</Text>
            <Text style={styles.gameInfoText}>
              Find and group all target words in each level before time runs out!
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.gameInfoTitle}>⏱️ Challenge</Text>
            <Text style={styles.gameInfoText}>
              Complete levels to unlock more words and tougher challenges!
            </Text>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <ScrollView 
            style={styles.categoriesList}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(CATEGORIES).map(([key, category]) => (
              <CategoryCard
                key={key}
                name={category.name}
                description={category.description}
                isSelected={selectedCategory === key}
                onSelect={() => handleCategorySelect(key)}
              />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedCategory && styles.startButtonDisabled,
          ]}
          disabled={!selectedCategory}
          onPress={handleStartGame}
        >
          <View style={styles.startButtonGradient}>
            <Text style={styles.startButtonText}>Start Game!</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    opacity: 0.8,
  },
  gameInfoSection: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  gameInfoText: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlign: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
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
  categoriesSection: {
    flex: 1,
    padding: SIZES.padding,
  },
  categoriesList: {
    flex: 1,
  },
  startButton: {
    margin: SIZES.padding,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonGradient: {
    padding: SIZES.padding,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  startButtonText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.marginSmall,
    ...SIZES.shadowSmall,
  },
  gameInfoTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: SIZES.marginSmall,
  },
});
