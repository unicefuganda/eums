'use strict';

angular.module('Item', ['eums.config'])
    .factory('ItemService', function($http, EumsConfig) {
        var getItemUnit = function(itemUnitId) {
            return $http.get(EumsConfig.BACKEND_URLS.ITEM_UNIT + itemUnitId + '/');
        };

        var fillOutItemUnit= function(item) {
            return getItemUnit(item.unit).then(function(response) {
                item.unit = response.data;
                return item;
            });
        };

        return {
            getItemDetails: function(itemId) {
                var getItemPromise = $http.get(EumsConfig.BACKEND_URLS.ITEM + itemId + '/');
                return getItemPromise.then(function(response) {
                    var item = response.data;
                    return fillOutItemUnit(item);
                });
            }
        };
    });

