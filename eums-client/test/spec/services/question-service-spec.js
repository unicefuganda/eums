describe('Question Service', function () {

    var questionService, mockBackend, questionEndpointUrl;

    var stubQuestion = {
        id: 1,
        text: 'Was product received?',
        label: 'productReceived'
    };

    beforeEach(function () {
        module('Question');

        inject(function (QuestionService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            questionEndpointUrl = EumsConfig.BACKEND_URLS.QUESTION;
            questionService = QuestionService;
        });
    });

    it('should get question by label', function (done) {
        mockBackend.whenGET(questionEndpointUrl + '?search=productReceived').respond([stubQuestion]);
        var label = 'productReceived';

        questionService.getQuestionByLabel(label).then(function (questions) {
            expect(questions).toEqual(stubQuestion);
            done();
        });
        mockBackend.flush();
    });

});