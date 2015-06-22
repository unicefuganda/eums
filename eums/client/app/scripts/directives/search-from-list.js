angular.module('NewDistributionPlan').directive('searchFromList', function ($timeout) {
    return {
        restrict: 'A',
        scope: false,
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            var list = JSON.parse(attrs.list);

            element.select2({
                width: '100%',
                query: function (query) {
                    var data = {results: []};
                    var matches = list.filter(function (item) {
                        return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                    });
                    data.results = matches.map(function (match) {
                        return {
                            id: match.id,
                            text: match.name
                        };
                    });
                    query.callback(data);
                },
                initSelection: function (element, callback) {
                    $timeout(function () {
                        var matchingItem = list.filter(function (item) {
                            return item.id === ngModel.$modelValue;
                        })[0];
                        if (matchingItem) {
                            callback({id: matchingItem.id, text: matchingItem.name});
                        }
                    });
                }
            });

            element.change(function () {
                ngModel.$setViewValue(element.select2('data').id);
                scope.$apply();
            });
        }
    };
});