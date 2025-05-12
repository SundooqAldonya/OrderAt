const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = config.modRequest.platformProjectRoot + '/Podfile'
      let contents = fs.readFileSync(podfilePath, 'utf-8')
      if (!contents.includes('use_modular_headers!')) {
        contents = contents.replace(
          "platform :ios, '12.0'",
          "platform :ios, '12.0'\nuse_modular_headers!"
        )
        fs.writeFileSync(podfilePath, contents)
      }
      return config
    }
  ])
}
