describe('Item Service', function() {

    var itemService, mockBackend, itemEndpointUrl, itemUnitEndpointUrl;

    var itemId = 1;

    beforeEach(function() {
        module('Item');

        inject(function(ItemService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            itemEndpointUrl = EumsConfig.BACKEND_URLS.ITEM;
            itemUnitEndpointUrl = EumsConfig.BACKEND_URLS.ITEM_UNIT;
            itemService = ItemService;
        });
    });

    it('should know how to fetch all items', function (done) {
        var stubItem = {
            id: itemId,
            name: 'Test Item'
        };

        mockBackend.whenGET(itemEndpointUrl).respond([stubItem]);
        itemService.all().then(function (response) {
            expect(response).toEqual([stubItem]);
            done();
        });
        mockBackend.flush();
    });

    it('should get item details', function(done) {
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

        itemService.get(itemId, ['unit']).then(function(item) {
            expect(item).toEqual(expectedItem);
            done();
        });
        mockBackend.flush();
    });

    it("should default item unit name to 'Each' if item has no item unit", function(done) {
        var itemId = 1;
        var itemUnitId = null;

        var stubItem = {
            id: itemId,
            description: 'item description',
            unit: null
        };

        var expectedItem = {
            id: itemId,
            description: 'item description',
            unit: {id: 0, name: 'Each'}
        };

        //mockBackend.whenGET(itemUnitEndpointUrl + itemUnitId + '/').respond(404, {});
        mockBackend.whenGET(itemEndpointUrl + itemId + '/').respond(stubItem);

        itemService.get(itemId, ['unit']).then(function(item) {
            expect(item).toEqual(expectedItem);
            done();
        });
        mockBackend.flush();
    });
});
