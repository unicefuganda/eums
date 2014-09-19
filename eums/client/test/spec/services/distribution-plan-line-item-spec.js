describe('Distribution Plan Line Item Service', function() {

    var lineItemService, mockBackend, lineItemEndpointUrl, mockItemService;

    var lineItemId, itemId = 1;
    var stubLineItem = {
        item: itemId,
        quantity: 10,
        under_current_supply_plan: false,
        planned_distribution_date: '2014-02-23',
        destination_location: 'Kampala',
        remark: "In good condition",
        distribution_plan_node: 1
    };
    var fullItem = {
        id: itemId,
        description: 'item description',
        unit: {id: 1, name: 'EA'}
    };

    var expectedLineItem = {
        item: fullItem,
        quantity: 10,
        under_current_supply_plan: false,
        planned_distribution_date: '2014-02-23',
        destination_location: 'Kampala',
        remark: "In good condition",
        distribution_plan_node: 1
    };

    beforeEach(function() {
        module('DistributionPlanLineItem');

        mockItemService = jasmine.createSpyObj('mockItemService', ['getItemDetails']);

        module(function($provide) {
            $provide.value('ItemService', mockItemService);
        });

        inject(function(DistributionPlanLineItemService, $httpBackend, EumsConfig, $q) {
            var deferred = $q.defer();
            deferred.resolve(fullItem);
            mockItemService.getItemDetails.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            lineItemEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM;
            lineItemService = DistributionPlanLineItemService;
        });
    });

    it('should get line item with full item details', function(done) {
        mockBackend.whenGET(lineItemEndpointUrl + lineItemId + '/').respond(stubLineItem);
        lineItemService.getLineItemDetails(lineItemId).then(function(returnedLineItem) {
            expect(returnedLineItem).toEqual(expectedLineItem);
            done();
        });
        mockBackend.flush();
    });
});

