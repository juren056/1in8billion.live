let fontBytes;
export async function prepareFont(){
 if(!fontBytes)fontBytes=(async()=>{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),60000);try{const response=await fetch('/vendor/premium/KeepsakeSans-Regular.ttf',{signal:controller.signal});if(!response.ok)throw Error('font_unavailable');return await response.arrayBuffer();}finally{clearTimeout(timeout);}})().catch(error=>{fontBytes=null;throw error;});
 return fontBytes;
}
