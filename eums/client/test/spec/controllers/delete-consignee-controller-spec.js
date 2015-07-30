describe('Delete Consignee Controller', function () {
    var mockConsigneeService, scope, rootScope, deleteConsigneePromise, spy, toast;
    var consignee = {name: 'Dwelling Places'};
    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['del']);

        inject(function ($controller, $rootScope, $q, ngToast) {
            deleteConsigneePromise = $q.defer();
            mockConsigneeService.del.and.returnValue(deleteConsigneePromise.promise);
            rootScope = $rootScope;
            scope = rootScope.$new();
            toast = ngToast;

            spy = spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('DeleteConsigneeController', {
                $scope: scope,
                ConsigneeService: mockConsigneeService
            });
        });
    });

    afterEach(function () {
        spy.and.callThrough();
    });

    describe('when "deleteConsignee" event is fired', function () {
        it('should should show the delete consignee modal', function () {
            spyOn(fakeElement, 'modal');
            rootScope.$broadcast('deleteConsignee', consignee);
            scope.$apply();
            expect(fakeElement.modal).toHaveBeenCalled();
        });

        it('should put passed consignee on scope', function () {
            rootScope.$broadcast('deleteConsignee', consignee);
            scope.$apply();
            expect(scope.consignee).toEqual(consignee);
        });
    });

    describe('when delete is called', function () {
        it('should call delete on ConsigneeService', function () {
            scope.del(consignee);
            expect(mockConsigneeService.del).toHaveBeenCalledWith(consignee);
        });

        it('should fire consigneeDeleted event when delete is successful', function () {
            deleteConsigneePromise.resolve(consignee);
            spyOn(scope, '$emit');
            scope.del(consignee);
            scope.$apply();
            expect(scope.$emit).toHaveBeenCalledWith('consigneeDeleted', consignee);
        });

        it('should show error message on delete failure', function () {
            var result = {data: {detail: 'Some error message'}};
            spyOn(toast, 'create');
            deleteConsigneePromise.reject(result);
            scope.$apply();
            scope.del(consignee);
            scope.$apply();
            expect(toast.create).toHaveBeenCalledWith({
                content: result.data.detail, class: 'danger', maxNumber: 1, dismissOnTimeout: true
            });
        });

        it('should remove modal when delete is successful', function() {
            deleteConsigneePromise.resolve(consignee);
            spyOn(fakeElement, 'modal');
            scope.del(consignee);
            scope.$apply();
            expect(fakeElement.modal).toHaveBeenCalledWith('hide');
        });
    });
});