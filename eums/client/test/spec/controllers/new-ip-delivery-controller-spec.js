describe('New IP Delivery Controller', function () {
    var mockIpService, location, scope, q;
    var districts = ['Kampala', 'Mukono'];

    beforeEach(function () {
        module('NewIpDelivery');
        inject(function ($controller, $rootScope, $q, $location) {
            mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);

            mockIpService.loadAllDistricts.and.returnValue($q.when({data: districts}));

            location = $location;
            spyOn($location, 'path').and.returnValue('fake location');

            scope = $rootScope.$new();

            q = $q;
            $controller('NewIpDeliveryController', {
                $scope: scope,
                IPService: mockIpService
            });
        });
    });

    it('should have empty contact on load', function () {
        expect(scope.contact).toEqual({});
    });

    it('should load all districts and put them on scope', function () {
        expect(scope.districtsLoaded).toBeFalsy();
        scope.$apply();
        expect(scope.districts).toEqual([{id: 'Kampala', name: 'Kampala'}, {id: 'Mukono', name: 'Mukono'}]);
        expect(scope.districtsLoaded).toBeTruthy();
    });

    it('should broadcast show contact event when addContact is called', function () {
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
});