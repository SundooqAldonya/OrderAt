const { withAppDelegate, createRunOncePlugin } = require('@expo/config-plugins');

function addFirebaseImports(appDelegate) {
  // Add import if missing
  if (!appDelegate.includes(`import FirebaseCore`)) {
    appDelegate = appDelegate.replace(
      /import React/,
      `import React\nimport FirebaseCore`
    );
  }
  return appDelegate;
}

function addFirebaseConfigureCall(appDelegate) {
  // Find didFinishLaunchingWithOptions and insert FirebaseApp.configure()
  const pattern = /(didFinishLaunchingWithOptions[^{]*\{)/;
  if (!appDelegate.includes('FirebaseApp.configure()')) {
    appDelegate = appDelegate.replace(
      pattern,
      `$1\n    FirebaseApp.configure()`
    );
  }
  return appDelegate;
}

const withFirebaseAppDelegate = (config) => {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('AppDelegate must be Swift for this plugin to work');
    }

    let contents = config.modResults.contents;

    contents = addFirebaseImports(contents);
    contents = addFirebaseConfigureCall(contents);

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = createRunOncePlugin(
  withFirebaseAppDelegate,
  'with-firebase-app-delegate',
  '1.0.0'
);
