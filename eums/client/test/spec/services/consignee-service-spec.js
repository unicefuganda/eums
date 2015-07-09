describe('Consignee Service', function () {

    var endpointUrl, scope;

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
            inject(function (ConsigneeService, $httpBackend, EumsConfig, $rootScope) {
                mockBackend = $httpBackend;
                consigneeService = ConsigneeService;
                endpointUrl = EumsConfig.BACKEND_URLS.CONSIGNEE;
                scope = $rootScope.$new();
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
            consigneeService.getTopLevelConsignees().then(function (consignees) {
                expect(consignees).toEqual(consigneeList);
                done();
            });
            mockBackend.flush();
        });

        it('should delete consignee that is not imported from vision and has no deliveries attached to them', function (done) {
            var consignee = {id: 1, importedFromVision: false};
            mockBackend.expectGET(endpointUrl + consignee.id + '/deliveries/').respond([]);
            mockBackend.whenDELETE(endpointUrl + consignee.id + '/').respond(200);
            consigneeService.del(consignee).then(function (status) {
                expect(status).toEqual(200);
                done();
            });
            mockBackend.flush();
        });

        it('should reject deletion of consignee imported from vision', function (done) {
            var consignee = {id: 1, importedFromVision: true};
            consigneeService.del(consignee).catch(function (reason) {
                expect(reason).toEqual('CANNOT DELETE CONSIGNEE IMPORTED FROM VISION');
                done();
            });
            scope.$apply();
        });

        it('should reject deletion of consignee that has deliveries attached to them', function (done) {
            var consignee = {id: 1, importedFromVision: false};
            mockBackend.expectGET(endpointUrl + consignee.id + '/deliveries/').respond([{id: 1}]);
            consigneeService.del(consignee).catch(function (reason) {
                expect(reason).toEqual('CANNOT DELETE CONSIGNEE THAT HAS DELIVERIES');
                done();
            });
            mockBackend.flush();
        });
    });
});