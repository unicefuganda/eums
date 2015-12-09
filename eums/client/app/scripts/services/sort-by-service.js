angular.module('SortBy', [])
    .service('SortByService', function () {


        var INITIAL_ORDER = 0;
        var SORT_STATUS = 3;
        var des;
        var field;

        return {
            sortedBy: function (sortTerm, sortField) {
                field = sortField;
                if(sortTerm.field === sortField) {
                    sortTerm.orderIndex = (sortTerm.orderIndex + 1) % SORT_STATUS;
                } else {
                    sortTerm.orderIndex = INITIAL_ORDER;
                    sortTerm.field = sortField;
                }

                switch (sortTerm.orderIndex) {
                    case 0:
                        des = false;
                        break;
                    case 1:
                        des = true;
                        break;
                    default :
                        field = '';
                }
                return {des: des, field: field};
            }
        }
    });
