describe('Login', function() {

    var username = 'admin',
        password = 'admin';

    beforeEach(function() {
        /* If we want test a non angular page */
        browser.ignoreSynchronization = true;
        browser.manage().window().setSize(800,600);
        //browser.manage().timeouts().implicitlyWait(2000);
        /* Reset browser state between specs */
        browser.manage().deleteAllCookies();
        browser.get(browser.params.baseUrl + '/site/login');
    });

    it('should work by pressing enter', function() {
        element(by.id('loginform-username')).sendKeys(username);
        element(by.id('loginform-password')).sendKeys(password + '\n');

        /* Maximum timeout for the login */
        browser.manage().timeouts().implicitlyWait(5000);

        var greeting = element(by.css('.jumbotron h1'));
        expect(greeting.getText()).toEqual('Congratulations!');

        var logoutButton = element(by.partialLinkText('Logout'));
        expect(logoutButton.isPresent()).toBe(true);
        expect(logoutButton.getText()).toBe('Logout (' + username + ')');

        /* Reset the timeout for the login */
        browser.manage().timeouts().implicitlyWait(0);
    });

    it('should work by pressing submit', function() {
        element(by.id('loginform-username')).sendKeys(username);
        element(by.id('loginform-password')).sendKeys(password);
        element(by.name('login-button')).click();

        /* Maximum timeout for the login */
        browser.manage().timeouts().implicitlyWait(5000);

        var greeting = element(by.css('.jumbotron h1'));
        expect(greeting.getText()).toEqual('Congratulations!');

        var logoutButton = element(by.partialLinkText('Logout'));
        expect(logoutButton.isPresent()).toBe(true);
        expect(logoutButton.getText()).toBe('Logout (' + username + ')');

        /* Reset the timeout for the login */
        browser.manage().timeouts().implicitlyWait(0);
    });

});
