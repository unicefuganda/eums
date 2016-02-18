'use strict';

angular.module('Answer', ['eums.config', 'eums.service-factory'])
    .factory('AnswerService', function ($http, EumsConfig, ServiceFactory) {
        var patchMethod = 'PATCH';
        var multipleChoiceAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.MULTIPLE_CHOICE_ANSWERS});
        var textAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.TEXT_ANSWERS});
        var numericAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.NUMERIC_ANSWERS});
        var webAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.WEB_ANSWERS});

        return {
            createMultipleChoiceAnswer: multipleChoiceAnswerService.create,
            updateMultipleChoiceAnswer: function (answerId, answerDetails) {
                return multipleChoiceAnswerService.update(Object.merge({id: answerId}, answerDetails), patchMethod);
            },
            createTextAnswer: textAnswerService.create,
            updateTextAnswer: function (answerId, answerDetails) {
                return textAnswerService.update(Object.merge({id: answerId}, answerDetails), patchMethod);
            },
            createNumericAnswer: numericAnswerService.create,
            updateNumericAnswer: function (answerId, answerDetails) {
                return numericAnswerService.update(Object.merge({id: answerId}, answerDetails), patchMethod);
            },
            createWebAnswer: function (runnable, answers) {
                return webAnswerService.create(Object.merge(
                    {
                        runnable: runnable.id,
                        answers: answers
                    })
                );
            }
        };
    });