'use strict';

angular.module('EumsLogin', ['eums.config'])
    .controller('EumsLoginController', function ($rootScope, $scope, EumsLoginService) {

        init();

        function init() {
            EumsLoginService.getSettings().then(function (data) {
                var country = data.country_name;
                $rootScope.countryLabel = $scope.countryLabel = country ? ' | ' + country : country;
            });
        }

    })
    .factory("EumsLoginService", function ($http, $q, EumsConfig) {
        return {
            getSettings: function () {
                var result = $q.defer();
                $http.get(EumsConfig.BACKEND_URLS.LOGIN_DATA).then(function (response) {
                    result.resolve(response.data);
                }, function () {
                    result.reject();
                });
                return result.promise;
            }
        };
    });
