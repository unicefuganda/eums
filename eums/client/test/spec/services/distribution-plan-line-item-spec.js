describe('Distribution Plan Line Item Service', function () {

    var lineItemService, mockBackend, lineItemEndpointUrl;

    var lineItemId, itemId = 1;
    var stubLineItem = {
        item: itemId,
        targetQuantity: 10,
        plannedDistributionDate: '2014-02-23',
        remark: 'In good condition',
        track: true,
        distribution_plan_node: 1
    };

    var expectedLineItem = {
        id: 1,
        item: itemId,
        targetQuantity: 10,
        plannedDistributionDate: '2014-02-23',
        remark: 'In good condition',
        track: true,
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
        lineItemService.getLineItem(lineItemId).then(function (returnedLineItem) {
            expect(returnedLineItem).toEqual(stubLineItem);
            done();
        });
        mockBackend.flush();
    });

    it('should add line item', function (done) {
        lineItemService.createLineItem(stubLineItem).then(function (returnedLineItem) {
            expect(returnedLineItem).toEqual(expectedLineItem);
            done();
        });
        mockBackend.flush();
    });

    it('should update line item', function(done) {
        var updatedLineItem = {id: 1};
        mockBackend.whenPUT(lineItemEndpointUrl + updatedLineItem.id + '/').respond(updatedLineItem);
        lineItemService.updateLineItem(updatedLineItem).then(function (returnedLineItem) {
            expect(returnedLineItem).toEqual(updatedLineItem);
            done();
        });
        mockBackend.flush();
    });
});

