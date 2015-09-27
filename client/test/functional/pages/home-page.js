var HomePage = function () {
    this.homePageTitle = element(by.css('.white.navbar-brand'));
    this.ipElement = element(by.model('filter.programme'));
    this.map = element(by.id('map'));
    this.mapLocation = element(by.binding('totalStats.location'));
    this.numberSent = element(by.binding('totalStats.totalSent'));
    this.numberDelivered = element(by.binding('totalStats.totalReceived'));
    this.numberNotDelivered = element(by.binding('totalStats.totalNotReceived'));
    this.numberOfResponses = element.all(by.repeater('response in responses'));
    this.responsesPageLink = element(by.id('response-page-btn'));
    this.windmill = element(by.id('loading'));

    this.pageTitle = function () {
        return this.homePageTitle.getText();
    };

    this.clickZoomOutIcon = function(){
        browser.sleep(2000);
        element(by.css('.view-thumbnail img')).click();
    };

    this.clickMapLayer = function (district) {
        browser.executeScript(function (district) {
            window.map.clickLayer(district);
        }, district);
    };

    this.highLightMapLayer = function (district) {
        browser.executeScript(function (district) {
            window.map.highlightLayer(district);
        }, district);
    };

    this.getHighlightedLayer = function (district) {
        return browser.executeScript(function (district) {
            return window.map.getHighlightedLayer(district);
        }, district).then(function (highlightedLayer) {
            return highlightedLayer;
        });
    };
    this.getHighlightedLayerName = function () {
        return browser.executeScript(function () {
            return window.map.getLayerName();
        }).then(function (highlightedLayerName) {
            return highlightedLayerName;
        });
    };

    this.getHighlightedStyle = function (district) {
        return browser.executeScript(function (district) {
            return window.map.getStyle(district);
        }, district).then(function (style) {
            return style;
        });
    };

    this.enterImplementingPartnerToFilterBy = function (selectedIp) {
        this.ipElement.sendKeys(selectedIp);
    };

    this.getMapZoomLevel = function () {
        browser.sleep(5000);
        return browser.executeScript(function () {
            return window.map.getZoom();
        }).then(function (zoomLevel) {
            return zoomLevel;
        });
    };

    this.goToResponseDetailsPage = function () {
        this.responsesPageLink.click();
        return require('./response-page');
    }

};

module.exports = new HomePage;
