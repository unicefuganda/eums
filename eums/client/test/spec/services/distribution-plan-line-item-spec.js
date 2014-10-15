describe('Distribution Plan Line Item Service', function () {

    var lineItemService, mockBackend, lineItemEndpointUrl;

    var lineItemId, itemId = 1;
    var stubLineItem = {
        item: itemId,
        targeted_quantity: 10,
        planned_distribution_date: '2014-02-23',
        programme_focal: 1,
        remark: 'In good condition',
        distribution_plan_node: 1
    };

    var expectedLineItem = {
        id: 1,
        item: itemId,
        targeted_quantity: 10,
        planned_distribution_date: '2014-02-23',
        remark: 'In good condition',
        distribution_plan_node: 1
    };


    beforeEach(function () {
        module('DistributionPlanLineItem');

        inject(function (DistributionPlanLineItemService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            lineItemEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM;
            lineItemService = DistributionPlanLineItemService;
        });

        mockBackend.whenPOST(lineItemEndpointUrl, stubLineItem).respond(expectedLineItem);
    });

    it('should get line item', function (done) {
        mockBackend.whenGET(lineItemEndpointUrl + lineItemId + '/').respond(stubLineItem);
        lineItemService.getLineItemDetails(lineItemId).then(function (returnedLineItem) {
            expect(returnedLineItem).toEqual(stubLineItem);
            done();
        });
        mockBackend.flush();
    });

    it('should add line item', function (done) {
        lineItemService.createLineItem(stubLineItem).then(function (response) {
            expect(response.data).toEqual(expectedLineItem);
            done();
        });
        mockBackend.flush();
    });
});

