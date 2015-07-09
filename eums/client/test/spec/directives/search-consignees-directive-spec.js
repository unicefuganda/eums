describe('Search Consignee Directive', function () {
    var scope, element, stubIp, stubIpList, mockConsigneeService, deferredStubIps;

    stubIp = {
        id: 1,
        name: 'Save the Children'
    };

    stubIpList = [stubIp,
        {
            id: 2,
            name: 'Malaria Consortium'
        }
    ];

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['filterByType', 'getByTopLevelNode']);

        inject(function ($rootScope, $compile, $q) {
            deferredStubIps = $q.defer();
            mockConsigneeService.filterByType.and.returnValue(deferredStubIps.promise);
            mockConsigneeService.getConsigneebyType.and.returnValue(stubIpList);

            scope = $rootScope.$new();
            scope.ips = stubIpList;
            scope.selectedIpId = undefined;

            element = '<input id="select-ip" class="form-control" type="hidden" search-consignees ng-model="selectedIPId">';

            element = $compile(element)(scope);
            scope.$digest();
        });

        it('should initialize with the first IP in the list', function () {
            deferredStubIps.resolve(stubIpList);

            scope.$apply();
            expect(mockConsigneeService.filterByType).toHaveBeenCalledWith('implementing_partner');
            expect(mockConsigneeService.getTopLevelConsignees).toHaveBeenCalled();
        });

        it('should Invoke getByTopLevelNode', function () {
            scope.$apply();
            expect(mockConsigneeService.getTopLevelConsignees).toHaveBeenCalled();
        });
    });
});