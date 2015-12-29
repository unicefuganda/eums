'use strict';

angular.module('User', ['eums.config', 'NavigationTabs'])
    .factory('UserService', function ($http, $q, EumsConfig) {
        var currentUser;
        return {
            getCurrentUser: function () {
                if (!currentUser) {
                    return $http.get('/api/current-user/').then(function (response) {
                        currentUser = response.data;
                        return currentUser;
                    });
                }
                var deferred = $q.defer();
                deferred.resolve(currentUser);
                return deferred.promise;
            },
            checkUserPermission: function (permission) {
                return $http.get('/api/permission?permission=' + permission).then(function () {
                    return true;
                }).catch(function () {
                    return false;
                });
            },
            hasPermissionTo: function (permissionToCheck) {
                return this.retrieveUserPermissions().then(function (permissions) {
                    return (permissions.indexOf(permissionToCheck) > -1);
                });
            },
            retrieveUserPermissions: function () {
                return $http.get(EumsConfig.BACKEND_URLS.PERMISSION + '/all').then(function (result) {
                    return result.data;
                });
            }
        };
    })
    .controller('CreateUserController', function ($scope) {

        groupRolesBootstrap();

        function hideElement(element) {
            $(element).hide();
        }

        function showElement(element) {
            $(element).show();
        }

        function resetElementValue(element) {
            $(element).val('');
        }

        function disableFields(selector) {
            $('body').find(selector).prop('disabled', true);
        }

        function enableFields(selector) {
            $('body').find(selector).prop('disabled', false);
        }

        function groupRolesBootstrap() {
            var $consignee = $('#id_consignee'),
                $consignee_parent = $consignee.parent().parent();

            hideElement($consignee_parent);

            $('select.select-roles').on('change', function () {
                var $selected_role = $.trim($(this).find('option:selected').text());
                if ($selected_role.indexOf("Implementing Partner") != -1) {
                    showElement($consignee_parent);
                    enableFields('#id_consignee');
                } else {
                    hideElement($consignee_parent);
                    disableFields('#id_consignee');
                    resetElementValue($consignee);
                }
            });
        }
    });