var HomePage = function () {
    this.homePageTitle = element(by.css('.white'));
    this.map = element(by.id('map'));
    this.mapLocation = element(by.binding('totalStats.location'));
    this.numberSent = element(by.binding('totalStats.totalSent'));
    this.numberDelivered = element(by.binding('totalStats.totalReceived'));
    this.numberNotDelivered = element(by.binding('totalStats.totalNotReceived'));

    this.pageTitle = function () {
        return this.homePageTitle.getText();
    };

    this.clickMapLayer = function (district) {
        browser.executeScript(function (district) {
            window.map.clickLayer(district);
        }, district);
    };

    this.getMapZoomLevel = function () {
        return browser.executeScript(function () {
            return window.map.getZoom();
        }).then(function (zoomLevel) {
            return zoomLevel;
        });
    };

};

module.exports = new HomePage;