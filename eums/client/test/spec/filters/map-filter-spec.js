describe('Map Filter Service', function () {
    var mapFilterService, deferredPlans, scope, httpBackend, eumsConfig;

    var consigneeResponseOne = [
        {
            'node': 2,
            'qualityOfProduct': 'Good',
            'amountReceived': '20',
            'consignee': {
                'id': 10,
                'name': 'PADER DHO'
            },
            'satisfiedWithProduct': 'Yes',
            'productReceived': 'Yes',
            'item': 'Safety box f.used syrgs/ndls 5lt/BOX-25',
            'amountSent': 100,
            'revisedDeliveryDate': '12/10/2014',
            'feedbackAboutDissatisfaction': 'It was awesome',
            'dateOfReceipt': '10/10/2014'
        }
    ], consigneeResponseTwo = [
        {
            'node': 3,
            'item': 'IEHK2006,kit,suppl.1-drugs',
            'informedOfDelay': 'No',
            'feedbackAboutDissatisfaction': 'I am so frustrated',
            'consignee': {
                'id': 21,
                'name': 'BUNDIBUGYO DHO'
            },
            'amountReceived': '0',
            'amountSent': 1,
            'productReceived': 'No'
        }
    ], markerMapOne = {
        marker: {},
        consigneeResponse: consigneeResponseOne
    }, markerMapTwo = {
        marker: {},
        consigneeResponse: consigneeResponseTwo
    }, distributionPlanTwo = {
        'id': 8,
        'programme': 1,
        'date': '2014-10-27',
        'distributionplannode_set': []
    }, distributionPlanThree = {
        'id': 1,
        'programme': 1,
        'date': '2014-10-13',
        'distributionplannode_set': [
            2,
            3
        ]
    }, distributionPlanNodeOne = {
        'id': 2,
        'parent': null,
        'distribution_plan': 6,
        'children': [],
        'location': 'Bukomansimbi',
        'distributionplanlineitem_set': [
            21
        ],
        'consignee': 32,
        'tree_position': 'MIDDLE_MAN',
        'contact_person_id': '542bfa5108453c32ffd4cade'
    }, distributionPlanNodetwo = {
        'id': 3,
        'parent': null,
        'distribution_plan': 6,
        'children': [],
        'location': 'Kalungu',
        'distributionplanlineitem_set': [
            23
        ],
        'consignee': 36,
        'tree_position': 'MIDDLE_MAN',
        'contact_person_id': '5422bf5999f3eb0000a46ae6'
    };


    beforeEach(function () {
        module('eums.mapFilter');
    });

    describe('filter by programme', function () {

        beforeEach(function () {
            var mockFilterService = jasmine.createSpyObj('mockFilterService', ['getDistributionPlansBy']);

            module(function ($provide) {
                $provide.value('FilterService', mockFilterService);
            });
            inject(function (MapFilterService, $q, $rootScope, $httpBackend, EumsConfig) {
                eumsConfig = EumsConfig;
                httpBackend = $httpBackend;
                scope = $rootScope.$new();
                deferredPlans = $q.defer();
                mapFilterService = MapFilterService;
                mockFilterService.getDistributionPlansBy.and.returnValue(deferredPlans.promise);
            });

        });

        it('should get all markers set on the service', function () {
            mapFilterService.setMapMarker(markerMapOne);
            expect(mapFilterService.getAllMarkerMaps()).toEqual([markerMapOne]);
        });
    });

    describe('filter by ip', function () {
        var mockDistributionPlanNodeService, deferredNodes;
        beforeEach(function () {
            mockDistributionPlanNodeService = jasmine.createSpyObj('mockDistributionPlanNodeService', ['filter']);

            module(function ($provide) {
                $provide.value('DistributionPlanNodeService', mockDistributionPlanNodeService);
            });

            inject(function ($q, MapFilterService, $rootScope) {
                deferredNodes = $q.defer();
                scope = $rootScope.$new();
                mapFilterService = MapFilterService;
                mockDistributionPlanNodeService.filter.and.returnValue(deferredNodes.promise);
            });
        });

        it('should filter markers by ip', function (done) {
            mapFilterService.setMapMarker(markerMapOne);
            mapFilterService.setMapMarker(markerMapTwo);
            var ip = 1;

            deferredNodes.resolve([distributionPlanNodeOne]);
            mapFilterService.filterMarkersByIp(ip, mapFilterService.getAllMarkerMaps()).then(function (markers) {
                expect(markers).toEqual([markerMapOne]);
                done();
            });
            scope.$apply();
        });
    });
});

