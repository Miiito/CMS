describe('Sitemap checking', function() {

	/* If we want test a non angular page */

	beforeEach(function() {
		browser.ignoreSynchronization = true;
	 	browser.manage().window().setSize(800,600);
		//browser.manage().timeouts().implicitlyWait(2000);
  	});

	it('Az oldal címének meg kellett volna jellenie', function() {
		browser.get(browser.params.baseUrl);
		var greeting = element(by.css('.jumbotron h1'));
		expect(greeting.getText()).toEqual('Congratulations!');
	});

	it('About oldalnak meg kell kellenie', function() {
    	element.all(by.css('.navbar-nav li a')).get(1).click();
       	var greeting = element(by.css('.container h1'));
		expect(greeting.getText()).toEqual('About');
	});

	it('Login oldalnak meg kell kellenie', function() {
		element.all(by.css('.navbar-nav li a')).get(3).click();

		element(by.id('loginform-username')).sendKeys('admin');
		element(by.id('loginform-password')).sendKeys('admin\n');

		/* Maximum timeout for the login */
		browser.manage().timeouts().implicitlyWait(5000);

		var greeting = element(by.css('.jumbotron h1'));
		expect(greeting.getText()).toEqual('Congratulations!');

		/* Reset the timeout for the login */
		browser.manage().timeouts().implicitlyWait(0);
	});

	it('About oldalnak meg kell kellenie', function() {
		element.all(by.css('.navbar-nav li a')).get(1).click();
		var greeting = element(by.css('.container h1'));
		expect(greeting.getText()).toEqual('About');
	});



});