// Display-only labels for recorded parental occupations; never rewrites saved facts.
export const occupationLabels={
en:['Farmer','Laborer','Taxi driver','Construction worker','Fisherman','Herder','Auto mechanic','Technician','Vendor','Porter','Security guard','Engineer','Teacher','Bank clerk','Sales clerk','Civil servant','Nurse','Service worker'],
'zh-TW':['農夫','工人','計程車司機','建築工','漁民','牧民','汽車維修技師','技工','小販','搬運工','保全','工程師','教師','銀行員','銷售員','公務員','護理師','服務業'],
'zh-CN':['农民','工人','出租车司机','建筑工人','渔民','牧民','汽车维修技师','技工','商贩','搬运工','保安','工程师','教师','银行职员','销售员','公务员','护士','服务业员工'],
ja:['農業従事者','労働者','タクシー運転手','建設作業員','漁業従事者','牧畜従事者','自動車整備士','技術者','販売業者','運搬作業員','警備員','エンジニア','教師','銀行員','販売員','公務員','看護師','サービス業従事者'],
ko:['농업 종사자','노동자','택시 기사','건설 노동자','어업 종사자','목축업 종사자','자동차 정비사','기술자','상인','운반 노동자','경비원','엔지니어','교사','은행원','판매원','공무원','간호사','서비스업 종사자'],
es:['Agricultor','Trabajador','Taxista','Trabajador de construcción','Pescador','Pastor','Mecánico de automóviles','Técnico','Vendedor ambulante','Mozo de carga','Guardia de seguridad','Ingeniero','Docente','Empleado bancario','Dependiente','Funcionario','Profesional de enfermería','Trabajador de servicios'],
'pt-BR':['Agricultor','Trabalhador','Taxista','Trabalhador da construção','Pescador','Criador de animais','Mecânico de automóveis','Técnico','Vendedor ambulante','Carregador','Segurança','Engenheiro','Professor','Bancário','Vendedor','Servidor público','Profissional de enfermagem','Trabalhador de serviços'],
fr:['Agriculteur','Ouvrier','Chauffeur de taxi','Ouvrier du bâtiment','Pêcheur','Éleveur','Mécanicien automobile','Technicien','Marchand','Manutentionnaire','Agent de sécurité','Ingénieur','Enseignant','Employé de banque','Employé de vente','Fonctionnaire','Personnel infirmier','Employé de services'],
de:['Landwirt','Arbeiter','Taxifahrer','Bauarbeiter','Fischer','Viehzüchter','Kfz-Mechaniker','Techniker','Händler','Lastenträger','Sicherheitskraft','Ingenieur','Lehrkraft','Bankangestellter','Verkaufskraft','Staatsbediensteter','Pflegekraft','Dienstleistungsmitarbeiter']
};
export function localizeParentOccupation(value,lang){const index=Object.values(occupationLabels).reduce((found,labels)=>found<0?labels.indexOf(value):found,-1);return index<0?value:(occupationLabels[lang]||occupationLabels.en)[index];}
