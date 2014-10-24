describe('NewDistributionPlanController', function() {

    beforeEach(module('NewDistributionPlan'));
    var scope, mockNodeService, mockIPService, mockPlanService, deferred, deferredPlan, deferredDistrictPromise,
        mockSalesOrderService, getSalesOrderPromise, mockSalesOrderItemService, mockLineItemService, deferredPlanNode,
        mockConsigneeService, q;

    var orderNumber = '00001';
    var plainDistricts = ['Abim', 'Gulu'];

    var salesOrders = [
        {
            id: 1,
            'programme': {
                id: 1,
                name: 'Alive'
            },
            'order_number': orderNumber,
            'date': '2014-10-05',
            'salesorderitem_set': ['1']
        },
        {
            id: 2,
            'programme': {
                id: 1,
                name: 'Alive'
            },
            'order_number': '22221',
            'date': '2014-10-05',
            'salesorderitem_set': [3, 4]
        }
    ];

    var stubSalesOrderItem = {
        id: 1,
        sales_order: '1',
        item: {
            id: 1,
            description: 'Test Item',
            material_code: '12345AS',
            unit: {
                name: 'EA'
            }
        },
        quantity: 100,
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: [1, 2]
    };

    var stubSalesOrderItemNoDistributionPlanItems = {
        id: 1,
        sales_order: '1',
        item: {
            id: 1,
            description: 'Test Item',
            material_code: '12345AS',
            unit: {name: 'EA'}
        },
        quantity: '100',
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: []
    };

    var expectedFormattedSalesOrderItem = {
        display: stubSalesOrderItem.item.description,
        materialCode: stubSalesOrderItem.item.material_code,
        quantity: stubSalesOrderItem.quantity,
        unit: stubSalesOrderItem.item.unit.name,
        information: stubSalesOrderItem,
        quantityLeft: jasmine.any(Number)
    };

    beforeEach(function() {
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem']);
        mockLineItemService = jasmine.createSpyObj('mockLineItemService', ['getLineItem', 'createLineItem', 'updateLineItem']);
        mockNodeService = jasmine.createSpyObj('mockNodeService', ['getPlanNodeDetails', 'createNode', 'updateNode']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['getConsigneeById', 'fetchConsignees']);
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['getSalesOrder']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['createPlan']);

        inject(function($controller, $rootScope, $q) {
            q = $q;
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredDistrictPromise = $q.defer();
            deferredPlanNode = $q.defer();
            getSalesOrderPromise = $q.defer();
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferred.promise);
            mockLineItemService.getLineItem.and.returnValue(deferred.promise);
            mockLineItemService.createLineItem.and.returnValue(deferred.promise);
            mockNodeService.getPlanNodeDetails.and.returnValue(deferredPlanNode.promise);
            mockNodeService.createNode.and.returnValue(deferredPlanNode.promise);
            mockConsigneeService.getConsigneeById.and.returnValue(deferred.promise);
            mockConsigneeService.fetchConsignees.and.returnValue(deferred.promise);
            mockSalesOrderService.getSalesOrder.and.returnValue(getSalesOrderPromise.promise);
            mockIPService.loadAllDistricts.and.returnValue(deferredDistrictPromise.promise);

            scope = $rootScope.$new();

            $controller('NewDistributionPlanController',
                {
                    $scope: scope,
                    SalesOrderItemService: mockSalesOrderItemService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanNodeService: mockNodeService,
                    DistributionPlanLineItemService: mockLineItemService,
                    ConsigneeService: mockConsigneeService,
                    SalesOrderService: mockSalesOrderService,
                    $routeParams: {salesOrderId: 1},
                    IPService: mockIPService
                });
        });
    });

    describe('when  distributionPlanItems list on scope changes, ', function() {
        it('the selected sales order item quantityLeft attribute should be updated', function() {
            scope.selectedSalesOrderItem = {quantity: 100, information: stubSalesOrderItem};
            scope.$apply();

            scope.distributionPlanItems.push({targetQuantity: 50});
            scope.$apply();
            expect(scope.selectedSalesOrderItem.quantityLeft).toBe(50);

            scope.distributionPlanItems[0].targetQuantity = 25;
            scope.$apply();
            expect(scope.selectedSalesOrderItem.quantityLeft).toBe(75);
        });
    });

    describe('when the controller is initialized', function() {
        beforeEach(function() {
            deferredDistrictPromise.resolve({data: plainDistricts});
        });

        it('should have the distributionPlanItems defaulted to an empty list', function() {
            expect(scope.distributionPlanItems).toEqual([]);
        });

        it('should set districts in the scope variable', function() {
            var expectedDistricts = [
                {id: 'Abim', name: 'Abim'},
                {id: 'Gulu', name: 'Gulu'}
            ];
            scope.$apply();

            expect(scope.districts).toEqual(expectedDistricts);
        });

        it('should have the selected sales orders in the scope', function() {
            getSalesOrderPromise.resolve(salesOrders[0]);
            scope.$apply();

            expect(scope.selectedSalesOrder).toEqual(salesOrders[0]);
        });

        it('should have the default selected sales orders item undefined in the scope', function() {
            scope.$apply();

            expect(scope.selectedSalesOrderItem).toBeUndefined();
        });

        it('should format the selected sales order appropriately for the view', function() {
            deferred.resolve(stubSalesOrderItem);
            getSalesOrderPromise.resolve(salesOrders[0]);
            scope.$apply();

            expect(scope.salesOrderItems).toEqual([expectedFormattedSalesOrderItem]);
        });

    });

    describe('when sales order item selected changes, ', function() {

        it('should set the selected sales order to the scope when sales order item is selected', function() {
            scope.selectedSalesOrderItem = expectedFormattedSalesOrderItem;
            scope.$apply();
            expect(scope.selectedSalesOrderItem).toEqual(expectedFormattedSalesOrderItem);
        });

        it('should know distribution plan node service is called if line items exists', function() {
            deferred.resolve({distribution_plan_node: 1});
            scope.selectedSalesOrderItem = {information: {distributionplanlineitem_set: ['1']}};
            scope.$apply();
            expect(mockNodeService.getPlanNodeDetails).toHaveBeenCalledWith(1);
        });

        it('should call the get distribution plan items service linked to the particular sales order item', function() {
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.materialCode, quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name, information: stubSalesOrderItem
            };
            scope.$apply();

            expect(mockLineItemService.getLineItem).toHaveBeenCalledWith(1);
            expect(mockLineItemService.getLineItem).toHaveBeenCalledWith(2);
        });

        it('should get distribution plan items linked to the particular sales order item and put in the scope', function() {
            deferredPlanNode.resolve({
                consignee: {
                    name: 'Save the Children'
                },
                location: 'Kampala',
                contact_person: {_id: 1}
            });
            deferred.resolve(stubSalesOrderItem);
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem
            };
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([stubSalesOrderItem, stubSalesOrderItem]);
        });

        it('should not get distribution plan items service linked to the particular sales order item with no line item set', function() {

            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItemNoDistributionPlanItems.item.description,
                material_code: stubSalesOrderItemNoDistributionPlanItems.item.material_code,
                quantity: stubSalesOrderItemNoDistributionPlanItems.quantity,
                unit: stubSalesOrderItemNoDistributionPlanItems.item.unit.name,
                information: stubSalesOrderItemNoDistributionPlanItems
            };
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });

        it('should not get distribution plan items service linked to the particular sales order item with undefined line item set', function() {

            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: {}
            };
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });
    });

    describe('when add IP button is clicked', function() {
        it('should add a default distribution plan line item to the selectedSalesOrderItem', function() {
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.material_code,
                quantity: 100,
                quantityLeft: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem
            };
            scope.$apply();

            var expectedPlanItem = {
                item: stubSalesOrderItem.item,
                plannedDistributionDate: '2014-10-10',
                targetQuantity: 0,
                destinationLocation: '',
                modeOfDelivery: '',
                contactPerson: '',
                tracked: false
            };

            scope.addDistributionPlanItem();
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([expectedPlanItem]);
        });
    });

    describe('when save is clicked, ', function() {
        var programmeId, distributionPlan;

        beforeEach(function() {
            var createPlanPromise = q.defer();
            distributionPlan = {id: 1};
            createPlanPromise.resolve(distributionPlan);
            mockPlanService.createPlan.and.returnValue(createPlanPromise.promise);

            programmeId = 1;
            scope.selectedSalesOrder = {programme: {id: programmeId}};
            scope.selectedSalesOrderItem = {quantity: 100, information: stubSalesOrderItem};
            scope.$apply();
        });

        describe('and a plan for the sales order item has not been saved, ', function() {
            it('a distribution plan should be created', function() {
                scope.saveDistributionPlanItems();
                scope.$apply();

                expect(mockPlanService.createPlan).toHaveBeenCalledWith({programme: programmeId});
            });
            it('the created distribution plan should be put on the scope', function() {
                scope.saveDistributionPlanItems();
                scope.$apply();

                expect(scope.distributionPlan).toEqual(distributionPlan);
            });
        });

        describe('and a plan for the sales order item has been saved, ', function() {
            it('a distribution plan should not be created', function() {
                scope.distributionPlan = {programme: 1};
                scope.$apply();

                scope.saveDistributionPlanItems();
                scope.$apply();

                expect(mockPlanService.createPlan).not.toHaveBeenCalled();
            });
        });

        describe('when saving a node and plan item, ', function() {
            var uiPlanItem;

            beforeEach(function() {
                uiPlanItem = {
                    consignee: 1,
                    destinationLocation: 'Kampala',
                    contactPerson: '0489284',
                    distributionPlan: {id: 1},
                    tree_position: 'MIDDLE_MAN',
                    modeOfDelivery: 'WAREHOUSE',
                    item: {id: 1},
                    targetQuantity: 10,
                    plannedDistributionDate: '2014-02-03',
                    remark: 'Remark'
                };

                scope.distributionPlanItems = [uiPlanItem];
                scope.$apply();
            });

            describe(' and a distribution plan item has not been saved before, ', function() {
                var nodeId;
                beforeEach(function() {
                    nodeId = 1;
                    deferredPlanNode.resolve({id: nodeId});
                });

                it('a node for the plan item should be saved', function() {
                    scope.saveDistributionPlanItems();
                    scope.$apply();

                    expect(mockNodeService.createNode).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'MIDDLE_MAN',
                        mode_of_delivery: 'WAREHOUSE'
                    });
                });

                it(' the saved node id should be put on the ui plan item', function() {
                    scope.saveDistributionPlanItems();
                    scope.$apply();

                    expect(uiPlanItem.nodeId).toBe(nodeId);
                });

                it('a distribution plan line item linked to a saved node should be saved', function() {
                    scope.saveDistributionPlanItems();
                    scope.$apply();

                    expect(mockLineItemService.createLineItem).toHaveBeenCalledWith({
                        item: uiPlanItem.item.id,
                        targeted_quantity: uiPlanItem.targetQuantity,
                        distribution_plan_node: nodeId,
                        planned_distribution_date: uiPlanItem.plannedDistributionDate,
                        remark: uiPlanItem.remark
                    });
                });

                it(' the saved line item id should be put on the ui plan item', function() {
                    var lineItemId = 1;
                    var createLineItemPromise = q.defer();
                    createLineItemPromise.resolve({id: lineItemId});
                    mockLineItemService.createLineItem.and.returnValue(createLineItemPromise.promise);

                    scope.saveDistributionPlanItems();
                    scope.$apply();

                    expect(uiPlanItem.lineItemId).toBe(lineItemId);
                });
            });

            describe(' and a distribution plan item has already been saved, ', function() {
                var nodeId, deferred;

                beforeEach(inject(function($q) {
                    nodeId = 1;
                    deferredPlanNode.resolve({id: nodeId});

                    deferred = $q.defer();
                    deferred.resolve({});
                    mockNodeService.updateNode.and.returnValue(deferred.promise);
                }));

                it('the node for the ui plan item should be updated and not saved', function() {
                    uiPlanItem.nodeId = nodeId;

                    scope.saveDistributionPlanItems();
                    scope.$apply();

                    expect(mockNodeService.updateNode).toHaveBeenCalledWith({
                        id: nodeId,
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'MIDDLE_MAN',
                        mode_of_delivery: 'WAREHOUSE'
                    });
                    expect(mockNodeService.createNode).not.toHaveBeenCalled();
                });

                it('the distribution plan line item should be updated and not saved', function() {
                    var lineItemId = 1;

                    uiPlanItem.lineItemId = lineItemId;

                    deferred.resolve({id: lineItemId});
                    mockLineItemService.createLineItem.and.returnValue(deferred.promise);
                    scope.saveDistributionPlanItems();
                    scope.$apply();

                    expect(mockLineItemService.updateLineItem).toHaveBeenCalledWith({
                        id: lineItemId,
                        item: uiPlanItem.item.id,
                        targeted_quantity: uiPlanItem.targetQuantity,
                        distribution_plan_node: nodeId,
                        planned_distribution_date: uiPlanItem.plannedDistributionDate,
                        remark: uiPlanItem.remark
                    });
                });
            });
        });
    });
});


