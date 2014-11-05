describe('Distribution report Service', function () {
    var reportService, config;

    var stubConsigneeResponses = [
        {
            'node': 13,
            'item': 'IEHK2006,kit,suppl.1-drugs',
            'productReceived': 'Yes',
            'consignee': {
                'id': 21,
                'name': 'BUNDIBUGYO DHO'
            },
            'amountReceived': '20',
            'amountSent': 1,
            'satisfiedWithProduct': 'No',
            'programme': {
                'id': 4,
                'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'
            }
        },
        {
            'node': 16,
            'item': 'IEHK2006,kit,suppl.1-drugs',
            'productReceived': 'No',
            'informedOfDelay': 'Yes',
            'consignee': {
                'id': 5,
                'name': 'WAKISO DHO'
            },
            'amountReceived': '30',
            'amountSent': 1,
            'programme': {
                'id': 4,
                'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'
            }
        },
        {
            'node': 17,
            'item': 'IEHK2006,kit,suppl.1-drugs',
            'qualityOfProduct': 'Good',
            'consignee': {
                'id': 19,
                'name': 'MUBENDE DHO'
            },
            'productReceived': 'Yes',
            'amountSent': 1,
            'satisfiedWithProduct': 'Yes',
            'programme': {
                'id': 4,
                'name': 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'
            }
        }
    ];

    beforeEach(function () {
        module('GlobalStats');

        inject(function (DistributionReportService, EumsConfig) {
            reportService = DistributionReportService;
            config = EumsConfig;
        });
    });


    it('should get total stats from report', function () {
        var totals = reportService.getTotals(stubConsigneeResponses);
        expect(totals).toEqual({ received: 50, notReceived: 0, distributed: 3, notDistributed: 47 });
    });

    it('should get total stats by consignee', function () {
        var totals = reportService.getTotals(stubConsigneeResponses, {consignee: 21});
        expect(totals).toEqual({ received: 20, notReceived: 0, distributed: 1, notDistributed: 19 });
    });

    it('should get total stats by programme', function () {
        var totals = reportService.getTotals(stubConsigneeResponses, {programme: 4});
        expect(totals).toEqual({ received: 50, notReceived: 0, distributed: 3, notDistributed: 47 });
    });

    it('should get total stats by programme and consignee', function () {
        var totals = reportService.getTotals(stubConsigneeResponses, {programme: 4, consignee: 21});
        expect(totals).toEqual({ received: 20, notReceived: 0, distributed: 1, notDistributed: 19 });
    });

    it('should parse consignee and programme option params to int before getting totals', function () {
        var totals = reportService.getTotals(stubConsigneeResponses, {programme: String(4), consignee: String(21)});
        expect(totals).toEqual({ received: 20, notReceived: 0, distributed: 1, notDistributed: 19 });
    });
});
