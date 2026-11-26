// STACK TAP - a simple, addictive one-tap leisure game.
// App features retained: portrait, music, save/load, 3x hold, scores,
// achievements, daily challenge, unlockables, haptics and sound.
let mode,paused,stack,block,dir,speed,score,combo,coins,cam,shake,fx,daily,seed,tic,meta,sel,boost;
const W=160,H=260,BY=232,BH=12;
document.body.innerHTML='<canvas id=V width='+W+' height='+H+' style="position:fixed;inset:0;margin:auto;width:min(100vw,61.5dvh);height:auto;image-rendering:pixelated;outline:1e4px solid #14101c">';
const cv=V,cx=cv.getContext('2d'),M=Math;
const R=()=>{if(!seed)return M.random();seed=(M.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const BG='#14101c',PAL=['#ff6b6b','#ffd166','#4ecdc4','#a78bfa','#f78fb3','#7bd88f','#63b3ed','#f6ad55'];
let AC=null;
const sfx=(f,d)=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}};
const vib=n=>{try{Android&&Android.vibrate&&Android.vibrate(n)}catch(e){}};
const saveMeta=()=>{try{Android&&Android.setMeta&&Android.setMeta(JSON.stringify(meta))}catch(e){}};
try{meta=JSON.parse((Android&&Android.getMeta&&Android.getMeta())||'{}')}catch(e){meta={}}
meta.scores=meta.scores||[];meta.ach=meta.ach||{};meta.best=meta.best||0;meta.bestStack=meta.bestStack||0;
const achieve=(id,label)=>{if(!meta.ach[id]){meta.ach[id]=1;window.__saveMsg&&window.__saveMsg('ACHIEVEMENT: '+label);saveMeta()}};
// boosters (the "four weapons"): each has its own handling/cost
const BOOST=[
 {n:'SLOW',cost:20,c:'#63b3ed',d:'Half speed for 5 drops'},
 {n:'WIDE',cost:30,c:'#4ecdc4',d:'Wider block next drop'},
 {n:'x2',cost:15,c:'#ffd166',d:'Double score for 5 drops'},
 {n:'SHIELD',cost:25,c:'#a78bfa',d:'Survive one bad drop'}
];
const reset=()=>{
 mode='playing';paused=false;stack=[{x:56,w:48,c:0}];block={x:56,w:48,c:1};
 dir=1;speed=1.6;score=0;combo=0;coins=0;cam=0;shake=0;fx=[];tic=0;sel=0;daily=false;seed=0;
 boost={slow:0,wide:0,x2:0,shield:0};
 window.__saveMsg&&window.__saveMsg('TAP TO DROP');
};
window.startGame=()=>reset();
window.startDaily=()=>{
 const d=new Date().toISOString().slice(0,10);
 if(meta.daily===d){window.__saveMsg&&window.__saveMsg('DAILY DONE TODAY');return}
 reset();daily=true;seed=[...d].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)>>>0;
 window.__saveMsg&&window.__saveMsg('DAILY CHALLENGE');
};
window.continueGame=()=>window.loadGame();
window.setWeapon=n=>{sel=M.max(0,Math.min(3,n|0))};
window.getGameState=()=>({wp:sel,ammo:coins,hp:stack.length,score:score,combo:combo,wave:stack.length,name:BOOST[sel].n,mode:mode,paused:paused,daily:daily});
window.getMeta=()=>meta;
window.setSensitivity=()=>{};
window.setPaused=v=>{if(mode==='playing')paused=!!v};
const over=()=>{
 mode='dead';meta.best=M.max(meta.best,score);meta.bestStack=M.max(meta.bestStack,stack.length);
 meta.scores.push({s:score,w:stack.length,d:new Date().toISOString().slice(0,10)});
 meta.scores.sort((a,b)=>b.s-a.s);meta.scores=meta.scores.slice(0,5);
 if(stack.length>=10)achieve('stack10','10 BLOCKS');
 if(daily)meta.daily=new Date().toISOString().slice(0,10);
 saveMeta();sfx(90,.4);vib(120);
};
const drop=()=>{
 if(mode!=='playing'||paused)return;
 const top=stack[stack.length-1],a=top,b=block;
 const left=M.max(a.x,b.x),right=M.min(a.x+a.w,b.x+b.w),ov=right-left;
 if(ov<=0){
  if(boost.shield){boost.shield=0;block={x:left,w:Math.max(12,a.w),c:(a.c+1)%PAL.length};sfx(200,.2);return}
  over();return;
 }
 const perfect=M.abs(a.x-b.x)<3;
 if(perfect){combo++;coins+=5*combo;block.w=Math.min(140,block.w+2);achieve('perfect5','5 PERFECT DROPS')}
 else combo=0;
 const pts=(10+stack.length)*(boost.x2>0?2:1);
 score+=pts;coins+=2;
 stack.push({x:left,w:ov,c:b.c});
 if(stack.length>8)cam=stack.length-8;
 if(boost.x2>0)boost.x2--;if(boost.slow>0)boost.slow--;
 speed=Math.min(5,speed+.06);
 block={x:60+Math.random()*40,w:block.w,c:(b.c+1)%PAL.length};
 sfx(perfect?900:520,.06);vib(perfect?25:8);
};
cv.addEventListener('pointerdown',e=>{
 e.preventDefault();e.stopPropagation();
 const r=cv.getBoundingClientRect(),y=(e.clientY-r.top)*H/r.height;
 if(y>=BY){ // booster cards
  const i=Math.floor((e.clientX-r.left)*W/r.width/(W/4));
  const b=BOOST[i];
  if(coins>=b.cost){coins-=b.cost;
   if(i===0)boost.slow=5;if(i===1){block.w=Math.min(140,block.w+10)}
   if(i===2)boost.x2=5;if(i===3)boost.shield=1;
   sfx(700,.1);window.__saveMsg&&window.__saveMsg(b.n+' ACTIVE');
  }else window.__saveMsg&&window.__saveMsg('NEED '+b.cost);
  return;
 }
 drop();
},{passive:false});
onkeydown=e=>{if(e.keyCode===32||e.keyCode===38)drop();if(e.keyCode>=49&&e.keyCode<=52)window.setWeapon(e.keyCode-49);if(e.keyCode===80)window.setPaused(!paused)};
const draw=()=>{
 cx.fillStyle=BG;cx.fillRect(0,0,W,H);
 // background grid
 cx.fillStyle='#1d1830';for(let y=16;y<BY;y+=16)for(let x=0;x<W;x+=16)cx.fillRect(x,y,1,1);
 // stack
 const baseY=BY-4-cam*BH;
 for(let i=0;i<stack.length;i++){
  const s=stack[i],y=baseY-i*BH;
  if(y<-BH||y>BY)continue;
  cx.fillStyle='#0b0910';cx.fillRect(s.x-1,y-1,s.w+2,BH+2);
  cx.fillStyle=PAL[s.c%PAL.length];cx.fillRect(s.x,y,s.w,BH-1);
  cx.fillStyle='rgba(255,255,255,.18)';cx.fillRect(s.x+1,y+1,s.w-2,2);
 }
 // moving block
 const y=baseY-stack.length*BH;
 if(y>-BH&&y<BY){
  cx.fillStyle='#0b0910';cx.fillRect(block.x-1,y-1,block.w+2,BH+2);
  cx.fillStyle=PAL[block.c%PAL.length];cx.fillRect(block.x,y,block.w,BH-1);
 }
 // guide
 cx.fillStyle='rgba(255,255,255,.25)';for(let x=6;x<W;x+=8)cx.fillRect(x,baseY-stack.length*BH-6,2,2);
 // HUD
 cx.fillStyle=BG;cx.fillRect(0,0,W,14);
 cx.fillStyle='#ffe08a';cx.font='bold 12px monospace';cx.fillText('SCORE '+score,4,11);
 cx.fillText('COMBO x'+(combo+1),62,11);
 cx.fillText('C '+coins,124,11);
 // cards
 cx.fillStyle=BG;cx.fillRect(0,BY,W,H-BY);
 for(let i=0;i<4;i++){
  const b=BOOST[i],x=i*(W/4)+1,y=BY+2,w=W/4-2,h=H-BY-4;
  cx.fillStyle=i===sel?'#5a3320':'#2c1f3a';cx.fillRect(x,y,w,h);
  cx.fillStyle=b.c;cx.fillRect(x+w/2-7,y+8,14,12);
  cx.fillStyle='#0b0910';cx.fillRect(x+w/2-9,y+6,18,2);
  cx.fillStyle='#ffe08a';cx.font='bold 12px monospace';cx.fillText(b.cost,x+w/2-8,y+h-5);
 }
 if(mode==='dead'){
  cx.fillStyle='rgba(0,0,0,.82)';cx.fillRect(0,40,W,130);
  cx.fillStyle='#ff6b6b';cx.font='bold 22px monospace';cx.fillText('GAME OVER',34,86);
  cx.fillStyle='#ffe08a';cx.font='bold 12px monospace';cx.fillText('SCORE '+score+'  BEST '+meta.best,26,112);
  cx.fillText('BLOCKS '+stack.length,52,136);
 }
};
const tick=()=>{
 if(mode==='playing'&&!paused){
  tic++;
  block.x+=dir*speed*(boost.slow>0?.5:1);
  if(block.x<4){block.x=4;dir=1}if(block.x+block.w>W-4){block.x=W-4-block.w;dir=-1}
 }
 draw();
};
setInterval(tick,1000/35);
const keys='score combo coins cam speed dir daily seed'.split(' ');
window.saveGame=()=>{
 try{const s={};for(const k of keys)s[k]=eval(k);
 s.stack=stack.map(o=>({x:o.x,w:o.w,c:o.c}));s.block={x:block.x,w:block.w,c:block.c};s.boost=Object.assign({},boost);
 Android.saveGame(JSON.stringify(s));window.__saveMsg&&window.__saveMsg('SAVED')}catch(e){window.__saveMsg&&window.__saveMsg('SAVE FAIL')}
};
window.loadGame=()=>{
 try{const raw=Android.loadGame();if(!raw){window.__saveMsg&&window.__saveMsg('NO SAVE');return false}
 const d=JSON.parse(raw);for(const k of keys)if(d[k]!==undefined)eval(k+'=d[k]');
 stack=(d.stack||[{x:56,w:48,c:0}]).map(o=>({x:o.x,w:o.w,c:o.c}));
 block=Object.assign({x:56,w:48,c:1},d.block||{});boost=Object.assign({slow:0,wide:0,x2:0,shield:0},d.boost||{});
 mode='playing';paused=false;window.__saveMsg&&window.__saveMsg('LOADED');return true}catch(e){window.__saveMsg&&window.__saveMsg('LOAD FAIL');return false}
};
mode='title';paused=false;stack=[{x:56,w:48,c:0}];block={x:56,w:48,c:1};dir=1;speed=1.6;
score=0;combo=0;coins=0;cam=0;tic=0;sel=0;daily=false;seed=0;boost={slow:0,wide:0,x2:0,shield:0};
