(function(root){
 const rows={
 en:['Real time','Birth calendar','A new real-time life starts in the current month of your device’s calendar. The birth month stays fixed; each simulated year advances the calendar by one year. The ending month is calculated from the actual simulated lifespan. Shared and daily lives keep the month saved in their link (daily invitations use UTC). Statistical observation years and source editions are unchanged.','Archived calendar · month not recorded','Recorded birth month','Simulated ending month'],
 ja:['リアルタイム','出生カレンダー','新しいリアルタイムの人生は端末の現在の年月から始まります。出生月を固定し、ゲームの1年ごとに暦も1年進みます。結末の年月は実際にシミュレーションした寿命から計算します。共有・毎日の人生はリンクに保存された年月を使います（毎日の招待はUTC）。統計の観測年と資料の版は変更しません。','旧カレンダー・月の記録なし','記録された出生年月','シミュレーションの終了年月'],
 ko:['실시간','출생 달력','새 실시간 인생은 기기 달력의 현재 연월에 시작합니다. 출생 월은 고정되며 게임의 1년마다 달력도 1년 전진합니다. 종료 연월은 실제 시뮬레이션 수명으로 계산합니다. 공유 및 오늘의 인생은 링크에 저장된 연월을 유지합니다(오늘의 초대는 UTC). 통계 관측 연도와 자료 판본은 변경하지 않습니다.','이전 달력 · 월 기록 없음','기록된 출생 연월','시뮬레이션 종료 연월'],
 'zh-TW':['實時時間','出生時間規則','新的實時人生從裝置日曆的當前年月出生。出生月份一經生成便固定，每個模擬年推進一年；結束年月按實際模擬壽命計算。分享和每日人生保留連結記錄的年月（每日邀請採用UTC）。統計資料的觀測年份與文獻版本保持原樣。','舊版時間紀錄・未記錄月份','記錄的出生年月','模擬結束年月'],
 'zh-CN':['实时时间','出生时间规则','新的实时人生从设备日历的当前年月出生。出生月份一经生成便固定，每个模拟年推进一年；结束年月按实际模拟寿命计算。分享和每日人生保留链接记录的年月（每日邀请采用UTC）。统计资料的观察年份与文献版本保持原样。','旧版时间记录・未记录月份','记录的出生年月','模拟结束年月'],
 es:['Tiempo real','Calendario de nacimiento','Una nueva vida en tiempo real nace en el mes actual del calendario de tu dispositivo. El mes de nacimiento queda fijado; cada año simulado avanza un año. El mes final se calcula con la duración real de la simulación. Las vidas compartidas y diarias conservan el mes del enlace (las invitaciones diarias usan UTC). Los años de observación y las ediciones de las fuentes no cambian.','Calendario anterior · mes no registrado','Mes de nacimiento registrado','Mes final simulado'],
 'pt-BR':['Tempo real','Calendário de nascimento','Uma nova vida em tempo real nasce no mês atual do calendário do dispositivo. O mês de nascimento fica fixo; cada ano simulado avança um ano. O mês final é calculado pela duração efetiva da simulação. Vidas compartilhadas e diárias preservam o mês do link (convites diários usam UTC). Os anos de observação e as edições das fontes não mudam.','Calendário anterior · mês não registrado','Mês de nascimento registrado','Mês final simulado'],
 fr:['Temps réel','Calendrier de naissance','Une nouvelle vie en temps réel naît au mois actuel du calendrier de votre appareil. Le mois de naissance reste fixe ; chaque année simulée avance le calendrier d’un an. Le mois final dépend de la durée effective de la simulation. Les vies partagées et quotidiennes gardent le mois du lien (les invitations quotidiennes utilisent UTC). Les années des observations et les éditions des sources restent inchangées.','Ancien calendrier · mois non enregistré','Mois de naissance enregistré','Mois de fin simulé'],
 de:['Echtzeit','Geburtskalender','Ein neues Echtzeitleben beginnt im aktuellen Monat des Gerätekalenders. Der Geburtsmonat bleibt gespeichert; jedes simulierte Jahr verschiebt den Kalender um ein Jahr. Der Endmonat folgt aus der tatsächlichen simulierten Lebensdauer. Geteilte und tägliche Leben behalten den Monat des Links (tägliche Einladungen nutzen UTC). Beobachtungsjahre und Quellenausgaben bleiben unverändert.','Alter Kalender · Monat nicht erfasst','Gespeicherter Geburtsmonat','Simulierter Endmonat']
 };
 root.CalendarCopy=Object.fromEntries(Object.entries(rows).map(([lang,r])=>[lang,{now:r[0],title:r[1],help:r[2],legacy:r[3],birth:r[4],ending:r[5]}]));
 const dates={
 en:['Calendar documentation checked','Model input observation years','Unverified. The birth calendar does not update demographic observations.'],
 ja:['出生カレンダーの説明を確認','モデル入力の観測年','未確認です。出生カレンダーを変えても人口統計の観測年は変わりません。'],
 ko:['출생 달력 설명 확인','모델 입력 관측 연도','확인되지 않았습니다. 출생 달력 변경은 인구 통계 관측 연도를 갱신하지 않습니다.'],
 'zh-TW':['出生時間說明核驗日期','模型資料的觀測年份','未核實。出生時間更新不會改寫人口統計資料的觀測年份。'],
 'zh-CN':['出生时间说明核验日期','模型资料的观察年份','未核实。出生时间更新不会改写人口统计资料的观察年份。'],
 es:['Documentación del calendario revisada','Años de observación del modelo','Sin verificar. El calendario de nacimiento no actualiza las observaciones demográficas.'],
 'pt-BR':['Documentação do calendário verificada','Anos de observação do modelo','Não verificados. O calendário de nascimento não atualiza as observações demográficas.'],
 fr:['Documentation du calendrier vérifiée','Années d’observation du modèle','Non vérifiées. Le calendrier de naissance ne met pas à jour les observations démographiques.'],
 de:['Kalenderdokumentation geprüft','Beobachtungsjahre der Modelldaten','Nicht verifiziert. Der Geburtskalender aktualisiert keine demografischen Beobachtungen.']
 };
 for(const[lang,r]of Object.entries(dates))Object.assign(root.CalendarCopy[lang],{reviewed:r[0],observed:r[1],unknown:r[2]});
})(globalThis);
