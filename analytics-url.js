// Campaign labels only. Never send gameplay queries or replay fragments.
(function(root){
 function safeAnalyticsUrl(value){
  const url=new URL(value),safe=new URL(url.origin+url.pathname);
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id']){
   const values=url.searchParams.getAll(key);
   if(values.length!==1)continue;
   const label=values[0];
   if(label.length>0&&label.length<=100&&/^[\p{L}\p{N} _.,~-]+$/u.test(label))safe.searchParams.set(key,label);
  }
  return safe.href;
 }
 root.safeAnalyticsUrl=safeAnalyticsUrl;
})(typeof window==='undefined'?globalThis:window);
