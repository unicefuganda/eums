'use strict';

angular.module('Directives', [])
    .directive('ordersTable', [function () {
        return {
            controller: 'DistributionPlanController',
            restrict: 'E',
            scope: {
                onSelect: '&',
                actionable: '@'
            },
            templateUrl: '/static/app/views/delivery/partials/view-sales-orders.html'
        };
    }])
    .directive('searchFromList', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var list = JSON.parse(attrs.list);
                element.select2({
                    width: '100%',
                    query: function (query) {
                        var data = {results: []};
                        var matches = list.filter(function (item) {
                            return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                        });
                        data.results = matches.map(function (match) {
                            return {
                                id: match.id,
                                text: match.name
                            };
                        });
                        query.callback(data);
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var matchingItem = list.filter(function (item) {
                                return item.id === ngModel.$modelValue;
                            })[0];
                            if (matchingItem) {
                                callback({id: matchingItem.id, text: matchingItem.name});
                            }
                        });
                    }
                });

                element.change(function () {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });

                scope.$on('clear-list', function () {
                    var select2Input = $(element).siblings('div').find('a span.select2-chosen');
                    select2Input.text('');
                    $(element).val(undefined);
                });

                scope.$on('set-location', function (_, location) {
                    var locationSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    locationSelect2Input.text(location.name);
                    $(element).val(location.id);
                });
            }
        };
    })
    .directive('searchContacts', function (ContactService, $timeout) {
        function formatContact(contact) {
            return {id: contact._id, text: contact.firstName + ' ' + contact.lastName};
        }

        function formatResponse(data) {
            return data.map(function (contact) {
                return formatContact(contact);
            });
        }

        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, element, _, ngModel) {
                element.select2({
                    minimumInputLength: 1,
                    width: '150px',
                    query: function (query) {
                        var data = {results: []};
                        ContactService.search(query.term).then(function (foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            if (modelValue) {
                                ContactService.get(modelValue).then(function (contact) {
                                    if (contact._id) {
                                        callback(formatContact(contact));
                                    }
                                });
                            }
                        });
                    }
                });

                element.change(function () {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });

                scope.$on('clear-contact', function () {
                    var contactSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    contactSelect2Input.text('');
                    $(element).val(undefined);
                });

                scope.$on('set-contact-for-node', function (_, contact, nodeId) {
                    var myNodeId = element[0].getAttribute('id').split('-').last();
                    if (Number(nodeId) === Number(myNodeId)) {
                        var contactSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                        var formattedContact = formatContact(contact);
                        contactSelect2Input.text(formattedContact.text);
                        $(element).val(formattedContact.id);
                    }
                });

                scope.$on('set-contact-for-single-ip', function (_, contact) {
                    var contactSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    var formattedContact = formatContact(contact);
                    contactSelect2Input.text(formattedContact.text);
                    $(element).val(formattedContact.id);
                });
            }
        };
    })
    .directive('searchConsignees', function (ConsigneeService, $timeout) {
        function formatConsignee(consignee) {
            var consigneeHasLocation = consignee.location && consignee.location.length;
            var consigneeDescription = consigneeHasLocation ? consignee.name + ' / ' + consignee.location : consignee.name;
            return Object.merge(consignee, {text: consigneeDescription});
        }

        function formatResponse(data) {
            return data.map(function (contact) {
                return formatConsignee(contact);
            });
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var filters = Object.has(attrs, 'onlyIps') ? {imported_from_vision: 'True'} : {};
                var queryParams = Object.merge({paginate: false}, filters);
                element.select2({
                    minimumInputLength: 1,
                    width: '240px',
                    query: function (query) {
                        var data = {results: []};
                        ConsigneeService.search(query.term, [], queryParams).then(function (consignees) {
                            data.results = formatResponse(consignees);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            modelValue && ConsigneeService.get(modelValue).then(function (consignee) {
                                callback(formatConsignee(consignee));
                            });
                        });
                    }
                });

                element.change(function () {
                    var consignee = $(element).select2('data');
                    ngModel.$setViewValue(consignee && consignee.id);
                    scope.$apply();
                });

                scope.$on('clear-consignee', function () {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text('');
                    $(element).val(undefined);
                });

                scope.$on('set-consignee-for-single-ip', function (_, consignee) {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text(consignee.name);
                    $(element).val(consignee.id);
                });

                scope.$on('set-consignee', function (_, consignee) {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text(consignee.name);
                    $(element).val(consignee.id);
                });
            }
        };
    })
    .directive('searchProgrammes', function (ProgrammeService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ProgrammeService.programmesWithIps().then(function (response) {
                    scope.progAndConsignees.allProgrammes = response.map(function (programe) {
                        return {id: programe.id, text: programe.name, ips: programe.ips}
                    });
                    scope.displayProgrammes = scope.progAndConsignees.allProgrammes;
                    scope.displayProgrammes;
                }).then(function () {
                    scope.populateProgrammesSelect2(scope.displayProgrammes);
                });

                scope.populateProgrammesSelect2 = function(displayProgrammes) {
                    $(element).select2({
                        placeholder: 'All Outcomes',
                        allowClear: true,
                        data: displayProgrammes
                    });
                }

                $(element).change(function () {
                    var programme = $(element).select2('data');
                    ngModel.$setViewValue(programme && programme.id);
                    scope.$apply();
                });

                scope.$on('clear-programme', function () {
                    var programmeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    programmeSelect2Input.text('');
                    $(element).val(undefined);
                });
                scope.$on('set-programme', function (_, programme) {
                    var programmeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    programmeSelect2Input.text(programme.name);
                    $(element).val(programme ? programme.id : undefined);
                });
            }
        };
    })
    .directive('selectProgram', function (ProgrammeService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, elem, ngModel) {
                ProgrammeService.programmesWithIps().then(function (response) {
                    return response.map(function (programe) {
                        return {id: programe.id, text: programe.name}
                    });
                }).then(function (data) {
                    $(elem).select2({
                        placeholder: 'All Outcomes',
                        allowClear: true,
                        data: data
                    });
                });

                elem.change(function () {
                    ngModel.$setViewValue($(elem).select2('data').id);
                    scope.$apply();
                });
            }
        }
    })
    .directive('selectIP', function (ProgrammeService, DeliveryService, ConsigneeService) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {

                ConsigneeService.filter({type: 'IMPLEMENTING_PARTNER'}).then(function (displayedData) {
                    scope.progAndConsignees.allIps = displayedData.map(function (consignee) {
                        return {id: consignee.id, text: consignee.name}
                    });
                    scope.displayIps = scope.progAndConsignees.allIps;
                    scope.populateIpsSelect2(scope.displayIps);
                });

                scope.populateIpsSelect2 = function(displayIps) {
                    $(element).select2({
                        placeholder: 'All Implementing Partners',
                        allowClear: true,
                        data: _.sortBy(displayIps, function (ip) {
                            return ip.text;
                        })
                    });
                }

                element.change(function () {
                    var consignee = $(element).select2('data');
                    ngModel.$setViewValue(consignee && consignee.id);
                    scope.$apply();
                });


                scope.$on('clear-consignee', function () {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text('');
                    $(element).val(undefined);
                });

                scope.$on('set-consignee', function (_, consignee) {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text(consignee.name);
                    $(element).val(consignee.id);
                });
            }
        }
    })
    .directive('onlyDigits', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attr, ngModelCtrl) {
                function inputValue(val) {
                    if (val) {
                        var digits = val.toString().replace(/[^0-9]/g, '');

                        if (digits.toString() !== val.toString()) {
                            ngModelCtrl.$setViewValue(digits);
                            ngModelCtrl.$render();
                        }
                        return parseInt(digits, 10);
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(inputValue);
            }
        };
    });


