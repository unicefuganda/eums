'use strict';

describe('contacts page', function () {

    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get('/');
    });

    it('should go to the contacts page', function () {
        browser.get('/contacts');

        element(by.css('.page-header'));
    });
});