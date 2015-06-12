var LoginPage = function () {

    this.url = 'login';
    this.visit = function () {
        browser.ignoreSynchronization = true;
        browser.get(this.url);
    };

    this.welcomeMessage = element(by.id('login-welcome'));
    this.username = element(by.id('username'));
    this.password = element(by.id('password'));
    this.loginButton = element(by.id('btn-login'));

    this.loginAs = function (username, password) {
        this.username.sendKeys(username);
        this.password.sendKeys(password);

        this.loginButton.click();

        browser.ignoreSynchronization = false;

        var EC = protractor.ExpectedConditions;
        var loadingModal = element(by.id('loading'));
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var mapHasLoaded = EC.and(EC.invisibilityOf(loadingModal), EC.stalenessOf(fadingModal));

        browser.wait(mapHasLoaded, 5000);
    };
};

module.exports = new LoginPage;