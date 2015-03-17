describe('Question Service', function () {

    var questionService, mockBackend, questionEndpointUrl;

    var stubQuestion = {
        id: 1,
        text: 'Was product received?',
        label: 'productReceived'
    };

    var questionList = [stubQuestion];


    beforeEach(function () {
        module('Question');

        inject(function (QuestionService, $httpBackend, EumsConfig, $q) {
            mockBackend = $httpBackend;
            questionEndpointUrl = EumsConfig.BACKEND_URLS.QUESTION;
            questionService = QuestionService;
        });
    });

    it('should get question by label', function (done) {
        mockBackend.whenGET(questionEndpointUrl + '?search=productReceived').respond(questionList);
        var label = 'productReceived';

        questionService.getQuestionByLabel(label).then(function (questions) {
            expect(questions).toEqual(questionList);
            done();
        });
        mockBackend.flush();
    });

});