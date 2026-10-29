// Until the account's certified CMP can be verified, never serve in these regions.
const excluded=new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE GB CH RU'.split(' '));
export function contentAdsPolicy(request,env){
 const country=request.cf?.country;
 return {allowed:env.CONTENT_ADS_ENABLED==='true'&&/^[A-Z]{2}$/.test(country||'')&&!['XX','T1'].includes(country)&&!excluded.has(country)&&request.headers.get('Sec-GPC')!=='1',personalized:false,restrictedDataProcessing:true,policy:'visible-direct-v2'};
}
