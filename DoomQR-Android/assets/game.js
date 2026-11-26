// DOOM.QR - portrait top-down tower defence, rebuilt from the supplied screenshot.
// Keeps the extended feature set: 4 placeable "weapons", upgrades, 5 enemy types +
// boss, growing map, minimap, score/combo, saves, music and all app features.
let mode,paused,wave,lives,coins,score,kills,combo,comboT,reveal,selected,waveActive;
let towers,enemies,shots,particles,trees,path,pathLen,t,tic,shake,hitT,fx,daily,seed,sens,wLvl,meta;
const W=160,H=260,MX=6,MY=18,MW=148,MH=204,BY=224;
document.body.innerHTML='<canvas id=V width='+W+' height='+H+' style="position:fixed;inset:0;margin:auto;width:min(100vw,61.5dvh);height:auto;image-rendering:pixelated;outline:1e4px solid #1a0f0d">';
const cv=V,cx=cv.getContext('2d'),img=cx.createImageData(W,H),D=img.data.fill(255),M=Math;
const R=()=>{if(!seed)return M.random();seed=(M.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const P=(x,y,c)=>{const i=((y|0)*W+(x|0))*4;if(i<0||i>=D.length)return;D[i]=c[0];D[i+1]=c[1];D[i+2]=c[2]};
const rect=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(x|0,y|0,w|0,h|0)};
const px=(x,y,c)=>P(x,y,c);
const line=(x0,y0,x1,y1,c,w)=>{cx.strokeStyle=c;cx.lineWidth=w;cx.lineCap='square';cx.beginPath();cx.moveTo(x0,y0);cx.lineTo(x1,y1);cx.stroke()};
const text=(s,x,y,size,c)=>{cx.fillStyle=c;cx.font='bold '+size+'px monospace';cx.fillText(s,x|0,y|0)};
// pixel palette matched to the reference screenshot
const C={bg:'#1a0f0d',grass:'#5a7a4a',speck:'#4a6a3a',path:'#cdbf83',edge:'#8b8060',card:'#3a1f2e',cardOn:'#8a4a1e',gold:'#ffe08a',fire:'#ff7a18',ice:'#4fc3ff',rock:'#9a9390',missile:'#8bd94f'};
// path (local coordinates inside the map rectangle)
const RAW=[[80,0],[80,28],[132,28],[132,64],[40,64],[40,108],[112,108],[112,152],[52,152],[52,186],[80,204]];
const pathAt=u=>{
 let d=u*pathLen,i=0;
 while(i<path.length-1){const a=path[i],b=path[i+1],s=M.hypot(b[0]-a[0],b[1]-a[1]);if(d<=s)return[a[0]+(b[0]-a[0])*d/s,a[1]+(b[1]-a[1])*d/s];d-=s;i++}
 return path[path.length-1];
};
const buildPath=()=>{path=RAW.map(p=>[p[0],p[1]]);pathLen=0;for(let i=0;i<path.length-1;i++)pathLen+=M.hypot(path[i+1][0]-path[i][0],path[i+1][1]-path[i][1])};
buildPath();
// tower types (the "four weapons"), costs from the screenshot for the first three
const TW=[
 {n:'FIRE',cost:25,dmg:9,rate:26,rng:34,col:C.fire,air:1,splash:4,slow:0},
 {n:'ROCK',cost:45,dmg:20,rate:48,rng:30,col:C.rock,air:0,splash:0,slow:0},
 {n:'ICE', cost:35,dmg:5, rate:20,rng:32,col:C.ice, air:1,splash:0,slow:.5},
 {n:'MISS',cost:55,dmg:26,rate:40,rng:42,col:C.missile,air:1,splash:9,slow:0}
];
const ET=[
 {n:'imp',hp:24,sp:9,rw:6,air:0,col:'#ff8a2a',sz:4},
 {n:'fly',hp:18,sp:13,rw:8,air:1,col:'#d36bff',sz:4},
 {n:'swarm',hp:12,sp:20,rw:4,air:0,col:'#b6e34a',sz:3},
 {n:'brute',hp:90,sp:6,rw:16,air:0,col:'#a0a0a8',sz:6},
 {n:'sniper',hp:30,sp:11,rw:10,air:0,col:'#5aa0ff',sz:4},
 {n:'boss',hp:500,sp:5,rw:100,air:0,col:'#ff4040',sz:9}
];
let AC=null;
const sfx=(f,d,type,vol)=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.value=f;g.gain.value=vol||.04;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}};
const vib=ms=>{try{window.Android&&Android.vibrate&&Android.vibrate(ms)}catch(e){}};
const ach=(id,label)=>{if(!meta.ach[id]){meta.ach[id]=1;window.__saveMsg&&window.__saveMsg('ACHIEVEMENT: '+label);saveMeta()}};
const saveMeta=()=>{try{window.Android&&Android.setMeta&&Android.setMeta(JSON.stringify(meta))}catch(e){}};
try{meta=JSON.parse((window.Android&&Android.getMeta&&Android.getMeta())||'{}')}catch(e){meta={}}
meta.scores=meta.scores||[];meta.ach=meta.ach||{};meta.bestWave=meta.bestWave||0;meta.bestScore=meta.bestScore||0;
const within=(x,y)=>x>=MX&&x<MX+MW&&y>=MY&&y<MY+MH;
const onPath=(x,y)=>{for(let u=0;u<=1;u+=.004){const p=pathAt(u);if(M.hypot(p[0]+MX-x,p[1]+MY-y)<7)return true}return false};
const nearTree=(x,y)=>trees.some(o=>M.hypot(o.x-x,o.y-y)<7);
const nearTower=(x,y)=>towers.some(o=>M.hypot(o.x-x,o.y-y)<10);
const makeTrees=()=>{trees=[];for(let i=0;i<26;i++){const x=MX+5+R()*(MW-10),y=MY+5+R()*(MH-10);if(!onPath(x,y))trees.push({x:x,y:y})}};
const reset=()=>{
 mode='playing';paused=false;wave=1;lives=20;coins=75+(meta.bestWave>=5?20:0);score=0;kills=0;combo=1;comboT=0;
 reveal=3;selected=0;waveActive=false;towers=[];enemies=[];shots=[];particles=[];fx=[];tic=0;shake=0;hitT=0;
 daily=false;seed=0;sens=1;wLvl=[0,0,0,0];if(meta.bestWave>=10)wLvl[3]=1;
 makeTrees();window.__saveMsg&&window.__saveMsg('PLACE TOWERS - TAP ARROW TO START');
};
window.startGame=()=>reset();
window.startDaily=()=>{
 const d=new Date().toISOString().slice(0,10);
 if(meta.daily===d){window.__saveMsg&&window.__saveMsg('DAILY DONE TODAY');return}
 reset();daily=true;seed=[...d].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)>>>0;
 window.__saveMsg&&window.__saveMsg('DAILY CHALLENGE');
};
window.continueGame=()=>window.loadGame();
window.setWeapon=n=>{selected=M.max(0,M.min(3,n|0));sfx(500,.04,'square',.03)};
window.getGameState=()=>({wp:selected,ammo:coins,hp:lives,score:score,combo:combo,wave:wave,name:TW[selected].n,mode:mode,paused:paused,daily:daily});
window.getMeta=()=>meta;
window.setSensitivity=v=>{sens=M.max(.4,M.min(2,v))};
window.setPaused=v=>{if(mode!=='playing')return;paused=!!v};
const record=()=>{
 meta.bestScore=M.max(meta.bestScore,score);meta.bestWave=M.max(meta.bestWave,wave);
 meta.scores.push({s:score,w:wave,d:new Date().toISOString().slice(0,10)});
 meta.scores.sort((a,b)=>b.s-a.s);meta.scores=meta.scores.slice(0,5);
 if(wave>=5)ach('wave5','WAVE 5');
 if(daily)meta.daily=new Date().toISOString().slice(0,10);
 saveMeta();
};
// ---------- input ----------
cv.addEventListener('pointerdown',e=>{
 if(mode!=='playing'||paused)return;
 const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
 e.preventDefault();e.stopPropagation();
 if(y>=BY){ // bottom cards
  const n=Math.floor(x/(W/5));
  if(n<4){selected=n;sfx(600,.05,'square',.04)}
  else startWave();
  return;
 }
 if(!within(x,y))return;
 const existing=towers.find(o=>M.hypot(o.x-x,o.y-y)<7);
 if(existing){
  const cost=15+existing.lv*15;
  if(coins>=cost&&existing.lv<5){coins-=cost;existing.lv++;sfx(900,.12,'sine',.05);window.__saveMsg&&window.__saveMsg(TW[existing.type].n+' LV '+existing.lv);vib(20)}
  return;
 }
 if(onPath(x,y)||nearTree(x,y)||nearTower(x,y))return;
 const tw=TW[selected];
 if(coins<tw.cost){window.__saveMsg&&window.__saveMsg('NEED '+tw.cost);return}
 coins-=tw.cost;towers.push({x:x,y:y,type:selected,lv:wLvl[selected]||0,cd:0});
 sfx(400,.08,'square',.04);vib(10);
},{passive:false});
onkeydown=e=>{
 if(e.keyCode>=49&&e.keyCode<=52)window.setWeapon(e.keyCode-49);
 if(e.keyCode==32)startWave();
 if(e.keyCode==80||e.keyCode==27)window.setPaused(!paused);
};
// ---------- waves ----------
const startWave=()=>{
 if(waveActive||mode!=='playing')return;
 waveActive=true;
 const n=4+wave*2;
 for(let i=0;i<n;i++){
  let kind=0;const q=R();
  if(wave>=3&&q<.15)kind=1;else if(wave>=2&&q<.30)kind=2;
  else if(wave>=4&&q<.42)kind=3;else if(wave>=5&&q<.52)kind=4;
  if(wave%5==0&&i==n-1)kind=5;
  const e=ET[kind],mul=1+wave*.16;
  enemies.push({kind:kind,x:MX+path[0][0],y:MY+path[0][1],u:0,hp:e.hp*mul,max:e.hp*mul,sp:e.sp,slowT:0,t:0});
 }
 window.__saveMsg&&window.__saveMsg('WAVE '+wave+(wave%5==0?' - BOSS':''));
 sfx(260,.2,'sawtooth',.04);
};
const finishWave=()=>{
 waveActive=false;wave++;
 const bonus=18+wave*6;coins+=bonus;score+=bonus;
 if(wave%3==0&&reveal<3){reveal++;window.__saveMsg&&window.__saveMsg('MORE MAP REVEALED');ach('explore','MAP EXPANDED')}
 window.__saveMsg&&window.__saveMsg('WAVE CLEAR +'+bonus);
 sfx(800,.18,'sine',.05);
};
const addScore=(n)=>{
 score+=n;combo=M.min(combo+1,9);comboT=120;
 if(combo>=5)ach('combo5','x5 COMBO');
 if(fx.length<10)fx.push({x:MX+R()*MW,y:MY+R()*80,t:25,txt:'+'+n});
};
const hurt=(e,n,slow)=>{
 e.hp-=n;hitT=5;
 if(slow)e.slowT=45;
 if(fx.length<12)fx.push({x:e.x,y:e.y-4,t:18,txt:'-'+Math.round(n)});
 if(e.hp<=0&&!e.dead){
  e.dead=1;kills++;const rw=ET[e.kind].rw;coins+=rw;addScore(10*combo+rw);
  sfx(700+combo*30,.09,'square',.04);vib(18);
  for(let i=0;i<4;i++)particles.push({x:e.x,y:e.y,vx:(R()-.5)*1.6,vy:(R()-.5)*1.6,t:14,col:ET[e.kind].col});
 }
};
// ---------- simulation ----------
const step=()=>{
 tic++;
 if(comboT>0)comboT--;else combo=1;
 fx.forEach(f=>f.t--);fx=fx.filter(f=>f.t>0);
 particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.t--});particles=particles.filter(p=>p.t>0);
 if(shake>0)shake--;
 // enemies
 for(const e of enemies){
  if(e.dead)continue;
  e.t++;
  const e0=ET[e.kind],sp=e0.sp*(e.slowT>0?.45:1)*(e.kind==5?1:1);
  if(e.slowT>0)e.slowT--;
  e.u+=sp/pathLen;
  if(e.u>=1){
   e.dead=1;lives-=e.kind==5?5:1;redFlash=12;sfx(90,.2,'sawtooth',.06);vib(60);
   if(lives<=0){lives=0;mode='dead';record();sfx(60,.5,'sawtooth',.08)}
   continue;
  }
  const p=pathAt(e.u);e.x=MX+p[0];e.y=MY+p[1];
 }
 enemies=enemies.filter(e=>!e.dead);
 // towers
 for(const w of towers){
  if(w.cd>0)w.cd--;
  const tw=TW[w.type],rng=tw.rng*(1+.12*w.lv),dmg=tw.dmg*(1+.3*w.lv);
  if(w.cd>0)continue;
  let best=null,bd=rng;
  for(const e of enemies){
   if(!tw.air&&ET[e.kind].air)continue;
   const d=M.hypot(e.x-w.x,e.y-w.y);
   if(d<bd){bd=d;best=e}
  }
  if(best){
   w.cd=tw.rate*(1-.08*w.lv);
   shots.push({x:w.x,y:w.y,tx:best.x,ty:best.y,target:best,dmg:dmg,splash:tw.splash,slow:tw.slow,col:tw.col,t:30,lv:w.lv});
   sfx(w.type==3?180:w.type==2?900:300,.05,'square',.025);
  }
 }
 // projectiles
 for(const s of shots){
  s.t--;
  let tx=s.tx,ty=s.ty;
  if(s.target&&!s.target.dead){tx=s.target.x;ty=s.target.y}
  const a=M.atan2(ty-s.y,tx-s.x),sp=2.6;
  s.x+=M.cos(a)*sp;s.y+=M.sin(a)*sp;
  if(M.hypot(tx-s.x,ty-s.y)<4||s.t<=0){
   s.done=1;
   if(s.splash){for(const e of enemies)if(!e.dead&&M.hypot(e.x-s.x,e.y-s.y)<s.splash)hurt(e,s.dmg*(ET[e.kind].air?.8:1),s.slow)}
   else if(s.target&&!s.target.dead)hurt(s.target,s.dmg,s.slow);
   for(let i=0;i<3;i++)particles.push({x:s.x,y:s.y,vx:(R()-.5)*1.2,vy:(R()-.5)*1.2,t:8,col:s.col});
  }
 }
 shots=shots.filter(s=>!s.done);
 if(waveActive&&enemies.length==0&&!enemies.pending)finishWave();
};
let redFlash=0;
// ---------- rendering ----------
const drawTree=(x,y)=>{
 const p=pathAt(0); // decorative pine tree
 cx.fillStyle='#2a160c';cx.fillRect(x-4,y-6,8,11);
 cx.fillStyle='#c85a10';cx.fillRect(x-3,y-6,6,3);
 cx.fillStyle='#ff9a20';cx.fillRect(x-2,y-9,4,4);cx.fillRect(x-3,y-4,6,3);cx.fillRect(x-4,y-1,8,3);
 cx.fillStyle='#7a3a08';cx.fillRect(x-1,y+4,2,2);
};
const drawTower=(w)=>{
 const tw=TW[w.type];
 cx.fillStyle='#241612';cx.fillRect(w.x-6,w.y-6,12,12);
 cx.fillStyle='#8a827c';cx.fillRect(w.x-5,w.y-3,10,7);
 cx.fillStyle='#5a5450';cx.fillRect(w.x-3,w.y,6,3);
 cx.fillStyle=tw.col;cx.fillRect(w.x-4,w.y-7,8,5);
 if(w.lv>0){cx.fillStyle='#ffe08a';cx.fillRect(w.x-2,w.y-11,Math.min(5,w.lv),1)}
};
const drawEnemy=(e)=>{
 const E=ET[e.kind],s=E.sz;
 cx.fillStyle='#160d0a';cx.fillRect(e.x-s-1,e.y-s-1,2*s+2,2*s+2);
 cx.fillStyle=E.col;cx.fillRect(e.x-s,e.y-s,2*s,2*s);
 if(E.air){cx.fillStyle='#fff';cx.fillRect(e.x-s-2,e.y-1,2,2);cx.fillRect(e.x+s,e.y-1,2,2)}
 cx.fillStyle='#ffe08a';cx.fillRect(e.x-1,e.y-1,2,2);
 if(e.kind==5){cx.fillStyle='#ffe08a';cx.fillRect(e.x-2,e.y-s-4,4,2)}
};
const draw=()=>{
 cx.fillStyle=C.bg;cx.fillRect(0,0,W,H);
 // grass
 const top=MY+Math.max(0,(3-reveal)*26);
 rect(MX,top,MW,MH-(top-MY),C.grass);
 for(let i=0;i<150;i++){
  const x=MX+(i*47%MW),y=top+(i*71%(MH-(top-MY)));
  px(x,y,C.speck);
 }
 // path
 cx.lineJoin='round';
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1];
  line(MX+a[0],MY+a[1],MX+b[0],MY+b[1],C.edge,14);
  line(MX+a[0],MY+a[1],MX+b[0],MY+b[1],C.path,10);
 }
 // fog on unrevealed area
 if(reveal<3){cx.fillStyle='rgba(20,12,10,.82)';cx.fillRect(MX,MY,MW,top-MY)}
 // trees
 trees.forEach(o=>{if(o.y>=top)drawTree(o.x,o.y)});
 // base
 const ep=pathAt(1);cx.fillStyle='#2a160d';cx.fillRect(MX+ep[0]-7,MY+ep[1]-7,14,14);
 cx.fillStyle='#d03028';cx.fillRect(MX+ep[0]-5,MY+ep[1]-5,10,8);
 cx.fillStyle='#8a827c';cx.fillRect(MX+ep[0]-6,MY+ep[1]+2,12,4);
 // towers, enemies, shots, particles
 towers.forEach(drawTower);
 enemies.forEach(e=>{if(e.y>=top||!ET[e.kind].air)drawEnemy(e)});
 shots.forEach(s=>{cx.fillStyle=s.col;cx.fillRect(s.x-2,s.y-2,4,4)});
 particles.forEach(p=>{cx.fillStyle=p.col;cx.fillRect(p.x,p.y,2,2)});
 // enemy health bars
 enemies.forEach(e=>{if(e.hp<e.max){const w=Math.max(8,ET[e.kind].sz*3);cx.fillStyle='#200';cx.fillRect(e.x-w/2,e.y-ET[e.kind].sz-5,w,2);cx.fillStyle='#0f0';cx.fillRect(e.x-w/2,e.y-ET[e.kind].sz-5,w*(e.hp/e.max),2)}});
 // damage numbers
 fx.forEach(f=>{cx.fillStyle='#ffe08a';cx.font='bold 9px monospace';cx.fillText(f.txt,f.x,f.y-f.t*.6)});
 // top HUD
 rect(0,0,W,16,'#1a0f0d');
 cx.fillStyle='#ff4a4a';cx.fillRect(4,5,4,6);cx.fillRect(5,4,2,8);
 text(lives+'',11,13,14,'#ffe08a');
 cx.fillStyle='#ff9a20';cx.fillRect(58,5,4,7);cx.fillRect(59,4,2,2);
 text(coins+'',66,13,14,'#ffe08a');
 cx.fillStyle='#ff9a20';cx.fillRect(112,4,3,9);cx.fillRect(115,7,5,2);
 text(kills+'',124,13,14,'#ffe08a');
 text('W'+wave,147,13,10,'#ffe08a');
 // minimap (top-left of grass)
 if(reveal>0){
  const s=.28;
  rect(MX+1,MY+1,42,6,'rgba(0,0,0,.55)');
  for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1];line(MX+1+a[0]*s,MY+1+a[1]*s,MX+1+b[0]*s,MY+1+b[1]*s,'#cdbf83',1)}
  towers.forEach(o=>{cx.fillStyle=TW[o.type].col;cx.fillRect(MX+1+o.x*s,MY+1+o.y*s,2,2)});
 }
 // bottom card bar
 rect(0,BY,W,H-BY,'#1a0f0d');
 const cw=W/5;
 for(let i=0;i<5;i++){
  const x=i*cw+1,y=BY+2,w=cw-2,h=H-BY-4;
  rect(x,y,w,h,i==selected?C.cardOn:C.card);
  if(i<4){
   const tw=TW[i];
   cx.fillStyle='#241612';cx.fillRect(x+w/2-7,y+8,14,14);
   cx.fillStyle='#8a827c';cx.fillRect(x+w/2-6,y+14,12,7);
   cx.fillStyle=tw.col;cx.fillRect(x+w/2-5,y+9,10,6);
   text(tw.cost+'',x+w/2,y+h-5,13,'#ffe08a');
  }else{
   cx.fillStyle='#ff9a20';
   cx.beginPath();cx.moveTo(x+w/2-2,y+h/2-6);cx.lineTo(x+w/2+5,y+h/2);cx.lineTo(x+w/2-2,y+h/2+6);cx.closePath();cx.fill();
  }
 }
 if(redFlash>0){redFlash--;cx.fillStyle='rgba(255,0,0,'+(redFlash/30*.5)+')';cx.fillRect(MX,MY,MW,MH)}
 if(hitT>0){hitT--;cx.fillStyle='#fff';cx.fillRect(79,100,2,8);cx.fillRect(76,103,8,2)}
 if(mode==='dead'||mode==='won'){
  cx.fillStyle='rgba(0,0,0,.8)';cx.fillRect(0,20,W,120);
  text(mode==='won'?'ESCAPED!':'GAME OVER',24,70,18,'#ff5a3a');
  text('WAVE '+wave+'  SCORE '+score,26,95,12,'#ffe08a');
 }
};
// ---------- save / load ----------
const keys='wave lives coins score kills combo comboT reveal selected waveActive tic daily seed redFlash'.split(' ');
window.saveGame=()=>{
 try{
  const s={};for(const k of keys)s[k]=eval(k);
  s.wLvl=wLvl.slice();s.towers=towers.map(o=>({x:o.x,y:o.y,type:o.type,lv:o.lv}));
  Android.saveGame(JSON.stringify(s));window.__saveMsg&&window.__saveMsg('SAVED');sfx(900,.08,'sine',.04)
 }catch(e){window.__saveMsg&&window.__saveMsg('SAVE FAIL')}
};
window.loadGame=()=>{
 try{
  const raw=Android.loadGame();if(!raw){window.__saveMsg&&window.__saveMsg('NO SAVE');return false}
  const d=JSON.parse(raw);for(const k of keys)if(d[k]!==undefined)eval(k+'=d[k]');
  wLvl=(d.wLvl||[0,0,0,0]).slice();
  towers=(d.towers||[]).map(o=>({x:o.x,y:o.y,type:o.type,lv:o.lv||0,cd:0}));
  enemies=[];shots=[];particles=[];fx=[];mode='playing';paused=false;waveActive=false;
  window.__saveMsg&&window.__saveMsg('LOADED');return true;
 }catch(e){window.__saveMsg&&window.__saveMsg('LOAD FAIL');return false}
};
// ---------- main loop ----------
redFlash=0;mode='title';paused=false;wave=1;lives=20;coins=75;score=0;kills=0;combo=1;comboT=0;
reveal=3;selected=0;waveActive=false;towers=[];enemies=[];shots=[];particles=[];fx=[];tic=0;shake=0;hitT=0;
daily=false;seed=0;sens=1;wLvl=[0,0,0,0];makeTrees();
const tick=()=>{if(mode==='playing'&&!paused)step();draw()};
setInterval(tick,1000/35);
