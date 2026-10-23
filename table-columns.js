// Infer a column once, rather than assigning conflicting alignment cell by cell.
const missing=/^(?:[—–−-]|n\/?a|null|unavailable|unknown|not recorded|未记录|未記錄|暂无|暫無|无数据|無資料|不明|정보 없음|非公開|indisponible|non disponible|nicht verfügbar|nicht erfasst|no disponible|não disponível|未提供)$/iu;
export function numericValue(value){const text=String(value??'').trim();return /\p{Nd}/u.test(text)&&/^(?:(?:US|CA|AU)?\$\s*|(?:USD|EUR|GBP|JPY|CHF|AUD|CAD|CNY|KRW|BRL|INR)\s*)?[\s\p{Sc}\p{Nd}.,%+−–—/:()\-]+(?:\s*(?:years?|yrs?|岁|歲|年|Jahre|ans|años|anos|people|persons?|人))?$/iu.test(text);}
export function numericColumn(values,explicit=false){const texts=values.map(v=>String(v??'').trim()).filter(Boolean);return explicit||texts.some(numericValue)&&texts.every(t=>numericValue(t)||missing.test(t));}
