describe('DistributionPlanController', function () {

    var scope, sorter, filter;
    var location, distPlanEndpointUrl;
    var mockContactService, mockPlanService, mockProgrammeService, mockSalesOrderService;
    var deferred, deferredPlan, deferredSalesOrder;

    var programmeOne = {
        id: 1, name: 'Test Programme'
    };

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var salesOrderOne = {id: 1, 'order_number': '00001', 'date': '2014-10-02', programme: programmeOne.id, description: 'sale'};
    var salesOrderDetails = [salesOrderOne];

    var stubError = {
        data: {
            error: 'Phone number is not valid'
        }
    };

    beforeEach(function () {
        module('DistributionPlan');
        mockContactService = jasmine.createSpyObj('mockContactService', ['create']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['getPlanDetails']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['get', 'all']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['all', 'getByHasReleaseOrders']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $sorter, $filter, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredSalesOrder = $q.defer();
            mockContactService.create.and.returnValue(deferred.promise);
            mockProgrammeService.get.and.returnValue(deferred.promise);
            mockProgrammeService.all.and.returnValue(deferred.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockSalesOrderService.all.and.returnValue(deferredSalesOrder.promise);
            mockSalesOrderService.getByHasReleaseOrders.and.returnValue(deferredSalesOrder.promise);

            location = $location;
            scope = $rootScope.$new();
            sorter = $sorter;
            filter = $filter;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            spyOn(angular, 'element').and.callFake(function () {
                return {
                    modal : jasmine.createSpy('modal').and.callFake(function (status) {
                        return status;
                    })
                };
            });

            $controller('DistributionPlanController',
                {$scope: scope, ContactService: mockContactService,
                    DistributionPlanService: mockPlanService,
                    ProgrammeService: mockProgrammeService,
                    SalesOrderService: mockSalesOrderService,
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

    describe('when initialized', function () {
        xit('should set all sales orders on initialize to the scope', function () {
            deferredSalesOrder.resolve(salesOrderDetails);
            scope.initialize();
            scope.$apply();
            expect(scope.salesOrders).toEqual(salesOrderDetails);
        });

        it('should set the sorter', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortBy).toBe(sorter);
        });

        it('should sort by order number', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sort.criteria).toBe('order_number');
        });

        it('should sort in descending order', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sort.descending).toBe(false);
        });

        it('should have the sort arrow icon on the order number column by default', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortArrowClass('')).toEqual('');
        });

        it('should set the clicked column as active', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortArrowClass('order_number')).toEqual('active glyphicon glyphicon-arrow-down');
        });

        it('should set the clicked column as active and have the up arrow when ascending', function () {
            scope.initialize();
            scope.sort.descending = true;
            scope.$apply();
            expect(scope.sortArrowClass('order_number')).toEqual('active glyphicon glyphicon-arrow-up');
        });

    });

    describe('when sales order is selected', function () {
        it('should change location to create distribution plan path', function () {
            deferredSalesOrder.resolve(salesOrderOne);
            scope.selectSalesOrder(salesOrderOne);
            scope.$apply();
            expect(location.path()).toEqual('/distribution-plan/new/1');
        });
    });

    xit('should save contact and return contact with an id', function () {
        deferred.resolve(stubResponse);
        scope.create();
        scope.$apply();
        expect(location.path()).toEqual('/');
    });

    xit('should add an error message to the scope when the contact is NOT saved', function () {
        deferred.reject(stubError);
        scope.create();
        scope.$apply();
        expect(scope.errorMessage).toBe('Phone number is not valid');
    });
});