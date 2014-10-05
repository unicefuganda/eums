describe('DistributionPlanController', function () {

    var scope;
    var location, distPlanEndpointUrl;
    var mockContactService, flowchartService, mockPlanService, mockProgrammeService, mockPlanNodeService;
    var deferred, deferredPlan;

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var salesOrderDetails = [
        {'sales_document': '00001',
            'material_code': '1234', 'order_quantity': '100',
            'date_created': '2014-10-02',
            'net_value': '1000', 'net_price': '10', 'description': 'Test'}
    ];

    var stubPlanOne = {data: [
        {
            id: 1,
            programme: 1,
            distributionplannode_set: [1, 2]
        }
    ]};

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
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails',
            'createDistributionPlanNode', 'getSalesOrders']);
        mockPlanNodeService = jasmine.createSpyObj('mockPlanNodeService', ['createNode']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['getProgramme']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            mockProgrammeService.getProgramme.and.returnValue(deferred.promise);
            mockPlanService.fetchPlans.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockPlanNodeService.createNode.and.returnValue(deferredPlan.promise);

            scope = $rootScope.$new();

            location = $location;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DistributionPlanController',
                {$scope: scope, ContactService: mockContactService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanNodeService: mockPlanNodeService,
                    ProgrammeService: mockProgrammeService,
                    $location: location, flowchart: flowchartService});
        });
    });

    it('should initialize ng Table parameters when initialize is invoked', inject(function (ngTableParams) {
        scope.initialize();
        scope.$apply();

        expect(ngTableParams).toBeDefined();
    }));

    it('should know that the programme service is invoked when initialized', function () {
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(mockProgrammeService.getProgramme).toHaveBeenCalledWith(1);
    });

    it('should replace program id with programme object when initialized', function () {
        var programme = {id: '1', name: 'Test Programme'};
        deferred.resolve(programme);
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(scope.distribution_plans[0].programme).toEqual(programme);
    });

