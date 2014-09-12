var SupplyPlanPage = function () {
    this.text = element(by.css('p'));

    this.getText = function () {
        return this.text.getText();
    };
};

module.exports = new SupplyPlanPage;