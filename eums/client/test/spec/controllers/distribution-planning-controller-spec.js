describe('DistributionPlanController', function () {

    var scope;
    var location;
    var mockContactService;
    var deferred;

    var stubResponse = {
        data: {
            _id: 'xxxxxxxx',
            firstname: 'Tunji',
            lastname: 'Sunmonu',
            phone: '+256778945363'
        }
    };

    var stubError = {
        data: {
            error: 'Phone number is not valid'
        }
    };

    beforeEach(function () {
        module('DistributionPlan');
        mockContactService = jasmine.createSpyObj('mockContactService', ['addContact']);


        inject(function ($controller, $rootScope, ContactService, $location, $q) {
            deferred = $q.defer();
            mockContactService.addContact.and.returnValue(deferred.promise);
            scope = $rootScope.$new();
            location = $location;

            $controller('DistributionPlanController', {$scope: scope, ContactService: mockContactService, $location: location});
        });
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
});