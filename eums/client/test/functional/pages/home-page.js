var HomePage = function () {
    this.text = element(by.css('.container'));
    this.distributionPlanNav = element(by.id('distribution-plan-nav'));
    this.homePageNav = element(by.id('home-nav'));

    this.elementisPresent = function () {
        return this.text.isPresent();
    };

    this.getHomeNavClass = function(){
      return this.homePageNav.getAttribute('class');
    };

    this.navigateToDistributionPlanTab = function () {
        this.distributionPlanNav.click();
        return require('./distribution-plan-page');
    };
};

module.exports = new HomePage;