describe('Site', function() {

    beforeEach(function() {
        /* If we want test a non angular page */
        browser.ignoreSynchronization = true;
        browser.manage().window().setSize(800,600);
        //browser.manage().timeouts().implicitlyWait(2000);
    });

    it('main page should contain congratulations', function() {
        browser.get(browser.params.baseUrl);
        var greeting = element(by.css('.jumbotron h1'));
        expect(greeting.getText()).toEqual('Congratulations!');
    });

    it('about page should contain about', function() {
        browser.get(browser.params.baseUrl + '/site/about');
        var greeting = element(by.css('.container h1'));
        expect(greeting.getText()).toBe('About');
    });

});
