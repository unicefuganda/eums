var SystemSettingsPage = function () {
};
var EC = protractor.ExpectedConditions;

SystemSettingsPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/system-settings';
        }
    },
    visit: {
        value: function () {
            browser.get(this.url);
            waitForPageToLoad();
        }
    },
    switch: {
        value: function () {
            element.all(by.css('div.bootstrap-switch span')).get(1).click();
            waitForModalToLoad();
            browser.sleep(500);
        }
    },
    autoTrackStatus: {
        value: function () {
            return element.all(by.css('div.bootstrap-switch span')).get(1).getText();
        }
    },
    confirmAutoTrack: {
        value: function () {
            $('#auto-track-confirm-modal button.btn-primary').click();
        }
    },
    cancelAutoTrack: {
        value: function () {
            $('#auto-track-confirm-modal button.btn-default').click();
        }
    }
});

module.exports = new SystemSettingsPage;

function waitForPageToLoad() {
    var spinner = element(by.css('#loading'));
    var screenHasLoaded = EC.invisibilityOf(spinner);
    browser.wait(screenHasLoaded, 5000, "Timeout exceeded while waiting for screen to load");
}

function waitForModalToLoad() {
    confirmModal = element(by.id('auto-track-confirm-modal'));
    var modalHasLoaded = EC.visibilityOf(confirmModal);
    browser.wait(modalHasLoaded, 5000, "Timeout exceeded while waiting for modal to load");
}
