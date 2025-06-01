# 🏗️ Word Tower - Word Game

A fun and engaging word puzzle game built with React Native and Expo where players build towers of words from letter blocks!

## 🎮 Game Features

- **Word Building**: Create words by selecting letter blocks
- **Multiple Categories**: Animals, Food, Sports, and more
- **Timed Gameplay**: 3-minute rounds for exciting gameplay
- **Beautiful UI**: Modern, colorful design with smooth animations
- **Audio Experience**: Background music and sound effects for immersive gameplay
- **Monetization**: Integrated ad system with Appodeal SDK
- **Cross-Platform**: Works on iOS, Android, and Web

## 🎵 Audio Features

- **Background Music**: Relaxing looping background music
- **Sound Effects**: 
  - Block selection and deselection sounds
  - Word completion celebrations
  - Button click feedback
  - Error notifications
  - Game completion fanfare
- **Audio Controls**: Volume settings and enable/disable options
- **Graceful Fallback**: Game works perfectly even without audio files

## 💰 Monetization Features

- **Banner Ads**: Non-intrusive banner ads on home and results screens
- **Interstitial Ads**: Full-screen ads between game sessions
- **Rewarded Videos**: Optional ads for extra hints and time
- **Development Mode**: Simulation mode for testing without real ads
- **GDPR Compliance**: User consent management for ads

## 🎨 App Design

- **Cute Icons**: Custom-designed app icons featuring colorful letter tower
- **Modern UI**: Gradient backgrounds and smooth animations
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Clear typography and intuitive controls

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd wordtower
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

4. Open the app:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## 📱 Platform Support

- **iOS**: Full native support with proper audio handling
- **Android**: Complete functionality with adaptive icons
- **Web**: Browser-compatible version available

## 🔧 Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6
- **Audio**: Expo AV for music and sound effects
- **Styling**: React Native StyleSheet with custom theme
- **State Management**: React Hooks (useState, useEffect)
- **TypeScript**: Full type safety throughout the codebase

## 📂 Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
├── services/           # Business logic and external services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── constants/          # Theme and configuration
└── navigation/         # Navigation configuration

assets/
├── audio/              # Music and sound effect files
├── icon.png           # Main app icon
├── adaptive-icon.png  # Android adaptive icon
└── splash-icon.png    # Splash screen icon
\`\`\`

## 🎯 Game Rules

1. **Start Game**: Choose a category and press "Start Game"
2. **Build Words**: Tap letter blocks to form valid words
3. **Submit Words**: Valid words are automatically detected
4. **Time Limit**: Complete as many words as possible in 3 minutes
5. **Scoring**: Points based on word length and difficulty

## 🎨 Customization

### Adding New Categories

Edit \`src/services/categories.ts\` to add new word categories:

\`\`\`typescript
export const CATEGORIES = {
  newCategory: {
    name: 'New Category',
    words: [
      { word: 'EXAMPLE', difficulty: 1 },
      // Add more words...
    ],
  },
};
\`\`\`

### Audio Files

Place audio files in \`assets/audio/\`:
- \`backgroundMusic.mp3\` - Main background music
- \`blockSelect.mp3\` - Block selection sound
- \`wordComplete.mp3\` - Word completion sound
- And more...

## 🛠️ Development

### Building for Production

\`\`\`bash
# Build for web
npm run build:web

# Build for iOS
expo build:ios

# Build for Android
expo build:android
\`\`\`

### Running Tests

\`\`\`bash
npm test
\`\`\`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 🎉 Acknowledgments

- Expo team for the amazing development platform
- React Native community for excellent documentation
- Sound effects and music from various creative commons sources

---

**Word Tower** - Building words, one block at a time! 🎮✨
