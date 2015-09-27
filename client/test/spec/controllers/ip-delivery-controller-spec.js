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

        inject(function ($controller, $rootScope, $location, $q,
                         LoaderService, UserService, AnswerService, DeliveryService) {
            controller = $controller;
            scope = $rootScope.$new();
            location = $location;
            q = $q;
            mockLoaderService = LoaderService;
            mockUserService = UserService;
            mockAnswerService = AnswerService;
            mockDeliveryService = DeliveryService;

            spyOn(angular, 'element').and.callFake(jqueryFake);

            spyOn(mockModal, 'modal');
            spyOn(mockLoaderService, 'showLoader');
            spyOn(mockLoaderService, 'hideLoader');
            spyOn(mockLoaderService, 'showModal');
            spyOn(mockLoaderService, 'hideModal');
            spyOn(mockUserService, 'retrieveUserPermissions');
            spyOn(mockAnswerService, 'createWebAnswer');
            spyOn(mockDeliveryService, 'all');
            spyOn(mockDeliveryService, 'getDetail');
            spyOn(location, 'path');

            mockDeliveryService.all.and.returnValue(q.when(deliveries));
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
        it('should set active delivery to undefined when initializing the controller', function () {
            initializeController();
            scope.$apply();

            expect(scope.activeDelivery).toBe(undefined);
            expect(scope.answers).toEqual([]);
        });

        it('should load answers when click on confirm', function () {
            var answers = [
                {
                    questionLabel: 'deliveryReceived',
                    type:'multipleChoice',
                    text: "Was delivery received?",
                    value: 'No',
                    options: ['Yes', 'No']
                }
            ];

            mockDeliveryService.getDetail.and.returnValue(q.when(answers));
            initializeController();
            var delivery = {id: 1};
            scope.confirm(delivery);
            scope.$apply();

            expect(mockLoaderService.showLoader.calls.count()).toBe(2);
            expect(mockLoaderService.hideLoader.calls.count()).toBe(2);
            expect(scope.activeDelivery).toBe(delivery);
            expect(mockDeliveryService.getDetail).toHaveBeenCalledWith(delivery, 'answers');
            expect(scope.answers).toBe(answers);
        });

        it('should set has received delivery based on the answer of delivery received', function(){
            mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
            initializeController();
            scope.answers = [
                {
                    question_label: 'deliveryReceived',
                    type:'multipleChoice',
                    text: "Was delivery received?",
                    value: 'No',
                    options: ['Yes', 'No']
                }
            ];
            scope.$apply();

            expect(scope.hasReceivedDelivery).toBe(false);

            scope.answers.first().value = 'Yes';
            scope.$apply();

            expect(scope.hasReceivedDelivery).toBe(true);
        });

        describe('on save answers', function () {
            var answersPromise;
            beforeEach(function () {
                answersPromise = q.defer();

            });

            it('should show loader', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when());
                scope.answers = [{questionLabel: 'deliveryReceived', value: 'Yes'}];
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.saveAnswers();
                scope.$apply();

                expect(mockLoaderService.showLoader).toHaveBeenCalled();
            });

            it('should call create answer service', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                var delivery = {id: 1};
                scope.activeDelivery = delivery;
                var answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Yes',
                        options: ['Yes', 'No']
                    },
                    {
                        question_label: 'dateOfReceipt',
                        type: 'text',
                        text: "When was delivery received?",
                        value: '2014-12-12'
                    }

                ];
                scope.answers = answers;

                scope.saveAnswers();
                scope.$apply();

                expect(mockAnswerService.createWebAnswer).toHaveBeenCalledWith(delivery, answers)
            });

            it('should call create answer service with only the first answer when delivery is not received', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                var delivery = {id: 1};
                scope.activeDelivery = delivery;
                var answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
                        text: "Was delivery received?",
                        value: 'No',
                        options: ['Yes', 'No']
                    },
                    {
                        question_label: 'dateOfReceipt',
                        type: 'text',
                        text: "When was delivery received?",
                        value: '2014-12-12'
                    }

                ];
                scope.answers = answers;

                scope.saveAnswers();
                scope.$apply();

                expect(mockAnswerService.createWebAnswer).toHaveBeenCalledWith(delivery, [answers.first()])
            });

            it('should set is valid choice to false when value is not valid', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Select item',
                        options: ['Yes', 'No']
                    }
                ];

                scope.$apply();

                expect(scope.isValidChoice).toBe(false);
            });

            it('should set is valid choice to true when value is valid', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Yes',
                        options: ['Yes', 'No']
                    }
                ];

                scope.$apply();

                expect(scope.isValidChoice).toBe(true);
            });

            it('should set is valid choice to false when value is invalid when shipment was received', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Yes',
                        options: ['Yes', 'No']
                    },
                    {
                        question_label: 'dateOfReceipt',
                        type: 'text',
                        text: "Was delivery received?",
                        value: ''
                    }
                ];

                scope.$apply();

                expect(scope.isValidChoice).toBe(false);
            });

            it('should set is valid choice to true when value is valid but no other fields', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
                        text: "Was delivery received?",
                        value: 'No',
                        options: ['Yes', 'No']
                    },
                    {
                        question_label: 'dateOfReceipt',
                        type: 'text',
                        text: "Was delivery received?",
                        value: ''
                    }
                ];

                scope.$apply();

                expect(scope.isValidChoice).toBe(true);
            });

            it('should set is valid choice to true when value is valid but no remarks', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                scope.activeDelivery = {id: 1};
                scope.answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Yes',
                        options: ['Yes', 'No']
                    },
                    {
                        question_label: 'dateOfReceipt',
                        type: 'text',
                        text: "Was delivery received?",
                        value: 'valid field'
                    },
                    {
                        question_label: 'additionalDeliveryComments',
                        type: 'text',
                        text: "Was delivery received?",
                        value: ''
                    }
                ];

                scope.$apply();

                expect(scope.isValidChoice).toBe(true);
            });

            it('should navigate to delivery items page upon successful save and  delivery is received', function () {
                mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
                initializeController();
                var delivery = {id: 1};
                scope.activeDelivery = delivery;
                scope.answers = [
                    {
                        question_label: 'deliveryReceived',
                        type:'multipleChoice',
                        text: "Was delivery received?",
                        value: 'Yes',
                        options: ['Yes', 'No']
                    }
                ];

                scope.saveAnswers();
                scope.$apply();

                expect(location.path).toHaveBeenCalledWith('/items-delivered-to-ip/' + delivery.id);
            });

            it('should load deliveries upon successful save and delivery is NOT received', function () {
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
                expect(mockDeliveryService.all.calls.count()).toBe(2);
                expect(scope.activeDelivery).toBe(undefined);
                expect(scope.answers).toEqual([])
            });
        });
    });

    describe('on filter by date range', function () {
        it('should not filter when fromDate and toDate is empty', function () {
            initializeController();
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(1);
        });

        it('should not filter when toDate is empty', function () {
            initializeController();
            scope.fromDate = '2014-07-07';
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(1);
        });

        it('should not filter when fromDate is empty', function () {
            initializeController();
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(1);
        });

        it('should filter deliveries when date range is given', function () {
            initializeController();
            scope.fromDate = '2014-05-07';
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(mockDeliveryService.all).toHaveBeenCalledWith(undefined, {from: '2014-05-07', to: '2014-07-07'});
        });

        it('should format dates before filtering deliveries ', function () {
            initializeController();
            scope.fromDate = 'Sun Aug 30 2015 00:00:00 GMT+0200 (SAST)';
            scope.toDate = 'Thu Sep 10 2015 00:00:00 GMT+0200 (SAST)';
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(mockDeliveryService.all).toHaveBeenCalledWith(undefined, {from: '2015-08-30', to: '2015-09-10'});
        });

        it('should filter deliveries when date range is given with additional query', function () {
            initializeController();
            scope.query = 'wakiso programme';
            scope.fromDate = '2014-05-07';
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(mockDeliveryService.all).toHaveBeenCalledWith(undefined, {from: '2014-05-07', to: '2014-07-07', query: 'wakiso programme'})
        });

        it('should filter deliveries without date when fromDate is not given with additional query', function () {
            initializeController();
            scope.query = 'wakiso programme';
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(mockDeliveryService.all).toHaveBeenCalledWith(undefined, {query: 'wakiso programme'})
        });

        it('should not filter deliveries when toDate is not given with additional query', function () {
            initializeController();
            scope.query = 'wakiso programme';
            scope.fromDate = '2014-07-07';
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(mockDeliveryService.all).toHaveBeenCalledWith(undefined, {query: 'wakiso programme'})
        });
    });
});
