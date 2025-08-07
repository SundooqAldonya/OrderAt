const { getSentryExpoConfig } = require('@sentry/react-native/metro')

const config = getSentryExpoConfig(__dirname)

// Add support for .cjs files
config.resolver.sourceExts.push('cjs')

module.exports = config
