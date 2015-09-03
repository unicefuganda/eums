describe('New Sub-consignee Delivery By IP Controller', function () {
    var mockIpService, scope, q, mockDeliveryNodeService, routeParams, mockDeliveryNode, childNodes, toast,
        mockLoaderService, parentNode, paginatedChildNodes;
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

        parentNode = {id: 12, item: orderItemId, quantityShipped: 100};

        inject(function ($controller, $rootScope, $q, $location, ngToast) {
            mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
            mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['filter', 'create', 'get']);
            mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);
            mockDeliveryNode = function (options) {
                this.track = options.track;
            };
            mockIpService.loadAllDistricts.and.returnValue($q.when({data: districts}));

            mockDeliveryNodeService.filter.and.returnValue($q.when(paginatedChildNodes));
            mockDeliveryNodeService.create.and.returnValue($q.when({}));
            mockDeliveryNodeService.get.and.returnValue($q.when(parentNode));

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
                LoaderService: mockLoaderService
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

        it('should load child deliveries for the parent delivery and item; and paginate', function () {
            scope.$apply();
            var filterParams = {item__item: routeParams.itemId, parent: routeParams.parentNodeId, paginate: true};
            expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(filterParams);
            expect(scope.deliveries).toEqual(childNodes);
        });
    });

    xdescribe('pagination and search:', function () {
        it('should add pagination parameters on page after fetching nodes', function () {
            scope.$apply();
            expect(scope.count).toEqual(paginatedChildNodes.count);
            expect(scope.pageSize).toEqual(paginatedChildNodes.pageSize);
        });

        it('should fetch new page when goToPage is called and put the consignees on that page on scope', function () {
            scope.goToPage(10);
            scope.$apply();
            expect(mockConsigneeItemService.all).toHaveBeenCalledWith([], {page: 10});
            expect(scope.items).toEqual(items);
        });

        it('should search for items with scope search term', function () {
            scope.$apply();
            expect(scope.items).toEqual(items);
            deferredSearchResults.resolve({results: searchResults});
            var searchTerm = 'some item name';
            scope.searchTerm = searchTerm;
            scope.$apply();
            expect(mockConsigneeItemService.search).toHaveBeenCalledWith(searchTerm);
            expect(scope.items).toEqual(searchResults);

            scope.searchTerm = '';
            scope.$apply();
            expect(mockConsigneeItemService.all).toHaveBeenCalled();
            expect(scope.items).toEqual(items);
        });

        it('should maintain search term when moving through pages', function () {
            var term = 'search term';
            scope.searchTerm = term;
            scope.$apply();
            scope.goToPage(10);
            scope.$apply();
            expect(mockConsigneeItemService.all).toHaveBeenCalledWith([], {page: 10, search: term});
        });

        it('should toggle search mode during search', function () {
            scope.$apply();
            expect(scope.searching).toBe(false);
            scope.searchTerm = 'something';
            scope.$apply();
            expect(mockConsigneeItemService.search).toHaveBeenCalled();
            expect(scope.searching).toBe(true);
            deferredSearchResults.resolve({results: searchResults});
            scope.$apply();
            expect(scope.searching).toBe(false);
        });
    });

    describe('Creating a new delivery', function () {
        it('should toggle adding new delivery form on click of button', function () {
            scope.$apply();
            spyOn(scope, '$broadcast');

            scope.toggleNewDeliveryForm();

            expect(scope.addingNewDelivery).toBeTruthy();
            expect(scope.newDelivery).toEqual(new mockDeliveryNode({track: true}));
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-contact');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-consignee');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-list');
        });

        it('it should format new delivery date correctly on change', function () {
            scope.newDelivery.deliveryDate = '2015-08-26T08:00:00.000Z';
            scope.$apply();
            expect(scope.newDelivery.deliveryDate).toBe('2015-08-26');
        });


        it('should save new delivery', function () {
            var deliveryData = setupDeliveryData();
            var newDelivery = deliveryData.newDelivery;
            var additionalFields = deliveryData.additionalFields;
            scope.createNewDelivery();

            var fullDelivery = Object.merge(additionalFields, newDelivery);
            expect(mockDeliveryNodeService.create).toHaveBeenCalledWith(fullDelivery);
        });

        it('should add created delivery to the top of the deliveries list upon successful save', function () {
            var createdNode = {id: 2};
            setupDeliveryData();
            mockDeliveryNodeService.create.and.returnValue(q.when(createdNode));

            scope.createNewDelivery();
            scope.$apply();

            expect(scope.deliveries.first()).toEqual(createdNode);
        });

        it('should reset delivery form fields  upon successful save', function () {
            setupDeliveryData();
            spyOn(scope, '$broadcast');

            scope.createNewDelivery();
            scope.$apply();

            expect(scope.newDelivery).toEqual(new mockDeliveryNode({track: true}));
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-contact');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-consignee');
            expect(scope.$broadcast).toHaveBeenCalledWith('clear-list');
        });

        function setupDeliveryData() {
            var newDelivery = {track: true, quantity: 3};
            var parentNode = {item: 10};
            scope.parentNode = parentNode;
            scope.newDelivery = newDelivery;
            var additionalFields = {
                item: parentNode.item,
                parents: [
                    {
                        id: routeParams.parentNodeId,
                        quantity: newDelivery.quantity
                    }
                ]
            };
            return {newDelivery: newDelivery, additionalFields: additionalFields};
        }
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


    //LOADERS
    //
    //it('should show loader on load', function () {
    //    scope.$apply();
    //    expect(mockLoaderService.showLoader).toHaveBeenCalled();
    //    expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    //});
    //
    //
    //it('should show success toast upon save', function () {
    //    scope.$apply();
    //    setupNewDelivery();
    //    scope.save();
    //    scope.$apply();
    //    expect(toast.create).toHaveBeenCalledWith({
    //        content: 'Delivery Successfully Created',
    //        class: 'success'
    //    });
    //});
    //
    //it('should show failure toast when save fails', function () {
    //    scope.$apply();
    //    setupNewDelivery();
    //    mockDeliveryNodeService.create.and.returnValue(q.reject());
    //    scope.save();
    //    scope.$apply();
    //    expect(toast.create).toHaveBeenCalledWith({
    //        content: 'Failed to save delivery',
    //        class: 'danger'
    //    });
    //});
    //
    //var assertSaveFails = {
    //    if: function (fieldname) {
    //        return {
    //            is: function (val) {
    //                var unsetParams = {};
    //                unsetParams[fieldname] = val;
    //                setupNewDelivery(unsetParams);
    //                scope.save();
    //                expect(mockDeliveryNodeService.create).not.toHaveBeenCalled();
    //                expect(scope.errors).toBeTruthy();
    //                expect(toast.create).toHaveBeenCalledWith({
    //                    content: 'Cannot save. Please fill out or fix values for all fields marked in red',
    //                    class: 'danger'
    //                });
    //            }
    //        }
    //    }
    //};
    //
    //
    //function setupNewDelivery(unset) {
    //    scope.newDelivery = {};
    //    scope.newDelivery.consignee = 10;
    //    scope.newDelivery.location = 'Jinja';
    //    scope.newDelivery.deliveryDate = '2015-01-30';
    //    scope.newDelivery.contact_person_id = '3A09C3B1-0937-4082-93D9-4ACC3E86B2B3';
    //    scope.newDelivery.parents = [{id: 1, quantity: 10}];
    //    Object.each(unset, function (key, value) {
    //        scope.newDelivery[key] = value;
    //    });
    //    return scope.newDelivery;
    //}
});