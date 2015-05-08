describe('Service Factory', function () {
    var mockBackend, q, service;
    const endpointUrl = '/some-endpoint/';
    const fakeOne = {id: 1, propertyOne: 'one', propertyTwo: 'two'};
    const fakeTwo = {id: 2, propertyOne: 'one', propertyTwo: 'two'};
    const fakeObjects = [fakeOne, fakeTwo];

    beforeEach(function () {
        module('GenericService');
        inject(function (ServiceFactory, $httpBackend, $q) {
            q = $q;
            mockBackend = $httpBackend;
            service = ServiceFactory({uri: endpointUrl});
        });
    });

    it('should get all objects from api endpoint', function (done) {
        mockBackend.whenGET(endpointUrl).respond(fakeObjects);
        service.all().then(function (objects) {
            expect(objects).toEqual(fakeObjects);
            done();
        });
        mockBackend.flush();
    });

    it('should get object by id', function (done) {
        mockBackend.whenGET(endpointUrl + fakeOne.id + '/').respond(fakeOne);
        service.get(fakeOne.id).then(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should create an object', function (done) {
        mockBackend.whenPOST(endpointUrl).respond(201, fakeOne);
        service.create(fakeOne).then(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });
});


