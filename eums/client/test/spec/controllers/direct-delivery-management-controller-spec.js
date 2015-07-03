describe('DirectDeliveryController', function () {

    beforeEach(module('DirectDeliveryManagement'));
    var mockNodeService, mockIPService, mockPlanService, mockPurchaseOrderItemService,
        mockConsigneeService, mockPurchaseOrderService, mockUserService, mockItemService;
    var deferred, deferredPlan, deferredDistrictPromise, deferredTopLevelNodes,
        deferredPlanNode, deferredPurchaseOrder, deferredNode, deferredUserPromise, deferredItemPromise;
    var scope, q, mockToastProvider, location;

    var orderNumber = '00001';
    var plainDistricts = ['Abim', 'Gulu'];

    var purchaseOrders = [
        {
            id: 1,
            'programme': {
                id: 3,
                name: 'Alive'
            },
            'orderNumber': orderNumber,
            'date': '2014-10-05',
            'purchaseorderitemSet': [{
                id: 1,
                item: {
                    id: 1,
                    description: 'Test Item',
                    materialCode: '12345AS',
                    value: '100.00',
                    unit: {
                        name: 'EA'
                    }
                },
                quantity: 100,
                quantityLeft: 100
            }]
        },
        {
            id: 2,
            'programme': {
                id: 4,
                name: 'Alive'
            },
            'orderNumber': '22221',
            'date': '2014-10-05',
            'purchaseorderitemSet': [{id: 3}, {id: 4}]
        }
    ];

    var stubUser = {
        username: 'admin',
        first_name: 'admin',
        last_name: 'admin',
        email: 'a@a.com',
        consignee_id: null
    };

    var stubIPUser = {
        username: 'ip',
        first_name: 'ip',
        last_name: 'ip',
        email: 'ip@ip.com',
        consignee_id: 1
    };

    var stubPurchaseOrderItem = {
        id: 1,
        purchase_order: '1',
        information: {
            id: 1,
            item: {
                id: 1,
                description: 'Test Item',
                materialCode: '12345AS',
                value: '100.00',
                unit: {
                    name: 'EA'
                }
            },
            quantity: 100,
            quantityLeft: 100
        },
        quantity: 100,
        date: '2014-10-02',
        distributionplannodeSet: [1, 2]
    };

    var stubPurchaseOrderItemNoDistributionPlanNodes = {
        id: 1,
        purchase_order: '1',
        information: {
            item: {
                id: 1,
                description: 'Test Item',
                material_code: '12345AS',
                value: '100.00',
                unit: {
                    name: 'EA'
                }
            }
        },
        quantity: '100',
        date: '2014-10-02',
        distributionplannode_set: []
    };

    var expectedFormattedPurchaseOrderItem = {
        display: stubPurchaseOrderItem.information.item.description,
        materialCode: stubPurchaseOrderItem.information.item.materialCode,
        quantity: stubPurchaseOrderItem.quantity,
        unit: stubPurchaseOrderItem.information.item.unit.name,
        information: stubPurchaseOrderItem.information,
        value: stubPurchaseOrderItem.value
    };

    var setUp = function (routeParams) {
        mockPlanService = jasmine.createSpyObj('mockPlanService', ['fetchPlans', 'getPlanDetails', 'all', 'createPlan', 'updatePlanTracking']);
        mockNodeService = jasmine.createSpyObj('mockNodeService', ['getPlanNodeDetails', 'create', 'update']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['get', 'all']);
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['get']);
        mockPurchaseOrderItemService = jasmine.createSpyObj('mockPurchaseOrderItemService', ['get', 'getTopLevelDistributionPlanNodes']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['getCurrentUser']);
        mockItemService = jasmine.createSpyObj('mockItemService', ['get']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        inject(function ($controller, $rootScope, $q, $location) {
            q = $q;
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredDistrictPromise = $q.defer();
            deferredPlanNode = $q.defer();
            deferredNode = $q.defer();
            deferredTopLevelNodes = $q.defer();
            deferredPurchaseOrder = $q.defer();
            deferredUserPromise = $q.defer();
            deferredItemPromise = $q.defer();
            mockPlanService.updatePlanTracking.and.returnValue(deferredPlan.promise);
            mockNodeService.getPlanNodeDetails.and.returnValue(deferredPlanNode.promise);
            mockNodeService.create.and.returnValue(deferredPlanNode.promise);
            mockConsigneeService.get.and.returnValue(deferred.promise);
            mockConsigneeService.all.and.returnValue(deferred.promise);
            mockPurchaseOrderService.get.and.returnValue(deferredPurchaseOrder.promise);
            mockPurchaseOrderItemService.get.and.returnValue(deferred.promise);
            mockPurchaseOrderItemService.getTopLevelDistributionPlanNodes.and.returnValue(deferredTopLevelNodes.promise);
            mockIPService.loadAllDistricts.and.returnValue(deferredDistrictPromise.promise);
            mockUserService.getCurrentUser.and.returnValue(deferredUserPromise.promise);
            mockItemService.get.and.returnValue(deferredItemPromise.promise);


            //TOFIX: dirty fix for element has been spied on already for setup being called again - showcase was impending
            if (!routeParams.distributionPlanNodeId) {
                spyOn(angular, 'element').and.callFake(function () {
                    return {
                        modal: jasmine.createSpy('modal').and.callFake(function (status) {
                            return status;
                        }),
                        hasClass: jasmine.createSpy('hasClass').and.callFake(function (status) {
                            return status;
                        }),
                        removeClass: jasmine.createSpy('removeClass').and.callFake(function (status) {
                            return status;
                        })
                    };
                });
            }

            location = $location;
            scope = $rootScope.$new();

            $controller('DirectDeliveryManagementController',
                {
                    $scope: scope,
                    $location: location,
                    $q: q,
                    $routeParams: routeParams,
                    PurchaseOrderItemService: mockPurchaseOrderItemService,
                    DistributionPlanService: mockPlanService,
                    DistributionPlanNodeService: mockNodeService,
                    ConsigneeService: mockConsigneeService,
                    PurchaseOrderService: mockPurchaseOrderService,
                    IPService: mockIPService,
                    UserService: mockUserService,
                    ItemService: mockItemService,
                    ngToast: mockToastProvider
                });
        });
    };

    beforeEach(function () {
        setUp({purchaseOrderId: 1});
    });

    describe('adding a contact', function () {
        describe('with invalid fields', function () {
            it('should be invalid when no number is supplied', function () {
                scope.contact = {
                    firstName: 'Dude',
                    lastName: 'Awesome',
                    phone: ''
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });

            it('should be invalid when no first name is supplied', function () {
                scope.contact = {
                    firstName: '',
                    lastName: 'Awesome',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });

            it('should be invalid when no last name is supplied', function () {
                scope.contact = {
                    firstName: 'Dudette',
                    lastName: '',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });
        });

        describe('with valid fields', function () {
            it('should be valid when full name and phone number are supplied', function () {
                scope.contact = {
                    firstName: 'Dudette',
                    lastName: 'Awesome',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeFalsy();
            });
        });
    });

    describe('when distributionPlanNodes list on scope changes, ', function () {
        it('the selected purchase order item quantityLeft attribute should be updated', function () {
            scope.invalidNodes = false;
            scope.totalQuantity = 100;
            scope.selectedPurchaseOrderItem = {quantity: 100, information: stubPurchaseOrderItem};
            scope.$apply();

            scope.distributionPlanNodes.push({targetedQuantity: 50});
            scope.$apply();
            expect(scope.quantityLeft).toBe(50);

            scope.distributionPlanNodes[0].targetedQuantity = 25;
            scope.$apply();
            expect(scope.quantityLeft).toBe(75);

        });

        describe('disabling save with invalidNodes field', function () {
            var invalidNode;
            var validNode = {
                item: 1,
                plannedDistributionDate: '2014-11-31',
                targetedQuantity: 42,
                consignee: 4,
                location: 'Adjumani',
                contactPerson: '5444d433ec8e8257ae48dc73',
                remark: '',
                track: true,
                isEndUser: false
            };

            beforeEach(function () {
                scope.selectedPurchaseOrderItem = {
                    quantity: 100,
                    information: {id: 1}
                };
                scope.distributionPlanNodes = [];
                scope.$apply();
            });

            it('sets the invalidNodes field to false when there are no invalid nodes', function () {
                scope.invalidNodes = false;
                scope.quantityLeft = 100;
                scope.totalQuantity = 100;
                scope.distributionPlanNodes.push(validNode);
                scope.$apply();

                expect(scope.invalidNodes).toBeFalsy();
            });

            it('sets the invalidNodes field to true when there are nodes with invalid target Quantities', function () {
                invalidNode = angular.copy(validNode);
                invalidNode.targetedQuantity = -1;
                scope.distributionPlanNodes.push(invalidNode);
                scope.$apply();

                expect(scope.invalidNodes).toBeTruthy();
            });

            it('sets the invalidNodes field to true when there are nodes with no consignee', function () {
                invalidNode = angular.copy(validNode);
                delete invalidNode.consignee;
                scope.distributionPlanNodes.push(invalidNode);
                scope.$apply();

                expect(scope.invalidNodes).toBeTruthy();
            });

            it('sets the invalidNodes field to true when there are nodes with no destinationLocation', function () {
                invalidNode = angular.copy(validNode);
                invalidNode.destinationLocation = '';
                scope.distributionPlanNodes.push(invalidNode);
                scope.$apply();

                expect(scope.invalidNodes).toBeTruthy();
            });

            it('sets the invalidNodes field to true when there are nodes with no contactPerson', function () {
                invalidNode = angular.copy(validNode);
                invalidNode.contactPerson = '';
                scope.distributionPlanNodes.push(invalidNode);
                scope.$apply();

                expect(scope.invalidNodes).toBeTruthy();
            });

            it('sets the invalidNodes field to true when there are nodes with no plannedDistributionDate', function () {
                invalidNode = angular.copy(validNode);
                invalidNode.plannedDistributionDate = '';
                scope.distributionPlanNodes.push(invalidNode);
                scope.$apply();

                expect(scope.invalidNodes).toBeTruthy();
            });

            it('sets the invalidNodes field to true when the quantity left of salesitems is less than 0', function () {
                invalidNode = angular.copy(validNode);
                invalidNode.targetedQuantity = 101;
                scope.distributionPlanNodes.push(invalidNode);
                scope.$apply();

                expect(scope.invalidNodes).toBeTruthy();
            });
        });
    });

    describe('when the controller is initialized', function () {
        beforeEach(function () {
            deferredDistrictPromise.resolve({data: plainDistricts});
        });

        it('should have the distributionPlanNodes defaulted to an empty list', function () {
            expect(scope.distributionPlanNodes).toEqual([]);
        });

        it('should set districts in the scope variable', function () {
            var expectedDistricts = [
                {id: 'Abim', name: 'Abim'},
                {id: 'Gulu', name: 'Gulu'}
            ];
            scope.$apply();

            expect(scope.districts).toEqual(expectedDistricts);
        });

        it('should have the selected purchase orders in the scope', function () {
            deferredPurchaseOrder.resolve(purchaseOrders[0]);
            scope.$apply();

            expect(scope.selectedPurchaseOrder).toEqual(purchaseOrders[0]);
        });

        it('should have the default selected purchase orders item undefined in the scope', function () {
            scope.$apply();

            expect(scope.selectedPurchaseOrderItem).toBeUndefined();
        });

        it('should format the selected purchase order appropriately for the view', function () {
            var stubItem = {
                id: 1,
                description: 'Test Item',
                materialCode: '12345AS',
                value: '100.00',
                unit: {
                    name: 'EA'
                }
            };

            deferredPurchaseOrder.resolve(purchaseOrders[0]);
            deferredItemPromise.resolve(stubItem);
            scope.$apply();

            expect(scope.purchaseOrderItems).toEqual([expectedFormattedPurchaseOrderItem]);
        });

    });

    describe('when purchase order item selected changes, ', function () {

        it('should set the selected purchase order to the scope when purchase order item is selected', function () {
            scope.selectedPurchaseOrderItem = expectedFormattedPurchaseOrderItem;
            scope.$apply();
            expect(scope.selectedPurchaseOrderItem).toEqual(expectedFormattedPurchaseOrderItem);
        });

        xit('should put a distribution plan on the scope if purchase order item has associated distribution plan nodes', function () {
            deferred.resolve({distribution_plan_node: 1});
            scope.selectedPurchaseOrderItem = {information: {distributionplannode_set: ['1']}};
            scope.$apply();

            expect(scope.distributionPlan).toEqual({id: 1, programme: 1});
        });

        it('should get distribution plan nodes for nodes if nodes exist', function () {
            setUp({purchaseOrderId: 1, distributionPlanNodeId: 1});

            deferred.resolve({distribution_plan_node: 1});
            scope.selectedPurchaseOrderItem = {information: {distributionplannode_set: ['1']}};
            scope.$apply();
            expect(mockNodeService.getPlanNodeDetails).toHaveBeenCalledWith(1);
        });

        it('should put a distribution plan on the scope if distribution plan node exists', function () {
            setUp({purchaseOrderId: 1, distributionPlanNodeId: 1});

            deferredUserPromise.resolve(stubUser);
            deferredNode.resolve({});
            deferredPlanNode.resolve({distributionPlan: 2, distributionplannode_set: [1]});
            scope.$apply();

            expect(scope.distributionPlan).toEqual(2);
        });

        it('should put a distribution plan on the scope if distribution plan node exists', function () {
            setUp({purchaseOrderId: 1, distributionPlanNodeId: 1});

            deferredUserPromise.resolve(stubUser);
            deferredNode.resolve({});
            deferredPlanNode.resolve({distributionPlan: 2, distributionplannode_set: [1]});
            scope.$apply();

            expect(scope.distributionPlan).toEqual(2);
        });

        it('should call the get distribution plan node service linked to the particular purchase order item', function () {
            deferredUserPromise.resolve(stubUser);
            scope.$apply();

            deferredPlanNode.resolve({
                consignee: {
                    name: 'Save the Children'
                },
                location: 'Kampala',
                contact_person: {_id: 1}
            });

            var stubNode = {id: 1};
            var stubNode2 = {id: 2};
            deferred.resolve(stubPurchaseOrderItem);
            deferredTopLevelNodes.resolve([stubNode, stubNode2]);
            deferredNode.resolve(stubNode);

            scope.selectedPurchaseOrderItem = {
                display: stubPurchaseOrderItem.information.item.description,
                materialCode: stubPurchaseOrderItem.information.item.materialCode, quantity: stubPurchaseOrderItem.quantity,
                unit: stubPurchaseOrderItem.information.item.unit.name, information: stubPurchaseOrderItem
            };
            scope.selectPurchaseOrderItem();
            scope.$apply();

            expect(mockPurchaseOrderItemService.getTopLevelDistributionPlanNodes).toHaveBeenCalledWith(stubPurchaseOrderItem);
        });

        it('should put the distribution plan nodes linked to the particular purchase order item on the scope', function () {
            deferredUserPromise.resolve(stubUser);
            scope.$apply();

            deferredPlanNode.resolve({
                consignee: {
                    name: 'Save the Children'
                },
                location: 'Kampala',
                contact_person: {_id: 1}
            });
            var stubNode = {id: 1};
            var stubNode2 = {id: 2};
            deferred.resolve(stubPurchaseOrderItem);
            deferredNode.resolve(stubNode);
            deferredTopLevelNodes.resolve([stubNode, stubNode2]);

            scope.selectedPurchaseOrderItem = {
                display: stubPurchaseOrderItem.information.item.description,
                materialCode: stubPurchaseOrderItem.information.item.material_code,
                quantity: stubPurchaseOrderItem.quantity,
                unit: stubPurchaseOrderItem.information.item.unit.name,
                information: stubPurchaseOrderItem
            };
            scope.selectPurchaseOrderItem();
            scope.$apply();

            expect(scope.distributionPlanNodes).toEqual([stubNode, stubNode2]);
        });

        it('should not get distribution plan nodes if there are no ui nodes', function () {

            scope.selectedPurchaseOrderItem = {
                display: stubPurchaseOrderItemNoDistributionPlanNodes.information.item.description,
                material_code: stubPurchaseOrderItemNoDistributionPlanNodes.information.item.material_code,
                quantity: stubPurchaseOrderItemNoDistributionPlanNodes.quantity,
                unit: stubPurchaseOrderItemNoDistributionPlanNodes.information.item.unit.name,
                information: stubPurchaseOrderItemNoDistributionPlanNodes
            };
            scope.$apply();

            expect(scope.distributionPlanNodes).toEqual([]);
        });

        it('should not get distribution plan nodes service linked to the particular purchase order item with undefined line item set', function () {

            scope.selectedPurchaseOrderItem = {
                display: stubPurchaseOrderItem.information.item.description,
                material_code: stubPurchaseOrderItem.information.item.material_code,
                quantity: stubPurchaseOrderItem.quantity,
                item: stubPurchaseOrderItem.information.item,
                information: {}
            };
            scope.$apply();

            expect(scope.distributionPlanNodes).toEqual([]);
        });

        it('should reset track, invalid nodes and distribution plan if newly selected item has no items', function () {
            scope.track = true;
            scope.invalidNodes = false;
            scope.distributionPlan = 1;

            scope.selectPurchaseOrderItem();
            scope.$apply();

            expect(scope.track).toEqual(false);
            expect(scope.invalidNodes).toEqual(NaN);
            expect(scope.distributionPlan).toEqual(NaN);
        });
    });

    describe('when track item checkbox changes, ', function () {
        beforeEach(function () {
            scope.track = true;
            scope.distributionPlan = 1;
        });

        it('should set the invalidNodes value', function () {
            scope.$apply();
            scope.trackPurchaseOrderItem();
            expect(scope.invalidNodes).toEqual(false);
        });

        it('should NOT call updatePlanTracking if track is set to true and plan Node is set', function () {
            scope.planNode = 1;

            scope.trackPurchaseOrderItem();
            scope.$apply();

            expect(mockPlanService.updatePlanTracking).not.toHaveBeenCalled();
        });

        it('should call updatePlanTracking if track is set to true and on first Level', function () {
            scope.consigneeLevel = true;

            scope.trackPurchaseOrderItem();
            scope.$apply();

            expect(mockPlanService.updatePlanTracking).toHaveBeenCalledWith(
                1,
                true
            );
        });

        it('should not call updatePlanTracking if track is set to true and not on first Level', function () {
            scope.consigneeLevel = false;

            scope.trackPurchaseOrderItem();
            scope.$apply();

            expect(mockPlanService.updatePlanTracking).not.toHaveBeenCalledWith();
        });

        it('should call updatePlanTracking if track is set to true and no plan Node', function () {
            scope.planNode = NaN;

            scope.trackPurchaseOrderItem();
            scope.$apply();

            expect(mockPlanService.updatePlanTracking).toHaveBeenCalledWith(
                1,
                true
            );
        });
    });

    describe('when Add Consignee button is clicked', function () {
        it('should add a default distribution plan line item to the selectedPurchaseOrderItem', function () {
            scope.selectedPurchaseOrderItem = {
                display: stubPurchaseOrderItem.information.item.description,
                materialCode: stubPurchaseOrderItem.information.item.material_code,
                quantity: 100,
                quantityLeft: stubPurchaseOrderItem.quantity,
                item: stubPurchaseOrderItem.information.item,
                information: stubPurchaseOrderItem,
                distributionplannode_set: stubPurchaseOrderItem.information.distributionplannode_set
            };
            scope.$apply();

            var expectedPlanNode = {
                item: stubPurchaseOrderItem.information.item.id,
                plannedDistributionDate: '',
                targetedQuantity: 0,
                destinationLocation: '',
                contactPerson: '',
                remark: '',
                track: false,
                isEndUser: false,
                flowTriggered: false
            };

            scope.addDistributionPlanNode();
            scope.$apply();

            expect(scope.distributionPlanNodes).toEqual([expectedPlanNode]);
        });
    });

    describe('when save is clicked, ', function () {
        var programmeId, distributionPlan;

        beforeEach(function () {
            var createPlanPromise = q.defer();
            distributionPlan = {id: 1};
            createPlanPromise.resolve(distributionPlan);
            mockPlanService.createPlan.and.returnValue(createPlanPromise.promise);

            programmeId = 42;
            scope.selectedPurchaseOrder = {programme: programmeId};
            scope.selectedPurchaseOrderItem = {quantity: 100, information: stubPurchaseOrderItem};
            scope.$apply();
        });

        describe('and the plan is successfully saved, ', function () {
            it('a toast confirming the save action should be created', function () {
                scope.saveDistributionPlanNodes();
                scope.$apply();

                var expectedToastArguments = {
                    content: 'Delivery Saved!',
                    class: 'success',
                    maxNumber: 1,
                    dismissOnTimeout: true
                };
                expect(mockToastProvider.create).toHaveBeenCalledWith(expectedToastArguments);
            });

        });

        describe('and a plan for the purchase order item has not been saved, ', function () {
            it('a distribution plan should be created', function () {
                scope.saveDistributionPlanNodes();
                scope.$apply();

                expect(mockPlanService.createPlan).toHaveBeenCalledWith({programme: programmeId});
            });
            it('the created distribution plan should be put on the scope', function () {
                scope.saveDistributionPlanNodes();
                scope.$apply();

                expect(scope.distributionPlan).toEqual(distributionPlan.id);
            });
        });

        describe('and a plan for the purchase order item has been saved, ', function () {
            it('a distribution plan should not be created', function () {
                scope.distributionPlan = {programme: 1};
                scope.$apply();

                scope.saveDistributionPlanNodes();
                scope.$apply();

                expect(mockPlanService.createPlan).not.toHaveBeenCalled();
            });
        });

        describe('when saving a node and plan item, ', function () {
            var uiPlanNode;
            var distributionDateFormattedForSave = '2014-2-3';

            beforeEach(function () {
                uiPlanNode = {
                    consignee: {id: 1},
                    location: 'Kampala',
                    destinationLocation: 'Kampala',
                    contactPerson: {id: '0489284'},
                    distributionPlan: 1,
                    tree_position: 'MIDDLE_MAN',
                    item: 1,
                    targetedQuantity: 10,
                    plannedDistributionDate: '02/03/2014',
                    remark: 'Remark',
                    track: false
                };

                scope.distributionPlanNodes = [uiPlanNode];
                scope.track = true;
                scope.$apply();
            });


            describe(' and a distribution plan node has not been saved before, ', function () {
                var nodeId;
                beforeEach(function () {
                    nodeId = 1;
                    deferredPlanNode.resolve({id: nodeId});
                    deferredUserPromise.resolve(stubUser);
                });

                it('should save node with end user tree position', function () {
                    uiPlanNode.isEndUser = true;

                    scope.saveDistributionPlanNodes();
                    scope.$apply();

                    expect(mockNodeService.create).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'END_USER',
                        parent: null,
                        item: uiPlanNode.item,
                        targeted_quantity: uiPlanNode.targetedQuantity,
                        planned_distribution_date: distributionDateFormattedForSave,
                        remark: uiPlanNode.remark,
                        track: scope.track
                    });
                });

                it('a node should be saved with no parent id as implementing partner', function () {
                    scope.saveDistributionPlanNodes();
                    scope.$apply();

                    expect(mockNodeService.create).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'IMPLEMENTING_PARTNER',
                        parent: null,
                        item: uiPlanNode.item,
                        targeted_quantity: uiPlanNode.targetedQuantity,
                        planned_distribution_date: distributionDateFormattedForSave,
                        remark: uiPlanNode.remark,
                        track: scope.track
                    });
                });

                it('should save node with middle man user tree position', function () {
                    uiPlanNode.isEndUser = false;
                    scope.planNode = {id: 1};
                    scope.saveDistributionPlanNodes();
                    scope.$apply();

                    expect(mockNodeService.create).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'MIDDLE_MAN',
                        parent: 1,
                        item: uiPlanNode.item,
                        targeted_quantity: uiPlanNode.targetedQuantity,
                        planned_distribution_date: distributionDateFormattedForSave,
                        remark: uiPlanNode.remark,
                        track: scope.track
                    });
                });

                it('a distribution plan node should be saved, with it\'s track property picked from the scope', function () {
                    scope.saveDistributionPlanNodes();
                    scope.$apply();

                    expect(mockNodeService.create).toHaveBeenCalledWith({
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'IMPLEMENTING_PARTNER',
                        parent: null,
                        item: uiPlanNode.item,
                        targeted_quantity: uiPlanNode.targetedQuantity,
                        planned_distribution_date: distributionDateFormattedForSave,
                        remark: uiPlanNode.remark,
                        track: scope.track
                    });
                });

            });

            it('should setting track to true if user is an IP user', function () {
                var nodeId = 1;
                deferredPlanNode.resolve({id: nodeId});
                deferredUserPromise.resolve(stubIPUser);
                scope.track = false;

                scope.saveDistributionPlanNodes();
                scope.$apply();

                expect(mockNodeService.create).toHaveBeenCalledWith({
                    consignee: 1,
                    location: 'Kampala',
                    contact_person_id: '0489284',
                    distribution_plan: 1,
                    tree_position: 'IMPLEMENTING_PARTNER',
                    parent: null,
                    item: uiPlanNode.item,
                    targeted_quantity: uiPlanNode.targetedQuantity,
                    planned_distribution_date: distributionDateFormattedForSave,
                    remark: uiPlanNode.remark,
                    track: true
                });
            });

            describe(' and a distribution plan node has already been saved, ', function () {
                var nodeId, deferred;

                beforeEach(inject(function ($q) {
                    nodeId = 1;
                    deferredPlanNode.resolve({id: nodeId});
                    deferredUserPromise.resolve(stubUser);

                    deferred = $q.defer();
                    deferred.resolve({});
                    mockNodeService.update.and.returnValue(deferred.promise);
                }));

                it('the node for the ui plan node should be updated and not saved', function () {
                    uiPlanNode.id = nodeId;

                    scope.saveDistributionPlanNodes();
                    scope.$apply();

                    expect(mockNodeService.update).toHaveBeenCalledWith({
                        id: nodeId,
                        consignee: 1,
                        location: 'Kampala',
                        contact_person_id: '0489284',
                        distribution_plan: 1,
                        tree_position: 'IMPLEMENTING_PARTNER',
                        parent: null,
                        children: [],
                        item: uiPlanNode.item,
                        targeted_quantity: uiPlanNode.targetedQuantity,
                        planned_distribution_date: distributionDateFormattedForSave,
                        remark: uiPlanNode.remark,
                        track: true
                    });
                    expect(mockNodeService.create).not.toHaveBeenCalled();
                });

            });
        });

        describe('for sub-consignees', function () {
            var uiPlanNodes;
            beforeEach(function () {
                uiPlanNodes = {
                    consignee: {id: 1},
                    destinationLocation: 'Kampala',
                    location: 'Kampala',
                    contactPerson: {id: '0489284'},
                    distributionPlan: 1,
                    tree_position: 'MIDDLE_MAN',
                    item: 1,
                    targetedQuantity: 10,
                    plannedDistributionDate: '2014-02-03',
                    remark: 'Remark',
                    parent: 42,
                    track: true
                };

                scope.distributionPlanNodes = [uiPlanNodes];
                scope.planNode = {id: 42};
                deferredUserPromise.resolve(stubUser);
                scope.track = true;
                scope.$apply();
            });

            it('a node be saved with parent node', function () {
                scope.saveDistributionPlanNodes();
                scope.$apply();

                expect(mockNodeService.create).toHaveBeenCalledWith({
                    consignee: 1,
                    location: 'Kampala',
                    contact_person_id: '0489284',
                    distribution_plan: 1,
                    tree_position: 'MIDDLE_MAN',
                    parent: scope.planNode.id,
                    item: 1,
                    targeted_quantity: 10,
                    planned_distribution_date: '2014-2-3',
                    remark: 'Remark',
                    track: true
                });

            });
        });
    });
});


