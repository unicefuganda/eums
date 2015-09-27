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

    it('should know how to update numeric answer', function () {
        answerService.updateNumericAnswer(answerId, answer);
        expect(mockService.update).toHaveBeenCalledWith(data, 'PATCH');
    });

    it('should know how to update multiple choice answer', function () {
        answerService.updateNumericAnswer(answerId, answer);
        expect(mockService.update).toHaveBeenCalledWith(data, 'PATCH');
    });

    it('should know how to create web answer', function () {
        var delivery = {id: 1};
        var answers = [
            {
                questionLabel: 'deliveryReceived',
                type:'multipleChoice',
                text: "Was delivery received?",
                value: 'Yes',
                options: ['Yes', 'No']
            },
            {
                questionLabel: 'dateOfReceipt',
                type:'text',
                text: "When was delivery received?",
                value: '2014-12-12'
            }

        ];

        answerService.createWebAnswer(delivery, answers);

        expect(mockService.create).toHaveBeenCalledWith(
            {
                runnable: delivery.id,
                answers: answers
            });
    });
});
