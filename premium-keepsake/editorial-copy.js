// Reading labels only; no event text, dates or model records are rewritten.
const make=v=>Object.fromEntries(['highlights','recurring','readingNote','repeatCount','recordedSpan'].map((key,i)=>[key,v[i]]));
export const editorialCopy={
 en:make(['Milestones at a glance','Repeated entries, together','Repeated wording is grouped here for reading. Counts and first–last dates describe recorded entries, not a continuous condition. Every original entry remains in the complete event record.','Recorded entries','First–last record']),
 ja:make(['人生の節目をたどる','繰り返された記録','同じ文面の記録を読みやすくまとめています。回数と最初・最後の時点は記録を示し、その間ずっと続いた状態を意味しません。元の記録はすべて全記録に残しています。','記録回数','最初・最後の記録']),
 ko:make(['한눈에 보는 삶의 이정표','반복된 기록 모아 보기','같은 문구의 기록을 읽기 쉽게 묶었습니다. 횟수와 처음·마지막 시점은 기록을 뜻하며, 그동안 계속된 상태를 뜻하지 않습니다. 원래 기록은 전체 사건 기록에 모두 남아 있습니다.','기록 횟수','처음·마지막 기록']),
 'zh-TW':make(['人生節點一覽','重複記錄彙整','此處將相同文字的記錄彙整，方便閱讀。次數與首末時間只代表記錄，並不表示期間持續發生；每筆原始記錄都保留在完整事件目錄。','記錄次數','首次至末次記錄']),
 'zh-CN':make(['人生节点一览','重复记录汇总','此处将相同文字的记录汇总，方便阅读。次数与首末时间只代表记录，并不表示期间持续发生；每条原始记录都保留在完整事件记录中。','记录次数','首次至末次记录']),
 es:make(['Los hitos de esta vida','Entradas repetidas, reunidas','Las entradas con el mismo texto se agrupan para facilitar la lectura. La cantidad y las fechas inicial y final describen registros, no una situación continua. Todas las entradas originales siguen en el registro completo.','Entradas registradas','Primer–último registro']),
 'pt-BR':make(['Os marcos desta vida','Registros repetidos, reunidos','Registros com o mesmo texto são agrupados para facilitar a leitura. A contagem e as datas inicial e final descrevem registros, não uma condição contínua. Todas as entradas originais permanecem no registro completo.','Registros','Primeiro–último registro']),
 fr:make(['Les jalons de cette vie','Les entrées répétées, réunies','Les entrées au texte identique sont regroupées pour faciliter la lecture. Le nombre et les dates extrêmes décrivent des entrées, pas une situation continue. Chaque entrée originale reste dans le relevé complet.','Entrées enregistrées','Premier–dernier relevé']),
 de:make(['Die Stationen dieses Lebens','Wiederholte Einträge, gebündelt','Einträge mit gleichem Text werden zur besseren Lesbarkeit zusammengefasst. Anzahl und erster–letzter Zeitpunkt beschreiben Einträge, keinen durchgehenden Zustand. Jeder Originaleintrag bleibt im vollständigen Ereignisprotokoll erhalten.','Aufgezeichnete Einträge','Erster–letzter Eintrag'])
};
