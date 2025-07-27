// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs']
}

module.exports = config
