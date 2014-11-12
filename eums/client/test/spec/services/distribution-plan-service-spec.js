describe('Distribution Plan Service', function () {
    var distributionPlanService, mockBackend, distPlanEndpointUrl, salesOrdersEndpointUrl, mockNodeService, q, http, config;
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

    var expectedPlan = {
        id: planId,
        programme: 1,
        distributionplannode_set: [1, 2, 3, 4],
        nodeTree: expectedNodeTree
    };

    var sales_order_details = {
        'sales_document': '00001',
        'materialCode': '1234', 'order_quantity': '100',
        'date_created': '2014-09-10',
        'net_value': '1000', 'net_price': '10', 'description': 'Test'
    };


    beforeEach(function () {
        module('DistributionPlan');

        mockNodeService = jasmine.createSpyObj('mockNodeService', ['getPlanNodeDetails']);

        module(function ($provide) {
            $provide.value('DistributionPlanNodeService', mockNodeService);
        });

        inject(function (DistributionPlanService, $httpBackend, $q, EumsConfig, $http) {
            mockNodeService.getPlanNodeDetails.and.callFake(fakeGetNodeDetails);
            q = $q;
            http = $http;
            config = EumsConfig;

            mockBackend = $httpBackend;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;
            salesOrdersEndpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER;
            distributionPlanService = DistributionPlanService;
        });
    });

    it('should create distribution plan', function (done) {
        var programmeId = 1;
        var stubCreatedPlan = {id: planId, programme: programmeId, distributionplannode_set: []};
        mockBackend.whenPOST(distPlanEndpointUrl).respond(201, stubCreatedPlan);
        distributionPlanService.createPlan({programme: programmeId}).then(function (createdPlan) {
            expect(stubCreatedPlan).toEqual(createdPlan);
            done();
        });
        mockBackend.flush();
    });

    it('should fetch all sales orders', function (done) {
        mockBackend.whenGET(salesOrdersEndpointUrl).respond(sales_order_details);
        distributionPlanService.getSalesOrders().then(function (response) {
            expect(response.data).toEqual(sales_order_details);
            done();
        });
        mockBackend.flush();
    });

    it('should fetch all distribution plans', function (done) {
        mockBackend.whenGET(distPlanEndpointUrl).respond(stubDistributionPlans);
        distributionPlanService.fetchPlans().then(function (response) {
            expect(response.data).toEqual(stubDistributionPlans);
            done();
        });
        mockBackend.flush();
    });

    it('should get distribution plan details, with node tree built out', function (done) {
        mockBackend.whenGET(distPlanEndpointUrl + planId + '/').respond(stubPlanOne);
        distributionPlanService.getPlanDetails(planId).then(function (detailedPlan) {
            expect(detailedPlan).toEqual(expectedPlan);
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
    var stubDistributionPlanNodes = [
        {
            'id': planNodeOne,
            'parent': 2,
            'distribution_plan': planId,
            'children': [],
            'location': 'Mbarara',
            'modeOfDelivery': 'DIRECT_DELIVERY',
            'distributionplanlineitem_set': [
                5,
                6
            ],
            'consignee': 2,
            'tree_position': 'MIDDLE_MAN',
            'contact_person_id': '542bfa6308453c32ffd4cadf'
        },
        {
            'id': planNodeTwo,
            'parent': 2,
            'distribution_plan': planId,
            'children': [],
            'location': 'Gulu',
            'modeOfDelivery': 'DIRECT_DELIVERY',
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
            'modeOfDelivery': 'DIRECT_DELIVERY',
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
            'consignee': {
                'id': 10,
                'name': 'PADER DHO'
            },
            'satisfiedWithProduct': 'Yes',
            'productReceived': 'Yes',
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'revisedDeliveryDate': 'didnt not specify',
            'qualityOfProduct': 'Good',
            'feedbackAboutDissatisfaction': 'they were damaged',
            'informedOfDelay': 'No',
            'dateOfReceipt': '6/10/2014',
            'programme': {
                'id': 3,
                'name': 'YI107 - PCR 3 KEEP CHILDREN SAFE'
            }
        },
        {
            'node': planNodeTwo,
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'productReceived': 'No',
            'informedOfDelay': 'No',
            'consignee': {
                'id': 4,
                'name': 'ARUA DHO DR. ANGUZU PATRICK'
            },
            'amountReceived': '30',
            'amountSent': 30,
            'programme': {
                'id': 3,
                'name': 'YI107 - PCR 3 KEEP CHILDREN SAFE'
            }
        }
    ];

    var scope, distributionPlanNodeService, distributionPlanService, deferredPlanNodePromise, httpBackend, eumsConfig, deferredNodePromise;

    beforeEach(function () {
        module('DistributionPlan');
        distributionPlanNodeService = jasmine.createSpyObj('distributionPlanNodeService', ['getPlanNodeDetails', 'getPlanNodeById']);

        module(function ($provide) {
            $provide.value('DistributionPlanNodeService', distributionPlanNodeService);
        });

        inject(function (DistributionPlanService, DistributionPlanNodeService, $q, $httpBackend, EumsConfig, $rootScope) {
            scope = $rootScope.$new();
            eumsConfig = EumsConfig;
            httpBackend = $httpBackend;
            deferredPlanNodePromise = $q.defer();
            deferredNodePromise = $q.defer();
            distributionPlanService = DistributionPlanService;
            distributionPlanNodeService.getPlanNodeDetails.and.returnValue(deferredPlanNodePromise.promise);
            distributionPlanNodeService.getPlanNodeById.and.returnValue(deferredNodePromise.promise);
        });

    });

    it('should get the nodes for a plan', function (done) {
        var stubPlan = {id: 1, distributionplannode_set: [2]};
        var expectedPlanNode = stubDistributionPlanNodes[0];
        deferredNodePromise.resolve(expectedPlanNode);
        httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeOne + '/').respond(expectedPlanNode);
        distributionPlanService.getNodes(stubPlan).then(function (expectedDistributionPlanNodes) {
            expect(expectedDistributionPlanNodes).toEqual([expectedPlanNode]);
            done();
        });
        scope.$apply();
    });


    it('should get all plan nodes', function (done) {

        var stubPlans = [
            {id: 1, distributionplannode_set: [2]}
        ];
        var expectedPlanNode = stubDistributionPlanNodes[0];

        deferredNodePromise.resolve(expectedPlanNode);
        httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN).respond(stubPlans);
        httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeOne + '/').respond(expectedPlanNode);

        distributionPlanService.getAllPlansNodes().then(function (unicefIps) {
            expect(unicefIps).toEqual([expectedPlanNode]);
            done();
        });
        scope.$apply();
        httpBackend.flush();
    });

    describe('consignee responses', function () {
        beforeEach(function(){
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.RESPONSES).respond(stubConsigneeResponses);
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeOne + '/').respond(stubDistributionPlanNodes[0]);
            httpBackend.whenGET(eumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeTwo + '/').respond(stubDistributionPlanNodes[1]);
        });

        it('should get all consignee responses', function () {
            distributionPlanService.getAllConsigneeResponses().then(function (responses) {
                expect(responses.data).toEqual(stubConsigneeResponses);
            });
            httpBackend.flush();
        });

        it('should get distribution plan node by id', function () {
            distributionPlanService.getDistributionPlanNodeById(planNodeOne).then(function (responses) {
                expect(responses.data).toEqual(stubDistributionPlanNodes[0]);
            });
            httpBackend.flush();
        });

        it('should map all consignee responses to node location', function (done) {
            distributionPlanService.mapConsigneesResponsesToNodeLocation().then(function (consigneesWithLocation) {
                expect(consigneesWithLocation[0].location).toBe(stubDistributionPlanNodes[0].location);
                done();
            });
            httpBackend.flush();
        });

        it('should group responses by location', function (done) {
             distributionPlanService.groupResponsesByLocation().then(function (responsesByLocation) {
                expect(responsesByLocation).toEqual([
                    {location: 'mbarara', consigneeResponses: jasmine.any(Function)},
                    {location: 'gulu', consigneeResponses: jasmine.any(Function)}
                ]);
                expect(responsesByLocation[0].consigneeResponses()[0].node).toEqual(planNodeOne);
                done();
            });
            httpBackend.flush();
        });
    });

});