'use strict';

angular.module('DatePicker', []).directive('eumsDatePicker', function () {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope) {

            // Disable weekend selection
            scope.disabled = function (date, mode) {
                return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
            };

            scope.isDatePickerOpen = false;

            scope.open = function ($event, type) {
                $event.preventDefault();
                $event.stopPropagation();
                angular.forEach(scope.datepicker, function (item, index) {
                    scope.datepicker[index] = false;
                });
                scope.datepicker = scope.datepicker || {};
                scope.datepicker[type] = true;
                scope.isDatePickerOpen = true;
            };

            scope.$watchCollection('datepicker', function (newValue, oldValue) {
                var date_has_changed = !Object.equal(newValue, oldValue);
                if(date_has_changed && (!newValue.from && !newValue.to)){
                    scope.isDatePickerOpen = false;
                }
            }, true);

            scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };
            scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            scope.format = scope.formats[0];
        }
    };
});