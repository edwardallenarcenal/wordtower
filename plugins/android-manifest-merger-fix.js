const { withAndroidManifest } = require('@expo/config-plugins');

function withAndroidManifestMergerFix(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
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
      
      // Remove any existing AD_SERVICES_CONFIG properties to avoid conflicts
      application.property = application.property.filter(prop => 
        !(prop.$ && prop.$['android:name'] === 'android.adservices.AD_SERVICES_CONFIG')
      );
      
      // Add the AD_SERVICES_CONFIG with tools:replace to resolve Google Play Services conflict
      // Use Google Mobile Ads config as it's more specific to our ad implementation
      application.property.push({
        $: {
          'android:name': 'android.adservices.AD_SERVICES_CONFIG',
          'android:resource': '@xml/gma_ad_services_config',
          'tools:replace': 'android:resource'
        }
      });

      // Also ensure application element has tools:replace for other potential conflicts
      if (!application.$) {
        application.$ = {};
      }
      
      // Add tools:replace for common conflicting attributes
      const existingReplace = application.$['tools:replace'] || '';
      const replaceAttributes = ['android:allowBackup', 'android:name', 'android:theme'];
      
      replaceAttributes.forEach(attr => {
        if (!existingReplace.includes(attr)) {
          application.$['tools:replace'] = existingReplace 
            ? `${existingReplace},${attr}` 
            : attr;
        }
      });
    }
    
    return config;
  });
}

module.exports = withAndroidManifestMergerFix;
