var LoginPage = function () {};

LoginPage.prototype = Object.create({}, {

    url: { get: function () { return '/login'; }},

    visit: { value: function () {
        browser.ignoreSynchronization = true;
        browser.get(this.url);
    }},

    logout: { value: function () {
        browser.ignoreSynchronization = true;
        browser.get('logout');
    }},

    welcomeMessage: { get: function () { return element(by.id('login-welcome')); }},
    username: { get: function () { return element(by.id('username')); }},
    password: { get: function () { return element(by.id('password')); }},
    loginButton: { get: function () { return element(by.id('btn-login')); }},

    loginAs: { value: function (username, password) {
        this.username.sendKeys(username);
        this.password.sendKeys(password);
        this.loginButton.click();

        browser.ignoreSynchronization = false;

        var EC = protractor.ExpectedConditions;
        var loadingModal = element(by.id('loading'));
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var mapHasLoaded = EC.and(EC.invisibilityOf(loadingModal), EC.stalenessOf(fadingModal));

        browser.wait(mapHasLoaded, 5000, "Timeout exceeded while loading map");
    }},

    loginWithNoWaitAs: { value: function (username, password) {
        this.username.sendKeys(username);
        this.password.sendKeys(password);
        this.loginButton.click();
    }}

});

module.exports = new LoginPage;