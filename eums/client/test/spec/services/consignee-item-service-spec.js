describe('Consignee Item Service', function () {
    var mockServiceFactory, mockItemService, config;

    beforeEach(function () {
        module('ConsigneeItem');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
            $provide.value('ItemService', mockItemService);
        });

        inject(function (ConsigneeItemService, EumsConfig) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should create itself with the right parameters', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.CONSIGNEE_ITEM,
            propertyServiceMap: {item: mockItemService}
        });
    });
});
