var homePage = function () {};

homePage.prototype = Object.create({}, {
    url: { get: function () { return ''; }},

    visit: { value: function () {
        browser.get(this.url);

        var EC = protractor.ExpectedConditions;
        var loadingModal = element(by.id('loading'));
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var mapHasLoaded = EC.and(EC.invisibilityOf(loadingModal), EC.stalenessOf(fadingModal));
        browser.wait(mapHasLoaded, 5000, "Timeout exceeded while loading map");
    }},

    pageTitle: { get: function () {
        return element(by.css('.white.navbar-brand')).getText();
    }},
    ipElement: { get: function () {
        return element(by.model('filter.programme'));
    }},
    map: { get: function () {
        return element(by.id('map'));
    }},
    mapLocation: { get: function () {
        return element(by.binding('totalStats.location')).getText();
    }},
    numberSent: { get: function () {
        return element(by.binding('totalStats.totalValueSent')).getText();
    }},
    numberDelivered: { get: function () {
        return element(by.binding('totalStats.totalValueReceived')).getText();
    }},
    numberNotDelivered: { get: function () {
        return element(by.binding('totalStats.percentageNotReceived')).getText();
    }},
    numberOfResponses: { get: function () {
        return element.all(by.repeater('response in responses'));
    }},
    responsesPageLink: { get: function () {
        return element(by.id('response-page-btn'));
    }},
    windmill: { get: function () {
        return element(by.id('loading'));
    }},


    clickZoomOutIcon: { value: function () {
        browser.sleep(2000);
        element(by.css('.view-thumbnail img')).click();
    }},

    clickMapLayer: { value: function (district) {
        browser.executeScript(function (district) {
            window.map.clickLayer(district);
        }, district);
    }},

    highLightMapLayer: { value: function (district) {
        browser.executeScript(function (district) {
            window.map.highlightLayer(district);
        }, district);
    }},

    getHighlightedLayer: { value: function () {
        return browser.executeScript(function (district) {
            return window.map.getHighlightedLayer(district);
        }, district).then(function (highlightedLayer) {
            return highlightedLayer;
        });
    }},

    getHighlightedLayerName: { value: function () {
        return browser.executeScript(function () {
            return window.map.getLayerName();
        }).then(function (highlightedLayerName) {
            return highlightedLayerName;
        });
    }},

    getHighlightedStyle: { value: function (district) {
        return browser.executeScript(function (district) {
            return window.map.getStyle(district);
        }, district).then(function (style) {
            return style;
        });
    }},

    enterImplementingPartnerToFilterBy: { value: function () {
        this.ipElement.sendKeys(selectedIp);
    }},

    getMapZoomLevel: { value: function () {
        browser.sleep(5000);
        return browser.executeScript(function () {
            return window.map.getZoom();
        }).then(function (zoomLevel) {
            return zoomLevel;
        });
    }},

    goToResponseDetailsPage: { value: function () {
        this.responsesPageLink.click();
    }},

    searchForProgramme: { value: function (searchTerm) {
        element(by.id('s2id_select-program')).click();
        element(by.css('.select2-input.select2-focused')).clear().sendKeys(searchTerm);
    }},

    programmeSearchResults: { get: function () {
        return element(by.css('.select2-results li')).getText();
    }}
});

module.exports = new homePage();