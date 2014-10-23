describe('NewDistributionPlanController', function() {

    beforeEach(module('NewDistributionPlan'));
    var scope, mockPlanService, mockDistributionPlanParametersService, mockProgrammeService, mockDistributionPlanNodeService, mockIPService,
        deferred, deferredPlan, deferredDistrictPromise, mockSalesOrderService, deferredSalesOrder, distPlanEndpointUrl, mockSalesOrderItemService, mockDistributionPlanLineItemService, deferredPlanNode, mockConsigneeService,
        mockUserService;

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
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem']);
        mockDistributionPlanLineItemService = jasmine.createSpyObj('mockDistributionPlanLineItemService', ['getLineItem', 'createLineItem']);
        mockDistributionPlanParametersService = jasmine.createSpyObj('mockDistributionPlanParametersService', ['retrieveVariable', 'saveVariable']);
        mockDistributionPlanNodeService = jasmine.createSpyObj('mockDistributionPlanNodeService', ['getPlanNodeDetails', 'createNode']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['getConsigneeById', 'fetchConsignees']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['getUserById']);
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['getSalesOrderBy']);

        inject(function($controller, $rootScope, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredDistrictPromise = $q.defer();
            deferredPlanNode = $q.defer();
            deferredSalesOrder = $q.defer();
            mockProgrammeService.fetchProgrammes.and.returnValue(deferred.promise);
            mockPlanService.createPlan.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferred.promise);
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrders);
            mockDistributionPlanLineItemService.getLineItem.and.returnValue(deferred.promise);
            mockDistributionPlanLineItemService.createLineItem.and.returnValue(deferred.promise);
            mockDistributionPlanNodeService.getPlanNodeDetails.and.returnValue(deferredPlanNode.promise);
            mockDistributionPlanNodeService.createNode.and.returnValue(deferredPlanNode.promise);
            mockConsigneeService.getConsigneeById.and.returnValue(deferred.promise);
            mockConsigneeService.fetchConsignees.and.returnValue(deferred.promise);
            mockUserService.getUserById.and.returnValue(deferred.promise);
            mockSalesOrderService.getSalesOrderBy.and.returnValue(deferredSalesOrder.promise);
            mockIPService.loadAllDistricts.and.returnValue(deferredDistrictPromise.promise);

            scope = $rootScope.$new();

            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;


            $controller('NewDistributionPlanController',
                {
                    $scope: scope,
                    DistributionPlanParameters: mockDistributionPlanParametersService,
                    ProgrammeService: mockProgrammeService,
                    SalesOrderItemService: mockSalesOrderItemService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanNodeService: mockDistributionPlanNodeService,
                    DistributionPlanLineItemService: mockDistributionPlanLineItemService,
                    ConsigneeService: mockConsigneeService,
                    UserService: mockUserService,
                    SalesOrderService: mockSalesOrderService,
                    $routeParams: {salesOrderId: 1},
                    IPService: mockIPService
                });
        });
    });

    describe('when a new distribution plan item list on scope changes, ', function() {
        it('the selected sales order item quantityLeft attribute should be updated', function() {
            scope.selectedSalesOrderItem = {quantity: 100, information: stubSalesOrderItem};
            scope.$apply();

            scope.distributionPlanItems.push({targetQuantity: 50});
            scope.$apply();

            expect(scope.selectedSalesOrderItem.quantityLeft).toBe(50);
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
            deferredSalesOrder.resolve({data: salesOrders[0]});
            scope.$apply();

            expect(scope.selectedSalesOrder).toEqual(salesOrders[0]);
        });

        it('should have the default selected sales orders item undefined in the scope', function() {
            scope.$apply();

            expect(scope.selectedSalesOrderItem).toBeUndefined();
        });

        it('should have the sales orders item flag as false by default', function() {
            scope.$apply();

            expect(scope.hasSalesOrderItems).toBeFalsy();
        });

        it('should format the selected sales order appropriately for the view', function() {
            deferred.resolve(stubSalesOrderItem);
            deferredSalesOrder.resolve({data: salesOrders[0]});
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
            expect(mockDistributionPlanNodeService.getPlanNodeDetails).toHaveBeenCalledWith(1);
        });

        it('should know plan id is set based on first item if line items exists', function() {
            deferred.resolve({distribution_plan_node: 1});
            deferredPlanNode.resolve({
                distribution_plan: 2, consignee: {
                    id: 1,
                    name: 'Save the Children'
                },
                contact_person: {_id: 1}
            });
            scope.selectedSalesOrderItem = {information: {distributionplanlineitem_set: ['1']}};
            scope.$apply();
            expect(scope.planId).toEqual(2);
        });

        it('should call the get distribution plan items service linked to the particular sales order item', function() {
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.materialCode, quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name, information: stubSalesOrderItem
            };
            scope.$apply();

            expect(mockDistributionPlanLineItemService.getLineItem).toHaveBeenCalledWith(1);
            expect(mockDistributionPlanLineItemService.getLineItem).toHaveBeenCalledWith(2);
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

        it('should subtract the targeted quantity from the quantity left for the sales order item', function() {
            deferred.resolve({targeted_quantity: 20});
            var quantity = '100';
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.material_code,
                quantity: quantity,
                quantityLeft: quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem
            };
            scope.$apply();

            var expectedQuantityRemaining = '60';
            expect(scope.selectedSalesOrderItem.quantityLeft).toEqual(expectedQuantityRemaining);
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

    describe('when save is clicked', function() {
        it('should call the create line item service for all the line items added', function() {
            deferredPlanNode.resolve({
                id: 1,
                parent: null,
                distribution_plan: 1,
                consignee: 1,
                tree_position: 'MIDDLE_MAN'
            });
            scope.planId = 1;
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.materialCode,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem
            };

            scope.distributionPlanItems = [
                {
                    item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity,
                    plannedDistributionDate: '2014-10-10',
                    destinationLocation: '',
                    modeOfDelivery: '',
                    consignee: {id: 1},
                    contactPerson: '',
                    remark: 'Good',
                    targetQuantity: ''
                },
                {
                    item: {id: 2},
                    quantity: stubSalesOrderItem.quantity,
                    plannedDistributionDate: '2014-10-10',
                    destinationLocation: '',
                    modeOfDelivery: '',
                    consignee: {id: 1},
                    contactPerson: '',
                    remark: 'Bad',
                    targetQuantity: 20
                }
            ];
            scope.saveDistributionPlanItems();
            scope.$apply();

            var lineItemDetails = {
                item: stubSalesOrderItem.item.id,
                targeted_quantity: '',
                distribution_plan_node: 1,
                planned_distribution_date: '2014-10-10',
                remark: 'Good'
            };

            var anotherLineItemDetails = {
                item: 2,
                targeted_quantity: 20,
                distribution_plan_node: 1,
                planned_distribution_date: '2014-10-10',
                remark: 'Bad'
            };

            expect(mockDistributionPlanLineItemService.createLineItem).toHaveBeenCalledWith(lineItemDetails);
            expect(mockDistributionPlanLineItemService.createLineItem).toHaveBeenCalledWith(anotherLineItemDetails);
        });

        it('should save the distribution plan ID in the scope variable', function() {
            scope.selectedSalesOrder = {programme: 1};

            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.materialCode,
                quantity: '100',
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem
            };

            deferredPlan.resolve({id: 1, date: '2014-10-09'});
            scope.saveDistributionPlanItems();
            scope.$apply();

            expect(scope.planId).toEqual(1);
        });

        it('should not call the create distribution plan service if plan has already been created for sales order item', function() {
            var distributionPlanItems = [];
            scope.selectedSalesOrderItem = {
                display: stubSalesOrderItem.item.description,
                materialCode: stubSalesOrderItem.item.materialCode,
                quantity: '100',
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem
            };
            scope.planId = 1;
            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            expect(mockPlanService.createPlan).not.toHaveBeenCalledWith({'programme': 1});
        });

    });
});


