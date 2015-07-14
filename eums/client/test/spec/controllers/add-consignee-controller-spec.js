describe('Add Consignee Controller', function () {
    var mockConsigneeService, scope, rootScope, addConsigneePromise, spy, toast, ConsigneeModel;
    var consignee = {name: 'Dwelling Places'};
    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['create']);

        inject(function ($controller, $rootScope, $q, ngToast, Consignee) {
            addConsigneePromise = $q.defer();
            mockConsigneeService.create.and.returnValue(addConsigneePromise.promise);
            rootScope = $rootScope;
            scope = rootScope.$new();
            toast = ngToast;
            ConsigneeModel = Consignee;

            spy = spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('AddConsigneeController', {
                $scope: scope,
                ConsigneeService: mockConsigneeService
            });
        });
    });

    afterEach(function () {
        spy.and.callThrough();
    });

    describe('when "add-consignee" event is fired', function () {
        it('should should show the add consignee modal', function () {
            spyOn(fakeElement, 'modal');
            rootScope.$broadcast('add-consignee');
            scope.$apply();
            expect(fakeElement.modal).toHaveBeenCalled();
        });

        it('should put an instance of Consignee on scope', function () {
            consignee = new ConsigneeModel();
            rootScope.$broadcast('add-consignee');
            scope.$apply();
            expect(JSON.stringify(scope.consignee)).toEqual(JSON.stringify(consignee));
        });

        it('should put passed object and object index on scope. For use when broadcasting "consignee-saved" event', function () {
            var obj = {};
            var objIndex = 1;
            rootScope.$broadcast('add-consignee', obj, objIndex);
            scope.$apply();
            expect(scope.object).toEqual(obj);
            expect(scope.objectIndex).toEqual(objIndex);
        });
    });

    describe('when save is called', function () {
        it('should call create on ConsigneeService', function () {
            scope.save(consignee);
            expect(mockConsigneeService.create).toHaveBeenCalledWith(consignee);
        });

        it('should fire consignee-saved event when save is successful', function () {
            var object = {};
            var objectIndex = 1;
            addConsigneePromise.resolve(consignee);
            scope.object = object;
            scope.objectIndex = objectIndex;
            spyOn(scope, '$emit');
            scope.save(consignee);
            scope.$apply();
            expect(scope.$emit).toHaveBeenCalledWith('consignee-saved', consignee, object, objectIndex);
        });

        it('should show error message on save failure', function () {
            var reason = 'Some error message';
            spyOn(toast, 'create');
            addConsigneePromise.reject({data: {error: reason}});
            scope.$apply();
            scope.save(consignee);
            scope.$apply();
            expect(toast.create).toHaveBeenCalledWith({content: reason, class: 'danger'});
        });

        it('should remove modal when save is successful', function () {
            addConsigneePromise.resolve(consignee);
            spyOn(fakeElement, 'modal');
            scope.save(consignee);
            scope.$apply();
            expect(fakeElement.modal).toHaveBeenCalledWith('hide');
        });
    });
});