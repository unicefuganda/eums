describe('Distribution Plan Line Item Service', function () {

    var lineItemService, mockBackend, lineItemEndpointUrl, lineItemResponseEndpointUrl;

    var lineItemId, itemId = 1;
    var stubLineItem = {
        item: itemId,
        targetQuantity: 10,
        plannedDistributionDate: '2014-02-23',
        remark: 'In good condition',
        track: true,
        distribution_plan_node: 1,
        flow_triggered : false
    };

    var expectedLineItem = {
        id: 1,
        item: itemId,
        targetQuantity: 10,
        plannedDistributionDate: '2014-02-23',
        remark: 'In good condition',
        track: true,
        distribution_plan_node: 1,
        flow_triggered : false
    };

    var expectedLineItemResponse = {
        'node': {
            'plan_id': 53,
            'contact_person_id': '54578a695d1b1dbd44790208',
            'consignee': 17,
            'id': 106,
            'location': 'Adjumani'
        },
        'responses': {
            'qualityOfProduct': {
                'id': 178,
                'value': 3,
                'formatted_value': 'Good'
            },
            'amountReceived': {
                'id': 52,
                'value': 25,
                'formatted_value': '25'
            },
            'dateOfReceipt': {
                'id': 43,
                'value': '04/10/2014',
                'formatted_value': '04/10/2014'
            },
            'productReceived': {
                'id': 103,
                'value': 1,
                'formatted_value': 'Yes'
            }
        }
    };


    beforeEach(function () {
        module('DistributionPlanLineItem');

        inject(function (DistributionPlanLineItemService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            lineItemEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM;
            lineItemResponseEndpointUrl = EumsConfig.BACKEND_URLS.PLAN_ITEM_RESPONSES;
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

    it('should update line item field', function(done) {
        var updatedLineItem = {id: 1};
        var updatedLineItemField = {tracking: true};
        var expectedLineItem = {id: 1, tracking: true};
        mockBackend.whenPATCH(lineItemEndpointUrl + updatedLineItem.id + '/').respond(expectedLineItem);
        lineItemService.updateLineItemField(updatedLineItem, updatedLineItemField).then(function (returnedLineItem) {
            expect(returnedLineItem).toEqual(expectedLineItem);
            done();
        });
        mockBackend.flush();
    });

    it('should get line item response', function (done) {
        mockBackend.whenGET(lineItemResponseEndpointUrl + lineItemId + '/').respond(expectedLineItemResponse);
        lineItemService.getLineItemResponse(lineItemId).then(function (returnedLineItemResponse) {
            expect(returnedLineItemResponse).toEqual(expectedLineItemResponse);
            done();
        });
        mockBackend.flush();
    });
});

