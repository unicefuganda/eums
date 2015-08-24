'use strict';

angular.module('Consignee', ['eums.config', 'eums.service-factory', 'ngToast', 'ui.bootstrap', 'User'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1});
    }])
    .factory('Consignee', function () {
        return function (json) {
            !json && (json = {});
            Object.defineProperty(this, 'inEditMode', {
                get: function () {
                    if (this._inEditMode) {
                        return true;
                    }
                    return this.id === undefined || this.id === null;
                }.bind(this)
            });

            Object.defineProperty(this, 'inEditRemarkMode', {
                get: function () {
                    if (this._inEditRemarkMode) {
                        return true;
                    }
                    return this.id === undefined || this.id === null;
                }.bind(this)
            });

            Object.defineProperty(this, 'isValid', {
                get: function () {
                    return this.name && this.name.length;
                }.bind(this)
            });
            this.id = json.id || undefined;
            this.name = json.name || null;
            this.customerId = json.customerId || null;
            this.location = json.location || null;
            this.importedFromVision = json.importedFromVision || false;
            this.remarks = json.remarks || null;

            this._inEditMode = false;
            this._inEditRemarkMode = false;

            this.switchToEditMode = function () {
                this._inEditMode = true;
                this._inEditRemarkMode = true;
            };
            this.switchToEditRemarkMode = function () {
                this._inEditMode = false;
                this._inEditRemarkMode = true;
            };
            this.switchToReadMode = function () {
                if (!this.id) {
                    throw new Error('cannot switch consignee without id to read mode');
                }
                this._inEditMode = false;
                this._inEditRemarkMode = false;
            };
        };
    })
    .factory('ConsigneeService', function ($http, EumsConfig, ServiceFactory, Consignee) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.CONSIGNEE,
            model: Consignee,
            methods: {
                userCanFullyEdit: function (consignee) {
                    return this.getDetail(consignee, 'permission_to_edit');
                }
            }
        });
    })
    .
    controller('ConsigneesController', function ($scope, ConsigneeService, Consignee, ngToast, UserService) {
        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }

        function setScopeDataFromResponse(response) {
            $scope.consignees = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }

        function fetchConsignees() {
            return ConsigneeService.all([], {paginate: 'true'}).then(function (response) {
                setScopeDataFromResponse(response);
            });
        }

        function showLoader() {
            if (!angular.element('#loading').hasClass('in')) {
                angular.element('#loading').modal();
            }
        }

        function hideLoader() {
            angular.element('#loading').modal('hide');
            angular.element('#loading.modal').removeClass('in');
            angular.element('.modal-backdrop').remove();
        }

        $scope.consignees = [];
        $scope.searching = false;

        UserService.retrieveUserPermissions().then(function (permissions) {
            $scope.userPermissions = permissions;
        });

        showLoader();
        fetchConsignees().catch(function () {
            createToast('Failed to fetch consignees', 'danger');
        }).finally(hideLoader);

        $scope.hasPermissionTo = function (permissionToCheck) {
            if (permissionToCheck && $scope.userPermissions) {
                return ($scope.userPermissions.indexOf(permissionToCheck) > -1);
            } else {
                return false;
            }
        };

        $scope.addConsignee = function () {
            $scope.consignees.insert(new Consignee(), 0);
        };

        $scope.save = function (consignee) {
            showLoader();
            if (consignee.id) {
                ConsigneeService.update(consignee).then(function () {
                    consignee.switchToReadMode();
                }).catch(function () {
                    createToast('Failed to update consignee', 'danger');
                }).finally(hideLoader);
            }
            else {
                ConsigneeService.create(consignee).then(function (createdConsignee) {
                    consignee.id = createdConsignee.id;
                }).catch(function () {
                    createToast('Failed to save consignee', 'danger');
                }).finally(hideLoader);
            }
        };

        $scope.edit = function (consignee) {

            ConsigneeService.userCanFullyEdit(consignee).then(function () {
                consignee.switchToEditMode();
            }).catch(function (result) {
                consignee.switchToEditRemarkMode();
            });
        };

        $scope.$on('consigneeDeleted', function (_, consignee) {
            $scope.consignees.remove(function (scopeConsignee) {
                return scopeConsignee.id === consignee.id;
            });
            createToast('Consignee deleted successfully', 'success');
        });

        $scope.showDeleteDialog = function (consignee) {
            $scope.$broadcast('deleteConsignee', consignee);
        };

        $scope.cancelEditOrCreate = function (consignee) {
            if (consignee.id) {
                consignee.switchToReadMode();
            }
            else {
                $scope.consignees.remove(function (scopeConsignee) {
                    return scopeConsignee.id === consignee.id;
                });
            }
        };

        $scope.$watch('searchTerm', function (term) {
            if (term && term.length) {
                $scope.searching = true;
                ConsigneeService.search(term, [], {paginate: true}).then(function (response) {
                    setScopeDataFromResponse(response);
                }).catch(function () {
                    createToast('Search failed', 'danger');
                }).finally(function () {
                    $scope.searching = false;
                });
            }
            else {
                fetchConsignees();
            }
        });

        $scope.goToPage = function (page) {
            showLoader();
            var urlArgs = {paginate: 'true', page: page};
            if ($scope.searchTerm && $scope.searchTerm.length) {
                urlArgs = Object.merge(urlArgs, {search: $scope.searchTerm});
            }
            ConsigneeService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            }).catch(function () {
                createToast('Failed to load consignees', 'danger');
            }).finally(hideLoader);
        };
    })
    .controller('DeleteConsigneeController', function ($scope, ConsigneeService, ngToast) {
        function createToast(message, klass) {
            ngToast.create({content: message, class: klass, maxNumber: 1, dismissOnTimeout: true});
        }

        $scope.$on('deleteConsignee', function (_, consignee) {
            $scope.consignee = consignee;
            angular.element('#delete-consignee-modal').modal();
        });

        $scope.del = function (consignee) {
            ConsigneeService.del(consignee).then(function () {
                $scope.$emit('consigneeDeleted', consignee);
            }).catch(function (result) {
                createToast(result.data.detail, 'danger');
            }).finally(function () {
                angular.element('#delete-consignee-modal').modal('hide');
            });
        };
    })
    .controller('AddConsigneeController', function ($scope, ConsigneeService, ngToast, Consignee) {
        $scope.$on('add-consignee', function (_, object, objectIndex) {
            $scope.consignee = new Consignee();
            $scope.object = object;
            $scope.objectIndex = objectIndex;
            angular.element('#add-consignee-modal').modal();
        });

        $scope.save = function (consignee) {
            ConsigneeService.create(consignee).then(function (createdConsignee) {
                $scope.$emit('consignee-saved', createdConsignee, $scope.object, $scope.objectIndex);
                angular.element('#add-consignee-modal').modal('hide');
            }).catch(function (response) {
                ngToast.create({content: response.data.error, class: 'danger'});
            });
        };
    });