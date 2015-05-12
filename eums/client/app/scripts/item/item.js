'use strict';

angular.module('Item', ['eums.config', 'eums.service-factory'])
    .factory('ItemService', function($http, EumsConfig, ServiceFactory) {
        var ItemUnitService = ServiceFactory({uri: EumsConfig.BACKEND_URLS.ITEM_UNIT});

        var fillOutItemUnit= function(item) {
            return ItemUnitService.get(item.unit).then(function(itemUnit) {
                item.unit = itemUnit;
                return item;
            }).catch(function(response) {
                if(response.status === 404) {
                    item.unit = {id: 0, name: 'Each'};
                    return item;
                }
            });
        };

        return {
            getItemDetails: function(itemId) {
                var getItemPromise = $http.get(EumsConfig.BACKEND_URLS.ITEM + itemId + '/');
                return getItemPromise.then(function(response) {
                    var item = response.data;
                    return fillOutItemUnit(item);
                });
            },
            fetchItems: function() {
                return $http.get(EumsConfig.BACKEND_URLS.ITEM).then(function (response) {
                    return response.data;
                });
            }
        };
    });

