describe('New IP Delivery Controller', function () {
    var mockIpService, location, scope, q, mockDeliveryNodeService, routeParams, mockDeliveryNode, ipNodes, toast,
        mockLoaderService, mockItemService, mockConsigneeItemService;
    var districts = ['Kampala', 'Mukono'];
    var orderItemId = 1890;
    var fetchedItem = {id: 1, description: 'Some name', unit: 1};
    var fetchedConsigneeItems = {results: [{id: 2, availableBalance: 450}]};

    beforeEach(function () {
        module('NewDeliveryByIp');

        ipNodes = [
            {id: 1, item: orderItemId, quantityShipped: 10},
            {id: 2, item: orderItemId, quantityShipped: 20},
            {id: 3, item: orderItemId, quantityShipped: 30},
            {id: 4, item: orderItemId, quantityShipped: 40}
        ];

        inject(function ($controller, $rootScope, $q, $location, ngToast) {
            mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
            mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['filter', 'create']);
            mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);
            mockItemService = jasmine.createSpyObj('ItemService', ['get']);
            mockConsigneeItemService = jasmine.createSpyObj('ConsigneeItemService', ['filter']);
            mockConsigneeItemService.filter.and.returnValue($q.when(fetchedConsigneeItems));
            mockDeliveryNode = function (options) {
                this.track = options.track;
            };
            mockIpService.loadAllDistricts.and.returnValue($q.when({data: districts}));
            mockDeliveryNodeService.filter.and.returnValue($q.when(ipNodes));
            mockDeliveryNodeService.create.and.returnValue($q.when({}));
            mockItemService.get.and.returnValue($q.when(fetchedItem));

            location = $location;
            spyOn($location, 'path');

            scope = $rootScope.$new();
            routeParams = {itemId: 2};
            toast = ngToast;

            spyOn(toast, 'create');

            q = $q;
            $controller('NewDeliveryByIpController', {
                $scope: scope,
                IPService: mockIpService,
                $routeParams: routeParams,
                DeliveryNodeService: mockDeliveryNodeService,
                DeliveryNode: mockDeliveryNode,
                ngToast: toast,
                $location: location,
                ItemService: mockItemService,
                ConsigneeItemService: mockConsigneeItemService,
                LoaderService: mockLoaderService
            });
        });
    });

    it('should show loader on load', function () {
        scope.$apply();
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should have empty initial data on load', function () {
        expect(scope.errors).toBe(false);
        expect(scope.districts).toEqual([]);
        expect(JSON.stringify(scope.newDelivery)).toEqual(JSON.stringify({track: true}));
    });

    it('should load all districts and put them on scope', function () {
        expect(scope.districtsLoaded).toBeFalsy();
        scope.$apply();
        expect(scope.districts).toEqual([{id: 'Kampala', name: 'Kampala'}, {id: 'Mukono', name: 'Mukono'}]);
        expect(scope.districtsLoaded).toBeTruthy();
    });

    it('should load deliveries made to IP for the item', function () {
        scope.$apply();
        var filterParams = {item__item: routeParams.itemId, is_distributable: true};
        expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(filterParams);
        expect(scope.deliveries).toEqual(ipNodes);
    });

    it('should fetch item details and put them on scope', function () {
        scope.$apply();
        expect(scope.item).toEqual(fetchedItem);
    });

    it('should fetch consignee item details on load', function () {
        scope.$apply();
        expect(mockConsigneeItemService.filter).toHaveBeenCalledWith({item: 2});
        expect(scope.quantityAvailable).toBe(450);
    });


    it('should broadcast add contact event when addContact is called', function () {
        spyOn(scope, '$broadcast');
        scope.addContact();
        expect(scope.$broadcast).toHaveBeenCalledWith('add-contact');
    });

    it('should put new contact on scope after save', function () {
        var contact = {_id: 1, firstName: 'James', lastName: 'Bean'};

        var contactScope = scope.$new();
        contactScope.$emit('contact-saved', contact);
        scope.$apply();

        expect(scope.newDelivery.contact_person_id).toBe(contact._id);
        expect(scope.newDelivery.contact).toEqual(contact);
    });

    it('should put contact name into select after contact-saved is called', function () {
        var fakeTextSetter = jasmine.createSpy();
        var fakeContactInput = {
            siblings: function () {
                return {
                    find: function () {
                        return {text: fakeTextSetter}
                    }
                }
            }
        };
        spyOn(angular, 'element').and.returnValue(fakeContactInput);

        var contact = {_id: 1, firstName: 'James', lastName: 'Bean'};
        var contactScope = scope.$new();
        contactScope.$emit('contact-saved', contact);
        scope.$apply();

        expect(fakeTextSetter).toHaveBeenCalledWith('James Bean');
    });

    it('should broadcast add consignee event when addConsignee is called', function () {
        spyOn(scope, '$broadcast');
        scope.addConsignee();
        expect(scope.$broadcast).toHaveBeenCalledWith('add-consignee');
    });

    it('should put new consignee on scope after save', function () {
        var consignee = {id: 1, name: 'Wakiso DHO', location: 'Wakiso'};

        var consigneeScope = scope.$new();
        consigneeScope.$emit('consignee-saved', consignee);
        scope.$apply();

        expect(scope.newDelivery.consignee).toEqual(consignee);
    });

    it('should compute new delivery quantity from individual deliveries quantityShipped', function () {
        scope.$apply();
        expect(scope.totalQuantityShipped).toBe(100);
        scope.deliveries.first().quantityShipped = 100;
        scope.$apply();
        expect(scope.totalQuantityShipped).toBe(190);

        scope.deliveries.last().quantityShipped = 500;
        scope.$apply();
        expect(scope.totalQuantityShipped).toBe(650);
    });

    it('it should format new delivery date correctly on change', function () {
        scope.newDelivery.deliveryDate = '2015-08-26T08:00:00.000Z';
        scope.$apply();
        expect(scope.newDelivery.deliveryDate).toBe('2015-08-26');
    });

    it('should put consignee name into select after consignee-saved is called', function () {
        var consignee = {id: 1, name: 'Wakiso DHO', location: 'Wakiso'};
        spyOn(scope, '$broadcast');
        var consigneeScope = scope.$new();
        consigneeScope.$emit('consignee-saved', consignee);
        scope.$apply();

        expect(scope.$broadcast).toHaveBeenCalledWith('set-consignee', consignee);
    });

    it('should save new delivery using only parent nodes with non-zero quantities', function () {
        scope.$apply();
        var newDelivery = setupNewDelivery();
        scope.deliveries = [
            {id: 1, item: orderItemId, quantityShipped: 10},
            {id: 2, item: orderItemId, quantityShipped: 0},
            {id: 3, item: orderItemId, quantityShipped: 40}
        ];
        scope.save();

        var createArgs = mockDeliveryNodeService.create.calls.allArgs().first().first();
        var additionalFields = {track: true, item: 1890, parents: [{id: 1, quantity: 10}, {id: 3, quantity: 40}]};
        var expectedArgs = Object.merge(newDelivery, additionalFields);
        expect(JSON.stringify(createArgs)).toEqual(JSON.stringify(expectedArgs));
    });

    it('should not save delivery when any required field on the new delivery is not provided', function () {
        scope.$apply();
        assertSaveFails.if('location').is(undefined);
        assertSaveFails.if('consignee').is(undefined);
        assertSaveFails.if('deliveryDate').is(undefined);
        assertSaveFails.if('contact_person_id').is(undefined);
    });

    it('should not save new delivery if all deliveries to IP have no or zero quantity shipped', function () {
        scope.$apply();
        setupNewDelivery();
        scope.deliveries = [{id: 1, item: orderItemId}, {id: 2, item: orderItemId, quantityShipped: 0}];
        scope.save();
        expect(mockDeliveryNodeService.create).not.toHaveBeenCalled();
    });

    it('should not save new delivery if any of the deliveries has a quantity shipped higher than their balance', function () {
        scope.$apply();
        setupNewDelivery();
        scope.deliveries = [
            {id: 1, balance: 10, item: orderItemId, quantityShipped: 50},
            {id: 2, balance: 20, item: orderItemId, quantityShipped: 10}
        ];
        scope.save();
        expect(mockDeliveryNodeService.create).not.toHaveBeenCalled();
        expect(scope.errors).toBeTruthy();
        expect(toast.create).toHaveBeenCalledWith({
            content: 'Cannot save. Please fill out or fix values for all fields marked in red',
            class: 'danger'
        });
    });

    it('should show success toast upon save', function () {
        scope.$apply();
        setupNewDelivery();
        scope.save();
        scope.$apply();
        expect(toast.create).toHaveBeenCalledWith({
            content: 'Delivery Successfully Created',
            class: 'success'
        });
    });

    it('should redirect to deliveries by ip list upon successful save', function() {
        scope.$apply();
        setupNewDelivery();
        scope.save();
        scope.$apply();
        expect(location.path).toHaveBeenCalledWith('/deliveries-by-ip/' + routeParams.itemId)
    });

    it('should show failure toast when save fails', function () {
        scope.$apply();
        setupNewDelivery();
        mockDeliveryNodeService.create.and.returnValue(q.reject());
        scope.save();
        scope.$apply();
        expect(toast.create).toHaveBeenCalledWith({
            content: 'Failed to save delivery',
            class: 'danger'
        });
    });

    it('should fail to save new delivery if its quantities are from shipments with different order numbers bu the same order type', function () {
        scope.$apply();
        setupNewDelivery();
        scope.deliveries = [
            {id: 1, balance: 10, item: orderItemId, quantityShipped: 10, orderNumber: 444, orderType: 'waybill'},
            {id: 2, balance: 20, item: orderItemId, quantityShipped: 10, orderNumber: 555, orderType: 'waybill'}
        ];
        scope.save();
        expect(mockDeliveryNodeService.create).not.toHaveBeenCalled();
    });

    it('should fail to save new delivery if its quantities are from shipments with the same order numbers but different order types', function () {
        scope.$apply();
        setupNewDelivery();
        scope.deliveries = [
            {id: 1, balance: 10, item: orderItemId, quantityShipped: 10, orderNumber: 444, orderType: 'waybill'},
            {id: 2, balance: 20, item: orderItemId, quantityShipped: 10, orderNumber: 444, orderType: 'purchase order'}
        ];
        scope.save();
        expect(mockDeliveryNodeService.create).not.toHaveBeenCalled();
    });

    var assertSaveFails = {
        if: function (fieldname) {
            return {
                is: function (val) {
                    var unsetParams = {};
                    unsetParams[fieldname] = val;
                    setupNewDelivery(unsetParams);
                    scope.save();
                    expect(mockDeliveryNodeService.create).not.toHaveBeenCalled();
                    expect(scope.errors).toBeTruthy();
                    expect(toast.create).toHaveBeenCalledWith({
                        content: 'Cannot save. Please fill out or fix values for all fields marked in red',
                        class: 'danger'
                    });
                }
            }
        }
    };


    function setupNewDelivery(unset) {
        scope.newDelivery = {};
        scope.newDelivery.consignee = 10;
        scope.newDelivery.location = 'Jinja';
        scope.newDelivery.deliveryDate = '2015-01-30';
        scope.newDelivery.contact_person_id = '3A09C3B1-0937-4082-93D9-4ACC3E86B2B3';
        scope.newDelivery.parents = [{id: 1, quantity: 10}];
        Object.each(unset, function (key, value) {
            scope.newDelivery[key] = value;
        });
        return scope.newDelivery;
    }
});