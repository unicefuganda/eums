describe('Consignee Service', function () {

    var endpointUrl;

    beforeEach(function () {
        module('Consignee');
    });

    describe('', function () {
        var mockServiceFactory, mockConsigneeModel;

        beforeEach(function () {
            mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
            mockConsigneeModel = function () {
            };
            module(function ($provide) {
                $provide.value('ServiceFactory', mockServiceFactory);
                $provide.value('Consignee', mockConsigneeModel);
            });
            inject(function (ConsigneeService, EumsConfig) {
                endpointUrl = EumsConfig.BACKEND_URLS.CONSIGNEE;
            });

        });

        it('should be instantiated with the right options', function () {
            expect(mockServiceFactory.create).toHaveBeenCalledWith({
                uri: endpointUrl, methods: jasmine.any(Object), model: mockConsigneeModel
            });
        });
    });
});