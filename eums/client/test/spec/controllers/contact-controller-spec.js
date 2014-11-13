describe('ContactController', function () {
    var scope, sorter, stubContactsPromise, mockContactService;

    var stubContacts = [
        {
            _id: 1,
            firstName: 'Andrew',
            lastName: 'Mukiza',
            phone: '+234778945674'
        },
        {
            _id: 2,
            firstName: 'James',
            lastName: 'Oloo',
            phone: '+234778945675'
        }
    ];

    beforeEach(module('Contact'));

    beforeEach(function () {
        module('ngTable');
        module('siTable');

        mockContactService = jasmine.createSpyObj('mockContactService', ['getAllContacts']);

        inject(function ($rootScope, $controller, $q, $sorter) {
            scope = $rootScope.$new();
            sorter = $sorter;

            stubContactsPromise = $q.defer();
            mockContactService.getAllContacts.and.returnValue(stubContactsPromise.promise);

            $controller('ContactController', {$scope: scope,
                ContactService: mockContactService,
                $sorter: sorter});
        });
    });

    it('should fetch all contacts', function () {
        stubContactsPromise.resolve(stubContacts);
        scope.initialize();
        scope.$apply();

        expect(scope.contacts).toEqual(stubContacts);
    });
});