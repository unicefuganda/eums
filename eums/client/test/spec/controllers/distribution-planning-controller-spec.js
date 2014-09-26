describe('DistributionPlanController', function () {

    var scope;
    var location, distPlanEndpointUrl;
    var mockContactService, flowchartService, mockPlanService;
    var deferred, deferredPlan;

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var stubPlanOne = {data: {
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2]
    }};

    var stubPlanTwo = {name: 'Plan 2',
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2],
        nodeTree: {
            id: 1,
            children: [],
            lineItems: [],
            distribution_plan: 1,
            consignee: {name: 'Test'}
        }};

    var stubPlanNoNodeList = {name: 'Plan 2',
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2],
        nodeList: []};

    var stubPlanThree = {name: 'Plan 3',
        id: 1,
        programme: 1,
        distributionplannode_set: [1, 2],
        nodeTree: {
            id: 1,
            children: [
                {id: 2,
                    parent: 1,
                    children: [
                        {id: 4,
                            parent: 2,
                            children: [],
                            lineItems: [],
                            distribution_plan: 1,
                            consignee: {name: 'Consignee 4'}}
                    ],
                    lineItems: [],
                    distribution_plan: 1,
                    consignee: {name: 'Consignee 2'}},
                {id: 3,
                    parent: 1,
                    children: [],
                    lineItems: [],
                    distribution_plan: 1,
                    consignee: {name: 'Consignee 3'}}
            ],
            lineItems: [],
            distribution_plan: 1,
            consignee: {name: 'Test'}
        }};

    var stubError = {
        data: {
            error: 'Phone number is not valid'
        }
    };

    beforeEach(function () {
        module('DistributionPlan');
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        flowchartService = jasmine.createSpyObj('flowchartService', ['ChartViewModel']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            mockPlanService.fetchPlans.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);

            scope = $rootScope.$new();
            location = $location;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DistributionPlanController',
                {$scope: scope, ContactService: mockContactService,
                    DistributionPlanService: mockPlanService,
                    $location: location, flowchart: flowchartService});
        });
    });

    it('should save contact and return contact with an id', function () {
        deferred.resolve(stubResponse);
        scope.addContact();
        scope.$apply();
        expect(location.path()).toBe('/');
    });

    it('should add an error message to the scope when the contact is NOT saved', function () {
        deferred.reject(stubError);
        scope.addContact();
        scope.$apply();
        expect(scope.errorMessage).toBe('Phone number is not valid');
    });

    it('should know that the plan information is stored in the scope when controller is invoked', function () {
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(scope.distribution_plans).toEqual(stubPlanOne.data);
    });

    it('should know how to get the distribution plan details for a particular plan id', function () {
        deferredPlan.resolve(stubPlanTwo);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(scope.distribution_plan_details).toEqual({nodeTree: stubPlanTwo.nodeTree, lineItems: stubPlanTwo.nodeTree.lineItems});
    });

    it('should know chart view model is called when show distribution plan is invoked', function () {
        var chartDataModel = {nodes: [
            {
                name: stubPlanTwo.nodeTree.consignee.name,
                id: stubPlanTwo.nodeTree.id,
                x: 0,
                y: 0,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ], connections: []};
        deferredPlan.resolve(stubPlanTwo);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(flowchartService.ChartViewModel).toHaveBeenCalledWith(chartDataModel);
    });

    it('should know how to initialise the chart model to be displayed for nodes with no children nodes', function () {
        var chartDataModel = {nodes: [
            {
                name: stubPlanTwo.nodeTree.consignee.name,
                id: stubPlanTwo.nodeTree.id,
                x: 0,
                y: 0,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ], connections: []};
        deferredPlan.resolve(stubPlanTwo);
        flowchartService.ChartViewModel.and.returnValue(chartDataModel);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(scope.chartViewModel).toEqual(chartDataModel);
    });

    it('should know distribution plan details are empty if there is no node elements', function () {
        deferredPlan.resolve(stubPlanNoNodeList);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(scope.distribution_plan_details).toEqual([]);
    });

    it('should know chart model is undefined when no nodes are present for plan', function () {
        deferredPlan.resolve(stubPlanNoNodeList);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(scope.chartViewModel).toBeUndefined();
    });

    it('should know how to build connections given nested children that belong to parent', function () {
        var chartDataModel = {nodes: [
            {
                name: stubPlanThree.nodeTree.consignee.name,
                id: stubPlanThree.nodeTree.id,
                x: 0,
                y: 0,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] },
            {
                name: stubPlanThree.nodeTree.children[0].consignee.name,
                id: stubPlanThree.nodeTree.children[0].id,
                x: 200,
                y: 0,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] },
            {
                name: stubPlanThree.nodeTree.children[0].children[0].consignee.name,
                id: stubPlanThree.nodeTree.children[0].children[0].id,
                x: 400,
                y: 0,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] },
            {
                name: stubPlanThree.nodeTree.children[1].consignee.name,
                id: stubPlanThree.nodeTree.children[1].id,
                x: 200,
                y: 100,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ],
            connections: [
                {source: {
                    nodeID: stubPlanThree.nodeTree.id,
                    connectorIndex: 0
                },

                    dest: {
                        nodeID: stubPlanThree.nodeTree.children[0].id,
                        connectorIndex: 0
                    }},
                {source: {
                    nodeID: stubPlanThree.nodeTree.children[0].id,
                    connectorIndex: 0
                },

                    dest: {
                        nodeID: stubPlanThree.nodeTree.children[0].children[0].id,
                        connectorIndex: 0
                    }},
                {source: {
                    nodeID: stubPlanThree.nodeTree.id,
                    connectorIndex: 0
                },

                    dest: {
                        nodeID: stubPlanThree.nodeTree.children[1].id,
                        connectorIndex: 0
                    }}

            ]};
        deferredPlan.resolve(stubPlanThree);
        scope.showDistributionPlan('1');
        scope.$apply();
        expect(flowchartService.ChartViewModel).toHaveBeenCalledWith(chartDataModel);
    });

});