angular.module('Sort', [])
    .service('SortService', function () {
        var ORDER = ['desc', 'asc', null],
            INITIAL_ORDER = ORDER[0];
        return {
            sortBy: function (sortField, sortOptions) {
                if (sortOptions.field === sortField) {
                    var orderIndex = ORDER.indexOf(sortOptions.order);
                    sortOptions.order = ORDER[(orderIndex + 1) % ORDER.length];
                } else {
                    sortOptions.field = sortField;
                    sortOptions.order = INITIAL_ORDER;
                }

                if (!sortOptions.order) {
                    sortOptions = {};
                }
                return sortOptions;
            }
        }
    });
