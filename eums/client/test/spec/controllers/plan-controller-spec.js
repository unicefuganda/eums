describe('NewDistributionPlanController', function () {

    beforeEach(module('NewDistributionPlan'));
    var scope, mockPlanService, mockDistributionPlanParametersService, mockProgrammeService,
        deferred, deferredPlan, location, distPlanEndpointUrl, mockSalesOrderItemService;

    var salesOrderDetails = [
        {'order_number': '00001',
            'date': '2014-10-05',
            'salesorderitem_set': ['1']}
    ];

    var programmes = [
        {id: 1, name: 'Test', focal_person: 1}
    ];


    beforeEach(function () {

        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem']);
        mockDistributionPlanParametersService = jasmine.createSpyObj('mockDistributionPlanParametersService', ['retrieveVariable']);

        inject(function ($controller, $rootScope, $location, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockProgrammeService.fetchProgrammes.and.returnValue(deferred.promise);
            mockPlanService.createPlan.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferred.promise);
            mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails);

            scope = $rootScope.$new();

            location = $location;

            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;


            $controller('NewDistributionPlanController',
                {$scope: scope, $location: location, DistributionPlanParameters: mockDistributionPlanParametersService,
                    ProgrammeService: mockProgrammeService, SalesOrderItemService: mockSalesOrderItemService});
        });
    });

    it('should have the sales orders in the scope when the controller is initialized', function () {
        mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails);
        scope.initialize();
        scope.$apply();

        expect(scope.salesOrders).toEqual(salesOrderDetails);
    });

    it('should call fetch programmes when the controller is initialized', function () {
        mockDistributionPlanParametersService.retrieveVariable.and.returnValue(null);
        scope.initialize();
        scope.$apply();

        expect(mockProgrammeService.fetchProgrammes).toHaveBeenCalled();
    });

    it('should have the programmes in the scope when the controller is initialized', function () {
        mockDistributionPlanParametersService.retrieveVariable.and.returnValue(null);
        deferred.resolve({data: programmes});
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

    it('should have all the scope variables as default when initialized and the proceed button has not been clicked', function () {
        mockDistributionPlanParametersService.retrieveVariable.and.returnValue(null);
        var expectedValue = '';
        var expectedDict = {name: ''};
        scope.initialize();
        scope.$apply();

        expect(scope.selectedSalesOrders).toEqual([]);
        expect(scope.programmeName).toEqual(expectedValue);
        expect(scope.date).toEqual(expectedValue);
        expect(scope.programmeSelected).toEqual(expectedDict);
        expect(scope.consigneeSelected).toEqual(expectedDict);
    });

    it('should have selectedSalesOrders when initialized and the proceed button has been clicked', function () {
        mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails);

        scope.initialize();
        scope.$apply();

        expect(scope.selectedSalesOrders).toEqual(salesOrderDetails);
    });


});
