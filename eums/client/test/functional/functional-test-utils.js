var FunctionalTestUtils = (function () {
    return {
        fillSelect2Chosen: function (id, input) {
            this.scrollToTop();
            browser.sleep(1000);
            element(by.id(id)).click();
            element(by.css('.select2-input.select2-focused')).clear().sendKeys(input);
            element(by.css('.select2-results li')).click();
        },
        waitForPageToLoad: function (elem) {
            var EC = protractor.ExpectedConditions;
            var spinner = elem ? elem : element(by.css('#loading'));
            var screenHasLoaded = EC.invisibilityOf(spinner);
            browser.wait(screenHasLoaded, 5000, "Timeout exceeded while waiting for screen to load");
        },
        wait: function (until) {
            browser.sleep(until);
        },
        clearSelect2Chosen: function (id) {
            element(by.id(id)).element(by.css('.select2-search-choice-close')).click();
        },
        scrollToTop: function() {
            browser.executeScript('window.scrollTo(0,0);');
        }
    }
})();
module.exports = FunctionalTestUtils;