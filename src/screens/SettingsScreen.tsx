import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { audioService } from '../services/audioService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: Props) {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initialize settings from audio service
    const settings = audioService.getSettings();
    setMusicEnabled(settings.musicEnabled);
    setSoundEffectsEnabled(settings.soundEnabled);
  }, []);

  const handleMusicToggle = (value: boolean) => {
    audioService.playSoundEffect('buttonClick');
    setMusicEnabled(value);
    audioService.updateSettings({ musicEnabled: value });
  };

  const handleSoundEffectsToggle = (value: boolean) => {
    if (value) {
      audioService.playSoundEffect('buttonClick');
    }
    setSoundEffectsEnabled(value);
    audioService.updateSettings({ soundEnabled: value });
  };

  const handleSaveSettings = () => {
    audioService.playSoundEffect('buttonClick');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Background Music</Text>
        <Switch
          value={musicEnabled}
          onValueChange={handleMusicToggle}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Sound Effects</Text>
        <Switch
          value={soundEffectsEnabled}
          onValueChange={handleSoundEffectsToggle}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Vibration</Text>
        <Switch
          value={vibrationEnabled}
          onValueChange={setVibrationEnabled}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
        />
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={handleSaveSettings}
      >
        <Text style={styles.buttonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  title: {
    fontSize: SIZES.xxLarge,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SIZES.margin * 2,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontSize: SIZES.large,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.margin * 2,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
});
