const { withAndroidManifest } = require('@expo/config-plugins')

module.exports = function withCustomAndroidManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest

    // Locate the <application> node
    const application = androidManifest.application[0]

    // Remove any existing Firebase notification color setting
    if (application['meta-data']) {
      application['meta-data'] = application['meta-data'].filter(
        (item) =>
          item.$['android:name'] !==
          'com.google.firebase.messaging.default_notification_color'
      )
    }

    // Add the correct notification color meta-data with tools:replace
    application['meta-data'].push({
      $: {
        'android:name':
          'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        'tools:replace': 'android:resource'
      }
    })

    return config
  })
}
