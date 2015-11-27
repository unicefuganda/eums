angular.module('SysUtils', [])
    .factory('UtilsService', function () {
        return {
            formatDate: function (date) {
                if (!date) {
                    return "";
                }
                return moment(date).format('DD-MMM-YYYY');
            }
        }
    });
