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

    it('should get distribution plan details, with node tree built out', function(done) {
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

         inject(function (DistributionPlanParameters){
             distributionPlanParameterService = DistributionPlanParameters;
         });
     });

    it('should save and retrieve parameters based on key-value', function(){
        var key = 'salesOrders';
        var value = ['1', '2'];
        distributionPlanParameterService.saveVariable(key, value);
        expect(value).toEqual(distributionPlanParameterService.retrieveVariable(key));
    });
});