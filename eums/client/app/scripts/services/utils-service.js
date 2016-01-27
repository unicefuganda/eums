angular.module('SysUtils', [])
    .factory('SysUtilsService', function () {
        return {
            // todo: rename to "formatToReadableDate"
            formatDate: function (date) {
                try {
                    var result = "";

                    if (date.trim()) {
                        date = date.trim().replace(/\//g, "-");
                        result = moment(date).format('DD-MMM-YYYY')
                    }

                    if (result == "Invalid date") {
                        result = moment(date, "DD-MM-YYYY").format('DD-MMM-YYYY')
                    }

                    return result;
                } catch (err) {
                    return "";
                }
            },
            // todo: rename to processable data, formatToYmdDate
            formatDateToYMD: function (date) {
                // this function is extracted from the controllers
                //return moment(date).format('YYYY-MM-DD')
                return date && moment(date).format('YYYY-MM-DD');
            },
            capitalize: function (data) {
                if (data) {
                    return data.substring(0,1).toUpperCase() + data.substring(1).toLowerCase();
                }
            }
        }
    });
