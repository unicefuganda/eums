describe('Consignee Service', function () {

    var endpointUrl, scope;

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

    describe('', function () {
        var consigneeService, mockBackend;

        beforeEach(function () {
            inject(function (ConsigneeService, $httpBackend, EumsConfig, $rootScope) {
                mockBackend = $httpBackend;
                consigneeService = ConsigneeService;
                endpointUrl = EumsConfig.BACKEND_URLS.CONSIGNEE;
                scope = $rootScope.$new();
            });
        });

        it('should get all consignees by node level ', function () {
            spyOn(consigneeService, 'filter');
            consigneeService.getTopLevelConsignees();
            expect(consigneeService.filter).toHaveBeenCalledWith({node: 'top'});
        });

        it('should delegate delete down on to factory', function () {
            var consignee = {name: 'some consignee'}
            spyOn(consigneeService, '_del');
            consigneeService.del(consignee);
            expect(consigneeService._del).toHaveBeenCalledWith(consignee);
        });
    });
});