describe('NewDistributionPlanController', function () {

    beforeEach(module('NewDistributionPlan'));
    var scope, mockPlanService, mockDistributionPlanParametersService, mockProgrammeService,
        deferred, deferredPlan, distPlanEndpointUrl, mockSalesOrderItemService, mockDistributionPlanLineItemService;

    var orderNumber = '00001';

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
        quantity: 100,
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02'
    };

    var expectedFormattedSalesOrderItem = {display: stubSalesOrderItem.item.description,
        material_code: stubSalesOrderItem.item.material_code,
        quantity: stubSalesOrderItem.quantity,
        unit: stubSalesOrderItem.item.unit.name,
        information: stubSalesOrderItem};


    beforeEach(function () {

        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem']);
        mockDistributionPlanLineItemService = jasmine.createSpyObj('mockDistributionPlanLineItemService', ['getLineItemDetails', 'createLineItem']);
        mockDistributionPlanParametersService = jasmine.createSpyObj('mockDistributionPlanParametersService', ['retrieveVariable', 'saveVariable']);

        inject(function ($controller, $rootScope, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockProgrammeService.fetchProgrammes.and.returnValue(deferred.promise);
            mockPlanService.createPlan.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferred.promise);
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails);
            mockDistributionPlanLineItemService.getLineItemDetails.and.returnValue(deferred.promise);
            mockDistributionPlanLineItemService.createLineItem.and.returnValue(deferred.promise);

            scope = $rootScope.$new();

            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;


            $controller('NewDistributionPlanController',
                {$scope: scope, DistributionPlanParameters: mockDistributionPlanParametersService,
                    ProgrammeService: mockProgrammeService, SalesOrderItemService: mockSalesOrderItemService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanLineItemService: mockDistributionPlanLineItemService});
        });
    });

    describe('when the controller is initialized', function () {
        it('should have the distributionPlanItems defaulted to an empty list', function () {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });

        it('should have the selected sales orders in the scope', function () {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.selectedSalesOrder).toEqual(salesOrderDetails[0]);
        });

        it('should have the default selected sales orders item undefined in the scope', function () {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.salesOrderItemSelected).toBeUndefined();
        });

        it('should have the sales orders item flag as false by default', function () {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.hasSalesOrderItems).toBeFalsy();
        });

        it('should have the distribution plan item flag as false by default', function () {
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();

            expect(scope.hasDistributionPlanItems).toBeFalsy();
        });

        it('should format the selected sales order appropriately for the view', function () {

            deferred.resolve(stubSalesOrderItem);
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails[0]);

            scope.initialize();
            scope.$apply();

            expect(scope.salesOrderItems).toEqual([expectedFormattedSalesOrderItem]);
        });
    });


    describe('when sales order item selected changes', function () {
        it('should know the has sales order items flag is set to true if sales item is selected', function () {
            scope.hasSalesOrderItems = false;
            scope.salesOrderItemSelected = expectedFormattedSalesOrderItem;
            scope.$apply();
            expect(scope.hasSalesOrderItems).toBeTruthy();
        });

        it('should set the distribution plan items flag to true if there are distribution plan items for sales order item selected', function () {
            scope.hasDistributionPlanItems = false;
            scope.distributionPlanItems = ['1', '2'];
            stubSalesOrderItem.distributionplanlineitem_set = ['1', '2'];
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();
            expect(scope.hasDistributionPlanItems).toBeTruthy();
        });

        it('should set the distribution plan items flag to false if there are no distribution plan items for sales order item selected', function () {
            scope.hasDistributionPlanItems = false;
            scope.distributionPlanItems = [];
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();
            expect(scope.hasDistributionPlanItems).toBeFalsy();
        });

        it('should know the has sales order items flag is set to false if sales item is null', function () {
            scope.hasSalesOrderItems = true;
            scope.salesOrderItemSelected = undefined;
            scope.$apply();
            expect(scope.hasSalesOrderItems).toBeFalsy();
        });

        it('should know the has sales order items flag is set to false if sales item is empty', function () {
            scope.hasSalesOrderItems = true;
            scope.$apply();
            scope.salesOrderItemSelected = '';
            scope.$apply();
            expect(scope.hasSalesOrderItems).toBeFalsy();
        });

        it('should call the get distribution plan items service linked to the particular sales order item', function () {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            expect(mockDistributionPlanLineItemService.getLineItemDetails).toHaveBeenCalledWith('1');
            expect(mockDistributionPlanLineItemService.getLineItemDetails).toHaveBeenCalledWith('2');
        });

        it('should get distribution plan items linked to the particular sales order item and put in the scope', function () {
            deferred.resolve(stubSalesOrderItem);
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([stubSalesOrderItem, stubSalesOrderItem]);
        });

        it('should not get distribution plan items service linked to the particular sales order item with no line item set', function () {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem,
                distributionplanlineitem_set: []};
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });

        it('should not get distribution plan items service linked to the particular sales order item with undefined line item set', function () {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([]);
        });
    });

    describe('when add IP button is clicked', function () {
        it('should add a default distribution plan line item to the salesOrderItemSelected', function () {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};
            scope.$apply();

            var distributionPlanLineItem = {item: stubSalesOrderItem.item,
                quantity: scope.salesOrderItemSelected.quantity, planned_distribution_date: '2014-10-10',
                targeted_quantity: 0, destination_location: '', mode_of_delivery: '',
                contact_phone_number: '', programme_focal: '', contact_person: ''};

            scope.addDistributionPlanItem();
            scope.$apply();

            expect(scope.distributionPlanItems).toEqual([distributionPlanLineItem]);
        });

        it('should not change information in the salesOrderItemSelected', function () {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            var expectedSalesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            scope.addDistributionPlanItem();
            scope.$apply();

            expect(scope.salesOrderItemSelected).toEqual(expectedSalesOrderItemSelected);
        });

        it('should modify the distribution plan items flag to true if it is currently false', function () {
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
    });

    describe('when save is cliked', function () {
        it('should call the create line item service for all the line items added', function () {
            scope.selectedSalesOrder = salesOrderDetails[0];
            scope.distributionPlanItems = [
                {item: stubSalesOrderItem.item,
                    quantity: stubSalesOrderItem.quantity, planned_distribution_date: '2014-10-10',
                    targeted_quantity: '', destination_location: '', mode_of_delivery: '', consignee: {id: 1},
                    contact_phone_number: '', programme_focal: {id: 1}, contact_person: '', tracked: true,
                    remark: 'Good', distribution_plan_node: 1},
                {item: {id: 2},
                    quantity: stubSalesOrderItem.quantity, planned_distribution_date: '2014-10-10',
                    targeted_quantity: 20, destination_location: '', mode_of_delivery: '', consignee: {id: 1},
                    contact_phone_number: '', programme_focal: {id: 2}, contact_person: '', tracked: false,
                    remark: 'Bad', distribution_plan_node: 1}
            ];
            scope.saveDistributionPlanItem();
            scope.$apply();

            var lineItemDetails = {item: stubSalesOrderItem.item.id, targeted_quantity: '', distribution_plan_node: 1,
                planned_distribution_date: '2014-10-10', programme_focal: 1, consignee: 1, contact_person: '',
                contact_phone_number: '', destination_location: '', mode_of_delivery: '', tracked: true, remark: 'Good'};

            var anotherLineItemDetails = {item: 2, targeted_quantity: 20, distribution_plan_node: 1,
                planned_distribution_date: '2014-10-10', programme_focal: 2, consignee: 1, contact_person: '',
                contact_phone_number: '', destination_location: '', mode_of_delivery: '', tracked: false, remark: 'Bad'};

            expect(mockDistributionPlanLineItemService.createLineItem).toHaveBeenCalledWith(lineItemDetails);
            expect(mockDistributionPlanLineItemService.createLineItem).toHaveBeenCalledWith(anotherLineItemDetails);
        });

        it('should call the create distribution plan service if no plan has been created for sales order item', function () {
            scope.distributionPlanItems = [];
            scope.selectedSalesOrder = salesOrderDetails[0];
            scope.saveDistributionPlanItem();
            scope.$apply();

            expect(mockPlanService.createPlan).toHaveBeenCalledWith({'programme': 1});
        });

        it('should save the distribution plan ID in the scope variable', function () {
            scope.distributionPlanItems = [];
            scope.selectedSalesOrder = salesOrderDetails[0];
            deferredPlan.resolve({id: 1, date: '2014-10-09'});
            scope.saveDistributionPlanItem();
            scope.$apply();

            expect(scope.planId).toEqual(1);
        });

        it('should not call the create distribution plan service if plan has already been created for sales order item', function () {
            scope.distributionPlanItems = [];
            scope.selectedSalesOrder = salesOrderDetails[0];
            scope.planId = 1;
            scope.saveDistributionPlanItem();
            scope.$apply();

            expect(mockPlanService.createPlan).not.toHaveBeenCalledWith({'programme': 1});
        });


    });


});
