describe('Item Model', function() {
    var ItemModel;
    beforeEach(function() {
        module('Item');
        inject(function(Item) {
            ItemModel = Item
        });
    });

    it('should construct empty object if nothing is passed to constructor', function() {
        var item = new ItemModel();
        expect(item.id).toBe('');
        expect(item.description).toBe('');
        expect(item.unit).toEqual({name: 'Each'});
    });

    it('should construct item from json', function() {
        var item = new ItemModel({id: 1, description: 'Best item', unit: {id: 2, name: 'kg'}});
        expect(item.id).toBe(1);
        expect(item.description).toBe('Best item');
        expect(item.unit).toEqual({id: 2, name: 'kg'});
    });
});
