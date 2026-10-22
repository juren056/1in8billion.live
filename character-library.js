// Fictional illustration candidates, NOT ethnicity estimates or demographic weights.
// A country can offer several visual backgrounds; no nationality implies one appearance.
export const characterProfiles=[
 ['aria','F','westasian'],['lina','F','african'],['sora','F','european'],['noah','M','european'],['mateo','M','westasian'],['amir','M','african'],
 ['mei','F','east'],['ren','M','east'],['yuna','F','east'],['jun','M','east'],
 ['anika','F','south'],['dev','M','south'],['sana','F','south'],['arun','M','south'],
 ['nur','F','southeast'],['adi','M','southeast'],['amina','F','african'],['kofi','M','african'],
 ['leila','F','westasian'],['omar','M','westasian'],['ines','F','latina'],['diego','M','latina'],
 ['elena','F','european'],['luca','M','european'],['moana','F','pacific'],['tane','M','pacific'],['alma','F','indigenous'],['nico','M','indigenous']
].map(([id,sex,background])=>({id,sex,background}));
const sets=[
 ['east','CHN JPN KOR PRK TWN HKG MAC'],
 ['east westasian','MNG KAZ KGZ'],
 ['south','IND BGD PAK LKA MDV'],
 ['south east','NPL BTN'],
 ['southeast east','IDN PHL THA VNM KHM LAO MMR TLS'],
 ['southeast east south','MYS SGP'],
 ['westasian south','AFG IRN'],
 ['westasian','DZA EGY LBY MAR TUN IRQ JOR KWT LBN OMN PSE QAT SAU SYR TUR YEM BHR'],
 ['westasian south african','ARE'],
 ['westasian european','ISR ARM AZE GEO CYP'],
 ['westasian east south','TJK TKM UZB'],
 ['african','AGO BEN BWA BFA BDI CMR CAF TCD COG CIV COD GNQ GAB GMB GHA GIN GNB HTI JAM KEN LSO LBR MWI MLI MOZ NAM NER NGA RWA SEN SLE SSD TZA TGO UGA ZMB ZWE SWZ'],
 ['african westasian','ERI ETH MRT SOM SDN DJI COM'],
 ['african southeast','MDG'],
 ['african european south','ZAF MUS'],
 ['african european','CPV'],
 ['european','AUT BLR BGR CZE HRV BIH MDA LTU ALB SVN LVA MKD XKX EST MNE HUN POL ROU SRB SVK UKR'],
 ['european westasian','ITA ESP PRT GRC MLT'],
 ['european east westasian','RUS'],
 ['latina indigenous european','MEX CHL COL CRI ECU SLV HND NIC PAN PRY VEN'],
 ['indigenous latina','BOL PER GTM'],
 ['latina african european','BRA CUB DOM'],
 ['european latina','ARG URY'],
 ['south african indigenous latina','TTO GUY SUR'],
 ['pacific african','PNG SLB'],
 ['pacific south','FJI'],
 ['european pacific east south','NZL AUS'],
 ['european african westasian east south latina indigenous pacific','USA CAN GBR FRA DEU BEL DNK FIN IRL NLD NOR SWE CHE LUX']
];
export const countryVisualGroups=Object.fromEntries(sets.flatMap(([groups,countries])=>countries.split(' ').map(id=>[id,groups.split(' ')])));
export function visualCandidates(country,sex){const groups=countryVisualGroups[country];const profiles=characterProfiles.filter(p=>(!['F','M'].includes(sex)||p.sex===sex)&&(!groups||groups.includes(p.background)));return profiles.map(p=>p.id);}
