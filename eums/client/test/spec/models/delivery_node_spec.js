describe('Delivery Node Model', function () {
    var DeliveryNodeModel;
    beforeEach(function () {
        module('DeliveryNode');
        inject(function (DeliveryNode) {
            DeliveryNodeModel = DeliveryNode;
        });
    });

    it('should return false when node exists but is not tracked yet', function () {
        var deliveryNode = new DeliveryNodeModel({id: 12, track:false});
        expect(deliveryNode.trackSubmitted()).toBeFalsy();
    });

    it('should return true when node exists and is tracked', function () {
        var deliveryNode = new DeliveryNodeModel({id: 1, track: true});
        expect(deliveryNode.trackSubmitted()).toBeTruthy();
    });

    it('should return false when node is tracked but does not exist', function () {
        var deliveryNode = new DeliveryNodeModel({track: true});
        expect(deliveryNode.trackSubmitted()).toBeFalsy(); 
    });

    it('should return false when node is not tracked and does not exist', function () {
        var deliveryNode = new DeliveryNodeModel({track: false});
        expect(deliveryNode.trackSubmitted()).toBeFalsy(); 
    });    
});
