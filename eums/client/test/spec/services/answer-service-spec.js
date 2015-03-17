describe('Answer Service', function() {

    var answerService, mockBackend, textAnswerEndpointUrl, numericAnswerEndpointUrl, multipleChoiceAnswerEndpointUrl;

    var answerId = 1, questionId = 1, lineItemRunId = 1;

    beforeEach(function() {
        module('Answer');

        inject(function(AnswerService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            textAnswerEndpointUrl = EumsConfig.BACKEND_URLS.TEXT_ANSWERS;
            numericAnswerEndpointUrl = EumsConfig.BACKEND_URLS.NUMERIC_ANSWERS;
            multipleChoiceAnswerEndpointUrl = EumsConfig.BACKEND_URLS.MULTIPLE_CHOICE_ANSWERS;
            answerService = AnswerService;
        });
    });

    describe('Text Answers', function() {
        var stubTextAnswer = {
            question: questionId,
            value: 'Test Item',
            line_item_run: lineItemRunId
        };

        var expectedAnswer = {
            id: answerId,
            question: questionId,
            value: 'Test Item',
            line_item_run: lineItemRunId
        };

        it('should know how to create a text answer', function (done) {
            mockBackend.whenPOST(textAnswerEndpointUrl).respond(201, expectedAnswer);
            answerService.createTextAnswer(stubTextAnswer).then(function (response) {
                expect(response).toEqual(expectedAnswer);
                done();
            });
            mockBackend.flush();
        });

        it('should know how to update a text answer', function (done) {
            var updatedTextAnswerField = {value: 'Edited'};
            mockBackend.whenPATCH(textAnswerEndpointUrl + answerId + '/').respond(expectedAnswer);
            answerService.updateTextAnswer(answerId, updatedTextAnswerField).then(function (response) {
                expect(response).toEqual(expectedAnswer);
                done();
            });
            mockBackend.flush();
        });
    });

    describe('Numeric Answers', function() {
        var stubNumericAnswer = {
            question: questionId,
            value: 1,
            line_item_run: lineItemRunId
        };

        var expectedAnswer = {
            id: answerId,
            question: questionId,
            value: 1,
            line_item_run: lineItemRunId
        };

        it('should know how to create a numeric answer', function (done) {
            mockBackend.whenPOST(numericAnswerEndpointUrl).respond(201, expectedAnswer);
            answerService.createNumericAnswer(stubNumericAnswer).then(function (response) {
                expect(response).toEqual(expectedAnswer);
                done();
            });
            mockBackend.flush();
        });

        it('should know how to update text answer', function (done) {
            var updatedNumericAnswerField = {value: 3};
            mockBackend.whenPATCH(numericAnswerEndpointUrl + answerId + '/').respond(expectedAnswer);
            answerService.updateNumericAnswer(answerId, updatedNumericAnswerField).then(function (response) {
                expect(response).toEqual(expectedAnswer);
                done();
            });
            mockBackend.flush();
        });
    });

    describe('Multiple Choice Answers', function() {
        var stubMultipleChoiceAnswer = {
            question: questionId,
            value: 1,
            line_item_run: lineItemRunId
        };

        var expectedAnswer = {
            id: answerId,
            question: questionId,
            value: 1,
            line_item_run: lineItemRunId
        };

        it('should know how to create a multiple choice answer', function (done) {
            mockBackend.whenPOST(multipleChoiceAnswerEndpointUrl).respond(201, expectedAnswer);
            answerService.createMultipleChoiceAnswer(stubMultipleChoiceAnswer).then(function (response) {
                expect(response).toEqual(expectedAnswer);
                done();
            });
            mockBackend.flush();
        });

        it('should know how to update multiple choice answer', function (done) {
            var updatedMultipleChoiceAnswerField = {value: 3};
            mockBackend.whenPATCH(multipleChoiceAnswerEndpointUrl + answerId + '/').respond(expectedAnswer);
            answerService.updateMultipleChoiceAnswer(answerId, updatedMultipleChoiceAnswerField).then(function (response) {
                expect(response).toEqual(expectedAnswer);
                done();
            });
            mockBackend.flush();
        });
    });
});
