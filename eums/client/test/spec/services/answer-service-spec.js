describe('Answer Service', function () {
    var answerService, mockServiceFactory, mockService;

    var answerId = 1;
    var answer = {value: 'Edited'};
    var data = {id: answerId, value: answer.value};

    beforeEach(function () {
        module('Answer');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        mockService = jasmine.createSpyObj('mockService', ['update', 'create']);
        mockServiceFactory.create.and.returnValue(mockService);

        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });

        inject(function (AnswerService) {
            answerService = AnswerService;
        });
    });

    it('should know how to update text answer', function () {
        answerService.updateTextAnswer(answerId, answer);
        expect(mockService.update).toHaveBeenCalledWith(data, 'PATCH');
    });

    it('Numeric Answers should know how to update text answer', function () {
        answerService.updateNumericAnswer(answerId, answer);
        expect(mockService.update).toHaveBeenCalledWith(data, 'PATCH');
    });

    it('Multiple Choice Answers should know how to update multiple choice answer', function () {
        answerService.updateNumericAnswer(answerId, answer);
        expect(mockService.update).toHaveBeenCalledWith(data, 'PATCH');
    });
});
