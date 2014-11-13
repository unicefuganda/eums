'use strict';

describe('contacts page', function() {

    beforeEach(function() {
    });

    it('should go to the contacts page', function() {
        browser.ignoreSynchronization = true;
        browser.get('/contacts');

        element(by.css('.page-header'));

        // TODO: Find out why elements cannot be found
    });
});