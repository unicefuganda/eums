angular.module('NewDistributionPlan').directive('searchContacts', function (ContactService, $timeout) {
    function formatResponse(data) {
        return data.map(function (contact) {
            return {
                id: contact._id,
                text: contact.firstName + ' ' + contact.lastName
            };
        });
    }

    return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function (scope, element, _, ngModel) {

            element.select2({
                minimumInputLength: 1,
                width: '150px',
                query: function (query) {
                    var data = {results: []};
                    ContactService.search(query.term).then(function (foundContacts) {
                        data.results = formatResponse(foundContacts);
                        query.callback(data);
                    });
                },
                initSelection: function (element, callback) {
                    $timeout(function () {
                        var modelValue = ngModel.$modelValue;
                        if (modelValue) {
                            ContactService.get(modelValue).then(function (contact) {
                                if (contact._id) {
                                    callback({
                                        id: contact._id,
                                        text: contact.firstName + ' ' + contact.lastName
                                    });
                                }
                            });
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
