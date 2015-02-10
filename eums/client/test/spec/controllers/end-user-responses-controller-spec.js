describe('EndUserResponsesController', function () {
    var mockDistributionPlanService, mockProgrammeService, mockConsigneeService, mockItemService;

    var deferredDistributionPlanPromise,  deferredProgrammePromise, deferredConsigneePromise, deferredItemPromise;

    var scope, q;

    var stubProgrammes = { data: [
            {
                'programme': {
                    id: 3,
                    name: 'Alive'
                },
                'salesorder_set': ['1']
            }
        ]
    };

    var stubConsignees = [
        {   children: [],
            consignee: 10,
            consignee_name: 'PADER DHO',
            contact_person_id: '5420508290cc38715b1af928',
            distribution_plan: 2,
            distributionplanlineitem_set: [1],
            id: 5,
            location: 'PADER',
            mode_of_delivery: 'WAREHOUSE',
            parent: null,
            tree_position: 'MIDDLE_MAN'
        }
    ];

    var stubItems = [
        {   id: 1,
            description: 'Computer',
            material_code: '12345AS',
            unit: {
                name: 'EA'
            }
        }
    ];

    var stubResponses = { data: [
        {
            amountReceived: '30',
            amountSent: 30,
            consignee: {
                    id: 5,
                    name: 'PADER DHO'
                },
            dateOfReceipt: '19/11/2014',
            feedbackAboutDissatisfaction: 'We are enjoying',
            ip: {
                    id: 5,
                    name: 'PADER DHO'
                },
            item: 'Computer',
            productReceived: 'Yes',
            programme: {
                    id: 3,
                    name: 'Alive'
                },
            qualityOfProduct: 'Good',
            satisfiedWithProduct: 'Yes'
        },
        {
            amountReceived: '10',
            amountSent: 10,
            consignee: {
                    id: 6,
                    name: 'Kitgum DHO'
                },
            dateOfReceipt: '19/11/2014',
            feedbackAboutDissatisfaction: 'Satisfactory',
            ip: {
                    id: 6,
                    name: 'Kitgum DHO'
                },
            item: 'Generator',
            productReceived: 'Yes',
            programme: {
                    id: 4,
                    name: 'Malaria Consortium'
                },
            qualityOfProduct: 'Good',
            satisfiedWithProduct: 'No'
        }
      ]
    };

    beforeEach(function () {
        module('EndUserResponses');

        mockDistributionPlanService = jasmine.createSpyObj('mockDistributionPlanService', ['getAllEndUserResponses']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['fetchProgrammes']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['fetchConsignees']);
        mockItemService = jasmine.createSpyObj('mockItemService', ['fetchItems']);

        inject(function ($controller, $q, $rootScope) {
            q = $q;
            deferredDistributionPlanPromise = $q.defer();
            deferredProgrammePromise = $q.defer();
            deferredConsigneePromise = $q.defer();
            deferredItemPromise = $q.defer();
            mockDistributionPlanService.getAllEndUserResponses.and.returnValue(deferredDistributionPlanPromise.promise);
            mockProgrammeService.fetchProgrammes.and.returnValue(deferredProgrammePromise.promise);
            mockConsigneeService.fetchConsignees.and.returnValue(deferredConsigneePromise.promise);
            mockItemService.fetchItems.and.returnValue(deferredItemPromise.promise);

            scope = $rootScope.$new();

            $controller('EndUserResponsesController', {
                $scope: scope,
                DistributionPlanService: mockDistributionPlanService,
                ProgrammeService: mockProgrammeService,
                ConsigneeService: mockConsigneeService,
                ItemService: mockItemService
            });
        });
    });

    it('should fetch programmes when controller is initialized', function () {
        deferredProgrammePromise.resolve(stubProgrammes);
        scope.initialize();
        scope.$apply();

        expect(scope.programmes).toEqual([{ id : 0, name : 'All Outcomes' }].concat(stubProgrammes.data));
    });

    it('should fetch all consignees when controller is initialized', function () {
        deferredConsigneePromise.resolve(stubConsignees);
        scope.initialize();
        scope.$apply();

        expect(scope.consignees).toEqual([{ id : 0, name : 'All Implementing Partners' }].concat(stubConsignees));
    });

    it('should fetch all items when controller is initialized', function () {
        deferredItemPromise.resolve(stubItems);
        scope.initialize();
        scope.$apply();

        expect(scope.items).toEqual([{ id : 0, description : 'All Items' }].concat(stubItems));
    });

    it('should fetch all responses when controller is initialized', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.initialize();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for programme when programme is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = stubProgrammes.data[0].programme;

        scope.initialize();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch all responses for programme when All Programmes is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = {id:0, name:'All Programmes'};

        scope.initialize();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for consignees when consignee is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedConsignee = stubConsignees[0];

        scope.initialize();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch all responses for consignees when All Consignees is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedConsignee = {id:0, name:'All Consignees'};

        scope.initialize();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for items when item is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedItem = stubItems[0];

        scope.initialize();
        scope.$apply();
        scope.selectItem();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch all items for items when All Items is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedItem = {id:0, description:'All Items'};

        scope.initialize();
        scope.$apply();
        scope.selectItem();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual(stubResponses.data);
    });

    it('should fetch filtered responses for programme when programme is first selected and then All Consignees is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = stubProgrammes.data[0].programme;
        scope.selectedConsignee = {id:0, name:'All Consignees'};

        scope.initialize();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });

    it('should fetch filtered responses for programme when All Consignees is selected first and then program is selected', function () {
        deferredDistributionPlanPromise.resolve(stubResponses);
        scope.selectedProgramme = stubProgrammes.data[0].programme;
        scope.selectedConsignee = {id:0, name:'All Consignees'};

        scope.initialize();
        scope.$apply();
        scope.selectConsignee();
        scope.$apply();
        scope.selectProgramme();
        scope.$apply();

        expect(scope.allResponses).toEqual(stubResponses.data);
        expect(scope.filteredResponses).toEqual([stubResponses.data[0]]);
    });
});
