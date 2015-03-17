'use strict';

angular.module('Answer', ['eums.config'])
    .factory('AnswerService', function ($http, EumsConfig) {
        return {
            createMultipleChoiceAnswer: function (answerDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.MULTIPLE_CHOICE_ANSWERS, answerDetails).then(function (response) {
                    return response.data;
                });
            },
            updateMultipleChoiceAnswer: function (answerId, answerDetails) {
                return $http({ method: 'PATCH', url: EumsConfig.BACKEND_URLS.MULTIPLE_CHOICE_ANSWERS + answerId + '/', data: answerDetails})
                    .then(function (response) {
                        return response.data;
                    });
            },
            createTextAnswer: function (answerDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.TEXT_ANSWERS, answerDetails).then(function (response) {
                    return response.data;
                });
            },
            updateTextAnswer: function (answerId, answerDetails) {
                return $http({ method: 'PATCH', url: EumsConfig.BACKEND_URLS.TEXT_ANSWERS + answerId + '/', data: answerDetails})
                    .then(function (response) {
                        return response.data;
                    });
            },
            createNumericAnswer: function (answerDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.NUMERIC_ANSWERS, answerDetails).then(function (response) {
                    return response.data;
                });
            },
            updateNumericAnswer: function (answerId, answerDetails) {
                return $http({ method: 'PATCH', url: EumsConfig.BACKEND_URLS.NUMERIC_ANSWERS + answerId + '/', data: answerDetails})
                    .then(function (response) {
                        return response.data;
                    });
            }
        };
    });


