var Navbar = function () {};

Navbar.prototype = Object.create({}, {

    goToDashboard: { value: function () { element(by.id('home-nav')).click(); }},
    goToDeliveryPage: { value: function () { element(by.id('home-nav')).click(); }},
    goToFieldVerificationPage: { value: function () { element(by.id('home-nav')).click(); }},

    revealReportsPanel: { value: function () { element(by.id('reports-nav')).click(); }},
    goToIPFeedbackReportPage: { value: function () {
        this.revealReportsPanel();
        element(by.id('ip-feedback-nav')).click();
    }},
    goToEndUserFeedbackReportPage: { value: function () {
        this.revealReportsPanel();
        element(by.id('item-feedback-nav')).click();
    }},
    goToIPStockReportPage: { value: function () {
        this.revealReportsPanel();
        element(by.id('ip-stock-nav')).click();
    }},

    goToConsigneesPage: { value: function () { element(by.id('home-nav')).click(); }},
    goToAlertsPage: { value: function () { element(by.id('home-nav')).click(); }},

    revealAdminPanel: { value: function () { element(by.id('admin-nav')).click(); }},
    goToImportPage: { value: function () {
        this.revealAdminPanel();
        element(by.id('import-nav')).click();
    }},
    goToUsersPage: { value: function () {
        this.revealAdminPanel();
        browser.ignoreSynchronization = true;
        element(by.id('users-nav')).click();
    }},
    goToContactsPage: { value: function () {
        this.revealAdminPanel();
        element(by.id('contact-nav')).click();
    }},

    goToChangePasswordPage: { value: function () { element(by.id('change-password-nav')).click(); }},
    logout: { value: function () { element(by.id('logout-nav')).click(); }}
});

module.exports = new Navbar;