'use strict';

angular.module('Answer', ['eums.config', 'eums.service-factory'])
    .factory('AnswerService', function ($http, EumsConfig, ServiceFactory) {
        var multipleChoiceAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.MULTIPLE_CHOICE_ANSWERS});
        var textAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.TEXT_ANSWERS});
        var numericAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.NUMERIC_ANSWERS});
        var webAnswerService = ServiceFactory.create({uri: EumsConfig.BACKEND_URLS.WEB_ANSWERS});
        var method = 'PATCH';

        return {
            createMultipleChoiceAnswer: multipleChoiceAnswerService.create,
            updateMultipleChoiceAnswer: function (answerId, answerDetails) {
                return multipleChoiceAnswerService.update(Object.merge({id: answerId}, answerDetails), method);
            },
            createTextAnswer: textAnswerService.create,
            updateTextAnswer: function (answerId, answerDetails) {
                return textAnswerService.update(Object.merge({id: answerId}, answerDetails), method);
            },
            createNumericAnswer: numericAnswerService.create,
            updateNumericAnswer: function (answerId, answerDetails) {
                return numericAnswerService.update(Object.merge({id: answerId}, answerDetails), method);
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