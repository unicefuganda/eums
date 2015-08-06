describe('Delivery Node Model', function () {
    var DeliveryNodeModel;
    beforeEach(function () {
        module('DeliveryNode');
        inject(function (DeliveryNode) {
            DeliveryNodeModel = DeliveryNode;
        });
    });

    it('should return false when node is not tracked', function () {
        var deliveryNode = new DeliveryNodeModel({id: 12, track: false});
        expect(deliveryNode.trackSubmitted).toBeFalsy();
    });

    it('should return true when node is tracked', function () {
        var deliveryNode = new DeliveryNodeModel({id: 1, track: true});
        expect(deliveryNode.trackSubmitted).toBeTruthy();
    });
});
