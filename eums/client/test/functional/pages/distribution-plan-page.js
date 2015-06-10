var DistributionPlanPage = function () {
    this.selectSalesOrder = function(orderNumber) {
        element(by.linkText(orderNumber)).click();
    };

    this.salesOrdersNumbers = function() {
        return element.all(by.repeater('salesOrder in salesOrders').column('salesOrder.orderNumber'));
    };

    this.go = function() {
      browser.get('/#/direct-delivery');
    };

    this.title = function() {
        return element(by.className('page-header')).getText();
    };
};

module.exports = new DistributionPlanPage;