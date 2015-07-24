describe('Single IP Direct Delivery Controller', function () {
    var mockPurchaseOrderService, scope, location, mockIpService,
        toast, mockDeliveryService, DeliveryNodeModel, mockDeliveryNodeService, q;
    var purchaseOrderValue = 1300.5;
    var purchaseOrderItems = [{quantityShipped: 10, id: 1}, {quantityShipped: 11, id: 2}];
    var programmeId = 1;
    var createdDelivery = {id: 10, programme: programmeId};
    var purchaseOrder = {id: 1, purchaseorderitemSet: purchaseOrderItems, programme: programmeId};
    var routeParams = {purchaseOrderId: purchaseOrder.id};
    var districts = [{name: 'Kampala', id: 'Kampala'}, {name: 'Jinja', id: 'Jinja'}];
    var districtsResponse = {data: ['Kampala', 'Jinja']};
    var mockElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('SingleIpDirectDelivery');

        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['get', 'getDetail']);
        mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
        mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['createPlan']);
        mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['create']);

        inject(function ($controller, $rootScope, $location, $q, ngToast, DeliveryNode) {
            DeliveryNodeModel = DeliveryNode;
            scope = $rootScope.$new();
            location = $location;
            toast = ngToast;
            q = $q;

            mockPurchaseOrderService.getDetail.and.returnValue($q.when(0));
            mockPurchaseOrderService.get.and.returnValue($q.when(purchaseOrder));
            mockDeliveryNodeService.create.and.returnValue($q.when(new DeliveryNodeModel({id: 1})));
            mockDeliveryService.createPlan.and.returnValue($q.when(createdDelivery));
            mockIpService.loadAllDistricts.and.returnValue($q.when(districtsResponse));

            spyOn(angular, 'element').and.returnValue(mockElement);
            spyOn(mockElement, 'modal');

            $controller('SingleIpDirectDeliveryController', {
                $scope: scope,
                $location: location,
                $routeParams: routeParams,
                PurchaseOrderService: mockPurchaseOrderService,
                IPService: mockIpService,
                DistributionPlanService: mockDeliveryService,
                DistributionPlanNodeService: mockDeliveryNodeService,
                DeliveryNode: DeliveryNodeModel,
                ngToast: toast
            });
        });
    });

    describe('on load', function () {
        it('should put empty objects on on scope', function () {
            scope.$apply();
            expect(scope.consignee).toEqual({});
            expect(scope.contact).toEqual({});
            expect(scope.district).toEqual({});
        });

        it('should load all districts and put them on scope and notify directive', function () {
            expect(scope.districtsLoaded).toBeFalsy();
            scope.$apply();
            expect(mockIpService.loadAllDistricts).toHaveBeenCalled();
            expect(scope.districts).toEqual(districts);
            expect(scope.districtsLoaded).toBe(true);
        });

        it('should fetch purchase order with id specified in route and put it on scope', function () {
            scope.$apply();
            expect(mockPurchaseOrderService.get).toHaveBeenCalledWith(purchaseOrder.id, jasmine.any(Array));
            expect(scope.purchaseOrder).toEqual(purchaseOrder);
        });

        it('should put purchase order value on purchase order', function () {
            mockPurchaseOrderService.getDetail.and.returnValue(q.when(purchaseOrderValue));
            scope.$apply();
            expect(mockPurchaseOrderService.getDetail).toHaveBeenCalledWith(jasmine.any(Object), 'total_value');
            expect(mockPurchaseOrderService.getDetail.calls.mostRecent().args.first().id).toBe(purchaseOrder.id);
            expect(scope.purchaseOrder.totalValue).toEqual(purchaseOrderValue);
        });

        it('should put purchase order items on the scope', function () {
            scope.$apply();
            expect(mockPurchaseOrderService.get).toHaveBeenCalledWith(purchaseOrder.id, ['purchaseorderitem_set.item']);
            expect(scope.purchaseOrderItems).toEqual(purchaseOrderItems);
        });
    });

    describe('when save is called', function () {
        beforeEach(function () {
            scope.purchaseOrderItems = []
        });

        it('should show warning modal if purchase order is not already in single IP mode', function () {
            scope.purchaseOrder = {};
            scope.save();
            scope.$apply();
            expect(angular.element).toHaveBeenCalledWith('#confirmation-modal');
            expect(mockElement.modal).toHaveBeenCalled();
        });

        it('should NOT show warning modal if purchase order is already in single IP mode', function () {
            scope.purchaseOrder = {isSingleIp: true};
            scope.save();
            scope.$apply();
            expect(angular.element).not.toHaveBeenCalled();
        });
    });

    describe('when save is confirmed', function () {
        var nodeOne, nodeTwo, itemOne, itemTwo, consignee, district, deliveryDate, formattedDeliveryDate , contact, remark;

        beforeEach(function () {
            consignee = {id: 1};
            district = {id: 'Kampala'};
            deliveryDate = 'Mon Jun 29 2015 00:00:00 GMT+0300 (EAT)';
            formattedDeliveryDate = moment(new Date(deliveryDate)).format('YYYY-MM-DD');
            contact = {id: 3};
            remark = 'Some remarks';
            itemOne = purchaseOrderItems[0];
            itemTwo = purchaseOrderItems[1];

            var deliveryCommonFields = {
                distributionPlan: createdDelivery,
                consignee: consignee,
                location: district.id,
                plannedDistributionDate: formattedDeliveryDate,
                contactPerson: contact,
                remark: remark,
                track: true,
                isEndUser: false,
                treePosition: 'IMPLEMENTING_PARTNER'
            };

            spyOn(toast, 'create');
            scope.purchaseOrder = {isSingleIp: true, programme: programmeId};
            scope.purchaseOrderItems = purchaseOrderItems;
            nodeOne = new DeliveryNodeModel(Object.merge({item: itemOne}, deliveryCommonFields));
            nodeTwo = new DeliveryNodeModel(Object.merge({item: itemTwo}, deliveryCommonFields));

        });

        it('should throw and error when required fields are not filled out', function () {
            testErrorIsOnScope('consignee', {});
            testErrorIsOnScope('deliveryDate');
            testErrorIsOnScope('contact', {});
            testErrorIsOnScope('district', {});
        });

        it('should create a new delivery and put it on scope when there is no current delivery on scope', function () {
            scope.delivery = undefined;
            scope.save();
            scope.$apply();
            expect(mockDeliveryService.createPlan).toHaveBeenCalledWith({programme: programmeId});
            expect(scope.delivery).toEqual(createdDelivery);
        });

        it('should not create a new delivery when there is a delivery in the scope', function () {
            scope.delivery = createdDelivery;
            scope.save();
            scope.$apply();
            expect(mockDeliveryService.createPlan).not.toHaveBeenCalled();
        });

        it('should not create delivery if all purchase order items have quantityShipped as zero', function () {
            scope.delivery = undefined;
            scope.purchaseOrderItems = [{quantityShipped: 0}, {quantityShipped: 0}];
            scope.save();
            scope.$apply();

            expect(mockDeliveryService.createPlan).not.toHaveBeenCalled();
            var errorMessage = 'Cannot save delivery with zero quantity shipped';
            expect(toast.create).toHaveBeenCalledWith({content: errorMessage, class: 'danger'});
        });

        it('should not throw zero-total-quantity error when total quantity is non zero and there is a delivery on scope', function () {
            scope.delivery = createdDelivery;
            scope.save();
            scope.$apply();
            expect(toast.create).not.toHaveBeenCalled();
        });

        it('should create delivery when one of the nodes has undefined quantityShipped but other have non-zero quantityShipped', function () {
            scope.delivery = undefined;
            scope.purchaseOrderItems = [{}, {quantityShipped: 10}];
            scope.save();
            scope.$apply();

            expect(mockDeliveryService.createPlan).toHaveBeenCalledWith({programme: programmeId});
        });

        it('should create tracked delivery nodes for each purchase order item when delivery is undefined', function () {
            setScopeData();
            scope.save();
            scope.$apply();

            var createNodeArgs = mockDeliveryNodeService.create.calls.allArgs();
            expect(mockDeliveryNodeService.create.calls.count()).toBe(2);
            expect(JSON.stringify(createNodeArgs.first().first())).toEqual(JSON.stringify(nodeOne));
            expect(JSON.stringify(createNodeArgs.last().first())).toEqual(JSON.stringify(nodeTwo));
        });

        it('should not create nodes for purchase order items with zero distributed quantity', function () {
            itemOne.quantityShipped = 0;
            setScopeData();
            scope.save();
            scope.$apply();

            var createNodeArgs = mockDeliveryNodeService.create.calls.allArgs();
            expect(mockDeliveryNodeService.create.calls.count()).toBe(1);
            expect(JSON.stringify(createNodeArgs.first().first())).toEqual(JSON.stringify(nodeTwo));
        });

        it('should alert user when creation of delivery fails', function () {
            mockDeliveryService.createPlan.and.returnValue(q.reject());
            setScopeData();
            scope.save();
            scope.$apply();

            expect(toast.create).toHaveBeenCalledWith({content: 'Save failed', class: 'danger'});
        });

        it('should alert user when creation of delivery nodes fails', function () {
            mockDeliveryNodeService.create.and.returnValue(q.reject());
            setScopeData();
            scope.save();
            scope.$apply();

            expect(toast.create).toHaveBeenCalledWith({content: 'Save failed', class: 'danger'});
        });

        describe('successfully with track = true', function () {
            it('reload purchase order and purchase order items on scope', function () {
                var newPurchaseOrder = {id: 15, purchaseorderitemSet: []};
                mockPurchaseOrderService.get.and.returnValue(q.when(newPurchaseOrder));
                setScopeData();

                scope.save();
                scope.$apply();

                expect(mockPurchaseOrderService.get.calls.count()).toBe(2);
                expect(mockPurchaseOrderService.get.calls.mostRecent().args).toEqual(
                    [purchaseOrder.id, ['purchaseorderitem_set.item']]
                );
                expect(scope.purchaseOrder).toEqual(newPurchaseOrder);
                expect(scope.purchaseOrderItems).toEqual([]);
            });

            //it('should disable and demote items with zero available quantity', function() {
            //    itemOne.
            //});
        });

        function setScopeData() {
            scope.delivery = undefined;
            scope.consignee = consignee;
            scope.district = district;
            scope.deliveryDate = deliveryDate;
            scope.contact = contact;
            scope.remark = remark;
            scope.purchaseOrderItems = [itemOne, itemTwo];
        }

        function testErrorIsOnScope(scopeField, nullState) {
            var fields = ['contact', 'consignee', 'deliveryDate', 'district'];
            fields.forEach(function (field) {
                if (field !== scopeField) {
                    scope[field] = {id: 1};
                }
            });
            scope[scopeField] = nullState;

            scope.$apply();
            scope.warningAccepted();
            expect(scope.errors).toBeTruthy();
            expect(toast.create).toHaveBeenCalledWith({
                content: 'Cannot save. Please fill out all fields marked in red first',
                class: 'danger'
            });
            expect(mockElement.modal).toHaveBeenCalledWith('hide');
        }
    });

    it('should show loader when loading data', function () {
        // TODO Implement at end
    });

});
