describe('Warehouse Delivery Management Controller', function () {

    var scope, location, q, routeParams, mockDistributionPlanService,
        mockDistributionPlanNodeService, mockReleaseOrderService, mockReleaseOrderItemService,
        mockIPService, toast, mockContactService;

    beforeEach(function () {
        module('WarehouseDeliveryManagement');
    });

    describe('On Save', function () {
        beforeEach(function () {
            routeParams = {releaseOrderId: 1};
            var releaseOrder = {
                consignee: 1,
                consignee_name: 'WAKISO DHO',
                delivery: 43,
                delivery_date: '2014-08-19',
                id: 1,
                items: [430],
                0: 430,
                order_number: 54102852,
                programme: '',
                purchase_order: 106,
                sales_order: 105,
                waybill: 72082647
            };
            var releaseOrderItem = {
                distributionplannode_set: [44],
                id: 430,
                item: 174,
                item_number: 10,
                purchase_order_item: 429,
                quantity: '50.00',
                release_order: 1,
                value: '8999.05'
            };
            var contact = {
                firstName: 'Francis',
                lastName: 'Mohammed',
                id: '634362487'
            };
            var districtsResponse = {data: ['Kampala', 'Jinja']};

            var emptyFunction = function () {};
            var mockModal = {modal: emptyFunction, hasClass: emptyFunction, removeClass: emptyFunction, remove: emptyFunction};
            var mockLoader = {modal: emptyFunction, hasClass: emptyFunction, removeClass: emptyFunction, remove: emptyFunction};

            var jqueryFake = function (selector) {
                return selector === '#confirmation-modal' ? mockModal : mockLoader;
            };

            mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['get']);
            mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['createPlan']);
            mockDistributionPlanNodeService = jasmine.createSpyObj(mockDistributionPlanNodeService, ['filter']);
            mockContactService = jasmine.createSpyObj('mockContactService', ['get']);
            mockIPService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);


            inject(function ($controller,$rootScope, $location, $q, ngToast) {
                scope = $rootScope.$new();
                location = $location;
                toast = ngToast;
                q = $q;

                mockReleaseOrderService.get.and.returnValue(q.when(releaseOrder));
                mockDistributionPlanNodeService.filter.and.returnValue(q.when());
                mockContactService.get.and.returnValue(q.when(contact));
                mockIPService.loadAllDistricts.and.returnValue(q.when(districtsResponse));

                spyOn(angular, 'element').and.callFake(jqueryFake);
                spyOn(mockModal, 'modal');
                spyOn(mockLoader, 'modal');
                spyOn(toast, 'create');


                $controller('WarehouseDeliveryManagementController', {
                    $scope: scope,
                    $location: location,
                    $q: q,
                    $routeParams: routeParams,
                    DistributionPlanService: mockDistributionPlanNodeService,
                    DistributionPlanNodeService: mockDistributionPlanNodeService,
                    ReleaseOrderService: mockReleaseOrderService,
                    ReleaseOrderItemService: mockReleaseOrderItemService,
                    IPService: mockIPService,
                    ngToast: toast,
                    ContactService: mockContactService
                });
            });
        });

        it('should validate delivery fields before saving', function () {
            scope.saveDelivery();
            scope.$apply();

            expect(scope.errors).toBe(true);
            expect(toast.create).toHaveBeenCalledWith({ content : 'Please fill in required field!', class : 'danger', maxNumber : 1, dismissOnTimeout : true });
            expect(mockDistributionPlanService.createPlan).not.toHaveBeenCalled();
        });
    });
});


