from eums.models import ItemUnit
from eums.models import Item

item_unit_1 = ItemUnit.objects.create(name="kgs")
item_unit_2 = ItemUnit.objects.create(name="Each")
item_unit_3 = ItemUnit.objects.create(name="Kit")
item_unit_4 = ItemUnit.objects.create(name="Sachet")
item_unit_5 = ItemUnit.objects.create(name="PU")

item_1 = Item.objects.create(material_code="SL004639", description="Leaflet 2013 A5 or A4 with 3 fold 2013 Full", unit=item_unit_1)
item_2 = Item.objects.create(material_code="SL004638", description="Fact sheet2013 A4 2013 Full colour 2013 double s", unit=item_unit_1)
item_3 = Item.objects.create(material_code="SL005144", description="Laptop,Lenovo,ThinkPad T510", unit=item_unit_2)
item_4 = Item.objects.create(material_code="SL002248", description="Laptop bag", unit=item_unit_2)
item_5 = Item.objects.create(material_code="SL005981", description="EXTRA POWER ADAPTER", unit=item_unit_2)
item_6 = Item.objects.create(material_code="SL002315", description="LENOVO USB 2.0 SUPER MULTI-BURNER DRIVE", unit=item_unit_2)
item_7 = Item.objects.create(material_code="SL004169", description="Toner", unit=item_unit_2)
item_8 = Item.objects.create(material_code="S0782208", description="Safety box f.used syrgs/ndls 5lt/BOX-25", unit=item_unit_2)
item_9 = Item.objects.create(material_code="S0060240", description="Therapeutic spread,sachet 92g/CAR-150", unit=item_unit_4)
item_10 = Item.objects.create(material_code="S1569125", description="ReSoMal,42g sachet for 1 litre/CAR-100", unit=item_unit_4)
item_11 = Item.objects.create(material_code="S0145620", description="MUAC,Child 11.5 Red/PAC-50", unit=item_unit_4)
item_12 = Item.objects.create(material_code="S0700208", description="F-75 therap.diet,sachet, 102.5g/CAR-120", unit=item_unit_4)
item_13 = Item.objects.create(material_code="SL004159", description="Toner", unit=item_unit_5)
item_14 = Item.objects.create(material_code="SL003247", description="Printer", unit=item_unit_2)
item_15 = Item.objects.create(material_code="S9906621", description="IEHK2006,kit,basic unit", unit=item_unit_3)
item_16 = Item.objects.create(material_code="S1906623", description="IEHK2006,kit,suppl.1-drugs", unit=item_unit_3)
item_17 = Item.objects.create(material_code="SL062371", description="MAMA KITS, CLEAN DELIVERY KITS", unit=item_unit_3)
item_18 = Item.objects.create(material_code="S9906623", description="IEHK2006,kit,suppl.1-drugs", unit=item_unit_3)
item_19 = Item.objects.create(material_code="S9901006", description="IEHK2011,kit,suppl.1-medicines", unit=item_unit_1)
item_20 = Item.objects.create(material_code="S0000240", description="Therapeutic spread,sachet 92g/CAR-150", unit=item_unit_1)
item_21 = Item.objects.create(material_code="S0000209", description="F-100 therap. diet, sachet,114g/CAR-90", unit=item_unit_1)
item_22 = Item.objects.create(material_code="S0000208", description="F-75 therap.diet,sachet, 102.5g/CAR-120", unit=item_unit_1)
item_23 = Item.objects.create(material_code="S0114530", description="Portable baby/child L-hgt mea.syst/SET-2", unit=item_unit_1)
item_24 = Item.objects.create(material_code="S0572510", description="Blanket,survival,220x140cm (Adult)", unit=item_unit_1)
item_25 = Item.objects.create(material_code="S0156000", description="Sterilizer,steam,39L", unit=item_unit_1)
item_26 = Item.objects.create(material_code="S0791500", description="Vacuum extractor,Bird,manual,comple.set", unit=item_unit_1)
item_27 = Item.objects.create(material_code="S0004123", description="Motor cycles- Yamaha DT125", unit=item_unit_1)
item_28 = Item.objects.create(material_code="S9906730", description="Diarrhoeal Disease Set Packing", unit=item_unit_1)
item_29 = Item.objects.create(material_code="SL006645", description="Round Neck T-Shirts", unit=item_unit_1)
item_30 = Item.objects.create(material_code="U320000", description="PVC Horizontal banner 6m x 2m", unit=item_unit_1)
item_31 = Item.objects.create(material_code="U320000", description="Tear Drops 70cm x265cm, 300cm length to", unit=item_unit_1)
item_32 = Item.objects.create(material_code="U320000", description="Rollup Exhibition Stands (Heavy Wide bas", unit=item_unit_1)
item_33 = Item.objects.create(material_code="S0000538", description="Chlorine 65% - 45 Kg. cartons", unit=item_unit_1)
item_34 = Item.objects.create(material_code="U320000", description="PVC banners", unit=item_unit_1)
item_35 = Item.objects.create(material_code="SL004594", description="Tally sheets printed on A4 Paper", unit=item_unit_1)
item_36 = Item.objects.create(material_code="SL004594", description="Throw Boxes", unit=item_unit_1)
item_37 = Item.objects.create(material_code="SL004594", description="Play Card box", unit=item_unit_1)
item_38 = Item.objects.create(material_code="SL004594", description="Value Cards and Value Card messages box", unit=item_unit_1)
item_39 = Item.objects.create(material_code="SL004594", description="Play card messages box", unit=item_unit_1)
item_40 = Item.objects.create(material_code="SL004594", description="Value cards", unit=item_unit_1)
item_41 = Item.objects.create(material_code="SL004594", description="Value Cards messages", unit=item_unit_1)
item_42 = Item.objects.create(material_code="SL004594", description="Message Booklet-Full colour print,", unit=item_unit_1)
item_43 = Item.objects.create(material_code="SL004594", description="Play Cards", unit=item_unit_1)
item_44 = Item.objects.create(material_code="SL004594", description="Play Card messages", unit=item_unit_1)
item_45 = Item.objects.create(material_code="U458000", description="MIcrosoft windows 7 Proefessional OLP NL", unit=item_unit_1)
item_46 = Item.objects.create(material_code="SL004775", description="Bar Soap 800gm", unit=item_unit_1)
item_47 = Item.objects.create(material_code="U320000", description="Invitation Cards", unit=item_unit_1)
item_48 = Item.objects.create(material_code="SL004594", description="Notebooks", unit=item_unit_1)
item_49 = Item.objects.create(material_code="SL006645", description="Round Neck Tshirts", unit=item_unit_1)
item_50 = Item.objects.create(material_code="U320000", description="PVC Horizontal Banner", unit=item_unit_1)
item_51 = Item.objects.create(material_code="U320000", description="Banner", unit=item_unit_1)
item_52 = Item.objects.create(material_code="U320000", description="Pull Up Stand banners", unit=item_unit_1)
item_53 = Item.objects.create(material_code="U792100", description="Printing services (NSGE) booklets", unit=item_unit_1)
item_54 = Item.objects.create(material_code="SL004594", description="Longitudinal ANC Register", unit=item_unit_1)
item_55 = Item.objects.create(material_code="U792100", description="Alt Corporal punishment abridged version", unit=item_unit_1)
item_56 = Item.objects.create(material_code="U792100", description="Alt Corporal punishment Original version", unit=item_unit_1)
item_57 = Item.objects.create(material_code="U389900", description="Training&demonstrational models,articles", unit=item_unit_1)
item_58 = Item.objects.create(material_code="S9935095", description="Replenishment kit for S9935098", unit=item_unit_1)
item_59 = Item.objects.create(material_code="S5086012", description="Tarpaulin,plastic,roll,4x50m", unit=item_unit_1)
item_60 = Item.objects.create(material_code="S9935062", description="Early Childhood Development (ECD - IKA)", unit=item_unit_1)
item_61 = Item.objects.create(material_code="S5088008", description="Tent,light weight,rectangular,24m00b2", unit=item_unit_1)
item_62 = Item.objects.create(material_code="S5088020", description="Tent,light weight,rectangular,72m00b2", unit=item_unit_1)
item_63 = Item.objects.create(material_code="S9910003", description="Surg.inst.,delivery /SET", unit=item_unit_1)
item_64 = Item.objects.create(material_code="S0845000", description="Resuscitator,hand-oper.,infant/child,set", unit=item_unit_1)
item_65 = Item.objects.create(material_code="SL004619", description="Printed Book", unit=item_unit_1)
item_66 = Item.objects.create(material_code="S0000204", description="Amoxicillin 125mg disp.tab/PAC-30", unit=item_unit_1)
item_67 = Item.objects.create(material_code="S1580020", description="Zinc 20mg tablets/PAC-100", unit=item_unit_1)
item_68 = Item.objects.create(material_code="S0000207", description="Amoxicillin 125mg disp.tab/PAC-20", unit=item_unit_1)
item_69 = Item.objects.create(material_code="S0845010", description="Timer,respiration for ARI", unit=item_unit_1)
item_70 = Item.objects.create(material_code="S1300074", description="Artem 20mg+Lumef120mg disp tabs/6/PAC-30", unit=item_unit_1)
item_71 = Item.objects.create(material_code="S0003581", description="SD Bioline Mal Pf (HRP2)kit/252019", unit=item_unit_1)
item_72 = Item.objects.create(material_code="S1561121", description="ORS low osm. 20.5g/1L CAR/10x100", unit=item_unit_1)
item_73 = Item.objects.create(material_code="SL004594", description="ICCM Facilitators Guide", unit=item_unit_1)
item_74 = Item.objects.create(material_code="SL004594", description="VHTJob Aids", unit=item_unit_1)
item_75 = Item.objects.create(material_code="SL004594", description="VHTParticipants Manual", unit=item_unit_1)
item_76 = Item.objects.create(material_code="SL004594", description="VHTCertificate basic package", unit=item_unit_1)
item_77 = Item.objects.create(material_code="SL004594", description="ICCM Sick Child Job Aid", unit=item_unit_1)
item_78 = Item.objects.create(material_code="SL004594", description="ICCM Training Certificate", unit=item_unit_1)
item_79 = Item.objects.create(material_code="SL004594", description="VHTPatient Register", unit=item_unit_1)
item_80 = Item.objects.create(material_code="SL004594", description="VHTFacilitator Guide", unit=item_unit_1)
item_81 = Item.objects.create(material_code="SL004594", description="VHT TOT Guide", unit=item_unit_1)
item_82 = Item.objects.create(material_code="SL004594", description="Medicine Boxes", unit=item_unit_1)
item_83 = Item.objects.create(material_code="U456100", description="TARGUS CARRYING CASE, NYLON NOTEPAC BASI", unit=item_unit_1)
item_84 = Item.objects.create(material_code="SL001267", description="Internet Modems - MTN", unit=item_unit_1)
item_85 = Item.objects.create(material_code="SL001267", description="Internet Modems - Orange", unit=item_unit_1)
item_86 = Item.objects.create(material_code="SL001267", description="Dongle, modem - Airtel", unit=item_unit_1)
item_87 = Item.objects.create(material_code="U452150", description="Computers,laptop/notebook", unit=item_unit_1)
item_88 = Item.objects.create(material_code="U322000", description="Information Guide for Adolescents", unit=item_unit_1)
item_89 = Item.objects.create(material_code="U322000", description="Life skills Training Guide Manual", unit=item_unit_1)
item_90 = Item.objects.create(material_code="SL001679", description="Birth Registration forms", unit=item_unit_1)
item_91 = Item.objects.create(material_code="U471000", description="TVs for Comms unit office", unit=item_unit_1)
item_92 = Item.objects.create(material_code="SL004594", description="Printed booklet-VHT Registers", unit=item_unit_1)
item_93 = Item.objects.create(material_code="SL004594", description="Printed booklet-VHT Referral forms", unit=item_unit_1)
item_94 = Item.objects.create(material_code="SL004594", description="Printed booklet-IYCG Counselling cards", unit=item_unit_1)
item_95 = Item.objects.create(material_code="SL004594", description="Printed booklet-Health worker ref. forms", unit=item_unit_1)
item_96 = Item.objects.create(material_code="SL004594", description="Printed booklet-VHT Manuals", unit=item_unit_1)
item_97 = Item.objects.create(material_code="U271610", description="Tarpaulins", unit=item_unit_1)
item_98 = Item.objects.create(material_code="SL004594", description="UNICEF branded notepads", unit=item_unit_1)
item_99 = Item.objects.create(material_code="U320000", description="UNICEF branded folders", unit=item_unit_1)
item_100 = Item.objects.create(material_code="U320000", description="UNICEF Exhibition banners", unit=item_unit_1)
item_101 = Item.objects.create(material_code="U320000", description="UNICEF branded feather banners", unit=item_unit_1)
item_102 = Item.objects.create(material_code="S1561125", description="ReSoMal,42g sachet for 1 litre/CAR-100", unit=item_unit_1)
item_103 = Item.objects.create(material_code="S0481053", description="Thermometer,clinical,digital,32-4300baC", unit=item_unit_1)
item_104 = Item.objects.create(material_code="S0557200", description="Sling for use w5555,0557000,0557100", unit=item_unit_1)
item_105 = Item.objects.create(material_code="S9910005", description="Surg.inst.,dressing /SET", unit=item_unit_1)
item_106 = Item.objects.create(material_code="S0777500", description="Speculum,vaginal,Graves,95x35mm", unit=item_unit_1)
item_107 = Item.objects.create(material_code="S0683200", description="Sphygmomanometer,(adult),aneroid", unit=item_unit_1)
item_108 = Item.objects.create(material_code="S0683300", description="Sphygmomanometer,(child),aneroid", unit=item_unit_1)
item_109 = Item.objects.create(material_code="S9910002", description="Surg.inst.,curettage /SET", unit=item_unit_1)
item_110 = Item.objects.create(material_code="S0145520", description="Scale,infant,clinic,beamtype,16kg x 10g", unit=item_unit_1)
item_111 = Item.objects.create(material_code="S0140500", description="Scale,physician,adult,metric,6-180kg", unit=item_unit_1)
item_112 = Item.objects.create(material_code="S0114520", description="Portable baby/child/adult L-hgt mea.syst", unit=item_unit_1)
item_113 = Item.objects.create(material_code="S0760640", description="Pump,suction,foot-operated", unit=item_unit_1)
item_114 = Item.objects.create(material_code="S0002047", description="Oxygen concentrator/SET", unit=item_unit_1)
item_115 = Item.objects.create(material_code="S0001300", description="Microscope, binocular, basic", unit=item_unit_1)
item_116 = Item.objects.create(material_code="SL001824", description="GUM BOOTS, White, labour ward use", unit=item_unit_1)
item_117 = Item.objects.create(material_code="S0002171", description="Table,examination - Couch", unit=item_unit_1)
item_118 = Item.objects.create(material_code="S0002152", description="Trolley,dressing,ss,2 trays", unit=item_unit_1)
item_119 = Item.objects.create(material_code="SL001824", description="GUM BOOTS,white-Labour ward use", unit=item_unit_1)
item_120 = Item.objects.create(material_code="SL004605", description="Printed Flyer", unit=item_unit_1)
item_121 = Item.objects.create(material_code="S0686000", description="Stethoscope,binaural,complete", unit=item_unit_1)
item_122 = Item.objects.create(material_code="S9910006", description="Surg.inst.,exam/sut,vaginal/cervical/SET", unit=item_unit_1)
item_123 = Item.objects.create(material_code="S0002299", description="Ess. spares for 10 solar systems ordered", unit=item_unit_1)
item_124 = Item.objects.create(material_code="S0005077", description="Solar refrig-freezer,>50L,4.5Kw/24hrs", unit=item_unit_1)
item_125 = Item.objects.create(material_code="SL004601", description="DCC Guidlines", unit=item_unit_1)
item_126 = Item.objects.create(material_code="SL004601", description="Brochures", unit=item_unit_1)
item_127 = Item.objects.create(material_code="SL004601", description="Posture - Your right as a child-School", unit=item_unit_1)
item_128 = Item.objects.create(material_code="SL004601", description="Posture - violence against women and chi", unit=item_unit_1)
item_129 = Item.objects.create(material_code="U456100", description="Targus Carrying Case Nylon Notepac", unit=item_unit_1)
item_130 = Item.objects.create(material_code="S0003595", description="STAT-PAK HIV1/2,dipstick,kit/30", unit=item_unit_1)
item_131 = Item.objects.create(material_code="S0003406", description="Uni-Gold HIV1/2,kit/20", unit=item_unit_1)
item_132 = Item.objects.create(material_code="S0003403", description="Alere Determine HIV1/2,WB set,kit/100", unit=item_unit_1)
item_133 = Item.objects.create(material_code="U454200", description="HP  LaserJet P3015DN", unit=item_unit_1)
item_134 = Item.objects.create(material_code="U452150", description="Laptops-ThinkPad x230 Notebook", unit=item_unit_1)
item_135 = Item.objects.create(material_code="SL004601", description="Printed brochure (stickers)", unit=item_unit_1)
item_136 = Item.objects.create(material_code="SL006645", description="Round neck T-Shirts", unit=item_unit_1)
item_137 = Item.objects.create(material_code="SL006645", description="T-shirt, cotton", unit=item_unit_1)
item_138 = Item.objects.create(material_code="U320000", description="Press Banner", unit=item_unit_1)
item_139 = Item.objects.create(material_code="U320000", description="Pull up Banners", unit=item_unit_1)
item_140 = Item.objects.create(material_code="U320000", description="Tear Drops- Feather Banners", unit=item_unit_1)
item_141 = Item.objects.create(material_code="SL002371", description="MAMA KITS, CLEAN DELIVERY KITS", unit=item_unit_1)
item_142 = Item.objects.create(material_code="SL007747", description="Latrin material, foundation, wooden", unit=item_unit_1)
item_143 = Item.objects.create(material_code="SL007746", description="Latrin material, wooden", unit=item_unit_1)
item_144 = Item.objects.create(material_code="S0686000", description="Stethoscope,binaural (digital)", unit=item_unit_1)
item_145 = Item.objects.create(material_code="S0683300", description="Sphygmomanometer,aneroid(Mercury)moveabl", unit=item_unit_1)
item_146 = Item.objects.create(material_code="S0683300", description="Sphygmomanometer, adult", unit=item_unit_1)
item_147 = Item.objects.create(material_code="S0305020", description="Plastic Aprons", unit=item_unit_1)
item_148 = Item.objects.create(material_code="SL001824", description="GUM BOOTS-White, use in labour rooms", unit=item_unit_1)
item_149 = Item.objects.create(material_code="S0002164", description="Wheelchair,adult", unit=item_unit_1)
item_150 = Item.objects.create(material_code="S0002160", description="Bedscreen,hospital,on castors", unit=item_unit_1)
item_151 = Item.objects.create(material_code="S0002150", description="Cot,baby,hospital,w/mattresses ,on cast", unit=item_unit_1)
item_152 = Item.objects.create(material_code="S0002152", description="Wheeling Trolleys", unit=item_unit_1)
item_153 = Item.objects.create(material_code="S0002035", description="Table,resusc,newborn,w/access", unit=item_unit_1)
item_154 = Item.objects.create(material_code="S5086012", description="Tarpaulin, Plastic rolls", unit=item_unit_1)
item_155 = Item.objects.create(material_code="U467100", description="SD Memory card", unit=item_unit_1)
item_156 = Item.objects.create(material_code="U467100", description="Samsung S duos 2 (7582)", unit=item_unit_1)
item_157 = Item.objects.create(material_code="SL004594", description="Community Based Newborn Care", unit=item_unit_1)
item_158 = Item.objects.create(material_code="SL004594", description="VHT Nutrition Facilitators Guide", unit=item_unit_1)
item_159 = Item.objects.create(material_code="SL004594", description="Newborn facilitators manual", unit=item_unit_1)
item_160 = Item.objects.create(material_code="SL004594", description="VHT Nutrition Participants Manual", unit=item_unit_1)
item_161 = Item.objects.create(material_code="U456100", description="Lenovo Optical Scrollpoint USB mouse", unit=item_unit_1)
item_162 = Item.objects.create(material_code="U456100", description="Targus Carrying Case, Nylon Notepc basic", unit=item_unit_1)
item_163 = Item.objects.create(material_code="SL001894", description="Helmet", unit=item_unit_1)
item_164 = Item.objects.create(material_code="SL001679", description="A5 Manila White printing paper for Birth", unit=item_unit_1)
item_165 = Item.objects.create(material_code="SL004369", description="Toner", unit=item_unit_1)
item_166 = Item.objects.create(material_code="SL007247", description="Printer", unit=item_unit_1)
item_167 = Item.objects.create(material_code="SL000171", description="APC Smart UPS", unit=item_unit_1)
item_168 = Item.objects.create(material_code="SL003339", description="EMO Effective Micro Organism Cleana", unit=item_unit_1)
item_169 = Item.objects.create(material_code="SL004164", description="Squatting plate, Latrine Slabs", unit=item_unit_1)
item_170 = Item.objects.create(material_code="U441800", description="Latrine digging kits", unit=item_unit_1)
item_171 = Item.objects.create(material_code="S0686500", description="Stethoscope,foetal,Pinard", unit=item_unit_1)
item_172 = Item.objects.create(material_code="S0211000", description="Basin,kidney,stainless steel,825ml", unit=item_unit_1)
item_173 = Item.objects.create(material_code="S0141021", description="Scale,electronic,mother/child,150kgx100g", unit=item_unit_1)
item_174 = Item.objects.create(material_code="SL005328", description="Birth Cushion set", unit=item_unit_1)
item_175 = Item.objects.create(material_code="S9908200", description="Sterilization, kit C", unit=item_unit_1)
item_176 = Item.objects.create(material_code="SL002486", description="Mattress With PVC Cover,Adult", unit=item_unit_1)
item_177 = Item.objects.create(material_code="SL001638", description="Patient Bed:W.Back Rest & w.out castors", unit=item_unit_1)
item_178 = Item.objects.create(material_code="SL002486", description="Mattress With PVC Cover,Adul 190x90x10cm", unit=item_unit_1)
item_179 = Item.objects.create(material_code="SL001638", description="Patient Bed:With Back Rest& w.out castor", unit=item_unit_1)
item_180 = Item.objects.create(material_code="SL005328", description="Birth Cushion Set", unit=item_unit_1)
item_181 = Item.objects.create(material_code="SL001638", description="Patient Bed: With castors", unit=item_unit_1)
item_182 = Item.objects.create(material_code="S0002151", description="Bed,labour/delivery,w/access", unit=item_unit_1)
item_183 = Item.objects.create(material_code="SL004594", description="Printing CP Mapping Report", unit=item_unit_1)
item_184 = Item.objects.create(material_code="SL004601", description="Printed material", unit=item_unit_1)
item_185 = Item.objects.create(material_code="SL001267", description="Internet Modems", unit=item_unit_1)
item_186 = Item.objects.create(material_code="U320000", description="PRINTING OF PRIMARY 4 MATHS BOOK", unit=item_unit_1)
item_187 = Item.objects.create(material_code="S5086011", description="Tarpaulin,reinforc.,plastic,sheet,4x5m", unit=item_unit_1)
item_188 = Item.objects.create(material_code="S9935035", description="Recreation kit-in-a-carton", unit=item_unit_1)
item_189 = Item.objects.create(material_code="S5088015", description="Tent,light weight,rectangular,42m00b2", unit=item_unit_1)
item_190 = Item.objects.create(material_code="S0782156", description="Syringe,A-D,0.5ml,Soloshot Mini/BOX-100", unit=item_unit_1)
item_191 = Item.objects.create(material_code="S0782306", description="Syringe,RUP, 5ml,w/fixed ndl/BOX-100", unit=item_unit_1)
item_192 = Item.objects.create(material_code="SL004594", description="A4 Size booklet", unit=item_unit_1)
item_193 = Item.objects.create(material_code="SL004594", description="Posters", unit=item_unit_1)
item_194 = Item.objects.create(material_code="SL004594", description="Child Poverty Report Voices", unit=item_unit_1)
item_195 = Item.objects.create(material_code="SL004594", description="Child Poverty Report Analysis", unit=item_unit_1)
item_196 = Item.objects.create(material_code="U471000", description="TV & radio transmitters&part/access", unit=item_unit_1)
item_197 = Item.objects.create(material_code="SL004594", description="OTC Client cards", unit=item_unit_1)
item_198 = Item.objects.create(material_code="SL004594", description="Ration cards", unit=item_unit_1)
item_199 = Item.objects.create(material_code="SL004594", description="Clinical Monitoring Forms", unit=item_unit_1)
item_200 = Item.objects.create(material_code="SL004594", description="Monthly report forms", unit=item_unit_1)
item_201 = Item.objects.create(material_code="SL004594", description="OTC Registers", unit=item_unit_1)
item_202 = Item.objects.create(material_code="SL004594", description="New IYCF Guidelines (2012)", unit=item_unit_1)
item_203 = Item.objects.create(material_code="SL004594", description="IYCF Counselling cards", unit=item_unit_1)
item_204 = Item.objects.create(material_code="SL000018", description="Bookend", unit=item_unit_1)
item_205 = Item.objects.create(material_code="U484650", description="Dispensing bags, plastic (PAK 100)", unit=item_unit_1)
item_206 = Item.objects.create(material_code="U484650", description="Polythene biohazard bags (red)", unit=item_unit_1)
item_207 = Item.objects.create(material_code="SL001251", description="Disinfectant ( 1000 ml Bottle)", unit=item_unit_1)
item_208 = Item.objects.create(material_code="U484000", description="Cotton wool, 250g, roll, non-ster", unit=item_unit_1)
item_209 = Item.objects.create(material_code="U484650", description="Gloves, non-sterile, latex, large dispos", unit=item_unit_1)
item_210 = Item.objects.create(material_code="SL001638", description="Portable examination beds", unit=item_unit_1)
item_211 = Item.objects.create(material_code="S1555370", description="Albendazole 400mg chewable tabs/PAC-100", unit=item_unit_1)
item_212 = Item.objects.create(material_code="S1550025", description="Fe(as fum.)+folic 60+0.4mg tab/PAC-1000", unit=item_unit_1)
item_213 = Item.objects.create(material_code="S1583015", description="Retinol 100,000IU soft gel.caps/PAC-500", unit=item_unit_1)
item_214 = Item.objects.create(material_code="S1568045", description="Sulfadox+Pyrimeth 500+25mg tabs/PAC-1000", unit=item_unit_1)
item_215 = Item.objects.create(material_code="SL003850", description="Graph Book ( 48 pages)", unit=item_unit_1)
item_216 = Item.objects.create(material_code="SL003850", description="Art Book (48 pages)", unit=item_unit_1)
item_217 = Item.objects.create(material_code="SL003850", description="Pencils (HB)", unit=item_unit_1)
item_218 = Item.objects.create(material_code="SL003850", description="Counter books 2 Quire", unit=item_unit_1)
item_219 = Item.objects.create(material_code="SL003850", description="Mathematical set (Oxford)", unit=item_unit_1)
item_220 = Item.objects.create(material_code="SL003850", description="Box file (ALBA RADO)", unit=item_unit_1)
item_221 = Item.objects.create(material_code="SL003850", description="Pens (BIC)", unit=item_unit_1)
item_222 = Item.objects.create(material_code="U317100", description="Packaging and Branding", unit=item_unit_1)
item_223 = Item.objects.create(material_code="SL003850", description="Sanitary Pads (Afripads)", unit=item_unit_1)
item_224 = Item.objects.create(material_code="SL001149", description="Tshirts", unit=item_unit_1)
item_225 = Item.objects.create(material_code="S0004208", description="Bicycles", unit=item_unit_1)
item_226 = Item.objects.create(material_code="SL004594", description="Flyers: Tippy Tap", unit=item_unit_1)
item_227 = Item.objects.create(material_code="SL004594", description="Flyers: Feeding children", unit=item_unit_1)
item_228 = Item.objects.create(material_code="SL004594", description="Flyers: Breast feeding", unit=item_unit_1)
item_229 = Item.objects.create(material_code="SL004594", description="Flyers: Hand washing", unit=item_unit_1)
item_230 = Item.objects.create(material_code="SL004594", description="Flyers: Making water safe", unit=item_unit_1)
item_231 = Item.objects.create(material_code="SL004594", description="Flyers: How to avoid diarrhea", unit=item_unit_1)
item_232 = Item.objects.create(material_code="SL004594", description="Printed booklet-Message Booklet", unit=item_unit_1)
item_233 = Item.objects.create(material_code="SL004164", description="Squatting plate, Latrine Slab", unit=item_unit_1)
item_234 = Item.objects.create(material_code="SL002247", description="Computer, laptop", unit=item_unit_1)
item_235 = Item.objects.create(material_code="U456100", description="Expendables for use with IT equipment", unit=item_unit_1)
item_236 = Item.objects.create(material_code="SL004594", description="Booklet: Introduction to Quality Improv'", unit=item_unit_1)
item_237 = Item.objects.create(material_code="SL004594", description="Booklet:-Immunisation Practice in Ug", unit=item_unit_1)
item_238 = Item.objects.create(material_code="S0002172", description="Table,baby dressing", unit=item_unit_1)
item_239 = Item.objects.create(material_code="SL004594", description="RMNCH Plan", unit=item_unit_1)
item_240 = Item.objects.create(material_code="SL004594", description="Printed booklet", unit=item_unit_1)
item_241 = Item.objects.create(material_code="S1300075", description="Artem20mg+Lumef120mg disp tabs/12/PAC-30", unit=item_unit_1)
item_242 = Item.objects.create(material_code="S0000559", description="Chlorine test,DPD N00ba3,Rapid,tabs/PAC-250", unit=item_unit_1)
item_243 = Item.objects.create(material_code="S0000235", description="Hygiene kit,adult", unit=item_unit_1)
item_244 = Item.objects.create(material_code="S5006051", description="Chlorine/pH, Pool Tester Kit for 250 tst", unit=item_unit_1)
item_245 = Item.objects.create(material_code="S1588345", description="Water purif.(NaDCC) 67mg tabs/BOX-16000", unit=item_unit_1)
item_246 = Item.objects.create(material_code="U441800", description="Sanitation Digging Kit", unit=item_unit_1)
item_247 = Item.objects.create(material_code="S0005828", description="Water quality assessment kit,basic", unit=item_unit_1)
item_248 = Item.objects.create(material_code="S0145920", description="MUAC,Child 11.5 Red/PAC-50", unit=item_unit_1)
item_249 = Item.objects.create(material_code="S0145630", description="MUAC,Adult,without colour code/PAC-50", unit=item_unit_1)
item_250 = Item.objects.create(material_code="S0114540", description="Portable baby/chd/adt L-H mea.syst/SET-2", unit=item_unit_1)
item_251 = Item.objects.create(material_code="S0114052", description="Nut. kit,inpatient,module-equipment", unit=item_unit_1)
item_252 = Item.objects.create(material_code="X0001", description="Freight", unit=item_unit_1)
item_253 = Item.objects.create(material_code="SL001267", description="Scan Disk 4GB Flash Card", unit=item_unit_1)
item_254 = Item.objects.create(material_code="SL001267", description="I GB data top up bundles", unit=item_unit_1)
item_255 = Item.objects.create(material_code="SL001267", description="3 GB top up for the modems", unit=item_unit_1)
item_256 = Item.objects.create(material_code="SL001267", description="USB Modems", unit=item_unit_1)
item_257 = Item.objects.create(material_code="U467100", description="Samsung Galaxy Fame", unit=item_unit_1)
item_258 = Item.objects.create(material_code="SL002247", description="HP Probook Computer Laptop 4340s", unit=item_unit_1)
item_259 = Item.objects.create(material_code="S359184", description="Oral Polio Vaccine,vial of 20 doses", unit=item_unit_1)
item_260 = Item.objects.create(material_code="S7800001", description="Retinol 100,000IU soft gel.caps/PAC-500", unit=item_unit_1)
item_261 = Item.objects.create(material_code="S7800002", description="Retinol 200,000IU soft gel.caps/PAC-500", unit=item_unit_1)
item_262 = Item.objects.create(material_code="SL006173", description="Drop Cable, (water resistant cable)", unit=item_unit_1)
item_263 = Item.objects.create(material_code="SL006173", description="Cable Ties", unit=item_unit_1)
item_264 = Item.objects.create(material_code="SL006173", description="Dayliff PVC 3M", unit=item_unit_1)
item_265 = Item.objects.create(material_code="SL006173", description="Water Proof Joint (6.0)mm2", unit=item_unit_1)
item_266 = Item.objects.create(material_code="SL006173", description="1.25 Cover Plate", unit=item_unit_1)
item_267 = Item.objects.create(material_code="SL006173", description="Pedestal Stand", unit=item_unit_1)
item_268 = Item.objects.create(material_code="SL006173", description="Solar Power System", unit=item_unit_1)
item_269 = Item.objects.create(material_code="SL006173", description="Electrical Fittings", unit=item_unit_1)
item_270 = Item.objects.create(material_code="SL006173", description="Plumbing fitting", unit=item_unit_1)
item_271 = Item.objects.create(material_code="SL006173", description="Switch Box, Power Control Unit CU", unit=item_unit_1)
item_272 = Item.objects.create(material_code="SL006173", description="Solar Panel mountng Structure", unit=item_unit_1)
item_273 = Item.objects.create(material_code="SL006147", description="Earthing System & Lightining Protection", unit=item_unit_1)
item_274 = Item.objects.create(material_code="U711100", description="Transport and installation charges", unit=item_unit_1)
item_275 = Item.objects.create(material_code="S0009113", description="SQFlex 3-10 Pump C/W 1.4KW", unit=item_unit_1)
item_276 = Item.objects.create(material_code="SL004638", description="Children's Rights & Busi Principles Info", unit=item_unit_2)
item_277 = Item.objects.create(material_code="SL004638", description="Children's Rights & Business Principles", unit=item_unit_2)
item_278 = Item.objects.create(material_code="SL004638", description="Children's Rights&Corporate Sector bklet", unit=item_unit_2)
item_279 = Item.objects.create(material_code="SL004638", description="How Business Affects Us", unit=item_unit_2)
item_280 = Item.objects.create(material_code="SL004638", description="Investor Perspectives & Children's Right", unit=item_unit_2)
item_281 = Item.objects.create(material_code="SL009122", description="Ess. Package for HS - CSZ Som Ver.", unit=item_unit_2)
item_282 = Item.objects.create(material_code="SL009123", description="Complete Imm. Schedule - CSZ Eng Ver.", unit=item_unit_2)
item_283 = Item.objects.create(material_code="SL009124", description="Complete Imm. Schedule - CSZ Som Ver.", unit=item_unit_2)
item_284 = Item.objects.create(material_code="SL009125", description="Fully Imm. Children - CSZ Eng Ver.", unit=item_unit_2)
