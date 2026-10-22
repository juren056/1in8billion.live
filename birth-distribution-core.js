// Presentation estimates only. Never consumes the simulation random stream.
export function estimateBirths(countries,elapsedSeconds){
 const total=countries.reduce((sum,c)=>sum+c.births,0),count=Math.max(0,Math.floor(Math.max(0,elapsedSeconds)*total/(365.25*86400)));
 const rows=countries.map((c,index)=>{const exact=count*c.births/total;return{id:c.id,count:Math.floor(exact),remainder:exact-Math.floor(exact),index};});
 let left=count-rows.reduce((n,c)=>n+c.count,0);
 for(const row of [...rows].sort((a,b)=>b.remainder-a.remainder||a.index-b.index)){if(left--<=0)break;row.count++;}
 return{count,counts:Object.fromEntries(rows.map(r=>[r.id,r.count]))};
}
