'use strict';

angular.module('Contact', ['eums.config', 'eums.service-factory', 'ngTable', 'siTable', 'ui.bootstrap', 'ngToast'])
    .controller('ContactController', function (ContactService, $scope, $sorter, ngToast) {
        $scope.contacts = [];
        $scope.sortBy = $sorter;
        $scope.currentContact = {};
        $scope.contact = {};

        function loadContacts() {
            ContactService.all().then(function (allContacts) {
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

        $scope.invalidContact = function (contact) {
            return !(contact.firstName && contact.lastName && contact.phone);
        };

        $scope.showAddContact = function () {
            $scope.$broadcast('add-contact');
        };

        $scope.$on('contact-saved', function (contact) {
            loadContacts();
            $scope.contact.id = contact._id;
        });

        $scope.showDeleteContact = function (contact) {
            $scope.currentContact = contact;
            angular.element('#delete-contact-modal').modal();
        };

        $scope.showEditContact = function (contact) {
            angular.copy(contact, $scope.currentContact);
            $scope.$broadcast('edit-contact', contact);
        };

        $scope.$on('dialog-closed', function () {
            loadContacts();
        });

        $scope.deleteSelectedContact = function () {
            ContactService.del($scope.currentContact).then(function () {
                var index = $scope.contacts.indexOf($scope.currentContact);
                $scope.contacts.splice(index, 1);
                $scope.currentContact = {};
                angular.element('#delete-contact-modal').modal('hide');
            }).catch(function(reason) {
                ngToast.create({content: reason, class: 'danger'})
            });
        };

        $scope.update = function (contact) {
            ContactService.update(contact).then(function () {
                angular.element('#edit-contact-modal').modal('hide');
                loadContacts();
                $scope.currentContact = {};
            });
        };
    })
    .factory('ContactService', function ($http, EumsConfig, ServiceFactory, $q) {
        return ServiceFactory.create({
            uri: EumsConfig.CONTACT_SERVICE_URL,
            changeCase: false,
            idField: '_id',
            methods: {
                get: function (id) {
                    return $http.get(EumsConfig.CONTACT_SERVICE_URL + id + '/').then(function (response) {
                        return response.data;
                    }).catch(function () {
                        return undefined;
                    });
                },
                search: function (searchString) {
                    return this.filter({searchfield: searchString});
                },
                update: function (contact) {
                    return $http.put(EumsConfig.CONTACT_SERVICE_URL, contact).then(function (response) {
                        return response.data;
                    });
                },
                del: function (contact) {
                    var nodeFilterUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?contact_person_id=' + contact._id;
                    return $http.get(nodeFilterUrl).then(function (response) {
                        return response.data.length ? $q.reject('Cannot delete contact that has deliveries') : this._del(contact);
                    }.bind(this));
                }
            }
        });
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
    })
    .directive('eumsContact', function (ContactService, ngToast, $templateCache) {
        var createToast = function (message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        };
        var templateUrl = '/static/app/views/contacts/partials/add-general-contact-modal.html';

        return {
            restrict: 'E',
            templateUrl: templateUrl,
            link: function (scope) {
                scope.contact = {};
                var contactInput = $('#contact-phone'), isEdit = false;

                $templateCache.remove(templateUrl);

                contactInput.intlTelInput({
                    defaultCountry: 'auto',
                    geoIpLookup: function (callback) {
                        $.get('http://ipinfo.io', function () {
                        }, 'jsonp').always(function (resp) {
                            var countryCode = (resp && resp.country) ? resp.country : 'UG';
                            callback(countryCode);
                        });
                    },
                    utilsScript: '/static/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js'
                });

                scope.contactChanged = function () {
                    if ($.trim(contactInput.val()) && contactInput.intlTelInput('isValidNumber')) {
                        scope.contact.phone = contactInput.intlTelInput('getNumber');
                    } else {
                        scope.contact.phone = undefined;
                    }

                };

                scope.$on('add-contact', function (_, object, objectIndex) {
                    isEdit = false;
                    scope.contact = {};
                    scope.object = object;
                    scope.objectIndex = objectIndex;
                    contactInput.val('');
                    $('#add-contact-modal').modal();
                });

                scope.$on('edit-contact', function (_, contact) {
                    scope.contact = contact;
                    isEdit = true;
                    contactInput.intlTelInput('setNumber', contact.phone);
                    $('#add-contact-modal').modal();
                });

                scope.closeDialog = function () {
                    scope.$emit('dialog-closed');
                };

                scope.invalidContact = function (contact) {
                    return !(contact.firstName && contact.lastName && contact.phone);
                };

                var emitEvent = function (contact) {
                    scope.$emit('contact-saved', contact, scope.object, scope.objectIndex);
                    $('#add-contact-modal').modal('hide');
                };

                scope.saveContact = function (contact) {
                    if (isEdit) {
                        ContactService.update(contact)
                            .then(function (createdContact) {
                                createToast('Contact Updated!', 'success');
                                emitEvent(createdContact);
                            }, function (response) {
                                createToast(response.data.error, 'danger');
                            });
                    } else {
                        ContactService.create(contact)
                            .then(function (createdContact) {
                                createToast('Contact Saved!', 'success');
                                emitEvent(createdContact);
                            }, function (response) {
                                createToast(response.data.error, 'danger');
                            });
                    }
                };
            }
        };
    });