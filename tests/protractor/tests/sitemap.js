describe('Sitemap checking', function() {

	/* If we want test a non angular page */
	browser.ignoreSynchronization = true;

	it('Az oldal címének meg kellett volna jellenie', function() {
		browser.get(browser.params.baseUrl);
		var greeting = element(by.css('.jumbotron h1'));
		expect(greeting.getText()).toEqual('Congratulations!');
		expect(browser.getCurrentUrl()).toBe(browser.params.baseUrl);
	});

	it('About oldalnak meg kell kellenie', function() {
		element.all(by.css('.navbar-nav li')).get(1).click();
		//browser.pause();
		/*
			browser.get(browser.params.baseUrl);
			var greeting = element(by.css('.jumbotron h1'));
			expect(greeting.getText()).toEqual('Congratulations!');
		*/
	});

	it('Contact oldalnak meg kell kellenie', function() {
		element.all(by.css('.navbar-nav li')).get(2).click();
		browser.pause();
		/*
			browser.get(browser.params.baseUrl);
			var greeting = element(by.css('.jumbotron h1'));
			expect(greeting.getText()).toEqual('Congratulations!');
		*/
	});



});