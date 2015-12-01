angular.module('SysUtils', [])
    .factory('SysUtilsService', function () {
        return {
            formatDate: function (date) {
                try {
                    return date.trim() ? moment(date.trim(), "DD-MM-YYYY").format('DD-MMM-YYYY') : "";
                } catch (err) {
                    return "";
                }
            }
        }
    });
