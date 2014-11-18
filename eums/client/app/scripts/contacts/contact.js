'use strict';

angular.module('Contact', ['eums.config', 'ngTable', 'siTable', 'ui.bootstrap', 'ngToast'])
    .controller('ContactController', function (ContactService, $scope, $sorter, ngToast) {
        $scope.contacts = [];
        $scope.sortBy = $sorter;
        $scope.currentContact = {};
        $scope.contact = {};

        function loadContacts() {
            ContactService.getAllContacts().then(function (allContacts) {
                $scope.contacts = allContacts.sort();
            });
        }

        $scope.initialize = function () {
            this.sortBy('firstName');
            this.sort.descending = false;
            loadContacts.call(this);
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

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }

        $scope.invalidContact = function (contact) {
            return !(contact.firstName && contact.lastName && contact.phone);
        };

        $scope.showAddContact = function () {
            angular.element('#add-contact-modal').modal();
        };

        $scope.showDeleteContact = function (contact) {
            $scope.currentContact = contact;
            angular.element('#delete-contact-modal').modal();
        };

        $scope.showEditContact = function (contact) {
            angular.copy(contact, $scope.currentContact);
            angular.element('#edit-contact-modal').modal();
        };

        $scope.saveContact = function () {
            ContactService.addContact($scope.contact).then(function () {
                angular.element('#add-contact-modal').modal('hide');
                loadContacts();
                $scope.contact = {};

            }, function (response) {
                if(response.status === 0){
                    createToast('Contact service down', 'danger');
                }
                else {
                    createToast(response.data.error, 'danger');
                }
            });
        };

        $scope.deleteSelectedContact = function () {
            ContactService.deleteContact($scope.currentContact).then(function () {
                var index = $scope.contacts.indexOf($scope.currentContact);
                $scope.contacts.splice(index, 1);
                $scope.currentContact = {};
                angular.element('#delete-contact-modal').modal('hide');
            });
        };

        $scope.editContact = function (contact) {
            ContactService.editContact(contact).then(function () {
                angular.element('#edit-contact-modal').modal('hide');
                loadContacts();
                $scope.currentContact = {};
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
            },
            editContact: function (contact) {
                return $http.put(EumsConfig.CONTACT_SERVICE_URL, contact).then(function (response) {
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