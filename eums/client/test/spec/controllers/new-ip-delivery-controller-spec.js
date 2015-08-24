describe('New IP Delivery Controller', function () {
    var mockIpService, location, scope, q, mockDeliveryNodeService, routeParams;
    var districts = ['Kampala', 'Mukono'];
    var ipNodes = [{id: 1}, {id: 2}, {id: 3}, {id: 4}];

    beforeEach(function () {
        module('NewIpDelivery');
        inject(function ($controller, $rootScope, $q, $location) {
            mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
            mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['filter']);

            mockIpService.loadAllDistricts.and.returnValue($q.when({data: districts}));
            mockDeliveryNodeService.filter.and.returnValue($q.when(ipNodes));

            location = $location;
            spyOn($location, 'path').and.returnValue('fake location');

            scope = $rootScope.$new();
            routeParams = {itemId: 2};

            q = $q;
            $controller('NewIpDeliveryController', {
                $scope: scope,
                IPService: mockIpService,
                $routeParams: routeParams,
                DeliveryNodeService: mockDeliveryNodeService
            });
        });
    });

    it('should have empty initial data on load', function () {
        expect(scope.contact).toEqual({});
        expect(scope.districts).toEqual([]);
        expect(scope.district).toEqual({});
        expect(scope.consignee).toEqual({});
    });

    it('should load all districts and put them on scope', function () {
        expect(scope.districtsLoaded).toBeFalsy();
        scope.$apply();
        expect(scope.districts).toEqual([{id: 'Kampala', name: 'Kampala'}, {id: 'Mukono', name: 'Mukono'}]);
        expect(scope.districtsLoaded).toBeTruthy();
    });

    it('should load deliveries made to IP for the item', function() {
        scope.$apply();
        var filterParams = {item: routeParams.itemId, balance_greater_than: 0};
        expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(filterParams);
        expect(scope.deliveries).toEqual(ipNodes);
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

        expect(scope.contact_person_id).toBe(contact._id);
        expect(scope.contact).toEqual(contact);
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

        expect(scope.consignee).toEqual(consignee);
    });

    it('should put consignee name into select after consignee-saved is called', function () {
        var consignee = {id: 1, name: 'Wakiso DHO', location: 'Wakiso'};
        spyOn(scope, '$broadcast');
        var consigneeScope = scope.$new();
        consigneeScope.$emit('consignee-saved', consignee);
        scope.$apply();

        expect(scope.$broadcast).toHaveBeenCalledWith('set-consignee', consignee);
    });
});