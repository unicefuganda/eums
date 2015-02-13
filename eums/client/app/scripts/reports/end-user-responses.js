'use strict';

angular.module('EndUserResponses', ['eums.config', 'DistributionPlan', 'Programme', 'Consignee', 'Item'])
    .controller('EndUserResponsesController',function ($scope, DistributionPlanService, ProgrammeService, ConsigneeService, ItemService) {
        $scope.allResponses = [];
        $scope.filteredResponses = [];
        $scope.programmeResponses = [];
        $scope.consigneeResponses = [];
        $scope.itemResponses = [];
        $scope.programmes = [{id: 0, name: 'All Outcomes'}];
        $scope.consignees = [{id: 0, name: 'All Implementing Partners'}];
        $scope.items = [{id: 0, description: 'All Items'}];

        $scope.initialize = function () {
            ProgrammeService.fetchProgrammes().then(function (result) {
                var programmes = result.data;
                $scope.programmes = $scope.programmes.concat(programmes);
            });

            ConsigneeService.fetchConsignees().then(function (consignees) {
                $scope.consignees = $scope.consignees.concat(consignees);
            });

            ItemService.fetchItems().then(function (items) {
                $scope.items = $scope.items.concat(items);
            });

            DistributionPlanService.getAllEndUserResponses().then(function (allResponses){
                $scope.allResponses = allResponses.data;
                $scope.programmeResponses = $scope.allResponses;
                $scope.consigneeResponses = $scope.allResponses;
                $scope.itemResponses = $scope.allResponses;
            });
        };

        function setFilteredResponses(){
            $scope.filteredResponses = _.intersection($scope.programmeResponses, $scope.consigneeResponses, $scope.itemResponses);
        }

        $scope.selectProgramme = function () {
            $scope.programmeResponses = $scope.allResponses;
            if (Boolean($scope.selectedProgramme.id)) {
                $scope.programmeResponses = $scope.allResponses.filter(function (end_user_response) {
                    return parseInt(end_user_response.programme.id) === parseInt($scope.selectedProgramme.id);
                });
            }
            setFilteredResponses();
        };

        $scope.selectConsignee = function () {
            $scope.consigneeResponses = $scope.allResponses;
            if (Boolean($scope.selectedConsignee.id)) {
                $scope.consigneeResponses = $scope.allResponses.filter(function (end_user_response) {
                    return parseInt(end_user_response.consignee.id) === parseInt($scope.selectedConsignee.id);
                });
            }
            setFilteredResponses();
        };

        $scope.selectItem = function () {
            $scope.itemResponses = $scope.allResponses;
            if (Boolean($scope.selectedItem.id)) {
                $scope.itemResponses = $scope.allResponses.filter(function (end_user_response) {
                    return end_user_response.item === $scope.selectedItem.description;
                });
            }
            setFilteredResponses();
        };
    });