'use strict';

angular.module('IpDelivery', ['eums.config', 'ngTable', 'siTable', 'Loader', 'User'])
    .controller('IpDeliveryController', function ($scope, DeliveryService, LoaderService, UserService) {
        LoaderService.showLoader();

        $scope.deliveries = [];
        $scope.isConfirmingDelivery = false;

        DeliveryService.all().then(function (deliveries) {
            $scope.deliveries = deliveries;
            LoaderService.hideLoader();
        });

        UserService.retrieveUserPermissions().then(function (userPermissions) {
            $scope.canConfirm = _isSubarray(userPermissions, [
                "auth.can_view_distribution_plans",
                "auth.can_add_textanswer",
                "auth.change_textanswer",
                "auth.add_nimericanswer",
                "auth.change_nimericanswer"
            ]);
        });

        $scope.confirm = function() {
            $scope.isConfirmingDelivery = true;
        };

        function _isSubarray(mainArray, testArray) {
            var found = [];
            testArray.forEach(function (element) {
                if (mainArray.indexOf(element) != -1) {
                    found.add(element)
                }
            });

            return found.length === testArray.length;
        }
    });


