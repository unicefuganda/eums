describe('Distribution Plan Service', function () {
    var distributionPlanService, mockBackend, distPlanEndpointUrl, salesOrdersEndpointUrl, mockNodeService, q, http, config, mockContactService;
    var planId = 1;

    var stubPlanOne = {
        id: planId,
        programme: 1,
        distributionplannode_set: [1, 2, 3, 4]
    };

    var fullNodeOne = {
        id: 1,
        parent: null,
        children: [2, 4],
        distribution_plan: 1
    };

    var fullNodeTwo = {
        id: 2,
        parent: 1,
        children: [3],
        distribution_plan: 1
    };

    var fullNodeThree = {
        id: 3,
        parent: 2,
        children: [],
        distribution_plan: 1
    };

    var fullNodeFour = {
        id: 4,
        parent: 1,
        children: [],
        distribution_plan: 1
    };

    var stubDistributionPlans = [
        stubPlanOne,
        {
            id: 2,
            programme: 2,
            distributionplannode_set: []
        }
    ];

    var expectedNodeTree = {
        id: 1, parent: null, distribution_plan: 1,
        children: [
            {
                id: 2,
                parent: 1,
                distribution_plan: 1,
                children: [
                    {
                        id: 3,
                        parent: 2,
                        children: [],
                        distribution_plan: 1
                    }
                ]
            },
            fullNodeFour
        ]
    };

    beforeEach(function () {
        module('Delivery');

        mockNodeService = jasmine.createSpyObj('mockNodeService', ['getPlanNodeDetails', 'updateNodeTracking']);
        mockContactService = jasmine.createSpyObj('mockContactService', ['get']);

        module(function ($provide) {
            $provide.value('DeliveryNodeService', mockNodeService);
            $provide.value('ContactService', mockContactService);
        });

        inject(function (DeliveryService, $httpBackend, $q, EumsConfig, $http) {
            mockNodeService.getPlanNodeDetails.and.callFake(fakeGetNodeDetails);
            q = $q;
            http = $http;
            config = EumsConfig;

            mockBackend = $httpBackend;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;
            salesOrdersEndpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER;
            distributionPlanService = DeliveryService;
        });
    });

    it('should fetch all distribution plans', function (done) {
        mockBackend.whenGET(distPlanEndpointUrl).respond(stubDistributionPlans);
        distributionPlanService.fetchPlans().then(function (response) {
            expect(response.data).toEqual(stubDistributionPlans);
            done();
        });
        mockBackend.flush();
    });

    var fakeGetNodeDetails = function () {
        var nodeId = arguments[0];
        var deferred = q.defer();

        var idNodeMap = {1: fullNodeOne, 2: fullNodeTwo, 3: fullNodeThree, 4: fullNodeFour};
        var deferredNodeOneRequest = q.defer();
        deferredNodeOneRequest.resolve(fullNodeOne);

        var deferredNodeTwoRequest = q.defer();
        deferredNodeTwoRequest.resolve(fullNodeTwo);

        if (nodeId === fullNodeOne.id) {
            return deferredNodeOneRequest.promise;
        }
        else if (nodeId === fullNodeTwo.id) {
            return deferredNodeTwoRequest.promise;
        }

        deferred.resolve(idNodeMap[nodeId]);
        return deferred.promise;
    };
});


