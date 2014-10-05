describe('DistributionPlanController', function () {

    var scope;
    var location, distPlanEndpointUrl;
    var mockContactService, flowchartService, mockPlanService, mockProgrammeService, mockPlanNodeService;
    var deferred, deferredPlan;

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var salesOrderDetails = [
        {'sales_document': '00001',
            'material_code': '1234', 'order_quantity': '100',
            'date_created': '2014-10-02',
            'net_value': '1000', 'net_price': '10', 'description': 'Test'}
    ];

    var stubPlanOne = {data: [
        {
            id: 1,
            programme: 1,
            distributionplannode_set: [1, 2]
        }
    ]};


    var stubError = {
        data: {
            error: 'Phone number is not valid'
        }
    };

    beforeEach(function () {
        module('DistributionPlan');
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        flowchartService = jasmine.createSpyObj('flowchartService', ['ChartViewModel']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails',
            'createDistributionPlanNode', 'getSalesOrders']);
        mockPlanNodeService = jasmine.createSpyObj('mockPlanNodeService', ['createNode']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['getProgramme']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $httpBackend, EumsConfig) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            mockProgrammeService.getProgramme.and.returnValue(deferred.promise);
            mockPlanService.fetchPlans.and.returnValue(deferredPlan.promise);
            mockPlanService.getSalesOrders.and.returnValue(deferredPlan.promise);
            mockPlanService.getPlanDetails.and.returnValue(deferredPlan.promise);
            mockPlanNodeService.createNode.and.returnValue(deferredPlan.promise);

            scope = $rootScope.$new();

            location = $location;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DistributionPlanController',
                {$scope: scope, ContactService: mockContactService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanNodeService: mockPlanNodeService,
                    ProgrammeService: mockProgrammeService,
                    $location: location, flowchart: flowchartService});
        });
    });

    it('should initialize ng Table parameters when initialize is invoked', inject(function (ngTableParams) {
        scope.initialize();
        scope.$apply();

        expect(ngTableParams).toBeDefined();
    }));

    it('should know that the programme service is invoked when initialized', function () {
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(mockProgrammeService.getProgramme).toHaveBeenCalledWith(1);
    });

    it('should replace program id with programme object when initialized', function () {
        var programme = {id: '1', name: 'Test Programme'};
        deferred.resolve(programme);
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(scope.distribution_plans[0].programme).toEqual(programme);
    });


    it('should save contact and return contact with an id', function () {
        deferred.resolve(stubResponse);
        scope.addContact();
        scope.$apply();
        expect(location.path()).toBe('/');
    });

    it('should add an error message to the scope when the contact is NOT saved', function () {
        deferred.reject(stubError);
        scope.addContact();
        scope.$apply();
        expect(scope.errorMessage).toBe('Phone number is not valid');
    });

    it('should know that the plan information is stored in the scope when controller is invoked', function () {
        deferredPlan.resolve(stubPlanOne);
        scope.initialize();
        scope.$apply();
        expect(scope.distribution_plans).toEqual(stubPlanOne.data);
    });


    it('should call the get sales order service from distribution plan', function () {
        scope.initialize();
        expect(mockPlanService.getSalesOrders).toHaveBeenCalled();
    });

    it('should expect all sales orders to be on the local scope when the controller is initialised', function () {
        deferredPlan.resolve({data: salesOrderDetails});
        scope.initialize();
        scope.$apply();
        expect(scope.salesOrders).toEqual(salesOrderDetails);
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

describe('NewDistributionPlanController', function () {
    var scope, mockPlanService, mockDistributionPlanParametersService, mockContactService, mockProgrammeService, deferred, deferredPlan, location, distPlanEndpointUrl;

    var salesOrderDetails = [
        {'sales_document': '00001',
            'material_code': '1234', 'order_quantity': '100',
            'date_created': '2014-10-02',
            'net_value': '1000', 'net_price': '10', 'description': 'Test'}
    ];

    var programmes = [{id: 1, name: 'Test', focal_person: 1}];

    beforeEach(module('DistributionPlan'));

    beforeEach(function () {
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails',
            'createDistributionPlanNode', 'getSalesOrders', 'createPlan']);

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