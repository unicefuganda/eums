var HomePage = function () {
    this.text = element(by.css('.container'));

    this.elementisPresent = function () {
        return this.text.isPresent();
    };
};

module.exports = new HomePage;