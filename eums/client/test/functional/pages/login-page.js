var LoginPage = function () {};

LoginPage.prototype = Object.create({bro: browser, ele: element}, {

    url: {
        get: function () {
            return '/login';
        }
    },

    visit: {
        value: function () {
            this.bro.ignoreSynchronization = true;
            this.bro.get(this.url);
        }
    },

    switchBrowser: {
        value: function (bro) {
            this.bro = bro || browser;
            this.ele = this.bro.element;
        }
    },

    logout: {
        value: function () {
            this.bro.ignoreSynchronization = true;
            this.bro.get('logout');
        }
    },

    welcomeMessage: {
        get: function () {
            return this.ele(by.css('.slogan'));
        }
    },
    username: {
        get: function () {
            return this.ele(by.id('username'));
        }
    },
    password: {
        get: function () {
            return this.ele(by.id('password'));
        }
    },
    loginButton: {
        get: function () {
            return this.ele(by.css('.btn-form'));
        }
    },

    loginAs: {
        value: function (username, password) {
            this.username.sendKeys(username);
            this.password.sendKeys(password);
            this.loginButton.click();

            this.bro.ignoreSynchronization = false;

            var EC = protractor.ExpectedConditions;
            var loadingModal = this.ele(by.id('loading'));
            var fadingModal = this.ele(by.css('.modal-backdrop.fade'));
            var mapHasLoaded = EC.and(EC.invisibilityOf(loadingModal), EC.stalenessOf(fadingModal));

            this.bro.wait(mapHasLoaded, 5000, "Timeout exceeded while loading map");
        }
    },

    loginWithNoWaitAs: {
        value: function (username, password) {
            this.username.sendKeys(username);
            this.password.sendKeys(password);
            this.loginButton.click();
        }
    }

});

module.exports = new LoginPage;