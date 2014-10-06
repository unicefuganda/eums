describe('NewDistributionPlanController', function () {
    var scope, mockPlanService, mockDistributionPlanParametersService, mockContactService, mockProgrammeService, deferred, deferredPlan, location, distPlanEndpointUrl;

    var salesOrderDetails = [
        {'sales_document': '00001',
            'material_code': '1234', 'order_quantity': '100',
            'date_created': '2014-10-02',
            'net_value': '1000', 'net_price': '10', 'description': 'Test'}
    ];

    var programmes = [
        {id: 1, name: 'Test', focal_person: 1}
    ];

    beforeEach(module('NewDistributionPlan'));

    beforeEach(function () {
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'getSalesOrders', 'createPlan']);

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