//    it('should set the pagination and page options for the ng table parameters', function(){
//        deferredPlan.resolve({data: salesOrderDetails});
//        scope.initialize();
//        scope.$apply();
//
//        var tableParameters = scope.tableParams.$params;
//        expect(tableParameters.page).toEqual(1);
//        expect(tableParameters.count).toEqual(25);
//        expect(tableParameters.sorting).toEqual({name: 'asc'});
//    });

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
        expect(scope.planId).toEqual('1');
        expect(scope.distribution_plan_details).toEqual({nodeTree: stubPlanTwo.nodeTree, lineItems: stubPlanTwo.nodeTree.lineItems});
    });

    it('should know chart view model is called when show distribution plan is invoked', function () {
        var chartDataModel = {nodes: [
            {
                name: stubPlanTwo.nodeTree.consignee.name,
                id: stubPlanTwo.nodeTree.id,
                x: 10,
                y: 10,
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
                x: 10,
                y: 10,
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
                y: 10,
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
                y: 10,
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
                y: 110,
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

    it('should get the maximum id in the current chartModel', function () {
        scope.chartViewModel = {data: {nodes: [
            {
                name: stubPlanThree.nodeTree.consignee.name,
                id: stubPlanThree.nodeTree.id,
                x: 10,
                y: 10,
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
                y: 10,
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
                y: 10,
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
        ]

        }};
        expect(scope.getNextNodeID()).toEqual(5);
    });

    it('should know chart view model is called with the right details given consignee Name', function () {
        var consigneeName = 'Test Consignee';
        var originalNodes = [
            {
                name: stubPlanThree.nodeTree.consignee.name,
                id: stubPlanThree.nodeTree.id,
                x: 10,
                y: 10,
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
                y: 10,
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
                y: 10,
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
                y: 110,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ];

        var expectedNodes = [
            {
                name: stubPlanThree.nodeTree.consignee.name,
                id: stubPlanThree.nodeTree.id,
                x: 10,
                y: 10,
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
                y: 10,
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
                y: 10,
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
                y: 110,
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
                name: consigneeName,
                id: 5,
                x: 400,
                y: 210,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ];
        var expectedConnections = [
            {
                source: {
                    nodeID: 3,
                    connectorIndex: 0
                },

                dest: {
                    nodeID: 5,
                    connectorIndex: 0
                }
            }
        ];

        scope.chartViewModel = {data: {nodes: originalNodes,
            connections: []

        }};

        var consigneeParent = {
            name: stubPlanThree.nodeTree.children[1].consignee.name,
            id: stubPlanThree.nodeTree.children[1].id,
            x: 200,
            y: 110,
            inputConnectors: [
                {
                    name: ''
                }
            ], outputConnectors: [
                {
                    name: ''
                }
            ] };


        scope.hide_modal = function () {

        };

        scope.node = {consigneeName: consigneeName, consigneeParent: consigneeParent};

        deferredPlan.resolve({data: []});
        scope.addNodeToFlow();
        scope.$apply();

        expect(flowchartService.ChartViewModel).toHaveBeenCalledWith({nodes: expectedNodes, connections: expectedConnections});
    });

    it('should know how to add a new node given consignee Name', function () {

        scope.planId = '1';
        var consigneeName = 'Test Consignee';
        var originalNodes = [
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
        ];

        var expectedNodes = [
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
            ] },
            {
                name: consigneeName,
                id: 5,
                x: 400,
                y: 210,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ];

        var expectedConnections = [
            {
                source: {
                    nodeID: 16,
                    connectorIndex: 0
                },

                dest: {
                    nodeID: 5,
                    connectorIndex: 0
                }
            }
        ];

        scope.chartViewModel = {data: {nodes: originalNodes,
            connections: []

        }};

        scope.hide_modal = function () {

        };

        var expectedScopeData = {nodes: expectedNodes, connections: expectedConnections};

        flowchartService.ChartViewModel.and.returnValue(expectedScopeData);

        var consigneeParent = {
            name: stubPlanThree.nodeTree.children[1].consignee.name,
            id: stubPlanThree.nodeTree.children[1].id,
            x: 200,
            y: 110,
            inputConnectors: [
                {
                    name: ''
                }
            ], outputConnectors: [
                {
                    name: ''
                }
            ] };

        scope.node = {consigneeName: consigneeName, consigneeParent: consigneeParent};

        deferredPlan.resolve({data: []});
        scope.addNodeToFlow();
        scope.$apply();

        expect(scope.chartViewModel).toEqual(expectedScopeData);
        expect(scope.nodes).toEqual(expectedScopeData.nodes);
    });

    it('should call the create node service when node is being added', function () {

        scope.planId = '1';

        var consigneeName = 'Test Consignee';
        var originalNodes = [
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
        ];

        var expectedNodes = [
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
            ] },
            {
                name: consigneeName,
                id: 5,
                x: 400,
                y: 200,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ];

        var expectedConnections = [
            {
                source: {
                    nodeID: 16,
                    connectorIndex: 0
                },

                dest: {
                    nodeID: 5,
                    connectorIndex: 0
                }
            }
        ];

        scope.chartViewModel = {data: {nodes: originalNodes,
            connections: []

        }};

        scope.hide_modal = function () {

        };

        var expectedScopeData = {nodes: expectedNodes, connections: expectedConnections};

        flowchartService.ChartViewModel.and.returnValue(expectedScopeData);

        var consigneeParent = {
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
            ] };

        scope.node = {consigneeName: consigneeName, consigneeParent: consigneeParent};
        deferredPlan.resolve(stubPlanTwo);

        var expectedPostData = {'consignee': '1', 'parent': consigneeParent.id, 'distribution_plan': scope.planId};
        scope.addNodeToFlow();
        scope.$apply();

        expect(mockPlanNodeService.createNode).toHaveBeenCalledWith(expectedPostData);
    });

    it('should have no error when the response to create node is successful', function () {

        scope.planId = '1';

        var consigneeName = 'Test Consignee';
        var originalNodes = [
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
        ];

        var expectedNodes = [
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
            ] },
            {
                name: consigneeName,
                id: 5,
                x: 400,
                y: 200,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                {
                    name: ''
                }
            ] }
        ];

        var expectedConnections = [
            {
                source: {
                    nodeID: 16,
                    connectorIndex: 0
                },

                dest: {
                    nodeID: 5,
                    connectorIndex: 0
                }
            }
        ];

        scope.chartViewModel = {data: {nodes: originalNodes,
            connections: []

        }};

        scope.hide_modal = function () {

        };

        var expectedScopeData = {nodes: expectedNodes, connections: expectedConnections};

        flowchartService.ChartViewModel.and.returnValue(expectedScopeData);

        var consigneeParent = {
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
            ] };

        scope.node = {consigneeName: consigneeName, consigneeParent: consigneeParent};

        deferredPlan.resolve({data: {}});
        scope.addNodeToFlow();
        scope.$apply();

        expect(scope.nodeErrorMessage).toBeFalsy();
    });

    it('should have an error when the response to create node is unsuccessful with error status', function () {
        scope.node = {consigneeName: '', consigneeParent: []};
        deferredPlan.resolve({status: 304, data: {}});

        scope.addNodeToFlow();
        scope.$apply();

        expect(scope.nodeErrorMessage).toBeTruthy();
    });

    it('should have an error when there is an error when posting the data and set the custom error message', function () {

        scope.node = {consigneeName: '2', consigneeParent: '1'};
        var response = {status: 404, data: {detail: 'Invalid data supplied.'}};
        deferredPlan.reject(response);
        scope.addNodeToFlow();
        scope.$apply();

        expect(scope.nodeErrorMessage).toBeTruthy();
        expect(scope.customErrorMessage).toEqual(response.data.detail + ' ');
    });

    it('should have an error when there is an error status text with no data detail when posting the data and set the custom error message', function () {
        scope.node = {consigneeName: '2', consigneeParent: '1'};
        var response = {status: 403, statusText: 'Forbidden Request', data: {}};
        deferredPlan.reject(response);
        scope.addNodeToFlow();
        scope.$apply();

        expect(scope.nodeErrorMessage).toBeTruthy();
        expect(scope.customErrorMessage).toEqual(response.statusText + '. ');
    });

    it('should call the get sales order service from distribution plan', function () {
        scope.initialize();
        expect(mockPlanService.getSalesOrders).toHaveBeenCalled();
    });

    it('should expect all sales orders to be on the local scope when the controller is initialised', function () {
        deferredPlan.resolve({data: salesOrderDetails});
        scope.initialize();
        scope.$apply();
        expect(scope.salesOrders).toEqual(salesOrderDetails);
    });

    it('should add sales order in selected sales order when check box click is invoked and sales order is not in selected list', function () {
        scope.isChecked(salesOrderDetails[0]);
        scope.$apply();
        expect(scope.selectedSalesOrders).toEqual(salesOrderDetails);
    });

    it('should remove sales order in selected sales order when check box click is invoked and sales order is in selected list', function () {
        scope.selectedSalesOrders = salesOrderDetails;
        scope.isChecked(salesOrderDetails[0]);
        scope.$apply();
        expect(scope.selectedSalesOrders).toEqual([]);
    });

    it('should remove one sales order in selected sales order when check box click is invoked and sales order is in selected list', function () {
        scope.selectedSalesOrders = [
            {'sales_document': '00002',
                'material_code': '12345', 'order_quantity': '100',
                'date_created': '2014-10-02',
                'net_value': '1000', 'net_price': '10', 'description': 'Test'},
            salesOrderDetails[0]
        ];
        scope.isChecked(salesOrderDetails[0]);
        scope.$apply();
        expect(scope.selectedSalesOrders).toEqual([
            {'sales_document': '00002',
                'material_code': '12345', 'order_quantity': '100',
                'date_created': '2014-10-02',
                'net_value': '1000', 'net_price': '10', 'description': 'Test'}
        ]);
    });

});

