describe('Service Factory', function () {
    var mockBackend, q, levelOneService, levelTwoService;
    const levelOneEndpoint = '/some-endpoint/';
    const levelTwoEndpoint = '/nested-endpoint/';
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
            levelTwoService = ServiceFactory({uri: levelTwoEndpoint});
            levelOneService = ServiceFactory({uri: levelOneEndpoint, propertyServiceMap: {
                nested: levelTwoService, children: levelTwoService, relatives: levelTwoService}
            });
        });
    });

    it('should get all objects from api endpoint', function (done) {
        mockBackend.whenGET(levelOneEndpoint).respond(fakeObjects);
        levelOneService.all().then(function (objects) {
            expect(objects).toEqual(fakeObjects);
            done();
        });
        mockBackend.flush();
    });

    it('should convert objects to camelCase after fetching all them from api', function(done) {
        mockBackend.whenGET(levelOneEndpoint).respond([{id: 1, first_property: 3}, {id: 2, first_property: 4}]);
        levelOneService.all().then(function (object) {
            expect(object).toEqual([{id: 1, firstProperty: 3}, {id: 2, firstProperty: 4}]);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when fetching objects does not return 200', function (done) {
        mockBackend.whenGET(levelOneEndpoint).respond(401);
        levelOneService.all().catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should build nested objects when fetching all objects if needed', function (done) {
        mockBackend.whenGET(levelOneEndpoint).respond(fakeObjects);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedOne.id)).respond(nestedOne);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedTwo.id)).respond(nestedTwo);
        var expectedFakeOne = Object.clone(fakeOne);
        var expectedFakeTwo = Object.clone(fakeTwo);
        expectedFakeOne.nested = nestedOne;
        expectedFakeTwo.nested = nestedTwo;

        levelOneService.all(['nested']).then(function (objects) {
            expect(objects).toEqual([expectedFakeOne, expectedFakeTwo]);
            done();
        });
        mockBackend.flush();
    });

    it('should get object by id', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond(fakeOne);
        levelOneService.get(fakeOne.id).then(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should convert objects to camelCase after fetching them from api', function(done) {
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond({id: 1, first_property: {inner_property: 2}});
        levelOneService.get(1).then(function (object) {
            expect(object).toEqual({id: 1, firstProperty: {innerProperty: 2}});
            done();
        });
        mockBackend.flush();
    });

    it('should build nested objects when fetching object by id if needed', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond(fakeOne);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedOne.id)).respond(nestedOne);
        var expectedFakeOne = Object.clone(fakeOne);
        expectedFakeOne.nested = nestedOne;

        levelOneService.get(fakeOne.id, ['nested']).then(function (object) {
            expect(object).toEqual(expectedFakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should fetch objects in list properties when fetching all when required', function(done) {
        var flat = {id: 11, children: [nestedOne.id, nestedTwo.id], relatives: [nestedOne.id, nestedTwo.id]};
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, flat.id)).respond(flat);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedOne.id)).respond(nestedOne);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedTwo.id)).respond(nestedTwo);
        var built = Object.clone(flat);
        built.children = [nestedOne, nestedTwo];
        built.relatives = [nestedOne, nestedTwo];
        levelOneService.get(flat.id, ['children', 'relatives']).then(function(object) {
            expect(object).toEqual(built);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when get object by id does not return 200', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond(401);
        levelOneService.get(fakeOne.id).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should create an object', function (done) {
        mockBackend.whenPOST(levelOneEndpoint).respond(201, fakeOne);
        levelOneService.create(fakeOne).then(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when create does not return 200', function (done) {
        mockBackend.whenPOST(levelOneEndpoint).respond(401);
        levelOneService.create(fakeOne).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should update flat object', function (done) {
        var changedOne = Object.clone(fakeOne);
        changedOne.propertyOne = 'changed';
        mockBackend.expectPUT('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id), changedOne).respond(200);
        levelOneService.update(changedOne).then(function (status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should flatten properties when updating', function (done) {
        var nestedFakeOne = Object.clone(fakeOne);
        nestedFakeOne.nested = nestedOne;
        mockBackend.expectPUT('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id), fakeOne).respond(200);
        levelOneService.update(nestedFakeOne).then(function (status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when update object does not return 200', function (done) {
        mockBackend.whenPUT('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond(401);
        var changedOne = Object.clone(fakeOne);
        changedOne.propertyOne = 'changed';
        levelOneService.update(changedOne).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });

    it('should delete object by id', function (done) {
        mockBackend.whenDELETE('{1}{2}/'.assign(levelOneEndpoint, fakeTwo.id)).respond(200);
        levelOneService.del(fakeTwo).then(function (status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should notify when delete does not return 200', function (done) {
        mockBackend.whenDELETE('{1}{2}/'.assign(levelOneEndpoint, fakeTwo.id)).respond(401);
        levelOneService.del(fakeTwo).catch(function (error) {
            expect(error.status).toBe(401);
            done();
        });
        mockBackend.flush();
    });
});


