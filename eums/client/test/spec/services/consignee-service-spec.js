describe('Consignee Service', function () {

    var endpointUrl;

    var consigneeList = [{
        id: 1,
        name: 'Save the Children'
    }];

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
            inject(function (ConsigneeService, $httpBackend, EumsConfig) {
                mockBackend = $httpBackend;
                consigneeService = ConsigneeService;
                endpointUrl = EumsConfig.BACKEND_URLS.CONSIGNEE;
            });
        });

        it('should get consignees by type', function (done) {
            mockBackend.whenGET(endpointUrl + '?search=implementing_partner').respond(consigneeList);
            var type = 'implementing_partner';

            consigneeService.filterByType(type).then(function (consignees) {
                expect(consignees).toEqual(consigneeList);
                done();
            });
            mockBackend.flush();
        });

        it('should get all consignees by node level ', function (done) {
            mockBackend.whenGET(endpointUrl + '?node=top').respond(consigneeList);
            consigneeService.getByTopLevelNode().then(function (consignees) {
                expect(consignees).toEqual(consigneeList);
                done();
            });
            mockBackend.flush();
        });
    });

});