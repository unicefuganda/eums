describe('NewDistributionPlanController', function () {

    beforeEach(module('NewDistributionPlan'));
    var scope, mockPlanService, mockDistributionPlanParametersService, mockProgrammeService,
        deferred, deferredPlan, location, distPlanEndpointUrl, mockSalesOrderItemService;

    var orderNumber = '00001';

    var salesOrderDetails = [
        {'order_number': orderNumber,
            'date': '2014-10-05',
            'salesorderitem_set': ['1']}
    ];

    var stubSalesOrderItem = {
        id: 1,
        sales_order: '1',
        item: 1,
        quantity: 100,
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02'
    };

    var programmes = [
        {id: 1, name: 'Test', focal_person: 1}
    ];


    beforeEach(function () {

        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);
        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem']);
        mockDistributionPlanParametersService = jasmine.createSpyObj('mockDistributionPlanParametersService', ['retrieveVariable', 'saveVariable']);
        location = jasmine.createSpyObj('location', ['path']);

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

            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;


            $controller('NewDistributionPlanController',
                {$scope: scope, $location: location, DistributionPlanParameters: mockDistributionPlanParametersService,
                    ProgrammeService: mockProgrammeService, SalesOrderItemService: mockSalesOrderItemService});
        });
    });

    it('should format the selected sales order appropriately for the view', function () {
        deferred.resolve(stubSalesOrderItem);
        mockDistributionPlanParametersService.retrieveVariable.and.returnValue(salesOrderDetails);

        scope.initialize();
        scope.$apply();

        expect(scope.salesOrderItems).toEqual([
            {salesOrder: orderNumber, item: stubSalesOrderItem}
        ]);
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

    it('should have location changed to proceed when the items need to be selected', function () {
        var proceedLocation = '/distribution-plan/proceed/';

        scope.selectItems();
        scope.$apply();

        expect(location.path).toHaveBeenCalledWith(proceedLocation);
    });

    it('should have selected sales orders to be saved when the items need to be selected', function () {
        var variable = 'selectedSalesOrders';
        scope.selectedSalesOrders = salesOrderDetails;

        scope.selectItems();
        scope.$apply();

        expect(mockDistributionPlanParametersService.saveVariable).toHaveBeenCalledWith(variable, salesOrderDetails);
    });

    it('should have proceeding flag saved when the items need to be selected', function () {
        var variable = 'isProceeding';

        scope.selectItems();
        scope.$apply();

        expect(mockDistributionPlanParametersService.saveVariable).toHaveBeenCalledWith(variable, true);
    });

    it('should have programme name saved when the items need to be selected', function () {
        var variable = 'programmeName';
        scope.programmeName = programmes[0].name;

        scope.selectItems();
        scope.$apply();

        expect(mockDistributionPlanParametersService.saveVariable).toHaveBeenCalledWith(variable, programmes[0].name);
    });

    it('should have date selected saved when the items need to be selected', function () {
        var variable = 'date';
        scope.date = '2014-10-06';

        scope.selectItems();
        scope.$apply();

        expect(mockDistributionPlanParametersService.saveVariable).toHaveBeenCalledWith(variable, '2014-10-06');
    });

    it('should have programme selected saved when the items need to be selected', function () {
        var variable = 'programmeSelected';
        scope.programmeSelected = programmes[0];

        scope.selectItems();
        scope.$apply();

        expect(mockDistributionPlanParametersService.saveVariable).toHaveBeenCalledWith(variable, programmes[0]);
    });

    it('should have consignee selected saved when the items need to be selected', function () {
        var variable = 'consigneeSelected';
        var consignee = {id: 1, name: 'Test Consignee'};

        scope.consigneeSelected = consignee;

        scope.selectItems();
        scope.$apply();

        expect(mockDistributionPlanParametersService.saveVariable).toHaveBeenCalledWith(variable, consignee);
    });
});
