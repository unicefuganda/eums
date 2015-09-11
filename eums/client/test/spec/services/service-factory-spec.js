describe('Service Factory', function () {
    var mockBackend, q, levelOneService, levelTwoService, serviceFactory, levelThreeService, levelFourService, grandChildService;
    const levelOneEndpoint = '/some-endpoint/';
    const levelTwoEndpoint = '/nested-endpoint/';
    const levelThreeEndpoint = '/third-endpoint/';
    const levelFourEndpoint = '/fourth-endpoint/';
    const grandChildEndpoint = '/grand-child-endpoint';
    const grandChild = {id: 11, name: 'Job'};
    const fakeOne = {id: 1, propertyOne: 'one', propertyTwo: 'two', nested: 1};
    const fakeTwo = {id: 2, propertyOne: 'one', propertyTwo: 'two', nested: 2};
    const fakeThree = {id: 3, propertyOne: 'one', propertyTwo: 'two', nested: 2};
    const nestedOne = {id: 1, properties: {}, child: grandChild.id};
    const nestedTwo = {id: 2, properties: []};
    const nestedThree = {id: 3, properties: []};
    const fakeObjects = [fakeOne, fakeTwo];

    beforeEach(function () {
        module('eums.service-factory');
        inject(function (ServiceFactory, $httpBackend, $q) {
            q = $q;
            serviceFactory = ServiceFactory;
            mockBackend = $httpBackend;
            grandChildService = ServiceFactory.create({uri: grandChildEndpoint});
            levelTwoService = ServiceFactory.create({
                uri: levelTwoEndpoint,
                propertyServiceMap: {child: grandChildService}
            });
            levelOneService = ServiceFactory.create({
                uri: levelOneEndpoint,
                propertyServiceMap: {nested: levelTwoService, children: levelTwoService, relatives: levelTwoService}
            });
            levelThreeService = ServiceFactory.create({
                uri: levelThreeEndpoint,
                propertyServiceMap: {child: levelOneService}
            });
            levelFourService = ServiceFactory.create({uri: levelFourEndpoint, propertyServiceMap: {child: 'self'}});

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

    it('should convert objects to camelCase after fetching all them from api', function (done) {
        mockBackend.whenGET(levelOneEndpoint).respond([
            {id: 1, first_property: 3},
            {id: 2, first_property: 4}
        ]);
        levelOneService.all().then(function (object) {
            expect(object).toEqual([
                {id: 1, firstProperty: 3},
                {id: 2, firstProperty: 4}
            ]);
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

    it('should build nested objects from the same service', function (done) {
        mockBackend.whenGET(levelFourEndpoint).respond([fakeThree]);
        mockBackend.whenGET('{1}{2}/'.assign(levelFourEndpoint, nestedThree.id)).respond(nestedThree);

        var expectedFake = Object.clone(fakeThree);
        levelFourService.all(['child']).then(function (objects) {
            expect(objects).toEqual([expectedFake]);
            done();
        });
        mockBackend.flush();
    });

    it('should make api filter calls on filter', function (done) {
        mockBackend.whenGET(levelOneEndpoint + '?param=value&other=1').respond(fakeObjects);
        levelOneService.filter({param: 'value', other: 1}).then(function (objects) {
            expect(objects).toEqual(fakeObjects);
            done();
        });
        mockBackend.flush();
    });

    it('should build nested objects when filtering', function (done) {
        mockBackend.whenGET(levelOneEndpoint + '?param=value').respond(fakeObjects);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedOne.id)).respond(nestedOne);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedTwo.id)).respond(nestedTwo);
        var expectedFakeOne = Object.clone(fakeOne);
        var expectedFakeTwo = Object.clone(fakeTwo);
        expectedFakeOne.nested = nestedOne;
        expectedFakeTwo.nested = nestedTwo;

        levelOneService.filter({param: 'value'}, ['nested']).then(function (objects) {
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

    it('should get object detail using detail route', function (done) {
        var detailRouteName = 'detail/';
        var expectedResponse = {details: 1};
        mockBackend.whenGET('{1}{2}/{3}'.assign(levelOneEndpoint, fakeOne.id, detailRouteName)).respond(expectedResponse);
        levelOneService.getDetail(fakeOne, detailRouteName).then(function (detail) {
            expect(detail).toEqual(expectedResponse);
            done();
        });
        mockBackend.flush();
    });

    it('should filter results from a detail route if filter-params are provided', function (done) {
        mockBackend.whenGET(levelOneEndpoint + '1/detail/?param=value&other=1').respond(fakeObjects);
        levelOneService.getDetail({id:1}, 'detail', undefined, {param: 'value', other: 1}).then(function (objects) {
            expect(objects).toEqual(fakeObjects);
            done();
        });
        mockBackend.flush();
    });


    it('should convert objects to camelCase after fetching them from api', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond({
            id: 1,
            first_property: {inner_property: 2}
        });
        levelOneService.get(1).then(function (object) {
            expect(object).toEqual({id: 1, firstProperty: {innerProperty: 2}});
            done();
        });
        mockBackend.flush();
    });

    it('should convert arrays to camelCase after fetching from the api', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond({
            id: 1,
            first_property: [
                {inner_property: 2}
            ]
        });
        levelOneService.get(1).then(function (object) {
            expect(object).toEqual({
                id: 1, firstProperty: [
                    {innerProperty: 2}
                ]
            });
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

    it('should fetch deep nested objects', function (done) {
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id)).respond(fakeOne);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedOne.id)).respond(nestedOne);
        mockBackend.whenGET('{1}{2}/'.assign(grandChildEndpoint, grandChild.id)).respond(grandChild);
        var expectedFakeOne = Object.clone(fakeOne);
        var expectedNestedOne = Object.clone(nestedOne);
        expectedNestedOne.child = grandChild;
        expectedFakeOne.nested = expectedNestedOne;

        levelOneService.get(fakeOne.id, ['nested.child']).then(function (object) {
            expect(object).toEqual(expectedFakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should not build nested object if its id is null even if building the nested object is requested', function (done) {
        var obj = {id: fakeOne.id, nested: null};
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, obj.id)).respond(obj);
        levelOneService.get(obj.id, ['nested']).then(function (object) {
            expect(object).toEqual(obj);
            done();
        });
        mockBackend.flush();
    });

    it('should search against endpoint', function (done) {
        var searchString = 'search string';
        mockBackend.expectGET('{1}?search={2}'.assign(levelOneEndpoint, searchString)).respond(fakeObjects);
        levelOneService.search(searchString).then(function (matches) {
            expect(matches).toEqual(fakeObjects);
            done();
        });
        mockBackend.flush();
    });

    it('should fetch objects in list properties when fetching all when required', function (done) {
        var flat = {id: 11, children: [nestedOne.id, nestedTwo.id], relatives: [nestedOne.id, nestedTwo.id]};
        mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, flat.id)).respond(flat);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedOne.id)).respond(nestedOne);
        mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, nestedTwo.id)).respond(nestedTwo);
        var built = Object.clone(flat);
        built.children = [nestedOne, nestedTwo];
        built.relatives = [nestedOne, nestedTwo];
        levelOneService.get(flat.id, ['children', 'relatives']).then(function (object) {
            expect(object).toEqual(built);
            done();
        });
        mockBackend.flush();
    });

    it('should get results from paginated response', function () {
        var expected = {results: [], count: 10, next: '?page=3', previous: '?page=1', pageSize: 10};
        mockBackend.whenGET(levelOneEndpoint).respond(expected);
        levelOneService.all().then(function (response) {
            expect(response.results).toEqual(expected.results);
            expect(response.next).toEqual(expected.next);
            expect(response.count).toEqual(expected.count);
            expect(response.previous).toEqual(expected.previous);
            expect(response.pageSize).toEqual(expected.pageSize);
        });
        mockBackend.flush();
    });

    it('should accept url params when fetching all', function () {
        mockBackend.expectGET(levelOneEndpoint + '?arg=val').respond([]);
        levelOneService.all([], {arg: 'val'});
        mockBackend.flush();
    });

    it('should accept url params when searching', function () {
        mockBackend.expectGET(levelOneEndpoint + '?arg=val&search=term').respond([]);
        levelOneService.search('term', [], {arg: 'val'});
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
        var expected = {id: 1, property_one: 'one', property_two: 'two', nested: 1};
        mockBackend.expectPOST(levelOneEndpoint, expected).respond(201, fakeOne);
        levelOneService.create(fakeOne).then(function (object) {
            expect(object).toEqual(fakeOne);
            done();
        });
        mockBackend.flush();
    });

    it('should flatten nested objects to ids before create', function (done) {
        var obj = {some_property: {id: 1}};
        var flattened = {some_property: 1};
        var apiResponse = {id: 3, some_property: 1};
        var expected = {id: 3, some_property: 1};
        mockBackend.expectPOST(levelOneEndpoint, flattened).respond(201, apiResponse);
        levelOneService.create(obj).then(function (created) {
            expect(created).toEqual(expected);
            done();
        });
        mockBackend.flush();
    });

    it('should change object keys to snake case when creating object', function (done) {
        var obj = {someProperty: 1};
        var expected = {some_property: 1};
        mockBackend.expectPOST(levelOneEndpoint, expected).respond(201, {id: 5, some_property: 1});
        levelOneService.create(obj).then(function () {
            done();
        });
        mockBackend.flush();
    });

    it('should change response keys to camel case  when requested, on creating object', function (done) {
        var obj = {some_property: 1};
        var apiResponse = {id: 3, some_response: 1};
        var expected = {id: 3, someResponse: 1};
        mockBackend.expectPOST(levelOneEndpoint, obj).respond(201, apiResponse);
        levelOneService.create(obj, {changeCaseOnResponse: true}).then(function (created) {
            expect(created).toEqual(expected);
            done();
        });
        mockBackend.flush();
    });

    it('should not change response keys when not requested to', function (done) {
        var obj = {some_property: 1};
        var apiResponse = {id: 3, some_response: 1};
        var expected = {id: 3, some_response: 1};
        mockBackend.expectPOST(levelOneEndpoint, obj).respond(201, apiResponse);
        levelOneService.create(obj).then(function (created) {
            expect(created).toEqual(expected);
            done();
        });
        mockBackend.flush();
    });

    it('should not change response keys when other extra options are requested', function (done) {
        var obj = {some_property: 1};
        var apiResponse = {id: 3, some_response: 1};
        var expected = {id: 3, some_response: 1};
        mockBackend.expectPOST(levelOneEndpoint, obj).respond(201, apiResponse);
        levelOneService.create(obj, {someOtherExtraOption: true}).then(function (created) {
            expect(created).toEqual(expected);
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

    it('should flatten object and change object keys to snake case before update', function (done) {
        var changedOne = Object.clone(fakeOne);
        changedOne.propertyOne = 'changed';
        var expected = {id: 1, property_one: changedOne.propertyOne, property_two: 'two', nested: 1};
        mockBackend.expectPUT('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id), expected).respond(200);
        levelOneService.update(changedOne).then(function (status) {
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
    it('should use "PATCH" when updating if specified', function (done) {
        var objectToUpdate = {id: fakeOne.id, property_one: 1};
        mockBackend.expectPATCH('{1}{2}/'.assign(levelOneEndpoint, fakeOne.id), objectToUpdate).respond(200);
        levelOneService.update(objectToUpdate, 'PATCH').then(function () {
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

    describe('when model option is specified', function () {
        var service;
        var Model = function (json) {
            this.firstName = json.firstName.toUpperCase();
        };
        beforeEach(function () {
            service = serviceFactory.create({
                uri: levelTwoEndpoint,
                model: Model
            });
        });

        it('should channel returned json through model, converting the object to camelCase', function (done) {
            var plainObject = {id: 1, first_name: 'Job'};
            mockBackend.whenGET('{1}{2}/'.assign(levelTwoEndpoint, plainObject.id)).respond(plainObject);
            service.get(plainObject.id).then(function (modelObject) {
                expect(modelObject).toEqual(new Model({id: 1, firstName: 'Job'}));
                done();
            });
            mockBackend.flush();
        });

        it('should return json through model when getting all, converting objects to camelCase', function (done) {
            var plainObjects = [
                {id: 1, first_name: 'Job'},
                {id: 2, first_name: 'Nim'}
            ];
            mockBackend.whenGET(levelTwoEndpoint).respond(plainObjects);
            service.all().then(function (modelObjects) {
                expect(modelObjects).toEqual([new Model({id: 1, firstName: 'Job'}), new Model({
                    id: 2,
                    firstName: 'Nim'
                })]);
                done();
            });
            mockBackend.flush();
        });

        it('should not use model when fetching object detail', function (done) {
            var detailRouteName = 'detail/';
            var expectedResponse = {details: 1};
            mockBackend.whenGET('{1}{2}/{3}'.assign(levelTwoEndpoint, fakeOne.id, detailRouteName)).respond(expectedResponse);
            service.getDetail(fakeOne, detailRouteName).then(function (detail) {
                expect(detail).toEqual(expectedResponse);
                done();
            });
            mockBackend.flush();
        });
    });

    describe('when additional methods are specified', function () {
        var service;
        beforeEach(function () {
            service = serviceFactory.create({
                methods: {
                    special: function () {
                        return this.get;
                    },
                    compute: function () {
                        return 10;
                    }
                }
            });
        });

        it('should add specified methods to service', function () {
            expect(service.compute()).toBe(10);
        });

        it('should make the service the context of added methods', function () {
            expect(service.special()).toEqual(service.get);
        });
    });

    describe('with "changeCase" option set to false', function () {
        var service;
        beforeEach(function () {
            service = serviceFactory.create({
                uri: levelOneEndpoint,
                changeCase: false
            });
        });

        it('should not change case on .create', function (done) {
            var obj = {someProperty: 1};
            var expected = {id: 5, someProperty: 1};
            mockBackend.expectPOST(levelOneEndpoint, obj).respond(201, expected);
            service.create(obj).then(function (created) {
                expect(created).toEqual(expected);
                done();
            });
            mockBackend.flush();
        });

        it('should not change case on .get', function (done) {
            var obj = {id: 1, some_property: 1};
            mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, obj.id)).respond(200, obj);
            service.get(obj.id).then(function (object) {
                expect(object).toEqual(obj);
                done();
            });
            mockBackend.flush();
        });

        it('should not change case on .update', function (done) {
            var obj = {id: 1, someProperty: 1};
            mockBackend.expectPUT('{1}{2}/'.assign(levelOneEndpoint, obj.id), obj).respond(200);
            service.update(obj).then(function () {
                done();
            });
            mockBackend.flush();
        });

        it('should not change case on .all', function (done) {
            var objects = [
                {id: 1, some_property: 1},
                {id: 2, some_property: 2}
            ];
            mockBackend.whenGET(levelOneEndpoint).respond(200, objects);
            service.all().then(function (list) {
                expect(list).toEqual(objects);
                done();
            });
            mockBackend.flush();
        });
    });

    describe('with "idField" option set', function () {
        var service;
        beforeEach(function () {
            service = serviceFactory.create({
                uri: levelOneEndpoint,
                idField: '_id'
            });
        });

        it('should use specified id field on .update', function (done) {
            var obj = {_id: 1, some_property: 1};
            mockBackend.expectPUT('{1}{2}/'.assign(levelOneEndpoint, obj._id), obj).respond(200);
            service.update(obj).then(function () {
                done();
            });
            mockBackend.flush();
        });

        it('should use specified id field on .delete', function (done) {
            var obj = {_id: 1, some_property: 1};
            mockBackend.expectDELETE('{1}{2}/'.assign(levelOneEndpoint, obj._id)).respond(200);
            service.del(obj).then(function () {
                done();
            });
            mockBackend.flush();
        });
    });

    describe('with "changeCase" option set to false', function () {
        var service;
        beforeEach(function () {
            service = serviceFactory.create({
                uri: levelOneEndpoint,
                changeCase: false
            });
        });

        it('should not change case on .create', function (done) {
            var obj = {someProperty: 1};
            var expected = {id: 5, someProperty: 1};
            mockBackend.expectPOST(levelOneEndpoint, obj).respond(201, expected);
            service.create(obj).then(function (created) {
                expect(created).toEqual(expected);
                done();
            });
            mockBackend.flush();
        });

        it('should not change case on .get', function (done) {
            var obj = {id: 1, some_property: 1};
            mockBackend.whenGET('{1}{2}/'.assign(levelOneEndpoint, obj.id)).respond(200, obj);
            service.get(obj.id).then(function (object) {
                expect(object).toEqual(obj);
                done();
            });
            mockBackend.flush();
        });

        it('should not change case on .update', function (done) {
            var obj = {id: 1, someProperty: 1};
            mockBackend.expectPUT('{1}{2}/'.assign(levelOneEndpoint, obj.id), obj).respond(200);
            service.update(obj).then(function () {
                done();
            });
            mockBackend.flush();
        });

        it('should not change case on .all', function (done) {
            var objects = [
                {id: 1, some_property: 1},
                {id: 2, some_property: 2}
            ];
            mockBackend.whenGET(levelOneEndpoint).respond(200, objects);
            service.all().then(function (list) {
                expect(list).toEqual(objects);
                done();
            });
            mockBackend.flush();
        });
    });

    describe('with "idField" option set', function () {
        var service;
        beforeEach(function () {
            service = serviceFactory.create({
                uri: levelOneEndpoint,
                idField: '_id'
            });
        });

        it('should use specified id field on .update', function (done) {
            var obj = {_id: 1, some_property: 1};
            mockBackend.expectPUT('{1}{2}/'.assign(levelOneEndpoint, obj._id), obj).respond(200);
            service.update(obj).then(function () {
                done();
            });
            mockBackend.flush();
        });

        it('should use specified id field on .delete', function (done) {
            var obj = {_id: 1, some_property: 1};
            mockBackend.expectDELETE('{1}{2}/'.assign(levelOneEndpoint, obj._id)).respond(200);
            service.del(obj).then(function () {
                done();
            });
            mockBackend.flush();
        });
    });
});
