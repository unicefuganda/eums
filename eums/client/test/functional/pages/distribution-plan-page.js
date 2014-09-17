var DistributionPlanPage = function () {
    this.text = element(by.css('.container'));
    this.firstNameElement = element(by.model('contact.firstname'));
    this.lastNameElement = element(by.model('contact.lastname'));
    this.phone = element(by.model('contact.phone'));
    this.addContactButton = element(by.id('add-contact'));
    this.errorSpan = element(by.id('error-msg'));

    this.elementisPresent = function () {
        return this.text.isPresent();
    };

    this.enterContactDetails = function (contactDetails) {
        this.firstNameElement.sendKeys(contactDetails.firstname);
        this.lastNameElement.sendKeys(contactDetails.lastname);
        this.phone.sendKeys(contactDetails.phone);

    };

    this.addContact = function (contactDetails) {
        this.enterContactDetails(contactDetails);
        this.addContactButton.click();

        return require('./home-page');
    };

    this.addInvalidContact = function (invalidContactDetails) {
        this.enterContactDetails(invalidContactDetails);
        this.addContactButton.click();
    };
};

module.exports = new DistributionPlanPage;