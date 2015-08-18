describe('IP Delivery Items Controller', function () {
    var mockDeliveryService, scope, location, mockLoaderService, q,
        mockDeliveryNodeService, controller, mockAnswerService;

    var nodeOne = {
        id: 1,
        location: 'Kampala',
        consignee: {id: 10},
        track: true,
        deliveryDate: '2015-01-02',
        remark: 'some remarks',
        item: 1
    };

    var nodeTwo = {
        id: 2,
        location: 'Kampala',
        consignee: {id: 10},
        track: true,
        deliveryDate: '2015-01-02',
        remark: 'some other remarks',
        item: 2
    };
    var deliveryNodes = [nodeOne, nodeTwo];

    var activeDelivery = {
        id: 1,
        location: 'Kampala',
        consignee: {id: 10},
        track: true,
        deliveryDate: '2015-01-02',
        remark: 'some remarks',
        totalValue: 6000,
        distributionplannodeSet: deliveryNodes
    };

    var firstNodeAnswers = [
        {
            question_label: 'itemReceived',
            type: 'multipleChoice',
            text: 'Was item received?',
            value: 'Yes',
            options: ['Yes'],
            position: 0
        }
    ];
    var secondNodeAnswers = [
        {
            question_label: 'additionalComments',
            type: 'text',
            text: 'Any additional comments?',
            value: 'Answer1',
            position: 1
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
            value: 'some remarks'
        }
    ];
    var nodeAnswers = [
        {
            id: 1, answers: firstNodeAnswers
        },
        {
            id: 2, answers: secondNodeAnswers
        }
    ];

    var combinedDeliveryNodes = [
        {
            id: 1,
            location: 'Kampala',
            consignee: {id: 10},
            track: true,
            deliveryDate: '2015-01-02',
            remark: 'some remarks',
            item: 1,
            answers: firstNodeAnswers
        },
        {
            id: 2,
            location: 'Kampala',
            consignee: {id: 10},
            track: true,
            deliveryDate: '2015-01-02',
            remark: 'some other remarks',
            item: 2,
            answers: secondNodeAnswers
        }];

    function initializeController() {
        controller('IpDeliveryItemsController', {
            $scope: scope,
            LoaderService: mockLoaderService,
            DeliveryService: mockDeliveryService,
            DeliveryNodeService: mockDeliveryNodeService,
            $routeParams: {activeDeliveryId: 1}
        });
    }

    beforeEach(function () {

        module('IpDeliveryItems');

        inject(function ($controller, $rootScope, $location, $q,
                         LoaderService, AnswerService, DeliveryService,
                         DeliveryNodeService) {
            controller = $controller;
            scope = $rootScope.$new();
            location = $location;
            q = $q;
            mockLoaderService = LoaderService;
            mockAnswerService = AnswerService;
            mockDeliveryService = DeliveryService;
            mockDeliveryNodeService = DeliveryNodeService;

            spyOn(mockLoaderService, 'showLoader');
            spyOn(mockLoaderService, 'hideLoader');
            spyOn(mockAnswerService, 'createWebAnswer');
            spyOn(mockDeliveryService, 'get');
            spyOn(mockDeliveryService, 'getDetail');
            spyOn(mockDeliveryNodeService, 'filter');
            spyOn(location, 'path');

        });
    });

    describe('on load', function () {

        beforeEach(function () {
            mockDeliveryService.get.and.returnValue(q.when(activeDelivery));
            mockDeliveryService.getDetail.and.returnValue(q.when(nodeAnswers));
            mockDeliveryNodeService.filter.and.returnValue(q.when(deliveryNodes));
        });

        it('should show loader while loading', function () {
            initializeController();
            scope.$apply();

            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.showLoader.calls.count()).toBe(1);
        });

        it('should call the delivery service and set the shipment date and total value in the scope', function () {
            initializeController();
            scope.$apply();

            expect(mockDeliveryService.get).toHaveBeenCalledWith(1);
            expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith({distribution_plan: 1}, ['item']);
            expect(scope.shipmentDate).toBe('2015-01-02');
            expect(scope.totalValue).toBe(6000);
        });

        it('should get all the answers for all nodes belonging to a delivery', function () {
            initializeController();
            scope.$apply();

            expect(mockDeliveryService.getDetail).toHaveBeenCalledWith(activeDelivery, 'node_answers');
        });

        it('should combine nodes and node answers belonging to a delivery', function () {
           initializeController();
            scope.$apply();

            expect(scope.combinedDeliveryNodes).toEqual(combinedDeliveryNodes);
        });

        it('should hide the loader after loading the data', function () {
            initializeController();
            scope.$apply();

            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader.calls.count()).toBe(1);
        })
    });

    describe('on save', function () {
        beforeEach(function () {
            mockDeliveryService.get.and.returnValue(q.when(activeDelivery));
            mockDeliveryService.getDetail.and.returnValue(q.when(nodeAnswers));
            mockDeliveryNodeService.filter.and.returnValue(q.when(deliveryNodes));
        });

        it('should show loader while saving', function () {
            initializeController();
            scope.$apply();
            scope.saveAnswers();
            scope.$apply();

            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.showLoader.calls.count()).toBe(2);
        });

        it('should call save web answers end points', function () {
            mockAnswerService.createWebAnswer.and.returnValue(q.when());
            initializeController();
            scope.$apply();

            scope.saveAnswers();
            scope.$apply();

            expect(mockAnswerService.createWebAnswer).toHaveBeenCalled();
            expect(mockAnswerService.createWebAnswer.calls.count()).toBe(2);
        });

        it('should navigate to the home page upon success', function () {
            mockAnswerService.createWebAnswer.and.returnValue(q.when());
            initializeController();
            scope.$apply();
            scope.saveAnswers();
            scope.$apply();

            expect(location.path).toHaveBeenCalledWith('/ip-deliveries');
        });

        it('should hide loader at the end', function () {
            mockAnswerService.createWebAnswer.and.returnValue(q.when());
            initializeController();
            scope.$apply();
            scope.saveAnswers();
            scope.$apply();

            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader.calls.count()).toBe(2);
        });

        describe('validations', function () {
            it('should set can save answer to false when a value is not set', function () {
                initializeController();
                scope.$apply();

                scope.combinedDeliveryNodes = [
                    {
                        id: 1, answers: [
                        {
                            question_label: 'itemReceived',
                            type: 'multipleChoice',
                            text: 'Was item received?',
                            value: '',
                            options: ['Yes'],
                            position: 0
                        }
                    ]
                    },
                    {
                        id: 2, answers: [
                        {
                            question_label: 'additionalComments',
                            type: 'text',
                            text: 'Any additional comments?',
                            value: '',
                            position: 1
                        }
                    ]}
                ];
                scope.$apply();

                expect(scope.areValidAnswers).toBe(false);
            });

            it('should set can save answer to false when numeric question has non positive answer', function(){
               initializeController();
                scope.$apply();
                scope.combinedDeliveryNodes = [
                    {
                        id: 1, answers: [
                        {
                            question_label: 'amountReceived',
                            type: 'numeric',
                            text: 'Amount received?',
                            value: -1,
                            options: [],
                            position: 0
                        }
                    ]
                    }
                ];
                scope.$apply();

                expect(scope.areValidAnswers).toBe(false);
            });

            it('should set can save answers to false when numeric is not a number', function () {
                initializeController();
                scope.$apply();

                scope.combinedDeliveryNodes = [
                    {
                        id: 1, answers: [
                        {
                            question_label: 'amountReceived',
                            type: 'numeric',
                            text: 'Amount received?',
                            value: 'not a number',
                            options: [],
                            position: 0
                        }
                    ]
                    }
                ];
                scope.$apply();

                expect(scope.areValidAnswers).toBe(false);
            });

            it('should set can save answers to false when value is empty', function () {
                initializeController();
                scope.$apply();

                scope.combinedDeliveryNodes = [
                    {
                        id: 1, answers: [
                        {
                            question_label: 'amountReceived',
                            type: 'numeric',
                            text: 'Amount received?',
                            value: '',
                            options: [],
                            position: 0
                        }
                    ]
                    }
                ];
                scope.$apply();

                expect(scope.areValidAnswers).toBe(false);
            });

            it('should set can save answer to true when numeric value is valid', function () {
                initializeController();
                scope.$apply();

                scope.combinedDeliveryNodes = [
                    {
                        id: 1, answers: [
                        {
                            question_label: 'amountReceived',
                            type: 'numeric',
                            text: 'Amount received?',
                            value: 2,
                            options: [],
                            position: 0
                        }
                    ]
                    }
                ];
                scope.$apply();

                expect(scope.areValidAnswers).toBe(true);
            });

            it('should set can save answer to true when all values are set', function () {
                initializeController();
                scope.$apply();

                scope.combinedDeliveryNodes = [
                    {
                        id: 1, answers: [
                        {
                            question_label: 'itemReceived',
                            type: 'multipleChoice',
                            text: 'Was item received?',
                            value: 'Yes',
                            options: ['Yes'],
                            position: 0
                        }
                    ]
                    },
                    {
                        id: 2, answers: [
                        {
                            question_label: 'additionalComments',
                            type: 'text',
                            text: 'Any additional comments?',
                            value: 'Remarks',
                            position: 1
                        },
                        {
                            question_label: 'quantityReceived',
                            type: 'numeric',
                            text: 'How many did you receive?',
                            value: 10,
                            position: 1
                        }
                    ]}
                ];
                scope.$apply();

                expect(scope.areValidAnswers).toBe(true);
            });

            it('should not validate remarks', function () {
                initializeController();
                scope.$apply();

                scope.combinedDeliveryNodes = [
                    {

                        id: 2, answers: [
                        {
                            question_label: 'additionalComments',
                            type: 'text',
                            text: 'Remarks' ,
                            value: '',
                            position: 1
                        }
                    ]}
                ];
                scope.$apply();

                expect(scope.areValidAnswers).toBe(true);
            });
        });
    });
});