describe('Distribution Directive: ', function () {
    var element, scope;

    beforeEach(module('DistributionPlan'));

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
        scope.nodes = [
            {name: 'fakeNode1'},
            {name: 'fakeNode2'},
            {name: 'fakeNode3'}
        ];

        scope.value = false;
        scope.hide_value = false;

        scope.show_modal = function () {
            scope.value = true;
        };
        scope.hide_modal = function () {
            scope.hide_value = true;
        };
    }));

    function compileDirective(fakeTemplate) {
        if (!fakeTemplate) {
            fakeTemplate = '<div addNodeModal ng-model="nodes"></div></form>';
        }
        fakeTemplate = '<form name="form">' + fakeTemplate + '</fakeTemplate>';
        inject(function ($compile) {
            var form = $compile(fakeTemplate)(scope);
            element = form.find('div');
        });

        scope.$digest();
    }

    describe('initialisation', function () {
        beforeEach(function () {
            compileDirective();
        });

        it('should produce a div', function () {
            expect(element.find('button').length).toEqual(0);
            expect(element.length).toEqual(1);
        });
        it('should check validity on init', function () {
            expect(scope.form.$valid).toBeTruthy();
        });
    });


});


describe('NewDistributionPlanController', function () {
    var scope, mockPlanService, mockDistributionPlanParametersService, mockContactService, mockProgrammeService, deferred, deferredPlan, location, distPlanEndpointUrl;

    var salesOrderDetails = [
        {'sales_document': '00001',
            'material_code': '1234', 'order_quantity': '100',
            'date_created': '2014-10-02',
            'net_value': '1000', 'net_price': '10', 'description': 'Test'}
    ];

    var programmes = [{id: 1, name: 'Test', focal_person: 1}];

    beforeEach(module('DistributionPlan'));

    beforeEach(function () {
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails',
            'createDistributionPlanNode', 'getSalesOrders', 'createPlan']);

        inject(function ($controller, $rootScope, ContactService, DistributionPlanParameters, $location, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            mockProgrammeService.addContact.and.returnValue(deferred.promise);
            mockPlanService.createPlan.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);

            scope = $rootScope.$new();

            location = $location;
            mockDistributionPlanParametersService = DistributionPlanParameters;

            mockDistributionPlanParametersService.saveVariable('salesOrders', salesOrderDetails);

            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;


            $controller('NewDistributionPlanController',
                {$scope: scope, ContactService: mockContactService,
                    $location: location, DistributionPlanParameters: mockDistributionPlanParametersService,
                    ProgrammeService: mockProgrammeService});
        });

        it('should have the sales orders in the scope when the controller is initialized', function () {
            scope.initialize();
            scope.$apply();

            expect(scope.salesOrders).toEqual(salesOrderDetails);
        });

        it('should call fetch programmes when the controller is initialized', function () {
            scope.initialize();
            scope.$apply();

            expect(mockProgrammeService.fetchProgrammes).toHaveBeenCalled();
        });

        it('should have the programmes in the scope when the controller is initialized', function () {
            deferred.resolve(programmes);
            scope.initialize();
            scope.$apply();

            expect(scope.programmes).toEqual(programmes);
        });

        it('should add sales order in selected sales order when check box click is invoked and sales order is not in selected list', function () {
            scope.isChecked(salesOrderDetails[0]);
            scope.$apply();
            expect(scope.selectedSalesOrders).toEqual(salesOrderDetails);
        });

        it('should remove sales order in selected sales order when check box click is invoked and sales order is in selected list', function () {
            scope.selectedSalesOrders = salesOrderDetails;
            scope.isChecked(salesOrderDetails[0]);
            scope.$apply();
            expect(scope.selectedSalesOrders).toEqual([]);
        });

        it('should remove one sales order in selected sales order when check box click is invoked and sales order is in selected list', function () {
            scope.selectedSalesOrders = [
                {'sales_document': '00002',
                    'material_code': '12345', 'order_quantity': '100',
                    'date_created': '2014-10-02',
                    'net_value': '1000', 'net_price': '10', 'description': 'Test'},
                salesOrderDetails[0]
            ];
            scope.isChecked(salesOrderDetails[0]);
            scope.$apply();
            expect(scope.selectedSalesOrders).toEqual([
                {'sales_document': '00002',
                    'material_code': '12345', 'order_quantity': '100',
                    'date_created': '2014-10-02',
                    'net_value': '1000', 'net_price': '10', 'description': 'Test'}
            ]);
        });
    });

});