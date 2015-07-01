var ImportDataPage = function () {

    this.url = '#/import-data';
    this.visit = function () {
        browser.get(this.url);
    };
};

module.exports = new ImportDataPage;