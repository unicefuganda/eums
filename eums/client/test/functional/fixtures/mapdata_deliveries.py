from eums.models import DistributionPlan
from eums.client.test.functional.fixtures.mapdata_consignees import *
from eums.client.test.functional.fixtures.mapdata_programmes import *
from eums.test.helpers.fake_datetime import FakeDate

delivery_37 = DistributionPlan.objects.create(programme=programme_3, location="Amur", consignee=consignee_1, contact_person_id="54213ccc797221e84ac993fe", track=False,  delivery_date="2014-10-14", remark="hh")
delivery_38 = DistributionPlan.objects.create(programme=programme_1, location="PADER", consignee=consignee_10, contact_person_id="5420508290cc38715b1af928", track=False,  delivery_date="2014-10-06", remark="SAFE Programme")
delivery_39 = DistributionPlan.objects.create(programme=programme_1, location="bundibugyo", consignee=consignee_21, contact_person_id="54213ccc797221e84ac993fe", track=False,  delivery_date="2014-10-01", remark="Mother and Child")
delivery_40 = DistributionPlan.objects.create(programme=programme_4, location="Bukomansimbi", consignee=consignee_33, contact_person_id="542bfa5108453c32ffd4cade", track=False,  delivery_date="2014-10-14", remark="hh")
delivery_41 = DistributionPlan.objects.create(programme=programme_3, location="Bukomansimbi", consignee=consignee_32, contact_person_id="542bfa5108453c32ffd4cade", track=False,  delivery_date="2014-06-10", remark="blah blah")
delivery_42 = DistributionPlan.objects.create(programme=programme_1, location="Oyam", consignee=consignee_38, contact_person_id="5422bf5999f3eb0000a46ae6", track=False,  delivery_date="2014-10-14", remark="hh")
delivery_43 = DistributionPlan.objects.create(programme=programme_3, location="Bukomansimbi", consignee=consignee_32, contact_person_id="542bfa5108453c32ffd4cade", track=True,  delivery_date=FakeDate.build(2015, 07, 11), remark="blah blah")
delivery_44 = DistributionPlan.objects.create(programme=programme_1, location="Bukomansimbi", consignee=consignee_33, contact_person_id="542bfa5108453c32ffd4cade", track=True,  delivery_date=FakeDate.build(2015, 07, 11), remark="blah blah")
delivery_45 = DistributionPlan.objects.create(programme=programme_3, location="Kaabong", consignee=consignee_6, contact_person_id="542bfa5108453c32ffd4cade", track=True,  delivery_date=FakeDate.build(2015, 07, 11), remark="blah blah")

delivery_46 = DistributionPlan.objects.create(
    programme=programme_1,
    location="Kaabong",
    consignee=consignee_1,
    contact_person_id="542bfa5108453c32ffd4cade",
    track=True,
    delivery_date=FakeDate.build(2015, 07, 11),
    remark="blah blah")
