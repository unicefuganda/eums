describe('Item Service', function() {

    var itemService, mockBackend, itemEndpointUrl, itemUnitEndpointUrl;

    beforeEach(function() {
        module('Item');

        inject(function(ItemService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            itemEndpointUrl = EumsConfig.BACKEND_URLS.ITEM;
            itemUnitEndpointUrl = EumsConfig.BACKEND_URLS.ITEM_UNIT;
            itemService = ItemService;
        });
    });

    it('should get item details', function(done) {
        var itemId = 1;

        var itemUnitId = 1;

        var stubItem = {
            id: itemId,
            description: 'item description',
            unit: 1
        };

        var stubItemUnit = {id: itemUnitId, name: 'Unit name'};

        var expectedItem = {
            id: itemId,
            description: 'item description',
            unit: {id: itemUnitId, name: 'Unit name'}
        };

        mockBackend.whenGET(itemUnitEndpointUrl + itemUnitId + '/').respond(stubItemUnit);
        mockBackend.whenGET(itemEndpointUrl + itemId + '/').respond(stubItem);

        itemService.getItemDetails(itemId).then(function(item) {
            expect(item).toEqual(expectedItem);
            done();
        });
        mockBackend.flush();
    });
});
