describe('NewDistributionPlanController', function() {

    beforeEach(module('NewDistributionPlan'));
    var scope, mockPlanService, mockDistributionPlanParametersService, mockProgrammeService, mockDistributionPlanNodeService, mockDistrictService,
        deferred, deferredPlan, distPlanEndpointUrl, mockSalesOrderItemService, mockDistributionPlanLineItemService, deferredPlanNode, mockConsigneeService,
        mockUserService;

    var orderNumber = '00001';
    var plainDistricts = ['Abim', 'Gulu'];

    var salesOrderDetails = [
        {'programme': 1,
            'order_number': orderNumber,
            'date': '2014-10-05',
            'salesorderitem_set': ['1']},
        {'programme': 1,
            'order_number': '22221',
            'date': '2014-10-05',
            'salesorderitem_set': []}
    ];

    var stubSalesOrderItem = {
        id: 1,
        sales_order: '1',
        item: {id: 1,
            description: 'Test Item',
            material_code: '12345AS',
            unit: {name: 'EA'}},
        quantity: '100',
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: ['1', '2']
    };

    var stubSalesOrderItemNoDistributionPlanItems = {
        id: 1,
        sales_order: '1',
        item: {id: 1,
            description: 'Test Item',
            material_code: '12345AS',
            unit: {name: 'EA'}},
        quantity: '100',
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: []
    };


    var expectedFormattedSalesOrderItem = {display: stubSalesOrderItem.item.description,
        material_code: stubSalesOrderItem.item.material_code,
        quantity: stubSalesOrderItem.quantity,
        quantityLeft: stubSalesOrderItem.quantity,
        unit: stubSalesOrderItem.item.unit.name,
        information: stubSalesOrderItem};


    beforeEach(function() {
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem']);
        mockDistributionPlanLineItemService = jasmine.createSpyObj('mockDistributionPlanLineItemService', ['getLineItemDetails', 'createLineItem']);
        mockDistributionPlanParametersService = jasmine.createSpyObj('mockDistributionPlanParametersService', ['retrieveVariable', 'saveVariable']);
        mockDistributionPlanNodeService = jasmine.createSpyObj('mockDistributionPlanNodeService', ['getPlanNodeDetails', 'createNode']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['getConsigneeById', 'fetchConsignees']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['getUserById']);
        mockDistrictService = jasmine.createSpyObj('mockDistrictService', ['getAllDistricts']);

        inject(function($controller, $rootScope, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredPlanNode = $q.defer();
            mockProgrammeService.fetchProgrammes.and.returnValue(deferred.promise);
            mockPlanService.createPlan.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferred.promise);
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails);
            mockDistributionPlanLineItemService.getLineItemDetails.and.returnValue(deferred.promise);
            mockDistributionPlanLineItemService.createLineItem.and.returnValue(deferred.promise);
            mockDistributionPlanNodeService.getPlanNodeDetails.and.returnValue(deferredPlanNode.promise);
            mockDistributionPlanNodeService.createNode.and.returnValue(deferredPlanNode.promise);
            mockDistrictService.getAllDistricts.and.returnValue(plainDistricts);
            mockConsigneeService.getConsigneeById.and.returnValue(deferred.promise);
            mockConsigneeService.fetchConsignees.and.returnValue(deferred.promise);
            mockUserService.getUserById.and.returnValue(deferred.promise);

            scope = $rootScope.$new();

            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;


            $controller('NewDistributionPlanController',
                {$scope: scope, DistributionPlanParameters: mockDistributionPlanParametersService,
                    ProgrammeService: mockProgrammeService, SalesOrderItemService: mockSalesOrderItemService,
                    DistributionPlanService: mockPlanService, DistributionPlanNodeService: mockDistributionPlanNodeService,
                    DistributionPlanLineItemService: mockDistributionPlanLineItemService,
                    Districts: mockDistrictService,
                    ConsigneeService: mockConsigneeService,
                    UserService: mockUserService});
        });
    });

    describe('when change selected sales order item', function() {
        it('should change the scope selected order item', function() {
            var expectedSalesOrderItem = {information: {distributionplanlineitem_set: []}};
            scope.salesOrderItemSelected = [];
            scope.changeSelectedSalesOrderItem(expectedSalesOrderItem);
            scope.$apply();

            expect(scope.salesOrderItemSelected).toEqual(expectedSalesOrderItem);
        });
    });

    describe('when the controller is initialized', function() {
        it('should have the distributionPlanItems defaulted to an empty list', function() {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });

        it('should have called the get districts function', function() {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(mockDistrictService.getAllDistricts).toHaveBeenCalled();
        });

        it('should set districts in the scope variable', function() {
            var expectedDistricts = [
                {id: 'Abim', name: 'Abim'},
                { id: 'Gulu', name: 'Gulu'}
            ];
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            mockDistrictService.getAllDistricts.and.returnValue(plainDistricts);
            scope.initialize();
            scope.$apply();

            expect(scope.districts).toEqual(expectedDistricts);
        });

        it('should have the selected sales orders in the scope', function() {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.selectedSalesOrder).toEqual(salesOrderDetails[0]);
        });

        it('should have the default selected sales orders item undefined in the scope', function() {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.salesOrderItemSelected).toBeUndefined();
        });

        it('should have the sales orders item flag as false by default', function() {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.hasSalesOrderItems).toBeFalsy();
        });

        it('should have the distribution plan item flag as false by default', function() {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.hasDistributionPlanItems).toBeFalsy();
        });

        it('should format the selected sales order appropriately for the view', function() {

            deferred.resolve(stubSalesOrderItem);
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);

            scope.initialize();
            scope.$apply();

            expect(scope.salesOrderItems).toEqual([expectedFormattedSalesOrderItem]);
        });

        it('should retrieve the programme selected from the distribution parameters', function() {
            deferred.resolve(stubSalesOrderItem);
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);

            scope.initialize();
            scope.$apply();

            expect(mockDistributionPlanParametersService.retrieveVariable).toHaveBeenCalledWith('programmeSelected');
        });
    });

    describe('when sales order item selected changes', function() {
        it('should know the has sales order items flag is set to true if sales item is selected', function() {
            scope.hasSalesOrderItems = false;
            scope.salesOrderItemSelected = expectedFormattedSalesOrderItem;
            scope.$apply();
            expect(scope.hasSalesOrderItems).toBeTruthy();
        });

        it('should know the plan ID is undefined', function() {
            scope.hasSalesOrderItems = false;
            scope.salesOrderItemSelected = '';
            scope.$apply();
            expect(scope.planId).toBeUndefined();
        });

        it('should know distribution plan node service is not called', function() {
            scope.hasSalesOrderItems = false;
            scope.salesOrderItemSelected = '';
            scope.$apply();
            expect(mockDistributionPlanNodeService.getPlanNodeDetails).not.toHaveBeenCalled();
        });

        it('should know distribution plan node service is called if line items exists', function() {
            deferred.resolve({distribution_plan_node: 1});
            scope.salesOrderItemSelected = {information: {distributionplanlineitem_set: ['1']}};
            scope.$apply();
            expect(mockDistributionPlanNodeService.getPlanNodeDetails).toHaveBeenCalledWith(1);
        });

        it('should know plan ID is set based on first item if line items exists', function() {
            deferred.resolve({distribution_plan_node: 1});
            deferredPlanNode.resolve({distribution_plan: 2});
            scope.salesOrderItemSelected = {information: {distributionplanlineitem_set: ['1']}};
            scope.$apply();
            expect(scope.planId).toEqual(2);
        });

        it('should set the distribution plan items flag to true if there are distribution plan items for sales order item selected', function() {
            scope.hasDistributionPlanItems = false;
            scope.distributionPlanItems = ['1', '2'];
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();
            expect(scope.hasDistributionPlanItems).toBeTruthy();
        });

        it('should set the distribution plan items flag to false if there are no distribution plan items for sales order item selected', function() {
            scope.hasDistributionPlanItems = false;
            scope.distributionPlanItems = [];
            scope.salesOrderItemSelected = {display: stubSalesOrderItemNoDistributionPlanItems.item.description,
                material_code: stubSalesOrderItemNoDistributionPlanItems.item.material_code,
                quantity: stubSalesOrderItemNoDistributionPlanItems.quantity,
                unit: stubSalesOrderItemNoDistributionPlanItems.item.unit.name,
                information: stubSalesOrderItemNoDistributionPlanItems};
            scope.$apply();
            expect(scope.hasDistributionPlanItems).toBeFalsy();
        });

        it('should know the has sales order items flag is set to false if sales item is null', function() {
            scope.hasSalesOrderItems = true;
            scope.salesOrderItemSelected = undefined;
            scope.$apply();
            expect(scope.hasSalesOrderItems).toBeFalsy();
        });

        it('should know the has sales order items flag is set to false if sales item is empty', function() {
            scope.hasSalesOrderItems = true;
            scope.$apply();
            scope.salesOrderItemSelected = '';
            scope.$apply();
            expect(scope.hasSalesOrderItems).toBeFalsy();
        });

        it('should call the get distribution plan items service linked to the particular sales order item', function() {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            expect(mockDistributionPlanLineItemService.getLineItemDetails).toHaveBeenCalledWith('1');
            expect(mockDistributionPlanLineItemService.getLineItemDetails).toHaveBeenCalledWith('2');
        });

        it('should get distribution plan items linked to the particular sales order item and put in the scope', function() {
            deferred.resolve(stubSalesOrderItem);
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([stubSalesOrderItem, stubSalesOrderItem]);
        });

        it('should not get distribution plan items service linked to the particular sales order item with no line item set', function() {
            scope.salesOrderItemSelected = {display: stubSalesOrderItemNoDistributionPlanItems.item.description,
                material_code: stubSalesOrderItemNoDistributionPlanItems.item.material_code,
                quantity: stubSalesOrderItemNoDistributionPlanItems.quantity,
                unit: stubSalesOrderItemNoDistributionPlanItems.item.unit.name,
                information: stubSalesOrderItemNoDistributionPlanItems};
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });

        it('should not get distribution plan items service linked to the particular sales order item with undefined line item set', function() {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: {}};
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });

        it('should subtract the targeted quantity from the quantity left for the sales order item', function() {
            deferred.resolve({targeted_quantity: 20});
            var quantity = '100';
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: quantity,
                quantityLeft: quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            var expectedQuantityRemaining = '60';
            expect(scope.salesOrderItemSelected.quantityLeft).toEqual(expectedQuantityRemaining);
        });
    });

    describe('when add IP button is clicked', function() {
        it('should add a default distribution plan line item to the salesOrderItemSelected', function() {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                quantityLeft: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            var distributionPlanLineItem = {item: stubSalesOrderItem.item,
                quantity: scope.salesOrderItemSelected.quantityLeft, planned_distribution_date: '2014-10-10',
                targeted_quantity: 0, destination_location: '', mode_of_delivery: '',
                contact_phone_number: '', programme_focal: '', contact_person: '', tracked: false};

            scope.addDistributionPlanItem();
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([distributionPlanLineItem]);
        });

        it('should not change information in the salesOrderItemSelected', function() {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                quantityLeft: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            var expectedSalesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                quantityLeft: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            scope.addDistributionPlanItem();
            scope.$apply();

            expect(scope.salesOrderItemSelected).toEqual(expectedSalesOrderItemSelected);
        });

        it('should modify the distribution plan items flag to true if it is currently false', function() {
            scope.hasDistributionPlanItems = false;
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            scope.addDistributionPlanItem();
            scope.$apply();

            expect(scope.hasDistributionPlanItems).toBeTruthy();
        });

        it('should know distribution plan has targeted quantity', function() {
            var distributedPlanItem = {targeted_quantity: '100'};
            expect(scope.hasTargetedQuantity(distributedPlanItem)).toBeTruthy();

        });

        it('should know distribution plan has no targeted quantity', function() {
            var distributedPlanItem = {targeted_quantity: '0'};
            expect(scope.hasTargetedQuantity(distributedPlanItem)).toBeFalsy();
        });

        it('should know distribution plan has no targeted quantity for zero value', function() {
            var distributedPlanItem = {targeted_quantity: 0};
            expect(scope.hasTargetedQuantity(distributedPlanItem)).toBeFalsy();
        });

        it('should know distribution plan has no targeted quantity for undefined value', function() {
            var distributedPlanItem = {};
            expect(scope.hasTargetedQuantity(distributedPlanItem)).toBeFalsy();
        });

        it('should know distribution plan has no targeted quantity for empty value', function() {
            var distributedPlanItem = {targeted_quantity: ''};
            expect(scope.hasTargetedQuantity(distributedPlanItem)).toBeFalsy();
        });
    });

    describe('when save is clicked', function() {
        it('should call the create line item service for all the line items added', function() {
            deferredPlanNode.resolve({id: 1, parent: null, distribution_plan: 1, consignee: 1, tree_position: 'END_USER'});

            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            scope.selectedSalesOrder = salesOrderDetails[0];
            var distributionPlanItems = [
                {item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity, plannedDistributionDate: '2014-10-10',
                    destinationLocation: '', modeOfDelivery: '', consignee: {id: 1},
                    contactPerson: '', remark: 'Good', targetQuantity: ''},
                {item: {id: 2},
                    quantity: stubSalesOrderItem.quantity, plannedDistributionDate: '2014-10-10',
                    destinationLocation: '', modeOfDelivery: '', consignee: {id: 1},
                    contactPerson: '', remark: 'Bad', targetQuantity: 20}
            ];
            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            var lineItemDetails = {item: stubSalesOrderItem.item.id, targeted_quantity: '', distribution_plan_node: 1,
                planned_distribution_date: '2014-10-10', remark: 'Good'};

            var anotherLineItemDetails = {item: 2, targeted_quantity: 20, distribution_plan_node: 1,
                planned_distribution_date: '2014-10-10', remark: 'Bad'};

            expect(mockDistributionPlanLineItemService.createLineItem).toHaveBeenCalledWith(lineItemDetails);
            expect(mockDistributionPlanLineItemService.createLineItem).toHaveBeenCalledWith(anotherLineItemDetails);
        });

        it('should call the create distribution plan service if no plan has been created for sales order item', function() {
            var distributionPlanItems = [];
            scope.salesOrderItemSelected = {
                display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: '100',
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem
            };
            scope.selectedSalesOrder = salesOrderDetails[0];
            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            expect(mockPlanService.createPlan).toHaveBeenCalledWith({'programme': 1});
        });

        it('should save the distribution plan ID in the scope variable', function() {
            var distributionPlanItems = [];
            scope.selectedSalesOrder = salesOrderDetails[0];
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: '100',
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            deferredPlan.resolve({id: 1, date: '2014-10-09'});
            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            expect(scope.planId).toEqual(1);
        });

        it('should not call the create distribution plan service if plan has already been created for sales order item', function() {
            var distributionPlanItems = [];
            scope.selectedSalesOrder = salesOrderDetails[0];
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: '100',
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.planId = 1;
            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            expect(mockPlanService.createPlan).not.toHaveBeenCalledWith({'programme': 1});
        });

        it('should invoke the distribution plan node service to create nodes for each distribution line item', function() {
            scope.planId = 1;
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            var distributionPlanItems = [
                {item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity, plannedDistributionDate: '2014-10-10',
                    targetQuantity: '', destinationLocation: 'Kampala', modeOfDelivery: 'WAREHOUSE', consignee: {id: 1},
                    contactPerson: 1, remark: 'Good'}
            ];

            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            expect(mockDistributionPlanNodeService.createNode).toHaveBeenCalledWith({
                    distribution_plan: 1, contact_person_id: 1,  location: 'Kampala',
                    consignee: 1, tree_position: 'MIDDLE_MAN', mode_of_delivery: 'WAREHOUSE'
                }
            );
        });

        it('should reduce the quantity left for the sales order item', function() {
            scope.planId = 1;
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: '100',
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            var distributionPlanItems = [
                {item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity, planned_distribution_date: '2014-10-10',
                    targeted_quantity: '10', destination_location: '', mode_of_delivery: '', consignee: {id: 1},
                    contact_phone_number: '', programme_focal: {id: 1}, contact_person: '', tracked: true,
                    remark: 'Good', target_quantity: '10'}
            ];

            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            var expectedQuantityLeft = '90';
            expect(scope.salesOrderItemSelected.quantityLeft).toEqual(expectedQuantityLeft);
        });

        it('should reduce the quantity left for the sales order item for multiple items', function() {
            scope.planId = 1;
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: '100',
                quantityLeft: '100',
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            var distributionPlanItems = [
                {item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity, planned_distribution_date: '2014-10-10',
                    targeted_quantity: '10', destination_location: '', mode_of_delivery: '', consignee: {id: 1},
                    contact_phone_number: '', programme_focal: {id: 1}, contact_person: '', tracked: true,
                    remark: 'Good'}
            ];

            scope.saveDistributionPlanItems(distributionPlanItems);
            scope.$apply();

            var multipleDistributionPlanItems = [
                {item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity, planned_distribution_date: '2014-10-10',
                    targeted_quantity: '10', destination_location: '', mode_of_delivery: '', consignee: {id: 1},
                    contact_phone_number: '', programme_focal: {id: 1}, contact_person: '', tracked: true,
                    remark: 'Good', target_quantity: '10'},
                {item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity, planned_distribution_date: '2014-10-10',
                    targeted_quantity: '20', destination_location: '', mode_of_delivery: '', consignee: {id: 1},
                    contact_phone_number: '', programme_focal: {id: 1}, contact_person: '', tracked: true,
                    remark: 'Good', target_quantity: '20'}
            ];

            scope.saveDistributionPlanItems(multipleDistributionPlanItems);
            scope.$apply();

            var expectedQuantityLeft = '70';
            expect(scope.salesOrderItemSelected.quantityLeft).toEqual(expectedQuantityLeft);
        });
    });

    describe('when checking for item quantities', function() {
        it('should know the item selected is defaulted to true when no selected sales order item', function() {
            expect(scope.hasItemsLeft()).toBeTruthy();
        });

        it('should know the item selected still has quantities that can be assigned to IPs', function() {
            scope.salesOrderItemSelected = {quantityLeft: '10'};
            expect(scope.hasItemsLeft()).toBeTruthy();
        });

        it('should know the item selected does not have any quantity that can be assigned to IPs', function() {
            scope.salesOrderItemSelected = {quantityLeft: '0'};
            expect(scope.hasItemsLeft()).toBeFalsy();
        });
    });
});
