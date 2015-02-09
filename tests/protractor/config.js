exports.config = {
  seleniumAddress: 'http://192.168.62.92:4444/wd/hub',

  ignoreSynchronization: true,
  //seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.41.0.jar',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};