describe('UNICEF IP', function () {
    var planId = 1, planNodeOne = 3, planNodeTwo = 4, planNodeThree = 2;
    var stubDeliveryNodes = [
        {
            'id': planNodeOne,
            'parent': 2,
            'distribution_plan': planId,
            'children': [],
            'location': 'Mbarara',
            'distributionplanlineitem_set': [
                5,
                6
            ],
            'consignee': 10,
            'tree_position': 'MIDDLE_MAN',
            'contact_person_id': '542bfa6308453c32ffd4cadf'
        },
        {
            'id': planNodeTwo,
            'parent': 2,
            'distribution_plan': planId,
            'children': [],
            'location': 'Gulu',
            'distributionplanlineitem_set': [
                7,
                8
            ],
            'consignee': 3,
            'tree_position': 'END_USER',
            'contact_person_id': '542bfa6308453c32ffd4cadf'
        },
        {
            'id': planNodeThree,
            'parent': '',
            'distribution_plan': planId,
            'children': [
                3, 4
            ],
            'location': 'Lira',
            'distributionplanlineitem_set': [
                3,
                4
            ],
            'consignee': 1,
            'tree_position': 'IMPLEMENTING_PARTNER',
            'contact_person_id': '542bfa6308453c32ffd4cadf'
        }
    ];


    var stubConsigneeResponses = [
        {
            'node': planNodeOne,
            'amountSent': 100,
            'amountReceived': '50',
            'value': 1000,
            'consignee': {
                'id': 10,
                'name': 'PADER DHO',
                'type': 'END_USER'
            },
            'satisfiedWithProduct': 'Yes',
            'productReceived': 'Yes',
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'revisedDeliveryDate': 'didnt not specify',
            'qualityOfProduct': 'Good',
            'feedbackAboutDissatisfaction': 'they were damaged',
            'informedOfDelay': 'No',
            'dateOfReceipt': '7/10/2014',
            'programme': {
                'id': 3,
                'name': 'YI107 - PCR 3 KEEP CHILDREN SAFE'
            }
        },
        {
            'node': planNodeOne,
            'amountSent': 100,
            'amountReceived': '50',
            'value': 500,
            'consignee': {
                'id': 10,
                'name': 'PADER DHO',
                'type': 'END_USER'
            },
            'productReceived': 'No',
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'qualityOfProduct': 'Good',
            'informedOfDelay': 'No',
            'dateOfReceipt': '6/10/2014',
            'programme': {
                'id': 3,
                'name': 'YI107 - PCR 3 KEEP MY CHILDREN SAFE'
            }
        },
        {
            'node': planNodeTwo,
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'productReceived': 'No',
            'informedOfDelay': 'No',
            'consignee': {
                'id': 4,
                'name': 'ARUA DHO DR. ANGUZU PATRICK',
                'type': 'MIDDLE_MAN'
            },
            'amountReceived': '30',
            'amountSent': 30,
            'value': 300,
            'programme': {
                'id': 3,
                'name': 'YI107 - PCR 3 KEEP CHILDREN SAFE'
            }
        }
    ];
    var stubEndUserResponses = [
        {
            'node': planNodeOne,
            'amountSent': 100,
            'amountReceived': '50',
            'value': 1000,
            'consignee': {
                'id': 10,
                'name': 'PADER DHO',
                'type': 'END_USER'
            },
            'satisfiedWithProduct': 'Yes',
            'productReceived': 'Yes',
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'revisedDeliveryDate': 'didnt not specify',
            'qualityOfProduct': 'Good',
            'feedbackAboutDissatisfaction': 'they were damaged',
            'informedOfDelay': 'No',
            'dateOfReceipt': '7/10/2014',
            'programme': {
                'id': 3,
                'name': 'YI107 - PCR 3 KEEP CHILDREN SAFE'
            },
            location: 'Mbarara'
        },
        {
            'node': planNodeOne,
            'amountSent': 100,
            'amountReceived': '50',
            'value': 500,
            'consignee': {
                'id': 10,
                'name': 'PADER DHO',
                'type': 'END_USER'
            },
            'productReceived': 'No',
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'qualityOfProduct': 'Good',
            'informedOfDelay': 'No',
            'dateOfReceipt': '6/10/2014',
            'programme': {
                'id': 3,
                'name': 'YI107 - PCR 3 KEEP MY CHILDREN SAFE'
            },
            location: 'Mbarara'
        }
    ];
    var locationResponses = [{location: 'Mbarara', consigneeResponses: stubEndUserResponses}];

    var scope, distributionPlanNodeService, distributionPlanService, deferredPlanNodePromise, httpBackend, eumsConfig, deferredNodePromise;

    beforeEach(function () {
        module('Delivery');
        distributionPlanNodeService = jasmine.createSpyObj('distributionPlanNodeService', ['getPlanNodeDetails', 'get']);

        module(function ($provide) {
            $provide.value('DeliveryNodeService', distributionPlanNodeService);
        });

        inject(function (DeliveryService, DeliveryNodeService, $q, $httpBackend, EumsConfig, $rootScope) {
            scope = $rootScope.$new();
            eumsConfig = EumsConfig;
            httpBackend = $httpBackend;
            deferredPlanNodePromise = $q.defer();
            deferredNodePromise = $q.defer();
            distributionPlanService = DeliveryService;
            distributionPlanNodeService.getPlanNodeDetails.and.returnValue(deferredPlanNodePromise.promise);
            distributionPlanNodeService.get.and.returnValue(deferredNodePromise.promise);
        });

    });

    it('should get the nodes for a plan', function (done) {
        var stubPlan = {id: 1, distributionplannode_set: [2]};
        var expectedPlanNode = stubDeliveryNodes[0];
        deferredNodePromise.resolve(expectedPlanNode);
        httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeOne + '/').respond(expectedPlanNode);
        distributionPlanService.getNodes(stubPlan).then(function (expectedDeliveryNodes) {
            expect(expectedDeliveryNodes).toEqual([expectedPlanNode]);
            done();
        });
        scope.$apply();
    });

    describe('consignee responses', function () {
        beforeEach(function () {
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.RESPONSES).respond(stubConsigneeResponses);
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.END_USER_RESPONSES).respond(stubEndUserResponses);
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeOne + '/').respond(stubDeliveryNodes[0]);
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeTwo + '/').respond(stubDeliveryNodes[1]);
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?search=IMPLEMENTING_PARTNER').respond([stubDeliveryNodes[2]]);
        });

        it('should get all consignee responses', function () {
            distributionPlanService.getAllConsigneeResponses().then(function (responses) {
                expect(responses.data).toEqual(stubConsigneeResponses);
            });
            httpBackend.flush();
        });

        it('should get all end user responses', function () {
            distributionPlanService.getAllEndUserResponses().then(function (responses) {
                expect(responses.data).toEqual(stubEndUserResponses);
            });
            httpBackend.flush();
        });

        it('should aggregate all responses', function () {
            var aggregates = distributionPlanService.aggregateStats(locationResponses, undefined);
            expect(aggregates).toEqual({
                location: undefined,
                totalSent: 2,
                totalReceived: 1,
                totalNotReceived: 1,
                totalValueSent: 150000,
                totalValueReceived: 75000,
                percentageReceived: 50,
                percentageNotReceived: 50
            });
        });

        it('should aggregate all consignee responses', function (done) {
            distributionPlanService.aggregateResponses().then(function (aggregates) {
                // TODO: Change back to this when using all responses, not just end user responses
                // expect(aggregates).toEqual({ location: 'UGANDA', totalSent: 3, totalReceived: 1, totalNotReceived: 2 });
                expect(aggregates).toEqual({
                    location: undefined, totalSent: 2, totalReceived: 1, totalNotReceived: 1, totalValueSent: 150000,
                    totalValueReceived: 75000,
                    percentageReceived: 50,
                    percentageNotReceived: 50
                });
                done();
            });
            httpBackend.flush();
        });

        it('should aggregate consignee responses for a district', function (done) {
            var district = 'Gulu';
            distributionPlanService.aggregateResponsesForDistrict(district).then(function (aggregates) {
                // TODO: Change back to this when using all responses, not just end user responses
                // expect(aggregates).toEqual({location: 'Gulu', totalSent: 1, totalReceived: 0, totalNotReceived: 1});
                expect(aggregates).toEqual({});
                done();
            });
            httpBackend.flush();
        });

        it('should map all consignee responses to node location', function (done) {
            distributionPlanService.mapConsigneesResponsesToNodeLocation().then(function (consigneesWithLocation) {
                expect(consigneesWithLocation[0].location).toBe(stubDeliveryNodes[0].location);
                done();
            });
            httpBackend.flush();
        });

        it('should group responses by location', function (done) {
            stubConsigneeResponses[0].location = stubDeliveryNodes[0].location;
            stubConsigneeResponses[1].location = stubDeliveryNodes[0].location;
            stubConsigneeResponses[2].location = stubDeliveryNodes[1].location;
            distributionPlanService.groupAllResponsesByLocation().then(function (responsesByLocation) {
//                TODO: Replace lower expectation with this when getAllUserResponses is replaced with getAllResponses
//                expect(responsesByLocation).toEqual([
//                    {
//                        location: stubDeliveryNodes[0].location.toLowerCase(),
//                        consigneeResponses: [stubConsigneeResponses[0], stubConsigneeResponses[1]]
//                    },
//                    {
//                        location: stubDeliveryNodes[1].location.toLowerCase(),
//                        consigneeResponses: [stubConsigneeResponses[2]]
//                    }
//                ]);

                expect(responsesByLocation).toEqual([
                    {
                        location: stubDeliveryNodes[0].location.toLowerCase(),
                        consigneeResponses: [stubConsigneeResponses[0], stubConsigneeResponses[1]]
                    }
                ]);
                done();
            });
            httpBackend.flush();
        });

        //TODO un-x this
        xit('should group responses for a given location', function (done) {
            var district = 'Gulu';
            distributionPlanService.getResponsesByLocation(district).then(function (responses) {
                expect(responses).toEqual([
                    {
                        node: 4,
                        item: 'Safety box f.used syrgs/ndls 5lt/BOX-25',
                        productReceived: 'No',
                        informedOfDelay: 'No',
                        consignee: {
                            id: 4,
                            name: 'ARUA DHO DR. ANGUZU PATRICK',
                            type: 'MIDDLE_MAN'
                        },
                        amountReceived: '30',
                        amountSent: 30,
                        programme: {
                            id: 3,
                            name: 'YI107 - PCR 3 KEEP CHILDREN SAFE'
                        },
                        location: 'Gulu'
                    }
                ]);
                done();
            });
            httpBackend.flush();
        });

        it('should group responses for a given location', function (done) {
            var district = 'Mbarara';
            distributionPlanService.getResponsesByLocation(district).then(function (responses) {
                expect(responses).toEqual([
                    {
                        node: 3,
                        amountSent: 100,
                        amountReceived: '50',
                        value: 1000,
                        consignee: {
                            id: 10,
                            name: 'PADER DHO',
                            type: 'END_USER'
                        },
                        satisfiedWithProduct: 'Yes',
                        productReceived: 'Yes',
                        item: 'Safety box f.used syrgs/ndls 5lt/BOX-25',
                        revisedDeliveryDate: 'didnt not specify',
                        qualityOfProduct: 'Good',
                        feedbackAboutDissatisfaction: 'they were damaged',
                        informedOfDelay: 'No',
                        dateOfReceipt: '7/10/2014',
                        programme: {
                            id: 3,
                            name: 'YI107 - PCR 3 KEEP CHILDREN SAFE'
                        },
                        location: 'Mbarara'
                    },
                    {
                        node: 3,
                        amountSent: 100,
                        amountReceived: '50',
                        value: 500,
                        consignee: {
                            id: 10,
                            name: 'PADER DHO',
                            type: 'END_USER'
                        }, productReceived: 'No',
                        item: 'Safety box f.used syrgs/ndls 5lt/BOX-25',
                        qualityOfProduct: 'Good',
                        informedOfDelay: 'No',
                        dateOfReceipt: '6/10/2014',
                        programme: {
                            id: 3,
                            name: 'YI107 - PCR 3 KEEP MY CHILDREN SAFE'
                        },
                        location: 'Mbarara'
                    }
                ]);
                done();
            });
            httpBackend.flush();
        });

        it('should order responses for a given location by receipt date', function (done) {
            var district = 'Mbarara';
            distributionPlanService.orderAllResponsesByDate(district).then(function (responses) {
                expect(responses).toEqual([
                    {
                        node: 3,
                        amountSent: 100,
                        amountReceived: '50',
                        value: 500,
                        consignee: {
                            id: 10,
                            name: 'PADER DHO',
                            type: 'END_USER'
                        }, productReceived: 'No',
                        item: 'Safety box f.used syrgs/ndls 5lt/BOX-25',
                        qualityOfProduct: 'Good',
                        informedOfDelay: 'No',
                        dateOfReceipt: '6/10/2014',
                        programme: {
                            id: 3,
                            name: 'YI107 - PCR 3 KEEP MY CHILDREN SAFE'
                        },
                        location: 'Mbarara'
                    },
                    {
                        node: 3,
                        amountSent: 100,
                        amountReceived: '50',
                        value: 1000,
                        consignee: {
                            id: 10,
                            name: 'PADER DHO',
                            type: 'END_USER'
                        },
                        satisfiedWithProduct: 'Yes',
                        productReceived: 'Yes',
                        item: 'Safety box f.used syrgs/ndls 5lt/BOX-25',
                        revisedDeliveryDate: 'didnt not specify',
                        qualityOfProduct: 'Good',
                        feedbackAboutDissatisfaction: 'they were damaged',
                        informedOfDelay: 'No',
                        dateOfReceipt: '7/10/2014',
                        programme: {
                            id: 3,
                            name: 'YI107 - PCR 3 KEEP CHILDREN SAFE'
                        },
                        location: 'Mbarara'
                    }

                ]);
                done();
            });
            httpBackend.flush();
        });
    });

});