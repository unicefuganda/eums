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

    var sales_order_details = {'sales_document': '00001',
        'material_code': '1234', 'order_quantity': '100',
        'date_created': '2014-09-10',
        'net_value': '1000', 'net_price': '10', 'description': 'Test'};


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


describe('Distribution Plan Parameters Service', function () {
    var distributionPlanParameterService;

    beforeEach(function () {
        module('DistributionPlan');

        inject(function (DistributionPlanParameters) {
            distributionPlanParameterService = DistributionPlanParameters;
        });
    });

    it('should save and retrieve parameters based on key-value', function () {
        var key = 'salesOrders';
        var value = ['1', '2'];
        distributionPlanParameterService.saveVariable(key, value);
        expect(value).toEqual(distributionPlanParameterService.retrieveVariable(key));
    });
});

describe('UNICEF IP', function () {
    var planId = 1, planNodeOne = 3, planNodeTwo = 4, planNodeThree = 2;
    var stubDistributionPlanNodes = [
        {
            'id': planNodeOne,
            'parent': 2,
            'distribution_plan': planId,
            'children': [
            ],
            'location': 'Mbarara',
            'mode_of_delivery': 'DIRECT_DELIVERY',
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
            'children': [
            ],
            'location': 'Gulu',
            'mode_of_delivery': 'DIRECT_DELIVERY',
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
            'mode_of_delivery': 'DIRECT_DELIVERY',
            'distributionplanlineitem_set': [
                3,
                4
            ],
            'consignee': 1,
            'tree_position': 'MIDDLE_MAN',
            'contact_person_id': '542bfa6308453c32ffd4cadf'
        }

    ];

    var scope, distributionPlanNodeService, distributionPlanService, deferredPlanNodePromise, httpBackend, eumsConfig, deferredNodePromise;

    beforeEach(function () {
        module('DistributionPlan');
        distributionPlanNodeService = jasmine.createSpyObj('distributionPlanNodeService', ['getPlanNodeDetails', 'getPlanNodeById']);


        module(function ($provide) {
            $provide.value('DistributionPlanNodeService', distributionPlanNodeService);
        });


        inject(function (DistributionPlanService, $q, $httpBackend, EumsConfig, $rootScope) {
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
});