'use strict';

angular.module('User', ['eums.config'])
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

        function hideElements(elements) {
            for (var index = 0; index < elements.length; ++index) {
                $(elements[index]).hide();
            }
        }

        function showElements(elements) {
            for (var index = 0; index < elements.length; ++index) {
                $(elements[index]).show();
            }
        }

        function resetElementValue(elements) {
            for (var index = 0; index < elements.length; ++index) {
                $(elements[index]).val('');
            }
        }

        function addRequiredValidationRule(elements) {
            for (var index = 0; index < elements.length; ++index) {
                if ($(elements[index]).length <= 0)
                    continue;
                $(elements[index]).rules("add", {required: true});
            }
        }

        function disableFields(selector) {
            $('body').find(selector).prop('disabled', true);
        }

        function enableFields(selector) {
            $('body').find(selector).prop('disabled', false);
        }

        function groupRolesBootstrap() {
            var $consignee_element = $('#create-user-form #id_consignee');

            hideElements([$consignee_element.parent().parent()]);

            $('select.select-roles').on('change', function () {
                var $selected_role = $.trim($(this).find('option:selected').text());
                if ($selected_role.indexOf("Implementing Partner") != -1) {
                    showElements([$consignee_element.parent().parent()]);
                    enableFields('#id_consignee');
                } else {
                    disableFields('#create-user-form #id_consignee');
                    hideElements([$consignee_element.parent().parent()]);
                    resetElementValue([$consignee_element]);
                }
            });
        }
    });