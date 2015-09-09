var ResponsePage = function () {};

ResponsePage.prototype = Object.create({}, {

    header: { get: function () {
        return element(by.className('page-header'));
    }},

    numberOfResponses: { get: function () {
        return element.all(by.repeater('response in allResponses').column('response.item'));
    }},

    searchTxtBox: { get: function () {
        return element(by.id('filter'));
    }},

    searchResponsesFor: { value: function (searchCriteria) {
        this.searchTxtBox.sendKeys(searchCriteria);
    }}
});

module.exports = new ResponsePage();