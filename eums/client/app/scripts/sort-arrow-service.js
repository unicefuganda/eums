angular.module('SortArrow', [])
    .service('SortArrowService', function() {
        return {
            setSortArrow: function (criteria , sortOptions) {

            var output = '';

            if (sortOptions.field === criteria) {
                if(sortOptions.order === 'desc') {
                    output = 'active glyphicon glyphicon-arrow-down';
                } else if (sortOptions.order === 'asc') {
                output = 'active glyphicon glyphicon-arrow-up';
                }
            return output;
            }
            }
        }
    });
