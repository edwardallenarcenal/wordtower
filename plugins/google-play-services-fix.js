const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Plugin to fix Google Play Services AD_SERVICES_CONFIG conflict
 * This resolves conflicts between Google Mobile Ads and Google Play Services Measurement API
 */
function withGooglePlayServicesFix(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    console.log('🔧 Applying Google Play Services AD_SERVICES_CONFIG fix...');
    
    // Ensure tools namespace is declared
    if (!androidManifest.manifest.$) {
      androidManifest.manifest.$ = {};
    }
    androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    
    // Find the application element
    const application = androidManifest.manifest.application?.[0];
    if (application) {
      // Ensure property array exists
      if (!application.property) {
        application.property = [];
      }
      
      // Find any existing AD_SERVICES_CONFIG property
      const existingConfigIndex = application.property.findIndex(prop => 
        prop.$ && prop.$['android:name'] === 'android.adservices.AD_SERVICES_CONFIG'
      );
      
      if (existingConfigIndex >= 0) {
        // Update existing property with tools:replace
        application.property[existingConfigIndex] = {
          $: {
            'android:name': 'android.adservices.AD_SERVICES_CONFIG',
            'android:resource': '@xml/gma_ad_services_config',
            'tools:replace': 'android:resource'
          }
        };
        console.log('✅ Updated existing AD_SERVICES_CONFIG with tools:replace');
      } else {
        // Add new property with tools:replace
        application.property.push({
          $: {
            'android:name': 'android.adservices.AD_SERVICES_CONFIG',
            'android:resource': '@xml/gma_ad_services_config',
            'tools:replace': 'android:resource'
          }
        });
        console.log('✅ Added AD_SERVICES_CONFIG with tools:replace');
      }
      
      // Also add tools:node="merge" to the application element to handle conflicts
      if (!application.$) {
        application.$ = {};
      }
      application.$['tools:node'] = 'merge';
      
      console.log('✅ Google Play Services fix applied successfully');
    }
    
    return config;
  });
}

module.exports = withGooglePlayServicesFix;
