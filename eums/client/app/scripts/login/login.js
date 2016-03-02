'use strict';

angular.module('EumsLogin', ['eums.config'])
    .controller('EumsLoginController', function ($rootScope, $scope, $http, $q, EumsConfig) {

        init();

        function init() {
            getSettings().then(function (data) {
                var country = data.country_name;
                $rootScope.countryLabel = $scope.countryLabel = country ? ' | ' + country : country;
            });
        }

        function getSettings() {
            var result = $q.defer();
            $http.get(EumsConfig.BACKEND_URLS.LOGIN_DATA).then(function (response) {
                result.resolve(response.data);
            }, function () {
                result.reject();
            });
            return result.promise;
        }
    });
