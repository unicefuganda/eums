describe('Single IP Direct Delivery Controller', function () {
    var mockPurchaseOrderService, deferredPurchaseOrder, scope, location, mockIpService, deferredPurchaseOrderTotalValue, toast;
    var purchaseOrderValue = 1300.5;
    var purchaseOrderItems = [{id: 1}, {id: 2}];
    var purchaseOrder = {id: 1, purchaseorderitemSet: purchaseOrderItems};
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

        inject(function ($controller, $rootScope, $location, $q, ngToast) {
            deferredPurchaseOrder = $q.defer();
            deferredPurchaseOrder.resolve(purchaseOrder);
            mockPurchaseOrderService.get.and.returnValue(deferredPurchaseOrder.promise);

            deferredPurchaseOrderTotalValue = $q.defer();
            mockPurchaseOrderService.getDetail.and.returnValue(deferredPurchaseOrderTotalValue.promise);

            var deferredDistricts = $q.defer();
            deferredDistricts.resolve(districtsResponse);
            mockIpService.loadAllDistricts.and.returnValue(deferredDistricts.promise);

            scope = $rootScope.$new();
            location = $location;
            toast = ngToast;
            spyOn(angular, 'element').and.returnValue(mockElement);
            spyOn(mockElement, 'modal');

            $controller('SingleIpDirectDeliveryController', {
                $scope: scope,
                $location: location,
                $routeParams: routeParams,
                PurchaseOrderService: mockPurchaseOrderService,
                IPService: mockIpService,
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
            scope.$apply();
            expect(mockPurchaseOrderService.getDetail).toHaveBeenCalledWith(jasmine.any(Object), 'total_value');
            expect(mockPurchaseOrderService.getDetail.calls.mostRecent().args.first().id).toBe(purchaseOrder.id);
            deferredPurchaseOrderTotalValue.resolve(purchaseOrderValue);
            scope.$apply();
            expect(scope.purchaseOrder.totalValue).toEqual(purchaseOrderValue);
        });

        it('should put purchase order items on the scope', function () {
            scope.$apply();
            expect(mockPurchaseOrderService.get).toHaveBeenCalledWith(purchaseOrder.id, ['purchaseorderitem_set.item']);
            expect(scope.purchaseOrderItems).toEqual(purchaseOrderItems);
        });
    });

    describe('when save is called', function () {
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
        beforeEach(function() {
            spyOn(toast, 'create');
        });

        it('should throw and error when required fields are not filled out', function () {
            testErrorIsOnScope('consignee', {});
            testErrorIsOnScope('deliveryDate');
            testErrorIsOnScope('contact', {});
            testErrorIsOnScope('district', {});
        });

        function testErrorIsOnScope(scopeField, nullState) {
            var fields = ['contact', 'consignee', 'deliveryDate', 'district'];
            fields.forEach(function(field) {
                if(field !== scopeField) {
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
