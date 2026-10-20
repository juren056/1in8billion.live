// Export presentation only. Original logs, RNG and Replay v1 are untouched.
const rows=[
 ['武裝衝突封鎖道路，學校關閉一週。','Armed conflict blocked the roads; school closed for a week.','武力衝突で道路が封鎖され、学校は1週間休校になった。','무력 충돌로 도로가 봉쇄되고 학교가 일주일 동안 문을 닫았다.'],
 ['父親被徵召上前線，數月無音訊。','Their father was called to the front; there was no news for months.','父親が前線に召集され、数か月連絡がなかった。','아버지가 전선으로 소집되어 몇 달 동안 소식이 없었다.'],
 ['空襲警報響起，全家躲進防空洞。','An air-raid warning sounded; the family took shelter.','空襲警報が鳴り、家族で防空壕に避難した。','공습 경보가 울려 가족이 방공호로 대피했다.'],
 ['鄰居在衝突中喪生，你目睹了場面。','A neighbor died in the conflict, an event the character witnessed.','隣人が紛争で亡くなる場面を目撃した。','분쟁으로 이웃이 숨지는 장면을 목격했다.'],
 ['鄰里被疏散到臨時營地，物資匱乏。','The neighborhood was evacuated to a temporary camp with scarce supplies.','地域の住民が仮設キャンプに避難し、物資が不足した。','주민들이 임시 캠프로 대피했고 물자가 부족했다.']
];export function exportText(text,lang){let value=String(text??'');if(value==='event.birth')return({en:'Was born.',ja:'生まれた。',ko:'태어났다.','zh-TW':'出生了。'})[lang]||'Was born.';const index={en:1,ja:2,ko:3}[lang];if(index)for(const row of rows)value=value.replaceAll(row[0],row[index]);return value;}
