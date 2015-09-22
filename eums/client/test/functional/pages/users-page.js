var usersPage = function () {};

usersPage.prototype = Object.create({}, {
    url: { get: function () { return '/users/'; }},

    visit: { value: function () {
        browser.ignoreSynchronization = true;
        browser.get(this.url);
    }}
});

module.exports = new usersPage;
