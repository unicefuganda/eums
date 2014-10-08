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
        it('should have the distributionPlanItems defaulted to an empty list', function(){
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
    });


});
