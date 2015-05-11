describe('Service Factory', function () {
    var mockBackend, q, topLevelService, nestedService;
    const topLevelEndpoint = '/some-endpoint/';
    const nestedEndpoint = '/nested-endpoint/';
    const fakeOne = {id: 1, propertyOne: 'one', propertyTwo: 'two', nested: 1};
    const fakeTwo = {id: 2, propertyOne: 'one', propertyTwo: 'two', nested: 2};
    const nestedOne = {id: 1, properties: {}};
    const nestedTwo = {id: 2, properties: []};
    const fakeObjects = [fakeOne, fakeTwo];

    beforeEach(function () {
        module('GenericService');
        inject(function (ServiceFactory, $httpBackend, $q) {
            q = $q;
            mockBackend = $httpBackend;
            nestedService = ServiceFactory({uri: nestedEndpoint});
            topLevelService = ServiceFactory({uri: topLevelEndpoint});
        });
    });

    it('should get all objects from api endpoint', function (done) {
        mockBackend.whenGET(topLevelEndpoint).respond(fakeObjects);
        topLevelService.all().success(function (objects) {
            expect(objects).toEqual(fakeObjects);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when fetching objects does not return 200', function (done) {
        mockBackend.whenGET(topLevelEndpoint).respond(401);
        topLevelService.all().catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should build nested objects when fetching all object if needed', function(done) {
        mockBackend.whenGET(topLevelEndpoint).respond(fakeObjects);
        mockBackend.whenGET('{1}{2}/'.assign(nestedEndpoint, nestedOne.id)).respond(nestedOne);
        mockBackend.whenGET('{1}{2}/'.assign(nestedEndpoint, nestedTwo.id)).respond(nestedTwo);
        var expectedFakeOne = Object.clone(fakeOne);
        var expectedFakeTwo = Object.clone(fakeTwo);
        expectedFakeOne.nested = nestedOne;
        expectedFakeTwo.nested = nestedTwo;

        topLevelService.all({build: {nested: nestedService}}).then(function(objects) {
            expect(objects).toEqual([expectedFakeOne, expectedFakeTwo]);
            done();
        });
        mockBackend.flush();
    });

    it('should get object by id', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(topLevelEndpoint, fakeOne.id)).respond(fakeOne);
        topLevelService.get(fakeOne.id).success(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when get object by id does not return 200', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(topLevelEndpoint, fakeOne.id)).respond(401);
        topLevelService.get(fakeOne.id).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should create an object', function (done) {
        mockBackend.whenPOST(topLevelEndpoint).respond(201, fakeOne);
        topLevelService.create(fakeOne).success(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when create does not return 200', function (done) {
        mockBackend.whenPOST(topLevelEndpoint).respond(401);
        topLevelService.create(fakeOne).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should update object', function (done) {
        mockBackend.whenPUT('{1}{2}/'.assign(topLevelEndpoint, fakeOne.id)).respond(200);
        var changedOne = Object.clone(fakeOne);
        changedOne.propertyOne = 'changed';
        topLevelService.update(changedOne).success(function (response, status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when update object does not return 200', function (done) {
        mockBackend.whenPUT('{1}{2}/'.assign(topLevelEndpoint, fakeOne.id)).respond(401);
        var changedOne = Object.clone(fakeOne);
        changedOne.propertyOne = 'changed';
        topLevelService.update(changedOne).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should delete object by id', function (done) {
        mockBackend.whenDELETE('{1}{2}/'.assign(topLevelEndpoint, fakeTwo.id)).respond(200);
        topLevelService.del(fakeTwo).success(function (response, status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when delete does not return 200', function (done) {
        mockBackend.whenDELETE('{1}{2}/'.assign(topLevelEndpoint, fakeTwo.id)).respond(401);
        topLevelService.del(fakeTwo).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });
});


