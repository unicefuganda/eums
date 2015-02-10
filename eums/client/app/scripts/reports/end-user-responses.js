'use strict';

angular.module('EndUserResponses', ['eums.config', 'DistributionPlan', 'Programme', 'Consignee', 'Item'])
    .controller('EndUserResponsesController',function ($scope, DistributionPlanService, ProgrammeService, ConsigneeService, ItemService) {
        $scope.allResponses = [];
        $scope.filteredResponses = [];
        $scope.programmeResponses = [];
        $scope.consigneeResponses = [];
        $scope.itemResponses = [];
        $scope.allProgramResponses = true;
        $scope.allConsigneeResponses = true;
        $scope.allItemResponses = true;
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
            });
        };

        function setFilteredResponses(){
            if (!$scope.allProgramResponses || !$scope.allConsigneeResponses || !$scope.allItemResponses){
                $scope.programmeResponses = $scope.allProgramResponses ? [] : $scope.programmeResponses;
                $scope.consigneeResponses = $scope.allConsigneeResponses ? [] : $scope.consigneeResponses;
                $scope.itemResponses = $scope.allItemResponses ? [] : $scope.itemResponses;
            }
            $scope.filteredResponses = _.union($scope.programmeResponses, $scope.consigneeResponses, $scope.itemResponses);
        }

        $scope.selectProgramme = function () {
            if (Boolean($scope.selectedProgramme.id)) {
                $scope.programmeResponses = $scope.allResponses.filter(function (end_user_response) {
                    return parseInt(end_user_response.programme.id) === parseInt($scope.selectedProgramme.id);
                });
                $scope.allProgramResponses = false;
            }
            else{
                $scope.programmeResponses = $scope.allResponses;
                $scope.allProgramResponses = true;
            }
            setFilteredResponses();
        };

        $scope.selectConsignee = function () {
            if (Boolean($scope.selectedConsignee.id)) {
                $scope.consigneeResponses = $scope.allResponses.filter(function (end_user_response) {
                    return parseInt(end_user_response.consignee.id) === parseInt($scope.selectedConsignee.id);
                });
                $scope.allConsigneeResponses = false;
            }
            else{
                $scope.consigneeResponses = $scope.allResponses;
                $scope.allConsigneeResponses = true;
            }
            setFilteredResponses();
        };

        $scope.selectItem = function () {
            if (Boolean($scope.selectedItem.id)) {
                $scope.itemResponses = $scope.allResponses.filter(function (end_user_response) {
                    return end_user_response.item === $scope.selectedItem.description;
                });
                $scope.allItemResponses = false;
            }
            else{
                $scope.itemResponses = $scope.allResponses;
                $scope.allItemResponses = true;
            }
            setFilteredResponses();
        };
    });