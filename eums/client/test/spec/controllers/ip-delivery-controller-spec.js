describe('IP Delivery Controller', function () {
    var mockDeliveryService, scope, location, mockLoaderService, q,
        mockUserService, controller, mockAnswerService;

    var firstDelivery = {
        id: 1,
        location: 'Kampala',
        consignee: {id: 10},
        track: true,
        delivery_date: '2015-01-02',
        remark: 'some remarks'
    };
    var secondDelivery = {
        id: 2,
        location: 'Khartoum',
        consignee: {id: 2},
        track: true,
        delivery_date: '2015-03-15',
        remark: 'no remarks'
    };
    var ipEditorPermissions = [
        "auth.can_view_distribution_plans",
        "auth.can_add_textanswer",
        "auth.change_textanswer",
        "auth.add_nimericanswer",
        "auth.change_nimericanswer"
    ];
    var ipViewerPermissions = ["auth.can_view_distribution_plans"];
    var deliveries = [firstDelivery, secondDelivery];
    var emptyFunction = function () {
    };
    var mockModal = {modal: emptyFunction, hasClass: emptyFunction, removeClass: emptyFunction, remove: emptyFunction};
    var viewDeliveryModal = {
        modal: emptyFunction,
        hasClass: emptyFunction,
        removeClass: emptyFunction,
        remove: emptyFunction
    };
    var jqueryFake = function (selector) {
        if (selector === '#confirmation-modal') return mockModal;
        else if (selector === '#view-delivery-modal') return viewDeliveryModal;
        else return mockLoaderService;
    };

    function initializeController(userService) {
        controller('IpDeliveryController', {
            $scope: scope,
            DeliveryService: mockDeliveryService,
            LoaderService: mockLoaderService,
            UserService: userService || mockUserService,
            AnswerService: mockAnswerService
        });
    }

    beforeEach(function () {

        module('IpDelivery');

        mockDeliveryService = jasmine.createSpyObj('mockDeliveryService', ['all']);

        inject(function ($controller, $rootScope, $location, $q,
                         LoaderService, UserService, AnswerService) {
            controller = $controller;
            scope = $rootScope.$new();
            location = $location;
            q = $q;
            mockLoaderService = LoaderService;
            mockUserService = UserService;
            mockAnswerService = AnswerService;

            mockDeliveryService.all.and.returnValue(q.when(deliveries));

            spyOn(angular, 'element').and.callFake(jqueryFake);
            spyOn(mockModal, 'modal');
            spyOn(mockLoaderService, 'showLoader');
            spyOn(mockLoaderService, 'hideLoader');
            spyOn(mockUserService, 'retrieveUserPermissions');
            spyOn(mockAnswerService, 'createWebAnswer');
            spyOn(location, 'path');

            mockUserService.retrieveUserPermissions.and.returnValue(q.when(ipEditorPermissions));
        });
    });

    describe('on load', function () {
        var deliveriesPromise;
        beforeEach(function () {
            deliveriesPromise = q.defer();
        });

        it('should show loader while loading', function () {
            initializeController();
            scope.$apply();

            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.showLoader.calls.count()).toBe(1);
        });

        it('should call delivery service and put deliveries on the scope', function () {
            initializeController();
            deliveriesPromise.resolve(deliveries);
            scope.$apply();

            expect(mockDeliveryService.all).toHaveBeenCalled();
            expect(scope.deliveries).toBe(deliveries);
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader.calls.count()).toBe(1);
        });

        it('should set can confirm permission to true for IP_Editor', function () {
            initializeController();
            scope.$apply();

            expect(mockUserService.retrieveUserPermissions).toHaveBeenCalled();
            expect(scope.canConfirm).toBe(true);
        });

        it('should set can confirm permission to false for IP_viewer', function () {
            mockUserService.retrieveUserPermissions.and.returnValue(q.when(ipViewerPermissions));
            initializeController(mockUserService);
            scope.$apply();

            expect(mockUserService.retrieveUserPermissions).toHaveBeenCalled();
            expect(scope.canConfirm).toBe(false);
        });
    });

    describe('on confirm', function () {
        it('should set is confirming delivery to false when initializing the controller', function () {
            initializeController();
            scope.$apply();

            expect(scope.isConfirmingDelivery).toBe(false);
        });

        it('should set is confirming delivery to true when click on confirm', function () {
            initializeController();
            scope.confirm();
            scope.$apply();

            expect(scope.isConfirmingDelivery).toBe(true);
        });

        describe('on save answers', function () {
            var answersPromise;
            beforeEach(function () {
                answersPromise = q.defer();

            });

            it('should show loader', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when());
                scope.activeDelivery = {id: 1};
                scope.answers = [{questionLabel: 'deliveryReceived', value: 'Yes'}];
                initializeController();
                scope.saveAnswers();
                scope.$apply();

                expect(mockLoaderService.showLoader).toHaveBeenCalled();
            });

            it('should call create answer service', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        questionLabel: 'deliveryReceived',
                        type:'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Yes',
                        options: ['Yes', 'No']
                    },
                    {
                        questionLabel: 'dateOfReceipt',
                        type:'text',
                        text: "When was delivery received?",
                        value: '2014-12-12'
                    }

                ];

                scope.saveAnswers();
                scope.$apply();

                expect(mockAnswerService.createWebAnswer).toHaveBeenCalledWith(scope.activeDelivery, scope.answers)
            });

            it('should navigate to delivery items page upon successful save and  delivery is received', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        questionLabel: 'deliveryReceived',
                        type:'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Yes',
                        options: ['Yes', 'No']
                    }
                ];

                scope.saveAnswers();
                scope.$apply();

                expect(location.path).toHaveBeenCalledWith('/ip-delivery-items/' + scope.activeDelivery.id);
            });

            it('should not navigate to delivery items page upon successful save and delivery is NOT received', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        questionLabel: 'deliveryReceived',
                        type:'multipleChoice',
                        text: "Was delivery received?",
                        value: 'No',
                        options: ['Yes', 'No']
                    }
                ];

                scope.saveAnswers();
                scope.$apply();

                expect(location.path).not.toHaveBeenCalled();

            })
        });
    })
});
