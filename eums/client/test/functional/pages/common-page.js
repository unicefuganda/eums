var commonPage = function () {
};

commonPage.prototype = Object.create({}, {
    currentUrl: {
        get: function () {
            return browser.getCurrentUrl().then(function (url) {
                return url.substring(url.lastIndexOf("/"), url.length);
            })
        }
    },
});
module.exports = new commonPage();