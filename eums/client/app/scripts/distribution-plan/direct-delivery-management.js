'use strict';


angular.module('DirectDeliveryManagement', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives'])
    .controller('DirectDeliveryManagementController', function ($scope, $location, DistributionPlanService, ProgrammeService, PurchaseOrderService, UserService, $sorter) {

        $scope.showSingleIpMode = function() {
            $scope.inSingleIpMode = true;
            $scope.inMultipleIpMode = false;
        }

        $scope.showMultipleIpMode = function() {
            $scope.inMultipleIpMode = true;
            $scope.inSingleIpMode = false;
        }

    });

