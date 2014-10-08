describe('DistributionPlanController', function () {

    var scope, sorter, filter, mockDistributionPlanParametersService;
    var location, distPlanEndpointUrl;
    var mockContactService, mockPlanService, mockProgrammeService, mockSalesOrderService;
    var deferred, deferredPlan, deferredSalesOrder;

    var programmes = [
        {id: '1', name: 'Test Programme', salesorder_set: ['1', '2']},
        {id: '2', name: 'Another Test Programme', salesorder_set: ['3', '4']}
    ];

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var salesOrderDetails = [
        {'order_number': '00001', 'date': '2014-10-02', 'salesorderitem_set': ['1', '2', '3']}
    ];

    var stubError = {
        data: {
            error: 'Phone number is not valid'
        }
    };

    beforeEach(function () {
        module('DistributionPlan');
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['getPlanDetails', 'getSalesOrders']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['getProgramme', 'fetchProgrammes']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['getSalesOrder']);
        mockDistributionPlanParametersService = jasmine.createSpyObj('mockDistributionPlanParametersService', ['retrieveVariable', 'saveVariable']);
        location = jasmine.createSpyObj('location', ['path']);


        inject(function ($controller, $rootScope, ContactService, $location, $q, $sorter, $filter, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredSalesOrder = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            mockProgrammeService.getProgramme.and.returnValue(deferred.promise);
            mockProgrammeService.fetchProgrammes.and.returnValue(deferred.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockSalesOrderService.getSalesOrder.and.returnValue(deferredSalesOrder.promise);


            scope = $rootScope.$new();
            sorter = $sorter;
            filter = $filter;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DistributionPlanController',
                {$scope: scope, ContactService: mockContactService,
                    DistributionPlanService: mockPlanService,
                    ProgrammeService: mockProgrammeService,
                    SalesOrderService: mockSalesOrderService,
                    DistributionPlanParameters: mockDistributionPlanParametersService,
                    $sorter: sorter,
                    $filter: filter,
                    $location: location});
        });
    });

    describe('when sorted', function () {
        it('should set the sort criteria', function () {
            scope.sortBy('field');
            expect(scope.sort.criteria).toBe('field');
        });
        it('should set the sort order as descending by default', function () {
            scope.sortBy('field');
            expect(scope.sort.descending).toBe(true);
        });
        it('should toggle the sort order', function () {
            scope.sortBy('field');
            scope.sortBy('field');
            expect(scope.sort.descending).toBe(false);
        });
    });

    describe('when filtering', function () {
        it('should reset the query parameter when reset filter is clicked', function () {
            scope.query = 'Name';
            scope.resetFilter();
            scope.$apply();

            expect(scope.query).toEqual('');
        });
    });

    describe('when initialized', function () {
        it('should fetch all programmes when initialized', function () {
            scope.initialize();
            scope.$apply();
            expect(mockProgrammeService.fetchProgrammes).toHaveBeenCalled();
        });

        it('should have all programmes in the scope when initialized', function () {
            deferred.resolve({data: programmes});
            scope.initialize();
            scope.$apply();
            expect(scope.programmes).toEqual(programmes);
        });

        it('should fetch the sales orders linked to the first programme on initialize', function () {
            deferred.resolve({data: programmes});
            scope.initialize();
            scope.$apply();

            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[0].salesorder_set[0]);
            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[0].salesorder_set[1]);
        });

        it('should set sales orders linked to the first programme on initialize to the scope', function () {
            deferred.resolve({data: programmes});
            deferredSalesOrder.resolve(salesOrderDetails[0]);
            scope.initialize();
            scope.$apply();
            expect(scope.salesOrders).toEqual([salesOrderDetails[0], salesOrderDetails[0],
                salesOrderDetails[0], salesOrderDetails[0]]);
        });

        it('should set the sorter', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortBy).toBe(sorter);
        });

        it('should sort by order number', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sort.criteria).toBe('date');
        });

        it('should sort in descending order', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sort.descending).toBe(false);
        });

        it('should have the sort arrow icon on the order number column by default', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortArrowClass('')).toEqual('icon icon-sort');
        });

        it('should set the clicked column as active', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortArrowClass('date')).toEqual('active icon icon-sort');
        });

    });

    describe('when programme selected changes', function () {
        it('should know the sales orders for new programme are retrieved when the programme selected changes', function () {
            scope.initialize();
            scope.$apply();
            scope.programmeSelected = programmes[1];
            scope.$apply();
            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[1].salesorder_set[0]);
            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[1].salesorder_set[1]);
        });

        it('should know the sales orders for all programmes are retrieved when the programme selected is empty changes', function () {
            scope.initialize();
            scope.$apply();
            scope.programmes = programmes;
            scope.programmeSelected = '';
            scope.$apply();
            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[0].salesorder_set[0]);
            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[0].salesorder_set[1]);
            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[1].salesorder_set[0]);
            expect(mockSalesOrderService.getSalesOrder).toHaveBeenCalledWith(programmes[1].salesorder_set[1]);
        });

        it('should know the search query is reset when the programme selected changes', function () {
            scope.query = 'Test';
            scope.programmeSelected = programmes[1];
            scope.$apply();
            expect(scope.query).toEqual('');
        });

        it('should know the search query is reset when no programme is selected', function () {
            scope.query = 'Test';
            scope.programmeSelected = null;
            scope.$apply();
            expect(scope.query).toEqual('');
        });
    });

    describe('when sales order number is clicked', function () {
        it('should set the selected sales order in the distribution parameters', function () {
            scope.selectSalesOrder(salesOrderDetails[0]);
            scope.$apply();
            expect(mockDistributionPlanParametersService.saveVariable).toHaveBeenCalledWith('selectedSalesOrder', salesOrderDetails[0]);
        });

        it('should change location to create distribution plan path', function () {
            scope.selectSalesOrder(salesOrderDetails[0]);
            scope.$apply();
            expect(location.path).toHaveBeenCalledWith('/distribution-plan/new/');
        });
    });

    it('should save contact and return contact with an id', function () {
        deferred.resolve(stubResponse);
        scope.addContact();
        scope.$apply();
        expect(location.path).toHaveBeenCalledWith('/');
    });

    it('should add an error message to the scope when the contact is NOT saved', function () {
        deferred.reject(stubError);
        scope.addContact();
        scope.$apply();
        expect(scope.errorMessage).toBe('Phone number is not valid');
    });
});