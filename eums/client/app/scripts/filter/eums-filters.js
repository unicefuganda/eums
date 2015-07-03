'use strict';


angular.module('EumsFilters', [])
    .filter('orderFilter', function ($filter) {

        var contains = function (array, item) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].id === item.id)
                    return true;
            }
            return false;
        };

        var intersection = function (arrays) {
            var result = [], arraysLength = arrays.length;
            if (arrays.length == 0) {
                return result;
            }
            for (var k = 0; k < arrays[0].length; k++) {
                var item = arrays[0][k];
                if (!contains(result, item)) {
                    var j;
                    for (j = 1; j < arraysLength; j++) {
                        if (!contains(arrays[j], item)) break;
                    }
                    if (j === arraysLength) {
                        result.push(item);
                    }
                }
            }
            return result;
        };

        return function (orderArray, query, dateQuery, searchFields) {
            if (!query && !dateQuery || orderArray.length <= 0) {
                return orderArray
            }

            var filteredArrays = [];
            searchFields && searchFields.each(function (field) {
                var fieldObj = {};
                fieldObj[field] = field.toLowerCase().indexOf('date') > -1 ? dateQuery : query;
                var results = $filter('filter')(orderArray, fieldObj);
                filteredArrays.push(results);
            });
            return intersection(filteredArrays);
        };
    })