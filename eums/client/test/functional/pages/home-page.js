var HomePage = function () {
    this.homePageTitle = element(by.className('white'));


    this.pageTitle = function () {
        return this.homePageTitle.getText();
    };
};

module.exports = new HomePage;