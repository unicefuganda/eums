describe('New Sub-consignee Delivery By IP Controller', function () {
    var mockIpService, scope, q, mockDeliveryNodeService, routeParams, mockDeliveryNode, childNodes, toast,
        mockLoaderService, parentNode, paginatedChildNodes, deferredSearchResults, searchResults, mockWindow,
        mockHistory, mockItemService, item, mockContactService, contact, lineageNodes, parentLineage;
    var districts = ['Kampala', 'Mukono'];
    var orderItemId = 1890;


    beforeEach(function () {
        module('NewSubConsigneeDeliveryByIp');

        childNodes = [
            {id: 1, item: orderItemId, quantityShipped: 10},
            {id: 2, item: orderItemId, quantityShipped: 20},
            {id: 3, item: orderItemId, quantityShipped: 30},
            {id: 4, item: orderItemId, quantityShipped: 40}
        ];
        paginatedChildNodes = {results: childNodes, count: 4, pageSize: 1, next: 'next', previous: 'prev'};
        searchResults = childNodes.first(2);

        parentNode = {id: 12, item: orderItemId, balance: 100};
        item = {description: 'some description'};
        contact = {firstName: 'Sikatange', lastName: 'Jafari'};

        lineageNodes = [
            {id: 6, item: orderItemId, quantityShipped: 10},
            {id: 8, item: orderItemId, quantityShipped: 20},
            {id: 7, item: orderItemId, quantityShipped: 30},
            {id: 9, item: orderItemId, quantityShipped: 40}
        ];

        parentLineage = [
            {id: 6, item: orderItemId, quantityShipped: 10},
            {id: 7, item: orderItemId, quantityShipped: 30},
            {id: 8, item: orderItemId, quantityShipped: 20},
            {id: 9, item: orderItemId, quantityShipped: 40},
            parentNode
        ];

        inject(function ($controller, $rootScope, $q, $location, ngToast) {
            mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
            mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['filter', 'create', 'get', 'search', 'getLineage']);
            mockItemService = jasmine.createSpyObj('mockItemService', ['get']);
            mockContactService = jasmine.createSpyObj('mockContactService', ['get']);
            mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);
            mockDeliveryNode = function (options) {
                this.track = options.track;
            };
            mockHistory = jasmine.createSpyObj('mockHistory', ['back']);
            mockWindow = {history: mockHistory};

            deferredSearchResults = $q.defer();
            mockIpService.loadAllDistricts.and.returnValue($q.when({data: districts}));
            mockDeliveryNodeService.filter.and.returnValue($q.when(paginatedChildNodes));
            mockDeliveryNodeService.getLineage.and.returnValue($q.when(lineageNodes));
            mockDeliveryNodeService.create.and.returnValue($q.when({}));
            mockDeliveryNodeService.get.and.returnValue($q.when(parentNode));
            mockDeliveryNodeService.search.and.returnValue(deferredSearchResults.promise);
            mockItemService.get.and.returnValue($q.when(item));
            mockContactService.get.and.returnValue($q.when(contact));

            scope = $rootScope.$new();
            routeParams = {itemId: 2, parentNodeId: 10};
            toast = ngToast;

            spyOn(toast, 'create');

            q = $q;
            $controller('NewSubConsigneeDeliveryByIpController', {
                $scope: scope,
                IPService: mockIpService,
                $routeParams: routeParams,
                DeliveryNodeService: mockDeliveryNodeService,
                DeliveryNode: mockDeliveryNode,
                ngToast: toast,
                LoaderService: mockLoaderService,
                $window: mockWindow,
                ItemService: mockItemService,
                ContactService: mockContactService
            });
        });
    });

    describe('On load', function () {
        it('should have empty initial data on load', function () {
            expect(scope.errors).toBe(false);
            expect(scope.addingNewDelivery).toBe(false);
            expect(scope.districts).toEqual([]);
            expect(JSON.stringify(scope.newDelivery)).toEqual(JSON.stringify({track: true}));
        });

        it('should load all districts and put them on scope', function () {
            expect(scope.districtsLoaded).toBeFalsy();
            scope.$apply();
            expect(scope.districts).toEqual([
                {id: 'Kampala', name: 'Kampala'},
                {id: 'Mukono', name: 'Mukono'}
            ]);
            expect(scope.districtsLoaded).toBeTruthy();
        });

        it('should fetch parent node and put it on scope', function () {
            scope.$apply();
            expect(mockDeliveryNodeService.get).toHaveBeenCalledWith(routeParams.parentNodeId);
            expect(scope.parentNode).toEqual(parentNode);
        });

        it('should fetch item and put it on scope', function () {
            scope.$apply();
            expect(mockItemService.get).toHaveBeenCalledWith(routeParams.itemId);
            expect(scope.item).toEqual(item);
        });

        it('should load child deliveries for the parent delivery and item; and paginate', function () {
            scope.$apply();
            var filterParams = {item__item: routeParams.itemId, parent: routeParams.parentNodeId, paginate: true};
            expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(filterParams, ['contact_person_id']);
            expect(scope.deliveries).toEqual(childNodes);
        });

        it('should load the lineage of the parent delivery', function() {
            scope.$apply();
            expect(mockDeliveryNodeService.getLineage).toHaveBeenCalledWith(parentNode);
            expect(scope.deliveryLineage).toEqual(parentLineage);
        })
    });

    describe('pagination and search:', function () {
        it('should add pagination parameters on page after fetching nodes', function () {
            scope.$apply();
            expect(scope.count).toEqual(paginatedChildNodes.count);
            expect(scope.pageSize).toEqual(paginatedChildNodes.pageSize);
            expect(scope.itemId).toEqual(routeParams.itemId);
        });

        it('should fetch new page when goToPage is called and put the consignees on that page on scope', function () {
            scope.goToPage(10);
            scope.$apply();
            var filterParams = {
                item__item: routeParams.itemId,
                parent: routeParams.parentNodeId,
                paginate: true,
                page: 10
            };
            expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(filterParams, ['contact_person_id']);
            expect(scope.deliveries).toEqual(childNodes);
        });

        it('should search for items with scope search term', function () {
            scope.$apply();
            expect(scope.deliveries).toEqual(childNodes);
            deferredSearchResults.resolve({results: searchResults});
            var searchTerm = 'some item name';
            scope.searchTerm = searchTerm;
            scope.$apply();
            var filterParams = {item__item: routeParams.itemId, parent: routeParams.parentNodeId, paginate: true};
            expect(mockDeliveryNodeService.search).toHaveBeenCalledWith(searchTerm, [], filterParams);
            expect(scope.deliveries).toEqual(searchResults);

            scope.searchTerm = '';
            scope.$apply();
            expect(mockDeliveryNodeService.filter).toHaveBeenCalled();
            expect(scope.deliveries).toEqual(childNodes);
        });

        it('should maintain search term when moving through pages', function () {
            var term = 'search term';
            scope.searchTerm = term;
            scope.$apply();
            scope.goToPage(10);
            scope.$apply();
            var filterParams = {
                item__item: routeParams.itemId,
                parent: routeParams.parentNodeId,
                paginate: true,
                page: 10,
                search: term
            };
            expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(filterParams, ['contact_person_id']);
        });

        it('should toggle search mode during search', function () {
            scope.$apply();
            expect(scope.searching).toBe(false);
            scope.searchTerm = 'something';
            scope.$apply();
            expect(mockDeliveryNodeService.search).toHaveBeenCalled();
            expect(scope.searching).toBe(true);
            deferredSearchResults.resolve({results: searchResults});
            scope.$apply();
            expect(scope.searching).toBe(false);
        });
    });

    describe('Creating a new delivery', function () {
        beforeEach(function () {
            setupNewDelivery();
        });

        it('should toggle adding new delivery form on click of button', function () {
            scope.$apply();
            scope.errors = true;

            spyOn(scope, '$broadcast');

            scope.toggleNewDeliveryForm();

            expect(scope.addingNewDelivery).toBeTruthy();
            expect(scope.newDelivery).toEqual(new mockDeliveryNode({track: true}));
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-contact');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-consignee');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-list');
            expect(scope.errors).toBeFalsy();
        });

        it('it should format new delivery date correctly on change', function () {
            scope.newDelivery.deliveryDate = '2015-08-26T08:00:00.000Z';
            scope.$apply();
            expect(scope.newDelivery.deliveryDate).toBe('2015-08-26');
        });

        it('should save new delivery and camel case the returned response', function () {
            var newDelivery = setupNewDelivery();

            scope.createNewDelivery();

            expect(newDelivery.item).toEqual(scope.parentNode.item);
            expect(newDelivery.parents).toEqual([{id: routeParams.parentNodeId, quantity: scope.newDelivery.quantity}]);
            expect(mockDeliveryNodeService.create).toHaveBeenCalledWith(newDelivery, {changeCaseOnResponse: true});
        });


        it('should show success toast upon save', function () {
            scope.$apply();
            setupNewDelivery();

            scope.createNewDelivery();

            scope.$apply();
            expect(toast.create).toHaveBeenCalledWith({
                content: 'Sub-consignee Successfully Created',
                class: 'success'
            });
        });


        it('should add created delivery to the top of the deliveries list upon successful save', function () {
            var createdNode = {id: 2, contactPersonId: 10};
            setupNewDelivery();
            mockDeliveryNodeService.create.and.returnValue(q.when(createdNode));

            scope.createNewDelivery();
            scope.$apply();
            expect(scope.deliveries.first()).toEqual(createdNode);
            expect(mockContactService.get).toHaveBeenCalledWith(createdNode.contactPersonId);
        });

        it('should reload parent node upon successful save', function () {
            setupNewDelivery();
            mockDeliveryNodeService.get.calls.reset();

            scope.createNewDelivery();
            scope.$apply();

            expect(mockDeliveryNodeService.get).toHaveBeenCalledWith(routeParams.parentNodeId);
        });

        it('should reset delivery form fields  upon successful save', function () {
            setupNewDelivery();
            spyOn(scope, '$broadcast');

            scope.createNewDelivery();
            scope.$apply();

            expect(scope.newDelivery).toEqual(new mockDeliveryNode({track: true}));
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-contact');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-consignee');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-list');
        });

        it('should not save delivery when any required field on the new delivery is not provided', function () {
            scope.$apply();
            assertSaveFails.if('quantity').is(undefined);
            assertSaveFails.if('quantity').is(0);
            assertSaveFails.if('location').is(undefined);
            assertSaveFails.if('consignee').is(undefined);
            assertSaveFails.if('deliveryDate').is(undefined);
            assertSaveFails.if('contact_person_id').is(undefined);
        });

        function setupNewDelivery(unset) {
            scope.parentNode = parentNode;

            scope.newDelivery = {track: true};
            scope.newDelivery.consignee = 10;
            scope.newDelivery.location = 'Jinja';
            scope.newDelivery.deliveryDate = '2015-01-30';
            scope.newDelivery.contact_person_id = '3A09C3B1-0937-4082-93D9-4ACC3E86B2B3';
            scope.newDelivery.quantity = 1;

            Object.each(unset, function (key, value) {
                scope.newDelivery[key] = value;
            });
            return scope.newDelivery;
        }

        var assertSaveFails = {
            if: function (fieldname) {
                return {
                    is: function (val) {
                        var unsetParams = {};
                        unsetParams[fieldname] = val;
                        setupNewDelivery(unsetParams);
                        scope.createNewDelivery();
                        expect(mockDeliveryNodeService.create).not.toHaveBeenCalled();
                        expect(scope.errors).toBeTruthy();
                        expect(toast.create).toHaveBeenCalledWith({
                            content: 'Cannot save. Please fill out or fix values for all fields marked in red',
                            class: 'danger'
                        });
                    }
                }
            }
        };

        it('should not save new delivery if the delivery to sub-consignee if quantity shipped is greater than quantity available', function () {
            scope.$apply();
            var quantityLargerThanAvailable = scope.parentNode.balance + 10;
            assertSaveFails.if('quantity').is(quantityLargerThanAvailable);
        });
    });

    describe('Consignee and Contact selectors', function () {
        it('should broadcast add contact event when addContact is called', function () {
            spyOn(scope, '$broadcast');
            scope.addContact();
            expect(scope.$broadcast).toHaveBeenCalledWith('add-contact');
        });

        it('should put new contact on scope after save', function () {
            var contact = {_id: 1, firstName: 'James', lastName: 'Bean'};

            var contactScope = scope.$new();
            contactScope.$emit('contact-saved', contact);
            scope.$apply();

            expect(scope.newDelivery.contact_person_id).toBe(contact._id);
            expect(scope.newDelivery.contact).toEqual(contact);
        });

        it('should put contact name into select after contact-saved is called', function () {
            var fakeTextSetter = jasmine.createSpy();
            var fakeContactInput = {
                siblings: function () {
                    return {
                        find: function () {
                            return {text: fakeTextSetter}
                        }
                    }
                }
            };
            spyOn(angular, 'element').and.returnValue(fakeContactInput);

            var contact = {_id: 1, firstName: 'James', lastName: 'Bean'};
            var contactScope = scope.$new();
            contactScope.$emit('contact-saved', contact);
            scope.$apply();

            expect(fakeTextSetter).toHaveBeenCalledWith('James Bean');
        });

        it('should broadcast add consignee event when addConsignee is called', function () {
            spyOn(scope, '$broadcast');
            scope.addConsignee();
            expect(scope.$broadcast).toHaveBeenCalledWith('add-consignee');
        });

        it('should put new consignee on scope after save', function () {
            var consignee = {id: 1, name: 'Wakiso DHO', location: 'Wakiso'};

            var consigneeScope = scope.$new();
            consigneeScope.$emit('consignee-saved', consignee);
            scope.$apply();

            expect(scope.newDelivery.consignee).toEqual(consignee);
        });

        it('should put consignee name into select after consignee-saved is called', function () {
            var consignee = {id: 1, name: 'Wakiso DHO', location: 'Wakiso'};
            spyOn(scope, '$broadcast');
            var consigneeScope = scope.$new();
            consigneeScope.$emit('consignee-saved', consignee);
            scope.$apply();

            expect(scope.$broadcast).toHaveBeenCalledWith('set-consignee', consignee);
        });
    });

    it('should show loader on load', function () {
        scope.$apply();
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });


    it('should go back to the previous history', function () {
        scope.goBack();
        scope.$apply();
        expect(mockHistory.back).toHaveBeenCalled();
    });



});