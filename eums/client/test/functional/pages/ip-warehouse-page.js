var IpWarehousePage = function () {};

IpWarehousePage.prototype = Object.create({}, {
    url: { get: function () { return '#/ip-items'; }},
    visit: { value: function () {
        browser.get(this.url);
    }},

    searchBar: { get: function () {
        return element(by.id('filter'));
    }},

    searchForItem: { value: function (searchTerm) {
        var EC = protractor.ExpectedConditions;
        var loadingCog = element(by.css('.glyphicon-cog'));
        var searchReady = EC.and(EC.visibilityOf(this.searchBar), EC.stalenessOf(loadingCog));

        browser.wait(searchReady, 5000, "Timeout exceeded while waiting for search to be ready");
        this.searchBar.clear().sendKeys(searchTerm);
        browser.sleep(2000);
        browser.wait(searchReady, 5000, "Timeout exceeded while retrieving search results");
    }},

    warehouseItemCount: { get: function () {
        return element.all(by.repeater('($index, item) in items')).count();
    }},

    itemDescriptions: { get: function () { return element.all(by.repeater('($index, item) in items').column('item.itemDescription')).getText(); }},
    itemBalances: { get: function () { return element.all(by.repeater('($index, item) in items').column('item.availableBalance')).getText(); }}
});

module.exports = new IpWarehousePage;
