angular.module('SysUtils', [])
    .factory('SysUtilsService', function () {
        return {
            formatDate: function (date) {
                try {
                    var result = "";
                    if (date.trim()) {
                        result = moment(date.trim()).format('DD-MMM-YYYY')
                    }
                    if (result == "Invalid date") {
                        result = moment(date.trim(),"DD-MM-YYYY").format('DD-MMM-YYYY')
                    }
                    return result;
                } catch (err) {
                    return "";
                }
            }
        }
    });
