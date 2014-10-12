describe('Districts Service', function () {
    var districtService;

    var districts = ['Buikwe', 'Bukomansimbi', 'Butambala', 'Buvuma', 'Gomba', 'Kalangala', 'Kalungu', 'Oyam',
        'Kampala', 'Kayunga', 'Kiboga', 'Kyankwanzi', 'Luweero', 'Lwengo', 'Lyantonde', 'Masaka', 'Otuke',
        'Mityana', 'Mpigi', 'Mubende', 'Mukono', 'Nakaseke', 'Nakasongola', 'Rakai', 'Soroti', 'Tororo',
        'Sembabule', 'Wakiso', 'Amuria', 'Budaka', 'Bududa', 'Bugiri', 'Bukedea', 'Sironko', 'Zombo',
        'Bukwa', 'Bulambuli', 'Busia', 'Butaleja', 'Buyende', 'Iganga', 'Jinja', 'Serere', 'Yumbe',
        'Kaberamaido', 'Kaliro', 'Kamuli', 'Kapchorwa', 'Katakwi', 'Kibuku', 'Kumi', 'Pallisa', 'Pader',
        'Kween', 'Luuka', 'Manafwa', 'Mayuge', 'Mbale', 'Namayingo', 'Namutumba', 'Ngora', 'Nwoya', 'Nebbi',
        'Napak', 'Nakapiripirit', 'Moyo', 'Moroto', 'Maracha', 'Lira', 'Lamwo', 'Kotido', 'Kole', 'Koboko',
        'Kitgum', 'Kaabong', 'Gulu', 'Dokolo', 'Arua', 'Apac', 'Amuru', 'Amudat', 'Amolatar', 'Alebtong',
        'Agago', 'Adjumani', 'Abim', 'Buhweju', 'Buliisa', 'Bundibugyo', 'Bushenyi', 'Hoima', 'Ibanda',
        'Isingiro', 'Kabale', 'Kabarole', 'Kamwenge', 'Kanungu', 'Kasese', 'Kibaale', 'Kiruhura', 'Kisoro',
        'Kiryandongo', 'Kyegegwa', 'Kyenjojo', 'Masindi', 'Mbarara', 'Mitooma', 'Ntoroko', 'Ntungamo',
        'Rubirizi', 'Rukungiri', 'Sheema', 'Central Region', 'Eastern Region', 'Northern Region',
        'Western Region'];

     beforeEach(function() {
         module('NewDistributionPlan');

         inject(function(Districts){
             districtService = Districts;
         });
     });

    it('should know the getAllDistricts function gets all Uganda districts and regions', function(){
             expect(districtService.getAllDistricts()).toEqual(districts);
         });
});


