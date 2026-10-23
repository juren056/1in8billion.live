// Editorial French for the priority French audience; no automatic runtime translation.
import {allChains} from './chains-source.mjs';
const copy={
 return:{
  '':'Et si vous repreniez, sans avoir à faire vos preuves ?',
  '.preludeTitle':'La part de vous qui attendait',
  '.prompt':'Une invitation vous donne envie de retrouver cette activité : {interest}. Le travail occupe encore vos journées, et reprendre peut intimider. Quelle place pourriez-vous lui faire, à votre mesure ?',
  '.a':'Me réserver un petit moment pour essayer',
  '.a.result':'Vous réservez un court moment à cette activité : {interest}. Vous prévenez les personnes concernées par ce changement. Le premier essai est imparfait, mais vous le gardez.',
  '.a.follow':'Vous avez réessayé pendant quelques soirées ordinaires, sans y parvenir chaque semaine. Un nouvel essai repose maintenant à côté de ce que vous aviez rangé.',
  '.a.later':'Des années plus tard, vous comparez les deux essais. Le travail est toujours là, comme les choses que vous ne savez pas encore faire. Reprendre ne demandait pas de devenir quelqu’un d’autre.',
  '.b':'Découvrir une séance avant de m’engager',
  '.b.result':'Vous assistez à une séance de découverte et posez une question de débutant. Vous repartez avec une idée à essayer chez vous, sans décider de toute la suite.',
  '.b.follow':'Vous essayez cette idée chez vous. Elle demande moins de matériel que prévu, et davantage de patience. Cette petite expérience vous appartient.',
  '.b.later':'Des années plus tard, vous retrouvez les notes de cette séance. Vous n’en avez pas fait un métier, mais vous avez appris quelque chose que vous aviez envie de comprendre.',
  '.c':'Garder le matériel et choisir le repos aujourd’hui',
  '.c.result':'Vous rangez le matériel à un endroit où vous pourrez le retrouver et choisissez une soirée tranquille. Vous n’êtes pas obligé d’accepter cette invitation.',
  '.c.follow':'En rangeant, vous revoyez le matériel. Il est toujours disponible. La soirée de repos que vous vous étiez accordée comptait, elle aussi.',
  '.c.later':'Des années plus tard, vous reconnaissez une limite dont vous aviez besoin à ce moment-là. Une page reste disponible dans le carnet, sans date à respecter.'
 },
 reconnect:{
  '':'Et si vous envoyiez une seule phrase sincère ?',
  '.preludeTitle':'Un nom venu d’un autre chapitre',
  '.prompt':'Vous et {person} partagez un vrai souvenir d’école, puis vos vies ont suivi des chemins différents. Une réponse n’est pas garantie. Quel premier pas auriez-vous envie de proposer ?',
  '.a':'Envoyer un souvenir, sans réclamer de réponse',
  '.a.result':'Vous envoyez à {person} un souvenir précis de l’école, en ajoutant qu’une réponse peut attendre. Vous laissez de la place à une vie dont vous ne connaissez pas encore les détails.',
  '.a.follow':'{person} répond brièvement et ajoute un détail que vous aviez oublié. Vous échangez quelques nouvelles, sans chercher à rattraper toutes les années en une conversation.',
  '.a.later':'Des années plus tard, vous relisez ces quelques messages. Vous n’êtes pas devenus inséparables, mais vous savez désormais que ce vieux souvenir appartenait à vous deux.',
  '.b':'Demander si un court échange serait possible',
  '.b.result':'Vous demandez à {person} si un court échange pourrait trouver sa place dans son emploi du temps. Vous précisez qu’une autre date, ou l’absence de rendez-vous, convient aussi.',
  '.b.follow':'Vous trouvez un moment qui vous convient à tous les deux. La conversation connaît quelques silences. Vous découvrez un peu des années que vous n’avez pas partagées.',
  '.b.later':'Des années plus tard, un détail de cet échange vous revient. Vous vous souvenez d’avoir demandé, sans considérer que l’ancienne amitié vous donnait automatiquement une place.',
  '.c':'Garder le souvenir, sans prendre contact maintenant',
  '.c.result':'Vous notez ce dont vous vous souvenez et n’envoyez pas de message aujourd’hui. Vous ne décidez pas à la place de {person} quelle aurait été sa réponse.',
  '.c.follow':'Vous retrouvez votre note. Elle garde un souvenir d’école, sans le transformer en une conversation ou des retrouvailles qui n’ont pas eu lieu.',
  '.c.later':'Des années plus tard, vous ne savez toujours pas ce qu’un message aurait changé. L’amitié peut avoir compté, même si une partie de son histoire reste ouverte.'
 },
 visit:{
  '':'Quelle présence serait possible aujourd’hui ?',
  '.preludeTitle':'Un peu de temps, encore possible',
  '.prompt':'{person} fait partie de votre vie présente, pas d’un compte à rebours. Vous avez aussi votre travail et vos limites. Quel moment pourriez-vous offrir sans promettre davantage que ce qui est possible ?',
  '.a':'Prévoir un moment ensemble, sans se presser',
  '.a.result':'Vous convenez d’un petit moment avec {person} et décalez une autre activité facultative. Vous posez une question sur l’histoire familiale et prenez le temps d’écouter la suite.',
  '.a.follow':'Vous et {person} revenez sur un détail de ce moment. Il ne s’agit pas d’un portrait de famille parfait, mais d’une conversation à laquelle vous avez réellement fait de la place.',
  '.a.later':'Des années plus tard, vous pouvez raconter cette petite histoire plus précisément, parce que vous avez posé la question. Vous gardez les mots entendus, sans demander à une seule rencontre de tout réparer.',
  '.b':'Proposer une conversation plus courte, mais possible',
  '.b.result':'Vous expliquez à {person} le temps dont vous disposez et partagez une courte conversation. Vous écoutez vraiment, sans passer tout l’échange à vous excuser de sa durée.',
  '.b.follow':'Une phrase de {person}, prononcée pendant ce court échange, vous revient. Sa brièveté ne l’empêche pas d’être un vrai moment partagé.',
  '.b.later':'Des années plus tard, vous pouvez encore replacer cette phrase dans une journée ordinaire. À ce moment-là, être présent avait une forme modeste et possible.',
  '.c':'Expliquer mes limites et laisser la date ouverte',
  '.c.result':'Vous expliquez à {person} que vous ne pouvez pas prévoir de moment pour l’instant. Vous évitez de promettre une date incertaine. La question reste notée pour une conversation qui n’a pas encore eu lieu.',
  '.c.follow':'Vous relisez votre note et vous rappelez pourquoi vous aviez laissé la date ouverte. Le récit ne vous attribue ni une visite qui n’a pas eu lieu, ni une faute pour avoir eu besoin de limites.',
  '.c.later':'Des années plus tard, ce projet resté ouvert demeure distinct des moments que vous avez vraiment partagés. La gratitude peut coexister avec une question sans réponse.'
 }
};
const setups={
 FRA:[
  'Vous retrouvez un dépliant annoté près du matériel de votre ancienne activité — {interest} —, rangé au début de votre vie professionnelle. Il évoque les ouvrages créatifs d’une bibliothèque municipale. Vous laissez ce papier bien en vue.',
  'Parmi vos affaires d’école, vous reconnaissez l’étiquette manuscrite d’une exposition de classe et pensez à {person}. Le dernier contact noté dans votre histoire remonte à vos {lastAge} ans. Vous gardez le papier à portée de main, en vous demandant si vous allez écrire.',
  'En ajoutant une date au dos d’une vieille photo de famille, vous entendez {person} évoquer un détail que vous n’aviez jamais demandé. Le travail remplit vos journées. Vous notez la question, sans prétendre avoir déjà pris le temps d’en parler.'
 ],
 TWN:[
  'Vous retrouvez un marque-page et une ébauche près du matériel de votre ancienne activité — {interest} —, rangé quand vous avez commencé à travailler. Une note évoque un groupe de lecture et de travaux manuels en bibliothèque. Vous laissez cette page bien en vue.',
  'Vous retrouvez une page du journal de classe écrite avec {person}. Le dernier contact noté dans votre histoire remonte à vos {lastAge} ans. Vous mettez la page de côté et cherchez les mots que vous aimeriez envoyer.',
  'Pendant un après-midi de pluie, vous feuilletez un vieil album avec {person}. Un détail vous donne envie de poser une question que vous aviez toujours laissée de côté. Vous la notez, sans transformer cette envie en rendez-vous déjà pris.'
 ],
 HKG:[
  'Vous retrouvez une idée griffonnée dans un carnet de lecture, près du matériel de votre ancienne activité — {interest} —, rangé quand le travail a commencé. Elle vous rappelle une présentation en bibliothèque publique. Vous laissez le carnet ouvert à cette page.',
  'Une note sur une lecture préparée en classe vous fait penser à {person}. Le dernier contact noté dans votre histoire remonte à vos {lastAge} ans. Vous gardez la note et vous demandez ce que vous pourriez écrire aujourd’hui.',
  'En vérifiant les noms et les lieux au dos de photos de famille, vous entendez {person} évoquer un détail encore inconnu. Vos journées sont chargées. Vous notez ce que vous aimeriez demander, sans faire comme si la conversation avait déjà eu lieu.'
 ],
 SGP:[
  'Dans un livre familier, vous retrouvez un dépliant de découverte près du matériel de votre ancienne activité — {interest} —, rangé au début de votre vie professionnelle. Il évoque un espace créatif en bibliothèque. Vous laissez la page bien en vue.',
  'Le croquis d’un ancien projet scolaire vous fait penser à {person}. Le dernier contact noté dans votre histoire remonte à vos {lastAge} ans. Vous posez le croquis à côté de vous, en réfléchissant à un éventuel message.',
  'En notant les mots employés à la maison pour expliquer une photo de famille, vous entendez {person} ajouter un détail nouveau. Le travail occupe vos journées. Vous gardez la question pour une vraie conversation, sans l’écrire comme si elle avait déjà eu lieu.'
 ]
};
export function editorialFrench(){const out={};for(const d of allChains){const c=copy[d.condition];if(!c)continue;for(const[suffix,text]of Object.entries(c))out[d.id+suffix]=text;if(setups[d.country])out[d.id+'.setup']=setups[d.country][['return','reconnect','visit'].indexOf(d.condition)];}return out;}
