// Original pixel scene artwork. Display only: no engine random calls or mutations.
export function ageStage(age){return age<5?0:age<12?1:age<18?2:age<60?3:4;}
const hash=value=>[...String(value)].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,7);
export function sceneKind(life){if(life?.died)return 'memory';const age=life?.age||0;if(age<5)return 'home';if(age<18)return 'school';if(age>=60)return 'quiet';return life?.stats?.employment==='employed'?'work':'outside';}
function person(ctx,life,x,y,scale=2,blink=false){
 const h=hash(life?.name?.full||life?.name||life?.country||'sample'),stage=ageStage(life?.age||0),skins=['#ecc5a0','#c5916d','#8f6045','#6b4536'],skin=skins[h%4],shirt=['#187a8a','#465e91','#947344','#5b7971'][h%4],hair=stage===4?'#c3b8aa':'#40302d';
 const r=(a,b,w,z,c)=>{ctx.fillStyle=c;ctx.fillRect(x+a*scale,y+b*scale,w*scale,z*scale);};
 const body=stage===0?8:stage===1?11:15;
 r(-5,-body-12,10,11,skin);r(-5,-body-13,10,4,hair);r(-6,-body-10,2,5,hair);r(-4,-body-7,2,blink?1:2,'#302b30');r(2,-body-7,2,blink?1:2,'#302b30');r(-1,-body-3,3,1,'#a86f59');
 r(-6,-body,12,body-3,shirt);r(-9,-body+1,3,8,shirt);r(6,-body+1,3,8,shirt);r(-9,-body+9,3,3,skin);r(6,-body+9,3,3,skin);r(-5,-3,4,5,'#394c63');r(1,-3,4,5,'#394c63');r(-6,2,5,2,'#34343e');r(1,2,5,2,'#34343e');
 if(stage===4){r(-6,-body-8,6,4,'#d7dedc');r(1,-body-8,6,4,'#d7dedc');r(-1,-body-7,2,1,'#59666c');}
}
export function drawScene(canvas,life={},kind=sceneKind(life),items=[]){
 canvas.width=384;canvas.height=216;const c=canvas.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;
 const r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const line=(x,y,w,h)=>r(x,y,w,h,'#b49a78');
 r(0,0,384,216,'#eee3cc');r(0,0,384,8,'#576b74');r(0,8,384,5,'#d3bfa0');
 for(let x=12;x<384;x+=24){r(x,18,1,139,'#e5d7bb');r(x+8,28,2,2,'#dfceb0');}
 r(0,157,384,59,'#b58b60');for(let y=160;y<216;y+=11){r(0,y,384,2,'#8e6d4e');for(let x=(y%2)*28;x<384;x+=56)r(x,y+2,1,9,'#c8a078');}
 r(0,153,384,6,'#8b7157');
 // Window: sky, landscape and a blue frame.
 r(25,31,119,94,'#8b765f');r(30,35,109,85,'#aacfd5');r(32,37,105,36,'#a8d9df');r(40,43,24,5,'#d4edf0');r(78,53,31,4,'#d4edf0');
 if(life.stats?.birthPlaceType==='rural'){r(31,85,108,35,'#8fa987');r(31,99,108,22,'#6e987c');r(43,88,18,12,'#e0c29a');r(40,85,24,4,'#8d7160');}
 else{for(let x=33;x<137;x+=20){const h=18+(hash(life.country+x)%28);r(x,120-h,16,h,'#8ba7b4');for(let y=124-h;y<115;y+=8)r(x+4,y,3,3,'#c7dee0');}}
 r(82,35,4,86,'#f0ead7');r(31,77,107,4,'#f0ead7');r(24,122,122,5,'#ddd0b7');r(19,28,132,4,'#7d6552');r(23,33,8,87,'#c6a991');r(138,33,8,87,'#c6a991');
 // Wall clock, framed landscape and warm pendant.
 r(263,28,36,34,'#6d6556');r(267,32,28,26,'#faf3dc');r(279,34,2,11,'#58656b');r(280,43,9,2,'#58656b');r(210,8,2,22,'#7b7568');r(196,30,31,4,'#d9bd80');r(201,25,21,5,'#e7cd8f');
 r(323,42,36,40,'#7f6651');r(327,46,28,32,'#c1d9d1');r(328,67,26,10,'#8bac8b');r(339,52,7,9,'#eac99d');r(335,61,15,14,'#608c9b');
 // Furniture shifts with the genuine life stage.
 if(kind==='school'){r(182,118,62,7,'#9c7652');r(188,125,5,42,'#795b43');r(233,125,5,42,'#795b43');r(191,111,24,6,'#eee7d6');r(192,109,10,2,'#5f8f9c');r(262,131,26,5,'#7e6f54');r(265,113,5,18,'#7e6f54');r(280,136,4,28,'#7e6f54');}
 else if(kind==='work'){r(174,122,102,7,'#926f4e');r(182,129,6,40,'#795b43');r(264,129,6,40,'#795b43');r(206,94,32,24,'#4b6272');r(210,98,24,16,'#9fc5c8');r(218,118,9,4,'#4b6272');r(196,123,53,3,'#d5cebc');}
 else if(kind==='outside'){r(158,158,155,26,'#9bb394');r(173,153,9,31,'#876d4c');r(156,120,42,34,'#6c987d');r(163,111,29,18,'#80aa8b');r(261,143,45,5,'#a47c53');r(265,148,4,25,'#806447');r(298,148,4,25,'#806447');}
 else{r(170,132,76,21,'#788e87');r(165,126,8,33,'#607b73');r(244,126,8,33,'#607b73');r(175,129,29,13,'#9eaca0');r(208,129,29,13,'#9eaca0');r(172,154,5,10,'#6a5748');r(241,154,5,10,'#6a5748');}
 r(47,162,66,7,'#ac8459');r(53,169,5,22,'#7b6149');r(102,169,5,22,'#7b6149');r(59,154,21,8,'#e9dfc9');r(82,153,9,9,'#6c939a');r(89,155,5,4,'#6c939a');
 r(332,144,18,25,'#bb8a62');r(336,125,4,22,'#63896c');r(325,127,13,6,'#7f9e73');r(340,119,14,7,'#7f9e73');
 if(kind==='quiet'||kind==='memory'){r(289,133,21,6,'#a8875a');r(291,117,5,16,'#a8875a');r(292,139,4,24,'#a8875a');r(305,139,4,24,'#a8875a');}
 items.forEach((item,i)=>{const x=171+i*46;if(item.key==='school'){r(x,84,23,17,'#648894');r(x+4,86,17,13,'#f1e3c7');}else if(item.key==='work'){r(x,85,24,16,'#9b6850');r(x+7,81,10,4,'#62564c');}else if(['partner','child'].includes(item.key)){r(x,79,27,22,'#8b7058');r(x+3,82,21,16,'#e9dfc7');r(x+7,85,4,5,'#bb9270');r(x+15,85,4,5,'#b28c68');r(x+6,90,15,6,'#7b9992');}else if(item.key==='birth'){r(x,82,21,18,'#eee4cf');r(x+4,86,12,1,'#a8a38d');r(x+4,90,12,1,'#a8a38d');}});
}
export function drawActor(canvas,life={}){canvas.width=384;canvas.height=216;const c=canvas.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;person(c,life,kindX(life),180,life.age<5?1.6:2);}
export function drawPortrait(canvas,life={}){canvas.width=112;canvas.height=112;const c=canvas.getContext('2d');c.fillStyle='#e8dfc8';c.fillRect(0,0,112,112);c.fillStyle='#b8d4d4';c.fillRect(8,8,96,96);person(c,life,56,91,2.5);}
const kindX=life=>life?.age<18?278:245;
export function sceneMarkup(label){return `<div class="pixel-stage"><canvas class="scene-room" width="384" height="216" role="img" aria-label="${label}"></canvas><canvas class="scene-person" width="384" height="216" aria-hidden="true"></canvas></div>`;}
export function paintScene(root,life,items=[]){drawScene(root.querySelector('.scene-room'),life,sceneKind(life),items);drawActor(root.querySelector('.scene-person'),life);root.dataset.ageStage=ageStage(life.age||0);}
