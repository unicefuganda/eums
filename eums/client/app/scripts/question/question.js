'use strict';

angular.module('Question', ['eums.config'])
    .factory('QuestionService', function ($http, EumsConfig) {
        return {
            getQuestionByLabel: function (label) {
                return $http.get(EumsConfig.BACKEND_URLS.QUESTION + '?search=' + label).then(function (response) {
                    return response.data;
                });
            }
        };
    });


