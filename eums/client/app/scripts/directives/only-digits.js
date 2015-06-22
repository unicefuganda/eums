angular.module('NewDistributionPlan').directive('onlyDigits', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attr, ngModelCtrl) {
            function inputValue(val) {
                if (val) {
                    var digits = val.toString().replace(/[^0-9]/g, '');

                    if (digits.toString() !== val.toString()) {
                        ngModelCtrl.$setViewValue(digits);
                        ngModelCtrl.$render();
                    }
                    return parseInt(digits, 10);
                }
                return undefined;
            }

            ngModelCtrl.$parsers.push(inputValue);
        }
    };
});
