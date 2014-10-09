describe('NewDistributionPlanController', function () {

    beforeEach(module('NewDistributionPlan'));
    var scope, mockPlanService, mockDistributionPlanParametersService, mockProgrammeService,
        deferred, deferredPlan, distPlanEndpointUrl, mockSalesOrderItemService;

    var orderNumber = '00001';

    var salesOrderDetails = [
        {'order_number': orderNumber,
            'date': '2014-10-05',
            'salesorderitem_set': ['1']},
        {'order_number': '22221',
            'date': '2014-10-05',
            'salesorderitem_set': []}
    ];

    var stubSalesOrderItem = {
        id: 1,
        sales_order: '1',
        item: {description: 'Test Item',
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

            scope = $rootScope.$new();

            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;


            $controller('NewDistributionPlanController',
                {$scope: scope, DistributionPlanParameters: mockDistributionPlanParametersService,
                    ProgrammeService: mockProgrammeService, SalesOrderItemService: mockSalesOrderItemService});
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

        it('should get the distribution plan items linked to the particular sales order item', function(){

        });
    });

    describe('when add IP button is clicked', function () {
        it('should add a default distribution plan line item to the salesOrderItemSelected', function () {
            scope.salesOrderItemSelected = {display: stubSalesOrderItem.item.description,
                material_code: stubSalesOrderItem.item.material_code,
                quantity: stubSalesOrderItem.quantity,
                unit: stubSalesOrderItem.item.unit.name,
                information: stubSalesOrderItem};

            var distributionPlanLineItem = {item: stubSalesOrderItem.item,
                quantity: scope.salesOrderItemSelected.quantity, planned_distribution_date: '2014-10-10',
                targeted_quantity: '', destination_location: '', mode_of_delivery: '',
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

        it('should modify the distribution plan items flag to true if it is currently false', function(){
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


});
