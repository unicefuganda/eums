'use strict';

angular.module('Contact', ['eums.config', 'eums.service-factory', 'ngTable', 'siTable',
        'ui.bootstrap', 'ngToast', 'Loader', 'Consignee', 'SystemSettingsService'])
    .controller('ContactController', function ($scope, $q, $sorter, ngToast, UserService, ContactService, LoaderService,
                                               ConsigneeService, SystemSettingsService) {
        $scope.contacts = [];
        $scope.sortBy = $sorter;
        $scope.currentContact = {};
        $scope.contact = {};
        $scope.currentUser = {};

        $scope.initialize = function () {
            this.sortBy('firstName');
            this.sort.descending = false;

            var promises = [];
            promises.push(loadUserPermissions());
            promises.push(loadCurrentUser());
            promises.push(SystemSettingsService.getSettingsWithDefault());
            $q.all(promises).then(function (returns) {
                LoaderService.showLoader();
                $scope.systemSettings = returns[2];
                loadContacts.call(this);
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

        $scope.invalidContact = function (contact) {
            return !(contact.firstName && contact.lastName && contact.phone);
        };

        $scope.showAddContact = function () {
            hideAdditionalInfo()
            $scope.$broadcast('add-contact');
        };

        $scope.showDeleteContact = function (contact) {
            $scope.currentContact = contact;
            angular.element('#delete-contact-modal').modal();
        };

        $scope.showEditContact = function (contact) {
            if (!angular.equals(contact, $scope.currentContact)) {
                angular.copy(contact, $scope.currentContact);
            }

            showAdditionalInfo();
            $scope.$broadcast('edit-contact', $scope.currentContact);
        };

        function showAdditionalInfo() {
            $scope.isAddtionalInfoVisiable = true;
        }

        function hideAdditionalInfo() {
            $scope.isAddtionalInfoVisiable = false;
        }

        $scope.deleteSelectedContact = function () {
            ContactService.del($scope.currentContact).then(function () {
                var index = $scope.contacts.indexOf($scope.currentContact);
                $scope.contacts.splice(index, 1);
                $scope.currentContact = {};
                ngToast.create({content: 'Contact deleted', class: 'success'});
            }).catch(function (reason) {
                ngToast.create({content: reason, class: 'danger'})
            }).finally(function () {
                angular.element('#delete-contact-modal').modal('hide');
            });
        };

        $scope.update = function (contact) {
            ContactService.update(contact).then(function () {
                angular.element('#edit-contact-modal').modal('hide');
                loadContacts();
                $scope.currentContact = {};
            });
        };

        $scope.$on('contact-saved', function (contact) {
            loadContacts();
            $scope.contact.id = contact._id;
        });

        $scope.$on('dialog-closed', function () {
            loadContacts();
        });

        function loadUserPermissions() {
            return UserService.retrieveUserPermissions().then(function (permissions) {
                $scope.userPermissions = permissions;
                UserService.hasPermission("auth.can_view_contacts", $scope.userPermissions).then(function (result) {
                    $scope.can_view_all = result;
                });
                UserService.hasPermission("auth.can_create_contacts", $scope.userPermissions).then(function (result) {
                    $scope.can_add = result;
                });
                UserService.hasPermission("auth.can_edit_contacts", $scope.userPermissions).then(function (result) {
                    $scope.can_change = result;
                });
                UserService.hasPermission("auth.can_delete_contacts", $scope.userPermissions).then(function (result) {
                    $scope.can_delete = result;
                });
                UserService.hasPermission("auth.can_view_users", $scope.userPermissions).then(function (result) {
                    $scope.can_view_users = result;
                });
            });
        }

        function loadCurrentUser() {
            return UserService.getCurrentUser().then(function (user) {
                $scope.currentUser = user;
            });
        }

        function loadContacts() {
            var promise = {};
            if ($scope.can_view_all) {
                promise = ContactService.all().then(function (resultContacts) {
                    $scope.contacts = resultContacts.sort();
                    convertIdToName($scope.contacts);
                });
            } else {
                promise = ContactService.findContacts($scope.currentUser.userid).then(function (resultContacts) {
                    $scope.contacts = resultContacts.sort();
                    convertIdToName($scope.contacts);
                });
            }

            promise.finally(function () {
                LoaderService.hideLoader();
            });
        }

        function convertIdToName(contacts) {
            convertIpIdToName(contacts);
            if ($scope.can_view_users) {
                convertUserIdToName(contacts);
            }
        }

        function convertIpIdToName(contacts) {
            contacts.forEach(function (contact) {
                var ipNames = [];
                contact.ips.forEach(function (id) {
                    ConsigneeService.get(id).then(function (ip) {
                        ipNames.push(ip.name);
                    })
                });
                contact.ipNames = ipNames;
            })
        }

        function convertUserIdToName(contacts) {
            contacts.forEach(function (contact) {
                if (!contact.createdByUserId) {
                    contact.createdByUserName = '';
                } else {
                    UserService.getUserById(contact.createdByUserId).then(function (user) {
                        contact.createdByUserName = getEntityName(user.groups[0]);
                    })
                }
            });
        }

        function getEntityName(group) {

            if (group.startsWith('UNICEF')) {
                return 'UNICEF';
            }
            return 'IP';
        }
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
                findContacts: function (currentUserId) {
                    return $http.get(EumsConfig.CONTACT_SERVICE_URL + '?createdbyuserid=' + currentUserId).then(function (response) {
                        return response.data;
                    }).catch(function () {
                        return undefined;
                    });
                },
                search: function (searchString) {
                    return this.filter(searchString ? {searchfield: searchString} : {});
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
    .directive('eumsContact', function (ContactService, UserService, ngToast, $templateCache) {
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
            replace: true,
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
                    UserService.getCurrentUser().then(function (user) {
                        isEdit = false;
                        scope.contact = {};
                        scope.contact.createdByUserId = user.userid;
                        scope.object = object;
                        scope.objectIndex = objectIndex;
                        contactInput.val('');
                        scope.clearMultipleIps();
                        scope.clearMultipleDistricts();
                        $('#model-name').text('Add Contact');
                        $('#add-contact-modal').modal();
                    });
                });

                scope.$on('edit-contact', function (_, contact) {
                    scope.contact = contact;
                    isEdit = true;
                    contactInput.intlTelInput('setNumber', contact.phone);
                    scope.setMultipleDistricts(contact.districts);
                    scope.setMultipleIps(contact.ips);
                    $('#model-name').text('Edit Contact');
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

                function buildPayload(contact) {
                    contact.districts = contact.districts ? contact.districts : '';
                    contact.ips = contact.ips ? contact.ips : [];
                }

                scope.saveContact = function (contact) {
                    buildPayload(contact);

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
                                createToast(response.error, 'danger');
                            });
                    }
                };
            }
        };
    });
