var Header = function () {};

Header.prototype = Object.create({}, {

    logout: { value: function () {
        browser.ignoreSynchronization = true;
        browser.get('/logout');
    }}

});

module.exports = new Header;