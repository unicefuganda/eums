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
        service.all().success(function (objects) {
            expect(objects).toEqual(fakeObjects);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when fetching objects does not return 200', function (done) {
        mockBackend.whenGET(endpointUrl).respond(401);
        service.all().catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should get object by id', function (done) {
        mockBackend.whenGET(endpointUrl + fakeOne.id + '/').respond(fakeOne);
        service.get(fakeOne.id).success(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when get object by id does not return 200', function (done) {
        mockBackend.whenGET(endpointUrl + fakeOne.id + '/').respond(401);
        service.get(fakeOne.id).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should create an object', function (done) {
        mockBackend.whenPOST(endpointUrl).respond(201, fakeOne);
        service.create(fakeOne).success(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when create does not return 200', function (done) {
        mockBackend.whenPOST(endpointUrl).respond(401);
        service.create(fakeOne).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should update object', function (done) {
        mockBackend.whenPUT(endpointUrl + fakeOne.id + '/').respond(200);
        var changedOne = Object.clone(fakeOne);
        changedOne.propertyOne = 'changed';
        service.update(changedOne).success(function (response, status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when update object does not return 200', function (done) {
        mockBackend.whenPUT(endpointUrl + fakeOne.id + '/').respond(401);
        var changedOne = Object.clone(fakeOne);
        changedOne.propertyOne = 'changed';
        service.update(changedOne).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });


    it('should delete object by id', function (done) {
        mockBackend.whenDELETE(endpointUrl + fakeTwo.id + '/').respond(200);
        service.del(fakeTwo).success(function (response, status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when delete does not return 200', function (done) {
        mockBackend.whenDELETE(endpointUrl + fakeTwo.id + '/').respond(401);
        service.del(fakeTwo).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });


});


