describe('Item Service', function () {
    var mockServiceFactory, mockItemModel, itemService, config, mockItemUnitService;

    beforeEach(function () {
        module('Item');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
            $provide.value('Item', mockItemModel);
            $provide.value('ItemUnitService', mockItemUnitService)
        });

        inject(function (ItemService, EumsConfig) {
            itemService = ItemService;
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should create itself with the right parameters', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.ITEM,
            propertyServiceMap: {unit: mockItemUnitService},
            model: mockItemModel
        });
    });
});
