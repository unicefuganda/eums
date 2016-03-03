describe('Contacts Filter', function () {
    var filter, contacts;

    beforeEach(module('Contact'));

    beforeEach(inject(function ($filter) {
        filter = $filter;
        contacts = [
            {
                _id: 1,
                firstName: 'Andrew',
                lastName: 'Mukiza',
                phone: '+234778945674',
                ips: ['WAKISO DHO'],
                districts: ['Wakiso']
            },
            {
                _id: 2,
                firstName: 'James',
                lastName: 'Oloo',
                phone: '+234778945675',
                ips: ['AUBUM DHO'],
                districts: ['Aubum']
            }
        ];
    }));

    it('should filter by first name', function () {
        expect(filter('contactsFilter')(contacts, 'And')).toEqual([contacts[0]]);
    });

    it('should filter by last name', function () {
        expect(filter('contactsFilter')(contacts, 'Oloo')).toEqual([contacts[1]]);
    });

    it('should filter by phone', function () {
        expect(filter('contactsFilter')(contacts, '675')).toEqual([contacts[1]]);
    });

    it('should filter by ip when exist', function () {
        expect(filter('ipFilter')(contacts, {name: 'WAKISO DHO'})).toEqual([contacts[0]]);
    });

     it('should filter by ip when not exist', function () {
        expect(filter('ipFilter')(contacts, {name: 'None ip'})).toEqual([]);
    });

    it('should filter by district when exist', function () {
        expect(filter('districtFilter')(contacts, 'Aubum')).toEqual([contacts[1]]);
    });

    it('should filter by district when not exist', function () {
        expect(filter('districtFilter')(contacts, 'None district')).toEqual([]);
    });
});