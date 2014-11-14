'use strict';

angular.module('Contact', ['eums.config', 'ngTable', 'siTable'])
    .controller('ContactController', function (ContactService, $scope, $sorter) {
        $scope.contacts = [];
        $scope.sortBy = $sorter;
        $scope.currentContact = null;

        $scope.initialize = function () {
            this.sortBy('firstName');
            this.sort.descending = false;

            ContactService.getAllContacts().then(function (allContacts) {
                $scope.contacts = allContacts.sort();
            });
        };

        $scope.sortArrowClass = function (criteria) {
            var output = '';

            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.showDeleteContact = function (contact) {
            $scope.currentContact = contact;
            $('#confirm-delete-modal').modal();
        };

        $scope.deleteSelectedContact = function () {
            ContactService.deleteContact($scope.currentContact).then(function () {
                var index = $scope.contacts.indexOf($scope.currentContact);
                $scope.contacts.splice(index, 1);
                $scope.currentContact = null;
                $('#confirm-delete-modal').modal('hide');
            });
        };
    })
    .factory('ContactService', function ($http, EumsConfig) {
        return {
            addContact: function (contact) {
                return $http.post(EumsConfig.CONTACT_SERVICE_URL, contact);
            },
            getContactById: function (id) {
                return $http.get(EumsConfig.CONTACT_SERVICE_URL + id + '/').then(function (response) {
                    return response.data;
                });
            },
            getContactsBySearchQuery: function (searchString) {
                return $http.get(EumsConfig.CONTACT_SERVICE_URL + '?searchfield=' + searchString).then(function (response) {
                    return response.data;
                });
            },
            getAllContacts: function () {
                return $http.get(EumsConfig.CONTACT_SERVICE_URL).then(function (response) {
                    return response.data;
                });
            },
            deleteContact: function (contact) {
                return $http.delete(EumsConfig.CONTACT_SERVICE_URL + contact._id + '/').then(function (response) {
                    return response.data;
                });
            }
        };
    })
    .filter('contactsFilter', function ($filter) {
        return function (contacts, query) {
            var results = $filter('filter')(contacts, {firstName: query});
            results = _.union(results, $filter('filter')(contacts, {lastName: query}));
            results = _.union(results, $filter('filter')(contacts, {phone: query}));
            return results;
        };
    })
    .factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    });