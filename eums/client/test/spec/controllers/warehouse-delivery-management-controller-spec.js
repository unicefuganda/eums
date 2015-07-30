describe('Warehouse Delivery Management Controller', function () {

    var scope, location, q, routeParams, mockDistributionPlanService,
        mockDistributionPlanNodeService, mockReleaseOrderService, mockReleaseOrderItemService,
        mockIPService, toast, mockContactService, contact, locations;

    var programId = 23123;
    var consigneeId = 1;

    beforeEach(function () {
        module('WarehouseDeliveryManagement');
    });

    describe('On Save', function () {
        beforeEach(function () {
            routeParams = {releaseOrderId: 1};
            contact = {
                firstName: 'Francis',
                lastName: 'Mohammed',
                id: '634362487'
            };
            locations = [
                {
                    id: 'Kampala'
                },
                {
                    id: 'Jinga'
                }
            ];
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
            var releaseOrder = {
                consignee: {id: consigneeId},
                consigneeName: 'WAKISO DHO',
                delivery: 43,
                deliveryDate: '2014-08-19',
                id: 1,
                items: [releaseOrderItem],
                0: 430,
                orderNumber: 54102852,
                programme: '',
                purchaseOrder: 106,
                salesOrder: {id: 105, programme: {id: programId}},
                waybill: 72082647
            };
            var districts = {data: ['Kampala', 'Jinja']};

            var emptyFunction = function () {};
            var mockModal = {modal: emptyFunction, hasClass: emptyFunction, removeClass: emptyFunction, remove: emptyFunction};
            var mockLoader = {modal: emptyFunction, hasClass: emptyFunction, removeClass: emptyFunction, remove: emptyFunction};

            var jqueryFake = function (selector) {
                return selector === '#confirmation-modal' ? mockModal : mockLoader;
            };

            mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['get']);
            mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['createPlan']);
            mockDistributionPlanNodeService = jasmine.createSpyObj(mockDistributionPlanNodeService, ['filter', 'create']);
            mockContactService = jasmine.createSpyObj('mockContactService', ['get']);
            mockIPService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);


            inject(function ($controller,$rootScope, $location, $q, ngToast) {
                scope = $rootScope.$new();
                location = $location;
                toast = ngToast;
                q = $q;

                mockReleaseOrderService.get.and.returnValue(q.when(releaseOrder));
                mockDistributionPlanNodeService.filter.and.returnValue(q.when());
                mockDistributionPlanNodeService.create.and.returnValue(q.when());
                mockContactService.get.and.returnValue(q.when(contact));
                mockIPService.loadAllDistricts.and.returnValue(q.when(districts));
                mockDistributionPlanService.createPlan.and.returnValue(q.when({id: 232}));

                spyOn(angular, 'element').and.callFake(jqueryFake);
                spyOn(mockModal, 'modal');
                spyOn(mockLoader, 'modal');
                spyOn(toast, 'create');

                $controller('WarehouseDeliveryManagementController', {
                    $scope: scope,
                    $location: location,
                    $q: q,
                    $routeParams: routeParams,
                    DistributionPlanService: mockDistributionPlanService,
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

        it('should call distribution plan service when fields are valid', function () {
            scope.$apply();
            scope.contact = contact;
            scope.selectedLocation = locations.first();
            scope.saveDelivery();
            scope.$apply();

            expect(scope.errors).toBe(false);
            expect(mockDistributionPlanService.createPlan).toHaveBeenCalledWith({
                programme: programId,
                consignee: consigneeId,
                location: 'Kampala',
                contact_person_id: '634362487',
                delivery_date: '2014-08-19',
                track: false
            });
            expect(mockDistributionPlanNodeService.create.calls.count()).toEqual(1);
            expect(toast.create).toHaveBeenCalledWith({ content : 'Warehouse Delivery Saved!', class : 'success', maxNumber : 1, dismissOnTimeout : true });
        });

    });
});


