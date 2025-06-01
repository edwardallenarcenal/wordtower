import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Navigation from './src/navigation';
import appodealService from './src/services/appodealService';

export default function App() {
  useEffect(() => {
    // Initialize Appodeal SDK when app starts
    const initializeAds = async () => {
      try {
        console.log('🚀 Initializing Appodeal SDK...');
        // Let the service determine test mode automatically
        const success = await appodealService.initialize();
        if (success) {
          console.log('✅ Appodeal SDK initialized successfully');
        } else {
          console.warn('⚠️ Appodeal SDK initialization failed');
        }
      } catch (error) {
        console.error('❌ Error initializing Appodeal:', error);
      }
    };

    initializeAds();
  }, []);

  return (
    <>
      <Navigation />
      <StatusBar style="auto" />
    </>
  );
}
