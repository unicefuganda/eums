angular.module('SortBy', [])
    .service('SortByService', function () {


        var INITIAL_ORDER = 0;
        var SORT_STATUS = 3;
        var des;
        var field;
        var sortDes = [false, true, ''];

        return {
            sortedBy: function (sortTerm, sortField) {
                field = sortField;
                if(sortTerm.field === sortField) {
                    sortTerm.orderIndex = (sortTerm.orderIndex + 1) % SORT_STATUS;
                } else {
                    sortTerm.orderIndex = INITIAL_ORDER;
                    sortTerm.field = sortField;
                }

                des = sortDes[sortTerm.orderIndex];
                field = des === '' ? '' : field;

                return {des: des, field: field};
            }
        }
    });
