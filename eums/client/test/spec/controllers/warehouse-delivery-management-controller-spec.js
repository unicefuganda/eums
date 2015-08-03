describe('Warehouse Delivery Management Controller', function () {

    var scope, location, q, routeParams, mockDeliveryService,
        mockDistributionPlanNodeService, mockReleaseOrderService, mockReleaseOrderItemService,
        mockIPService, toast, mockContactService, contact, locations, releaseOrderItem;

    var programId = 23123;
    var consigneeId = 1;
    var releaseOrderItemId = 430;
    var updatedDelivery = {id: 1, item: 2};

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
            releaseOrderItem = {
                distributionplannode_set: [44],
                id: releaseOrderItemId,
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
                0: releaseOrderItemId,
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
            mockDeliveryService = jasmine.createSpyObj('mockDeliveryService',
                ['create', 'update']);
            mockDistributionPlanNodeService = jasmine.createSpyObj(mockDistributionPlanNodeService,
                ['filter', 'create', 'update']);
            mockContactService = jasmine.createSpyObj('mockContactService', ['get']);
            mockIPService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);


            inject(function ($controller,$rootScope, $location, $q, ngToast) {
                scope = $rootScope.$new();
                location = $location;
                toast = ngToast;
                q = $q;

                mockReleaseOrderService.get.and.returnValue(q.when(releaseOrder));
                mockDistributionPlanNodeService.filter.and.returnValue(q.when([{location: 'Kampala', id: 1}]));
                mockDistributionPlanNodeService.create.and.returnValue(q.when());
                mockDistributionPlanNodeService.update.and.returnValue(q.when({}));
                mockContactService.get.and.returnValue(q.when(contact));
                mockIPService.loadAllDistricts.and.returnValue(q.when(districts));
                mockDeliveryService.create.and.returnValue(q.when({id: 232}));
                mockDeliveryService.update.and.returnValue(q.when(updatedDelivery));

                spyOn(angular, 'element').and.callFake(jqueryFake);
                spyOn(mockModal, 'modal');
                spyOn(mockLoader, 'modal');
                spyOn(toast, 'create');

                $controller('WarehouseDeliveryManagementController', {
                    $scope: scope,
                    $location: location,
                    $q: q,
                    $routeParams: routeParams,
                    DeliveryService: mockDeliveryService,
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
            expect(mockDeliveryService.create).not.toHaveBeenCalled();
        });

        it('should call distribution plan service when fields are valid', function () {
            scope.$apply();
            scope.contact = contact;
            scope.track = false;
            scope.selectedLocation = locations.first();
            scope.saveDelivery();
            scope.$apply();

            expect(scope.errors).toBe(false);
            expect(mockDeliveryService.create).toHaveBeenCalledWith({
                programme: programId,
                consignee: consigneeId,
                location: 'Kampala',
                contact_person_id: '634362487',
                delivery_date: '2014-08-19',
                track: false
            });
            expect(mockDistributionPlanNodeService.create.calls.count()).toEqual(1);
            expect(toast.create).toHaveBeenCalledWith({
                content: 'Warehouse Delivery Saved!',
                class: 'success',
                maxNumber: 1,
                dismissOnTimeout: true
            });
        });

        it('should update deliveries and nodes when has a delivery in the scope', function () {
            scope.$apply();
            var delivery = {id: 1};
            scope.delivery = delivery;
            scope.contact = contact;
            scope.deliveryNodes = [{item: releaseOrderItemId}];
            scope.selectedLocation = locations.first();
            scope.saveDelivery();
            scope.$apply();

            expect(scope.errors).toBe(false);
            expect(mockDistributionPlanNodeService.create.calls.count()).toEqual(0);
            expect(mockDeliveryService.update).toHaveBeenCalledWith(delivery);
            expect(mockDistributionPlanNodeService.update.calls.count()).toEqual(1);
            expect(toast.create).toHaveBeenCalledWith({
                content: 'Warehouse Delivery Saved!',
                class: 'success',
                maxNumber: 1,
                dismissOnTimeout: true
            });
        });

    });
});


