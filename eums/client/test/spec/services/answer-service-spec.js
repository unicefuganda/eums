describe('Answer Service', function () {
    var answerService, mockBackend, textAnswerEndpointUrl, numericAnswerEndpointUrl, multipleChoiceAnswerEndpointUrl;

    var answerId = 1;

    beforeEach(function () {
        module('Answer');

        inject(function (AnswerService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            textAnswerEndpointUrl = EumsConfig.BACKEND_URLS.TEXT_ANSWERS;
            numericAnswerEndpointUrl = EumsConfig.BACKEND_URLS.NUMERIC_ANSWERS;
            multipleChoiceAnswerEndpointUrl = EumsConfig.BACKEND_URLS.MULTIPLE_CHOICE_ANSWERS;
            answerService = AnswerService;
        });
    });

    it('Text Answers should know how to update a text answer', function (done) {
        var answer = {value: 'Edited'};
        var data = {id: answerId, value: answer.value};
        mockBackend.expectPATCH(textAnswerEndpointUrl + answerId + '/', data).respond(200);
        answerService.updateTextAnswer(answerId, answer).then(function () {
            done();
        });
        mockBackend.flush();
    });

    it('Numeric Answers should know how to update text answer', function (done) {
        var answer = {value: 3};
        var data = {id: answerId, value: answer.value};
        mockBackend.expectPATCH(numericAnswerEndpointUrl + answerId + '/', data).respond(200);
        answerService.updateNumericAnswer(answerId, answer).then(function () {
            done();
        });
        mockBackend.flush();
    });

    it('Multiple Choice Answers should know how to update multiple choice answer', function (done) {
        var answer = {value: 3};
        var data = {id: answerId, value: answer.value};
        mockBackend.expectPATCH(multipleChoiceAnswerEndpointUrl + answerId + '/', data).respond(200);
        answerService.updateMultipleChoiceAnswer(answerId, answer).then(function () {
            done();
        });
        mockBackend.flush();
    });
});
