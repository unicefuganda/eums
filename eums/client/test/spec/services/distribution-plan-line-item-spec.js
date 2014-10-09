describe('Distribution Plan Line Item Service', function() {

    var lineItemService, mockBackend, lineItemEndpointUrl;

    var lineItemId, itemId = 1;
    var stubLineItem = {
        item: itemId,
        quantity: 10,
        under_current_supply_plan: false,
        planned_distribution_date: '2014-02-23',
        destination_location: 'Kampala',
        remark: 'In good condition',
        distribution_plan_node: 1
    };

    beforeEach(function() {
        module('DistributionPlanLineItem');

        inject(function(DistributionPlanLineItemService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            lineItemEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM;
            lineItemService = DistributionPlanLineItemService;
        });
    });

    it('should get line item', function(done) {
        mockBackend.whenGET(lineItemEndpointUrl + lineItemId + '/').respond(stubLineItem);
        lineItemService.getLineItemDetails(lineItemId).then(function(returnedLineItem) {
            expect(returnedLineItem).toEqual(stubLineItem);
            done();
        });
        mockBackend.flush();
    });
});

