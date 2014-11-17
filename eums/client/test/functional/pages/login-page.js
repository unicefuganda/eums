var LoginPage = function () {
    this.welcomeMessage = element(by.id('login-welcome'));
    this.username = element(by.id('username'));
    this.password = element(by.id('password'));

    this.loginButton = element(by.id('btn-login'));


    this.welcomeMessageIsPresent = function () {
        return this.welcomeMessage.isPresent();
    };

    this.loginWithCredentials = function (username, password) {
        this.username.sendKeys(username);
        this.password.sendKeys(password);

        this.loginButton.click();
        return require('./home-page');
    };

    this.logout = function() {
        browser.get('/logout');
    };
};

module.exports = new LoginPage;