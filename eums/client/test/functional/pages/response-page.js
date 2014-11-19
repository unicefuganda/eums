var ResponsePage = function () {
    this.header = element(by.className('page-header'));
    this.numberOfResponses = element.all(by.repeater('response in allResponses').column('response.item'));
    this.searchTxtBox = element(by.id('filter'));

    this.searchResponsesFor = function (searchCriteria) {
        this.searchTxtBox.sendKeys(searchCriteria);
    }
};

module.exports = new ResponsePage;