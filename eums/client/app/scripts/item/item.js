'use strict';

angular.module('Item', ['eums.config', 'eums.service-factory'])
    .factory('Item', function () {
        return function (json) {
            !json && (json = {});
            this.id = json.id || '';
            this.description = json.description || '';
            this.unit = json.unit || {name: 'Each'};
            this.materialCode = json.materialCode;
        };
    }).factory('ItemUnitService', function (ServiceFactory, EumsConfig) {
        return ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.ITEM_UNIT});
    }).factory('ItemService', function ($http, EumsConfig, ServiceFactory, Item, ItemUnitService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.ITEM,
            propertyServiceMap: {unit: ItemUnitService},
            model: Item
        });
    }).directive('searchItems', function (ItemService, $timeout) {
        function formatItem(item) {
            return Object.merge(item, {text: item.materialCode + '/' + item.description});
        }

        function formatResponse(data) {
            return data.map(function (item) {
                return formatItem(item);
            });
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.select2({
                    minimumInputLength: 1,
                    allowClear: true,
                    placeholder: "Select an item",
                    query: function (query) {
                        var data = {results: []};
                        ItemService.search(query.term, []).then(function (items) {
                            data.results = formatResponse(items);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            modelValue && ItemService.get(modelValue).then(function (item) {
                                callback(formatItem(item));
                            });
                        });
                    }
                });

                element.change(function () {
                    var item = $(element).select2('data');
                    ngModel.$setViewValue(item && item.id);
                });

                scope.$on('clear-item', function () {
                    var itemSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    itemSelect2Input.text('');
                    $(element).val(undefined).trigger('change');
                });

                scope.$on('set-item', function (_, item) {
                    var itemSelect2Input = $(element).siblings('div').find('a span.select2-chosen');
                    itemSelect2Input.text(item.description);
                    $(element).val(item.id);
                });
            }
        };

    });

