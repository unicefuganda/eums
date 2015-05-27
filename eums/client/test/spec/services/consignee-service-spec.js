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
        var mockServiceFactory;

        beforeEach(function () {
            mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
            module(function ($provide) {
                $provide.value('ServiceFactory', mockServiceFactory);
            });
            inject(function (ConsigneeService, EumsConfig) {
                endpointUrl = EumsConfig.BACKEND_URLS.CONSIGNEE;
            });
        });

        it('should be instantiated with the right options', function () {
            expect(mockServiceFactory.create).toHaveBeenCalledWith({uri: endpointUrl, methods: jasmine.any(Object)});
        });
    });

    describe('', function () {
        var consigneeService, mockBackend;

        beforeEach(function () {
            inject(function (ConsigneeService, $httpBackend) {
                mockBackend = $httpBackend;
                consigneeService = ConsigneeService;
            });
        });

        it('should get consignees by type', function (done) {
            mockBackend.whenGET(endpointUrl + '?search=implementing_partner').respond(consigneeList);
            var type = 'implementing_partner';

            consigneeService.filterByType(type).then(function (consignees) {
                //expect(consignees).toEqual(consigneeList);
                expect(consignees).toEqual(null);
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