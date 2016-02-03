describe('IP Delivery Controller', function () {
    var mockDeliveryService, scope, location, mockLoaderService, q, mockSystemSettingsService, mockFileUploadService,
        mockUserService, controller, mockAnswerService, timeout, mockIPService, mockContactService;
    var userHasPermissionToPromise, deferredPermissionsResultsPromise;

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
    var districts = {
        'data': ['wakiso']
    };
    var settings = {
        'notification_message': 'notification'
    };
    var adminPermissions = [
        // admin permissions
        "auth.can_view_self_contacts",
        "auth.can_view_contacts",
        "auth.can_create_contacts",
        "auth.can_edit_contacts",
        "auth.can_delete_contacts",
        // ip editor permissions
        "auth.can_view_distribution_plans",
        "auth.can_add_textanswer",
        "auth.change_textanswer",
        "auth.add_nimericanswer",
        "auth.change_nimericanswer"
    ];

    function initializeController(userService) {
        controller('IpDeliveryController', {
            $scope: scope,
            $timeout: timeout,
            DeliveryService: mockDeliveryService,
            LoaderService: mockLoaderService,
            UserService: userService || mockUserService,
            AnswerService: mockAnswerService,
            IPService: mockIPService,
            ContactService: mockContactService,
            SystemSettingsService: mockSystemSettingsService,
            FileUploadService: mockFileUploadService
        });
    }

    beforeEach(function () {
        module('IpDelivery');
        mockUserService = jasmine.createSpyObj('mockUserService', ['hasPermission', 'retrieveUserPermissions']);

        inject(function ($controller, $rootScope, $location, $q, $timeout, SystemSettingsService, FileUploadService,
                         LoaderService, UserService, AnswerService, DeliveryService, IPService, ContactService) {
            controller = $controller;
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;
            q = $q;
            mockLoaderService = LoaderService;
            mockAnswerService = AnswerService;
            mockDeliveryService = DeliveryService;
            mockIPService = IPService;
            mockContactService = ContactService;
            mockSystemSettingsService = SystemSettingsService;
            mockFileUploadService = FileUploadService;
            deferredPermissionsResultsPromise = $q.defer();
            userHasPermissionToPromise = $q.defer();

            spyOn(angular, 'element').and.callFake(jqueryFake);
            spyOn(mockModal, 'modal');
            spyOn(mockLoaderService, 'showLoader');
            spyOn(mockLoaderService, 'hideLoader');
            spyOn(mockLoaderService, 'showModal');
            spyOn(mockLoaderService, 'hideModal');
            spyOn(mockAnswerService, 'createWebAnswer');
            spyOn(mockDeliveryService, 'all');
            spyOn(mockDeliveryService, 'getDetail');
            spyOn(location, 'path');
            spyOn(mockIPService, 'loadAllDistricts');
            spyOn(mockSystemSettingsService, 'getSettings');
            spyOn(mockFileUploadService, 'getImages');

            mockDeliveryService.all.and.returnValue(q.when(deliveries));
            mockIPService.loadAllDistricts.and.returnValue(q.when(districts));
            mockSystemSettingsService.getSettings.and.returnValue(q.when(settings));
            mockUserService.hasPermission.and.returnValue(userHasPermissionToPromise.promise);
            mockUserService.retrieveUserPermissions.and.returnValue(deferredPermissionsResultsPromise.promise);
        });
    });

    describe('on load', function () {
        var deliveriesPromise;
        beforeEach(function () {
            deliveriesPromise = q.defer();
            deferredPermissionsResultsPromise.resolve(adminPermissions);
            userHasPermissionToPromise.resolve(true);
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
        beforeEach(function () {
            deferredPermissionsResultsPromise.resolve(adminPermissions);
            userHasPermissionToPromise.resolve(true);
        });

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
                    type: 'multipleChoice',
                    text: "Was delivery received?",
                    value: 'No',
                    options: ['Yes', 'No']
                }
            ];

            var uploads = {
                "images": [
                    {
                        "plan": 1,
                        "url": "photos/2016/01/12/mock-1.png"
                    },
                    {
                        "plan": 1,
                        "url": "photos/2016/01/12/mock-2.png"
                    }
                ]
            };

            mockDeliveryService.getDetail.and.returnValue(q.when(answers));
            mockFileUploadService.getImages.and.returnValue(q.when(uploads));
            initializeController();
            var delivery = {id: 1};
            scope.$apply();
            scope.confirm(delivery);
            scope.$apply();

            expect(mockLoaderService.showLoader.calls.count()).toBe(2);
            expect(mockLoaderService.hideLoader.calls.count()).toBe(2);
            expect(scope.activeDelivery).toBe(delivery);
            expect(mockDeliveryService.getDetail).toHaveBeenCalledWith(delivery, 'answers');
            expect(mockFileUploadService.getImages).toHaveBeenCalledWith(delivery.id);
            expect(scope.answers).toBe(answers);
            expect(scope.uploadedImages).toBe(uploads.images);
        });

        it('should set has received delivery based on the answer of delivery received', function () {
            mockAnswerService.createWebAnswer.and.returnValue(q.when({}));
            initializeController();
            scope.answers = [
                {
                    question_label: 'deliveryReceived',
                    type: 'multipleChoice',
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
                scope.contact = {id: 'sjyuan'};
                scope.selectedLocation = {id: 'Xian'};
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
                scope.contact = {id: 'sjyuan'};
                scope.selectedLocation = {id: 'Xian'};
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
                scope.contact = {id: 'sjyuan'};
                scope.selectedLocation = {id: 'Xian'};
                scope.activeDelivery = delivery;
                scope.answers = [
                    {
                        question_label: 'deliveryReceived',
                        type: 'multipleChoice',
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
                scope.contact = {id: 'sjyuan'};
                scope.selectedLocation = {id: 'Xian'};
                scope.answers = [
                    {
                        questionLabel: 'deliveryReceived',
                        type: 'multipleChoice',
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
        beforeEach(function () {
            deferredPermissionsResultsPromise.resolve(adminPermissions);
            userHasPermissionToPromise.resolve(true);
        });

        it('should not filter when fromDate and toDate is empty', function () {
            initializeController();
            scope.$apply();

            expect(mockDeliveryService.all.calls.count()).toEqual(1);
        });

        it('should filter by only fromDate when toDate is empty', function () {
            initializeController();
            scope.$apply();
            scope.fromDate = '2014-07-07';
            scope.$apply();
            timeout.flush();
            var callArgs = mockDeliveryService.all.calls.allArgs();
            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(callArgs[1]).toEqual([undefined, {from: '2014-07-07'}]);
        });

        it('should filter by only toDate when fromDate is empty', function () {
            initializeController();
            scope.$apply();
            scope.toDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            var callArgs = mockDeliveryService.all.calls.allArgs();
            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(callArgs[1]).toEqual([undefined, {to: '2014-07-07'}]);
        });

        it('should filter deliveries when date range is given', function () {
            initializeController();
            scope.$apply();
            scope.fromDate = '2014-05-07';
            scope.toDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            var callArgs = mockDeliveryService.all.calls.allArgs();
            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(callArgs[1]).toEqual([undefined, {from: '2014-05-07', to: '2014-07-07'}]);
        });

        it('should format dates before filtering deliveries ', function () {
            initializeController();
            scope.$apply();
            scope.fromDate = 'Sun Aug 30 2015 00:00:00 GMT+0200 (SAST)';
            scope.toDate = 'Thu Sep 10 2015 00:00:00 GMT+0200 (SAST)';
            scope.$apply();
            timeout.flush();

            var callArgs = mockDeliveryService.all.calls.allArgs();
            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(callArgs[1]).toEqual([undefined, {from: '2015-08-30', to: '2015-09-10'}]);
        });

        it('should filter deliveries when date range is given with additional query', function () {
            initializeController();
            scope.$apply();
            scope.query = 'wakiso programme';
            scope.fromDate = '2014-05-07';
            scope.toDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            var callArgs = mockDeliveryService.all.calls.allArgs();
            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(callArgs[1]).toEqual([undefined, {from: '2014-05-07', to: '2014-07-07', query: 'wakiso programme'}]);
        });

        it('should filter deliveries without date when toDate is given with additional query', function () {
            initializeController();
            scope.$apply();
            scope.query = 'wakiso programme';
            scope.toDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            var callArgs = mockDeliveryService.all.calls.allArgs();
            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(callArgs[1]).toEqual([undefined, {to: '2014-07-07', query: 'wakiso programme'}]);

        });

        it('should not filter deliveries when fromDate is given with additional query', function () {
            initializeController();
            scope.$apply();
            scope.query = 'wakiso programme';
            scope.fromDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            var callArgs = mockDeliveryService.all.calls.allArgs();
            expect(mockDeliveryService.all.calls.count()).toEqual(2);
            expect(callArgs[1]).toEqual([undefined, {from: '2014-07-07', query: 'wakiso programme'}]);
        });
    });
});
