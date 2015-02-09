exports.config = {
	seleniumAddress: 'http://192.168.62.92:4444/wd/hub',
	//seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.41.0.jar',

	// Capabilities to be passed to the webdriver instance.
	capabilities: {
		'browserName': 'chrome'
	},

	params: {
		username: 'mito',
		password: 'mito',
		baseUrl: 'http://mito:mito@dev.mito.hu/bszekeres/basic-template/web/'
	},

	// Options to be passed to Jasmine-node.
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 30000
	}
};