'use strict';

angular.module('Programme', ['eums.config', 'eums.service-factory'])
    .factory('ProgrammeService', function ($http, EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PROGRAMME,
            methods: {
                programmesWithIps: function (nestedFields) {
                    return this._listEndpointMethod('with-ips/', nestedFields);
                }
            }
        });
    }).directive('searchProgrammesBetter', function (ProgrammeService, $timeout) {
        function formatProgramme(programme) {
            return Object.merge(programme, {text: programme.name});
        }

        function formatResponse(data) {
            return data.map(function (programme) {
                return formatProgramme(programme);
            });
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.select2({
                    minimumInputLength: 1,
                    allowClear: true,
                    placeholder: "Select an outcome",
                    query: function (query) {
                        var data = {results: []};
                        ProgrammeService.search(query.term, []).then(function (programmes) {
                            data.results = formatResponse(programmes);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            modelValue && ProgrammeService.get(modelValue).then(function (programme) {
                                callback(formatProgramme(programme));
                            });
                        });
                    }
                });

                element.change(function () {
                    var programme = $(element).select2('data');
                    ngModel.$setViewValue(programme && programme.id);
                });

                scope.$on('clear-programme', function () {
                    var programmeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    programmeSelect2Input.text('');
                    $(element).val(undefined).trigger('change');
                });

                scope.$on('set-programme', function (_, programme) {
                    var programmeSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    programmeSelect2Input.text(programme.name);
                    $(element).val(programme.id);
                });
            }
        };

    });