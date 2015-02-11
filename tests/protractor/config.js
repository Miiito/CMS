var localConfig = require('../config.json');

console.log(localConfig);

exports.config = {
	seleniumAddress: localConfig.seleniumAddress || 'http://192.168.88.24:4444/wd/hub',

	// Capabilities to be passed to the webdriver instance.
	capabilities: {
		'browserName': localConfig.browser || 'phantomjs'
	},

	params: {
		baseUrl: 'http://mito:mito@playground/bszekeres/basic-template/testweb/index-test.php'
	},

	// Options to be passed to Jasmine-node.
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000
	}
};