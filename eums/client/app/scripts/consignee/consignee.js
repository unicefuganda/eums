'use strict';

angular.module('Consignee', ['eums.config', 'eums.service-factory', 'ngToast'])
    .directive('searchConsignees', function (ConsigneeService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, _, ngModel) {
                ConsigneeService.filterByType('implementing_partner').then(function (allIps) {
                    element.select2({
                        width: '100%',
                        query: function (query) {
                            var data = {results: []};
                            var matches = allIps.filter(function (item) {
                                return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                            });

                            data.results = matches.map(function (match) {
                                return {id: match.id, text: match.name};
                            });
                            query.callback(data);
                        }
                    });

                    element.change(function () {
                        ngModel.$setViewValue(element.select2('data').id);
                        scope.$apply();
                    });
                });
            }
        };
    })
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
            this.id = json.id || undefined;
            this.name = json.name || null;
            this.customerId = json.customerId || null;
            this.location = json.location || null;
            this.importedFromVision = json.importedFromVision || false;
            this.remarks = json.remarks || null;

            this._inEditMode = false;
            this.switchToEditMode = function () {
                this._inEditMode = true;
            };
            this.switchToReadMode = function () {
                if (!this.id) {
                    throw new Error('cannot switch consignee without id to read mode');
                }
                this._inEditMode = false;
            };
        };
    })
    .factory('ConsigneeService', function ($http, EumsConfig, ServiceFactory, Consignee, $q) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.CONSIGNEE,
            model: Consignee,
            methods: {
                getTopLevelConsignees: function () {
                    //TODO return this.filter({node: 'top'});
                    return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + '?node=top').then(function (response) {
                        return response.data;
                    });
                },
                filterByType: function (type) {
                    //TODO call service.filter({search: type}) wherever this method is used
                    return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + '?search=' + type).then(function (response) {
                        return response.data;
                    });
                },
                del: function (consignee) {
                    if (!consignee.importedFromVision) {
                        return this.getDetail(consignee, 'deliveries/').then(function (deliveries) {
                            return deliveries.length ? $q.reject('Cannot delete consignee that has deliveries') : this._del(consignee);
                        }.bind(this));
                    }
                    return $q.reject('Cannot delete consignee imported from vision');
                }
            }
        });
    })
    .controller('ConsigneesController', function ($scope, ConsigneeService, Consignee, ngToast) {
        function createToast(message, klass) {
            ngToast.create({content: message, class: klass, maxNumber: 1, dismissOnTimeout: true});
        }

        function fetchConsignees() {
            ConsigneeService.all().then(function (consignees) {
                $scope.consignees = consignees;
            });
        }

        $scope.consignees = [];
        fetchConsignees();
        $scope.addConsignee = function () {
            $scope.consignees.insert(new Consignee(), 0);
        };
        $scope.save = function (consignee) {
            if (consignee.id) {
                ConsigneeService.update(consignee).then(function () {
                    consignee.switchToReadMode();
                });
            }
            else {
                ConsigneeService.create(consignee).then(function (createdConsignee) {
                    consignee.id = createdConsignee.id;
                });
            }
        };
        $scope.edit = function (consignee) {
            consignee.switchToEditMode();
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

        $scope.$watch('searchTerm', function (term) {
            if (term && term.length) {
                ConsigneeService.search(term).then(function (matches) {
                    $scope.consignees = matches;
                });
            }
            else {
                fetchConsignees();
            }
        });
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
            }).catch(function (reason) {
                createToast(reason, 'danger');
            }).finally(function () {
                angular.element('#delete-consignee-modal').modal('hide');
            });
        };
    });