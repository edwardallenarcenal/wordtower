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
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { CategoryCard } from '../components/CategoryCard';
import { CATEGORIES } from '../services/categories';
import { audioService } from '../services/audioService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('animals');

  useEffect(() => {
    // Start background music when home screen loads
    audioService.playBackgroundMusic();
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
      <LinearGradient
        colors={[COLORS.background, COLORS.block.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Word Tower</Text>
          <Text style={styles.subtitle}>Find all words before time runs out!</Text>
        </View>

        <View style={styles.gameInfoSection}>
          <Text style={styles.gameInfoText}>
            You have 3 minutes to group all words in the category.
          </Text>
          <Text style={styles.gameInfoText}>
            Win by finding and grouping all target words!
          </Text>
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
          <LinearGradient
            colors={[COLORS.secondary, COLORS.block.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Start Game!</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
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
  },
  startButtonText: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
});
