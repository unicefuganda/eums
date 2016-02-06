'use strict';

angular.module('Consignee', ['eums.config', 'eums.service-factory', 'ngToast', 'ui.bootstrap', 'Loader', 'User'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1});
    }])
    .factory('Consignee', function () {
        return function (json) {
            !json && (json = {});
            Object.defineProperty(this, 'inFullyEditMode', {
                get: function () {
                    if (this._inFullyEditMode) {
                        return true;
                    }
                    return this.id === undefined || this.id === null;
                }.bind(this)
            });

            Object.defineProperty(this, 'isEditingRemarks', {
                get: function () {
                    if (this._isEditingRemarks) {
                        return true;
                    }
                    return this.id === undefined || this.id === null;
                }.bind(this)
            });

            Object.defineProperty(this, 'isEditingLocation', {
                get: function () {
                    if (this._isEditingLocation) {
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
            this.createdByUser = json.createdByUser || null;
            this.itemPermission = null;

            this._inFullyEditMode = false;
            this._isEditingRemarks = false;
            this._isEditingLocation = false;

            this.switchToFullyEditMode = function () {
                this._inFullyEditMode = true;
                this._isEditingRemarks = true;
                this._isEditingLocation = true;
            };
            this.switchToEditRemarksMode = function () {
                this._inFullyEditMode = false;
                this._isEditingRemarks = true;
                this._isEditingLocation = false;
            };
            this.switchToEditLocationAndRemarksMode = function () {
                this._inFullyEditMode = false;
                this._isEditingRemarks = true;
                this._isEditingLocation = true;
            };
            this.switchToReadMode = function () {
                if (!this.id) {
                    throw new Error('cannot switch consignee without id to read mode');
                }
                this._inFullyEditMode = false;
                this._isEditingRemarks = false;
                this._isEditingLocation = false;
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
    .controller('ConsigneesController', function ($scope, $q, $timeout, ngToast, ConsigneeService, Consignee, LoaderService, UserService) {
        var timer;
        var initializing = true;
        var CAN_EDIT_FULLY = 'can_edit_fully';
        var CAN_EDIT_REMARKS = 'can_edit_remarks';
        var CAN_EDIT_LOCATION_AND_REMARKS = 'can_edit_location_and_remarks';

        $scope.consignees = [];
        $scope.pagination = {page: 1};
        $scope.searchTerm = {};
        $scope.searching = false;

        init();

        $scope.$watchCollection('searchTerm', function (oldSearchTerm, newSearchTerm) {
            if (initializing) {
                loadConsignees();
                initializing = false;
            } else {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }

                if (oldSearchTerm.search != newSearchTerm.search) {
                    timer = $timeout(function () {
                        loadConsignees()
                    }, 2000);
                } else {
                    loadConsignees();
                }
            }
        });

        $scope.$on('consigneeDeleted', function (_, consignee) {
            $scope.consignees.remove(function (scopeConsignee) {
                return scopeConsignee.id === consignee.id;
            });
            createToast('Consignee deleted successfully', 'success');
        });

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            loadConsignees();
        };

        $scope.addConsignee = function () {
            $scope.consignees.insert(new Consignee(), 0);
        };

        $scope.save = function (consignee) {
            LoaderService.showLoader();
            var promise = {};
            if (consignee.id) {
                promise = ConsigneeService.update(consignee).then(function () {
                    consignee.switchToReadMode();
                }).catch(function () {
                    createToast('Failed to update consignee', 'danger');
                });
            }
            else {
                promise = ConsigneeService.create(consignee).then(function (createdConsignee) {
                    consignee.id = createdConsignee.id;
                }).catch(function () {
                    createToast('Failed to save consignee', 'danger');
                });
            }

            promise.finally(function () {
                $scope.originalConsignees = angular.copy($scope.consignees);
                LoaderService.hideLoader();
                getConsigneeItemPermission(consignee);
            })
        };

        $scope.edit = function (consignee) {
            ConsigneeService.userCanFullyEdit(consignee).then(function (responce) {
                if (responce.permission == CAN_EDIT_FULLY)
                    consignee.switchToFullyEditMode();
                else if (responce.permission == CAN_EDIT_REMARKS)
                    consignee.switchToEditRemarksMode();
                else if (responce.permission == CAN_EDIT_LOCATION_AND_REMARKS)
                    consignee.switchToEditLocationAndRemarksMode();
                else
                    consignee.switchToReadMode();
            }).catch(function () {
                consignee.switchToReadMode();
            });
        };

        $scope.cancelEditOrCreate = function (consignee) {
            if (consignee.id) {
                var originalObject = angular.copy($scope.originalConsignees.filter(function (item) {
                    return item.id == consignee.id;
                }).first());
                consignee.name = originalObject.name;
                consignee.location = originalObject.location;
                consignee.customerId = originalObject.customerId;
                consignee.remarks = originalObject.remarks;
                consignee.switchToReadMode();
            }
            else {
                $scope.consignees.remove(function (scopeConsignee) {
                    return scopeConsignee.id === consignee.id;
                });
            }
        };

        $scope.showDeleteDialog = function (consignee) {
            $scope.$broadcast('deleteConsignee', consignee);
        };

        function init() {
            var promises = [];
            promises.push(loadUserPermissions());
            $q.all(promises).then(function () {
                LoaderService.showLoader();
                loadConsignees();
            });
        }

        function loadUserPermissions() {
            return UserService.retrieveUserPermissions().then(function (permissions) {
                $scope.userPermissions = permissions;
                UserService.hasPermission("eums.add_consignee", $scope.userPermissions).then(function (result) {
                    $scope.can_add = result;
                });
                UserService.hasPermission("eums.change_consignee", $scope.userPermissions).then(function (result) {
                    $scope.can_change = result;
                });
                UserService.hasPermission("eums.delete_consignee", $scope.userPermissions).then(function (result) {
                    $scope.can_delete = result;
                });
            });
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }

        function loadConsignees() {
            LoaderService.showLoader();
            var allFilters = angular.extend({
                'paginate': 'true',
                'page': $scope.pagination.page
            }, getSearchTerms(), $scope.sortTerm);

            ConsigneeService.all(undefined, allFilters)
                .then(function (response) {
                    $scope.consignees = response.results;
                    $scope.originalConsignees = angular.copy(response.results);
                    $scope.count = response.count;
                    $scope.pageSize = response.pageSize;

                    response.results.forEach(function (responseConsignee) {
                        getConsigneeItemPermission(responseConsignee);
                    });
                })
                .catch(function () {
                    createToast('Failed to load consignees', 'danger');
                })
                .finally(function () {
                    LoaderService.hideLoader();
                    $scope.searching = false;
                });
        }

        function getConsigneeItemPermission(consignee) {
            ConsigneeService.userCanFullyEdit(consignee)
                .then(function (permissionResponse) {
                    var hasChangePermission =
                        permissionResponse.permission == CAN_EDIT_FULLY ||
                        permissionResponse.permission == CAN_EDIT_REMARKS ||
                        permissionResponse.permission == CAN_EDIT_LOCATION_AND_REMARKS;
                    consignee.itemPermission = hasChangePermission;
                })
                .catch(function (result) {
                    throw new Error('Retrieve item based permission info failed' + result);
                });
        }

        function getSearchTerms() {
            var filters = _($scope.searchTerm).omit(_.isUndefined).omit(_.isNull).value();
            return filters;
        }
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