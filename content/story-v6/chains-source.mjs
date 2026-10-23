import {chains as previous,localChains as priorLocal,narrativeUI} from '../story-v5/chains-source.mjs';
import {places} from './country-source.mjs';
export {narrativeUI};
export const chains=previous.map(d=>({...structuredClone(d),id:d.id.replace('s5.','s6.')}));
const inherited=priorLocal.map(d=>({...structuredClone(d),id:d.id.replace('s5.','s6.')}));
export const newLocalChains=Object.entries(places).flatMap(([country,p])=>chains.filter(d=>['return','reconnect','visit'].includes(d.condition)).map(d=>({
 ...structuredClone(d),id:`s6.${country}.${d.condition}`,country,
 setupEn:d.condition==='return'?`You find ${p.objectEn} beside the materials for {interest}, paused when work began. It mentions ${p.en}. You leave the page where you can see it.`:d.condition==='reconnect'?`You recognize ${p.reunionEn} among your school things and remember {person}. Your last recorded contact was at age {lastAge}. You set it aside, thinking about whether to write.`:`During ${p.familyEn}, {person} mentions a detail you had never asked about. Work has filled your days. You note the question without pretending you have already made time.`,
 setupZh:d.condition==='return'?`你在开始工作时收起的{interest}材料旁，发现${p.objectZh}。上面提到了${p.zh}。你把那页纸留在看得见的地方。`:d.condition==='reconnect'?`你在求学时的东西里认出了${p.reunionZh}，想起{person}。上一次有记录的联系，是你{lastAge}岁的时候。你先把它放在一旁，想了想要不要写几句话。`:`${p.familyZh}时，{person}提起一个你从没问过的细节。工作最近占满了日子。你记下想问的话，没有把它写成已经认真聊过。`,
 prompt:d.prompt+` The starting point is ${d.condition==='return'?p.objectEn:d.condition==='reconnect'?p.reunionEn:p.familyEn}, not an obligation to follow a cultural script.`,
 promptZh:d.promptZh+` 眼前的起点，是${d.condition==='return'?p.objectZh:d.condition==='reconnect'?p.reunionZh:p.familyZh}，不需要把自己的生活过成某种标准答案。`
})));
export const allChains=[...chains,...inherited,...newLocalChains];
