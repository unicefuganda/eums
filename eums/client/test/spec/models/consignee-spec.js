describe('Consignee Model', function () {
    var ConsigneeModel;
    beforeEach(function () {
        module('Consignee');
        inject(function (Consignee) {
            ConsigneeModel = Consignee;
        });
    });

    it('should construct null object if nothing is passed to constructor', function () {
        var consignee = new ConsigneeModel();
        expect(consignee.id).toBeUndefined();
        expect(consignee.name).toBe(null);
        expect(consignee.location).toBe(null);
        expect(consignee.remarks).toBe(null);
        expect(consignee.customerId).toBe(null);
        expect(consignee.importedFromVision).toBe(false);
    });

    it('should construct a consignee from json', function () {
        var consignee = new ConsigneeModel({
            id: 1, name: 'Some name', location: 'Kampala', remarks: 'something',
            customerId: 'L200', importedFromVision: true
        });
        expect(consignee.id).toBe(1);
        expect(consignee.name).toBe('Some name');
        expect(consignee.location).toBe('Kampala');
        expect(consignee.remarks).toBe('something');
        expect(consignee.customerId).toBe('L200');
        expect(consignee.importedFromVision).toBe(true);
    });

    it('should be editable and deletable if it has an id', function() {
        var consignee = new ConsigneeModel({id: 10});
        expect(consignee.isDeletable).toBe(true);
        expect(consignee.isEditable).toBe(true);
    });

    it('should not be editable and deletable if it does not have an id', function() {
        var consignee = new ConsigneeModel();
        expect(consignee.isDeletable).toBe(false);
        expect(consignee.isEditable).toBe(false);
    });
});
