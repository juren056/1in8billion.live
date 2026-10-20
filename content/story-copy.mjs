// Presentation-only translations. Never alter the event keys, probabilities or stored story.
const rows=`學會走路|Learned to walk|歩けるようになった|걷기 시작했다
說出第一個字|First word spoken|初めて言葉を話した|첫 말을 했다
發燒了|Had a fever|熱が出た|열이 났다
開始認得家人|Started recognizing family|家族の顔を覚えた|가족을 알아보기 시작했다
交了新朋友|Made a new friend|新しい友達ができた|새 친구를 사귀었다
在小比賽得名次|Won a small competition|小さな大会で入賞した|작은 대회에서 입상했다
玩耍時受傷|Got injured playing|遊んでいてけがをした|놀다가 다쳤다
發現一本喜歡的書|Discovered a favorite book|お気に入りの本に出会った|좋아하는 책을 발견했다
感冒了|Caught a cold|風邪をひいた|감기에 걸렸다
成績進步了|Got good grades|成績が上がった|성적이 올랐다
發現喜歡的音樂|Discovered favorite music|好きな音楽に出会った|좋아하는 음악을 발견했다
初戀破滅|First heartbreak|初めて失恋した|첫 실연을 겪었다
迷上電玩|Got into gaming|ゲームに夢中になった|게임에 빠졌다
騎腳踏車去新地方|Biked somewhere new|自転車で新しい場所へ出かけた|자전거로 새로운 곳에 갔다
病了一週|Got sick for a week|1週間体調を崩した|일주일 동안 아팠다
獲得學業獎|Won academic award|学業の賞を受けた|학업상을 받았다
畢業了|Graduated|卒業した|졸업했다
找到第一份工作|Got first job|初めての仕事に就いた|첫 직장을 구했다
戀愛了|Fell in love|恋をした|사랑에 빠졌다
跑了馬拉松|Ran a marathon|マラソンを走った|마라톤을 뛰었다
考了駕照|Got driver license|運転免許を取った|운전면허를 땄다
健康出了點狀況|Had health scare|健康に不安を感じた|건강에 이상을 느꼈다
升職了|Got promoted|昇進した|승진했다
結婚了|Got married|結婚した|결혼했다
有了孩子|Had a child|子どもが生まれた|아이가 태어났다
買了房子|Bought a home|家を買った|집을 샀다
大幅晉升|Got big promotion|大きく昇進した|크게 승진했다
買了車|Bought a car|車を買った|차를 샀다
健康出了狀況|Had health issue|健康上の問題が起きた|건강 문제가 생겼다
離婚了|Got divorced|離婚した|이혼했다
家族旅遊|Family trip|家族旅行に出かけた|가족 여행을 갔다
孩子畢業了|Child graduated|子どもが卒業した|자녀가 졸업했다
去度假|Took vacation|休暇を楽しんだ|휴가를 떠났다
孫子女出生|Grandchild born|孫が生まれた|손주가 태어났다
健康檢查|Health checkup|健康診断を受けた|건강검진을 받았다
重返校園|Went back to school|再び学校で学んだ|다시 학교에 다녔다
失去摯愛|Lost a loved one|大切な人を亡くした|사랑하는 사람을 잃었다
孫子女來訪|Grandchildren visit|孫が訪ねてきた|손주가 찾아왔다
公園散步|Walked in the park|公園を散歩した|공원을 산책했다
讀了一本好書|Read a great book|よい本を読んだ|좋은 책을 읽었다
看孫子女長大|Saw grandchild grow|孫の成長を見守った|손주가 자라는 것을 보았다
做了健康檢查|Had health check|健康診断を受けた|건강검진을 받았다
受到當地動亂影響|Affected by local unrest|地域の混乱の影響を受けた|지역의 혼란에 영향을 받았다
周產期問題|Perinatal conditions|周産期の問題|주산기 문제
先天異常|Congenital conditions|先天的な異常|선천적 이상
感染性疾病|Infectious disease|感染症|감염성 질환
嬰兒猝死|Sudden infant death|乳幼児突然死|영아 돌연사
營養不良|Malnutrition|栄養失調|영양실조
呼吸系統|Respiratory disease|呼吸器疾患|호흡기 질환
自然衰老|Natural aging|自然な老化|자연적인 노화
心血管|Cardiovascular disease|心血管疾患|심혈관 질환
糖尿病|Diabetes|糖尿病|당뇨병
中風|Stroke|脳卒中|뇌졸중
溺水|Drowning|溺水|익사
癌症|Cancer|がん|암
自殺|Suicide|自殺|자살
他殺|Homicide|他殺|타살
事故|Accident|事故|사고
其他|Other|その他|기타`.split('\n').map(s=>s.split('|'));
export const storyMaps=Object.fromEntries(['en','ja','ko','zh-TW'].map((lang,index)=>[lang,Object.fromEntries(rows.map(r=>[r[0],r[[1,2,3,0][index]]]))]));
export function translateStory(text,lang){const map=storyMaps[lang]||{};return Object.keys(map).sort((a,b)=>b.length-a.length).reduce((value,key)=>value.replaceAll(key,map[key]),text);}
export const coreOverrides={
 ja:{'nav.tree':'家系図','life.states':'状態 0–100','life.health':'健康','life.happiness':'幸福','life.knowledge':'知識','life.social':'人間関係','life.netAssets':'純資産（PPP）','edu.pre':'就学前','edu.univ':'大学','life.feed':'人生の記録','life.familyHead':'家族','life.familyHint':'家族の記録','life.familyGo':'家系図を見る','intro.duration':'進行速度','end.download':'人生の画像を保存','end.pastRecords':'過去の人生','end.pastNote':'記録はこのブラウザだけに保存されます。','end.viewShelf':'過去の人生を見る','end.organize':'記録を管理','end.deleteAll':'すべて削除'},
 ko:{'nav.tree':'가계도','life.states':'상태 0–100','life.health':'건강','life.happiness':'행복','life.knowledge':'지식','life.social':'관계','life.netAssets':'순자산(PPP)','edu.pre':'취학 전','edu.univ':'대학교','life.feed':'인생 기록','life.familyHead':'가족','life.familyHint':'가족 기록','life.familyGo':'가계도 보기','intro.duration':'진행 속도','end.download':'인생 이미지 저장','end.pastRecords':'지난 인생','end.pastNote':'기록은 이 브라우저에만 저장됩니다.','end.viewShelf':'지난 인생 보기','end.organize':'기록 관리','end.deleteAll':'모두 삭제'}
};
