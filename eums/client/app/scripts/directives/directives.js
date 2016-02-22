'use strict';

angular.module('Directives', ['eums.ip', 'SysUtils'])
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
    .directive('searchFromList', function (IPService, $timeout, SysUtilsService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var list;
                if (attrs.list == '$districts') {
                    IPService.loadAllDistricts().then(function (response) {
                        list = response.data.map(function (district) {
                            return {id: district, name: district};
                        });
                    });
                } else {
                    list = JSON.parse(attrs.list);
                }

                element.select2({
                    width: '100%',
                    allowClear: true,
                    placeholder: attrs.placeholder || 'All Districts',
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
                        SysUtilsService.whenAvailable(function () {
                            return list;
                        }, function () {
                            var matchingItem = list.filter(function (item) {
                                return item.id === ngModel.$modelValue;
                            })[0];
                            if (matchingItem) {
                                callback({id: matchingItem.id, text: matchingItem.name});
                            } else {
                                callback({});
                            }
                        });
                    }
                });

                element.change(function () {
                    var data = element.select2('data');
                    ngModel.$setViewValue(data && data.id);
                    scope.$apply()
                });

                scope.$watch(function () {
                    return scope.$parent.$eval(attrs.ngModel);
                }, function (newValue, oldValue) {
                    $(element).select2('val', newValue ? newValue : '');
                });

                attrs.$observe('placeholder', function (newValue) {
                    if (!$(element).val()) {
                        $(element).siblings('div').find('a span.select2-chosen').text(newValue);
                        $(element).attr('placeholder', newValue);
                    }
                });

                scope.$on('clear-location', function () {
                    var select2Input = $(element).siblings('div').find('a span.select2-chosen');
                    select2Input.text('');
                    $(element).val(undefined).trigger('change');
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
            return {id: contact._id, fullName: contact.firstName + ' ' + contact.lastName, phone: contact.phone};
        }

        function formatResponse(data) {
            return data.map(function (contact) {
                return formatContact(contact);
            });
        }

        function contactFormatResult(item) {
            var markup =
                '<div class="row-fluid">' +
                '<div class="span3">' + item.fullName + '</div>' +
                '<div class="span3 text-warning"><small><i>' + item.phone + '</i></small></div>' +
                '</div>';
            return markup;
        }

        function contactFormatSelection(item) {
            return item.fullName;
        }

        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.select2({
                    placeholder: attrs.placeholder || 'All Contacts',
                    allowClear: true,
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
                            } else {
                                callback({});
                            }
                        });
                    },
                    formatResult: contactFormatResult,
                    formatSelection: contactFormatSelection,
                    dropdownCssClass: "bigdrop",
                    escapeMarkup: function (m) {
                        return m;
                    }
                });

                element.change(function () {
                    var contact = $(element).select2('data');
                    ngModel.$setViewValue(contact && contact.id);
                    $(element).siblings("div").attr('title', contact && contact.phone);
                    scope.$apply();
                });

                scope.$watch(function () {
                    return scope.$parent.$eval(attrs.ngModel);
                }, function (newValue, oldValue) {
                    $(element).select2('val', newValue ? newValue : '');
                });

                scope.$on('clear-contact', function () {
                    $(element).select2('val', '');
                });

                scope.$on('set-contact-for-node', function (_, contact, nodeId) {
                    var myNodeId = element[0].getAttribute('id').split('-').last();
                    if (Number(nodeId) === Number(myNodeId)) {
                        var contactSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                        var formattedContact = formatContact(contact);
                        contactSelect2Input.text(formattedContact.fullName);
                        $(element).val(formattedContact.id);
                    }
                });

                scope.$on('set-contact-for-single-ip', function (_, contact) {
                    var contactSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    var formattedContact = formatContact(contact);
                    contactSelect2Input.text(formattedContact.fullName);
                    $(element).val(formattedContact.id);
                });

                scope.$on('set-contact', function (_, contactId) {
                    $(element).select2('val', [contactId]);
                });
            }
        };
    })
    .directive('searchConsignees', function ($timeout, ConsigneeService) {
        function formatConsignee(consignee) {
            return Object.merge(consignee, {text: _([consignee.customerId, consignee.location]).compact().join(' | ')});
        }

        function formatResponse(data) {
            return data.map(function (contact) {
                return formatConsignee(contact);
            });
        }

        function consigneeFormatResult(item) {
            var markup =
                '<div class="row-fluid">' +
                '<div class="span3">' + item.name + '</div>' +
                '<div class="span3 text-warning"><small><i>' + item.text + '</i></small></div>' +
                '</div>';
            return markup;
        }

        function consigneeFormatSelection(item) {
            return item.name;
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
                    allowClear: true,
                    placeholder: attrs.placeholder || 'All Consignees',
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
                            if (modelValue) {
                                ConsigneeService.get(modelValue).then(function (consignee) {
                                    callback(formatConsignee(consignee));
                                });
                            } else {
                                callback({});
                            }
                        });
                    },
                    formatResult: consigneeFormatResult,
                    formatSelection: consigneeFormatSelection,
                    dropdownCssClass: "bigdrop",
                    escapeMarkup: function (m) {
                        return m;
                    }
                });

                element.change(function () {
                    var consignee = $(element).select2('data');
                    ngModel.$setViewValue(consignee && consignee.id);
                    $(element).siblings("div").attr('title', consignee && consignee.text);
                    scope.$apply();
                });

                scope.$on('clear-consignee', function () {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text('');
                    $(element).val(undefined).trigger('change');
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
    .directive('selectIP', function ($timeout, ProgrammeService, DeliveryService, ConsigneeService) {
        function formatConsignee(consignee) {
            return Object.merge(consignee, {text: _([consignee.customerId, consignee.location]).compact().join(' | ')});
        }

        function formatResponse(data) {
            return data.map(function (contact) {
                return formatConsignee(contact);
            });
        }

        function consigneeFormatResult(item) {
            var markup =
                '<div class="row-fluid">' +
                '<div class="span3">' + item.name + '</div>' +
                '<div class="span3 text-warning"><small><i>' + item.text + '</i></small></div>' +
                '</div>';
            return markup;
        }

        function consigneeFormatSelection(item) {
            return item.name;
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.select2({
                    allowClear: true,
                    placeholder: 'All Implementing Partners',
                    query: function (query) {
                        var data = {results: []};
                        ConsigneeService.search(query.term, [], {type: 'IMPLEMENTING_PARTNER'}).then(function (resultConsignees) {
                            data.results = formatResponse(resultConsignees);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            if (modelValue) {
                                ConsigneeService.get(modelValue).then(function (consignee) {
                                    callback(formatConsignee(consignee));
                                });
                            } else {
                                callback({});
                            }
                        });
                    },
                    formatResult: consigneeFormatResult,
                    formatSelection: consigneeFormatSelection,
                    dropdownCssClass: "bigdrop",
                    escapeMarkup: function (m) {
                        return m;
                    }
                });

                element.change(function () {
                    var consignee = $(element).select2('data');
                    ngModel.$setViewValue(consignee && consignee.id);
                    $(element).siblings("div").attr('title', consignee && consignee.text);
                    scope.$apply();
                });

                scope.$on('clear-consignee', function () {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text('');
                    $(element).val(undefined).trigger('change');
                });

                scope.$on('set-consignee', function (_, consignee) {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text(consignee.name);
                    $(element).val(consignee.id);
                });
            }
        }
    })
    //TODO Remove this directive. Make use of the one in the Programme module
    .directive('searchProgrammes', function (ProgrammeService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ProgrammeService.programmesWithIps().then(function (response) {
                    scope.directiveValues.allProgrammes = response.map(function (programe) {
                        return {id: programe.id, text: programe.name, ips: programe.ips}
                    });
                    scope.displayProgrammes = scope.directiveValues.allProgrammes;
                }).then(function () {
                    scope.populateProgrammesSelect2(scope.displayProgrammes);
                });

                scope.populateProgrammesSelect2 = function (displayProgrammes) {
                    $(element).select2({
                        placeholder: 'All Outcomes',
                        allowClear: true,
                        data: displayProgrammes
                    });
                };

                $(element).change(function () {
                    var programme = $(element).select2('data');
                    ngModel.$setViewValue(programme && String(programme.id));
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
                    ngModel.$setViewValue(String($(elem).select2('data').id));
                    scope.$apply();
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
    })
    .directive('selectRecipientType', function () {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                Promise.resolve([
                        {id: 'IMPLEMENTING_PARTNER', text: 'IP'},
                        {id: 'MIDDLE_MAN', text: 'Sub-consignee'},
                        {id: 'END_USER', text: 'End-user'}])
                    .then(function (treePositions) {
                        return treePositions;
                    }).then(function (data) {
                    $(elem).select2({
                        placeholder: 'Recipient Type',
                        allowClear: true,
                        data: data
                    });
                });

                elem.change(function () {
                    var recipientType = $(elem).select2('data');
                    ngModel.$setViewValue(recipientType && recipientType.id);
                    scope.$apply();
                });
            }
        }
    })
    .directive('selectOption', function (OptionService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                var optionAttrs = attrs.selectOption.split(' ');
                var deliveryOptionService = OptionService.getService(optionAttrs[0], optionAttrs[1]);
                deliveryOptionService().then(function (options) {
                    var originOptions = _.uniq(options, function (option) {
                        return option.text;
                    });
                    return _.reject(originOptions, function (option) {
                        return option.text == 'UNCATEGORISED';
                    });
                }).then(function (data) {
                    $(elem).select2({
                        placeholder: attrs.placeholder || '',
                        allowClear: true,
                        data: data
                    });
                });

                elem.change(function () {
                    var option = $(elem).select2('data');
                    ngModel.$setViewValue(option && option.text);
                    scope.$apply();
                });
            }
        }
    })
    .directive('selectMultipleIps', function (ProgrammeService, DeliveryService, ConsigneeService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ConsigneeService.filter({type: 'IMPLEMENTING_PARTNER'}).then(function (displayedData) {
                    scope.allIps = displayedData.map(function (consignee) {
                        return {id: consignee.id, text: consignee.name}
                    });
                    scope.displayIps = scope.allIps;
                    populateIpsSelect2(scope.displayIps);
                });

                function populateIpsSelect2(displayIps) {
                    $(element).select2({
                        placeholder: attrs.placeholder || 'All Implementing Partners',
                        allowClear: true,
                        multiple: 'multiple',
                        data: _.sortBy(displayIps, function (ip) {
                            return ip.text;
                        })
                    });
                }

                scope.clearMultipleIps = function () {
                    var consigneeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    consigneeSelect2Input.text('');
                    $(element).val(undefined).trigger('change');
                };

                scope.setMultipleIps = function (ids) {
                    $(element).val(ids).trigger('change');
                };

                element.change(function () {
                    var consignees = $(element).select2('data');
                    var ids = consignees.map(function (consignee) {
                        return consignee.id;
                    });
                    ngModel.$setViewValue(ids);
                    scope.$apply();
                });
            }
        }
    });
