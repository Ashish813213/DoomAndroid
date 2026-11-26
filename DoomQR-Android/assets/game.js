// DOOM.QR - extended build for the Android app.
// Adds: 4 weapons (ground + air), flying enemies, missile splash, waves, score/combo.
let F,C,LT,WT,FT,FL,r,y,x,px,py,pa,pz,vx,vy,sa,ca,hp,ammo,kills,xl,mvx,mvy,tf,TS,fire,T,i,red,wt,gs,tt,tic,vh,ez,bob;
let wp,wsw,ramp,score,combo,comboT,wave,lastWave,shake;
document.body.innerHTML='<canvas id=V width=320 height=200 style="position:fixed;inset:0;margin:auto;width:min(100vw,133dvh);height:min(75vw,100dvh);image-rendering:pixelated;outline:1e4px solid">';
const cx=V.getContext('2d'),img=cx.createImageData(320,200),D=img.data.fill(255),zb=new Float32Array(53760),M=Math,R=M.random;
const P=(i,c,k)=>{D[i*=4]=c[0]*k;D[i+1]=c[1]*k;D[i+2]=c[2]*k};
const lf=(l,z)=>(32-M.max(0,4*(15-l-xl)-20/z|0))/32;
// map data (unchanged)
const MS=[...":140;240<240?153?161<348726@727D28880D07:142D08:144D09:146D0:9368D0=;=28@1?=819?1H=215@2=>>:0L3=>>22L4H>292L4=E>22L4KE122>5LA:82H6TD123H70GH0PU0ZN0N]0pV0v^0tT3XH3bT1Q["].map(c=>c.charCodeAt()-48);
[F,C,LT,WT,FT,FL]=[0,0,0,0,0,0].map(_=>new Float32Array(1040));
for(r=32;r<137;r+=7)for(y=MS[r+1];y<MS[r+1]+MS[r+3];y++)for(x=MS[r];x<MS[r]+MS[r+2];x++)[F,C,LT,WT,FT,FL].map((a,j)=>a[y*40+x]=j<2?MS[r+4+j]/8:MS[MS[r+6]*4+j-2]);
const cell=(x,y)=>40*(y|0)+(x|0);
// OPEN marks walkable cells; the map grows into unused space as waves rise.
const OPEN=new Uint8Array(1040);
for(let k=0;k<1040;k++)OPEN[k]=WT[k]||FT[k]||FL[k]||LT[k]||C[k]?1:0;
const openCell=(x,y)=>{
 if(x<1||x>38||y<1||y>24)return;
 const k=cell(x,y);F[k]=0;C[k]=20;LT[k]=5;WT[k]=1;FT[k]=4;FL[k]=0;OPEN[k]=1;
};
const carve=(x,y,w,h)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)openCell(x+i,y+j)};
const link=(lx,from,to)=>{for(let y=from;y<=to;y++)openCell(lx,y)};
// each wave reveals a new sector plus a corridor back to the existing maze
const SECTORS=[
 {x:3,y:5,w:9,h:3,l:5},{x:14,y:4,w:10,h:4,l:16},{x:25,y:3,w:12,h:5,l:24},
 {x:1,y:1,w:10,h:4,l:3},{x:13,y:1,w:11,h:4,l:16},{x:26,y:1,w:12,h:4,l:28},
 {x:36,y:10,w:3,h:6,l:36},{x:36,y:3,w:3,h:7,l:36}
];
const expandMap=n=>{
 if(n<SECTORS.length){const s=SECTORS[n];carve(s.x,s.y,s.w,s.h);link(s.l,s.y+s.h-1,s.l==36?17:11)}
 else{const g=Math.min(4,n-SECTORS.length+1);for(const s of SECTORS)carve(s.x-g,s.y-g,s.w+2*g,s.h+2*g)}
};
const HU=[,[150,96,56],[118,118,126],[156,128,40],[104,104,96],[50,200,40],[116,96,76],[200,40,40],[210,70,210],[70,190,90]];
const tex=(t,u,v)=>(u&=63,v&=63,t==5?.75+M.sin((u+tic)/6)*M.sin(v/5)/4:t==3&&v<10?.2+(u+v>>3&1):u&31&&v&31?.9:.5);
// raycaster
const render=(x,q,rx,ry,tp,bt,ci,ni,d,sd,a,u,t,l,y,fp,wp2)=>{
 fp=(hh,t,z,i,a)=>{zb[i=y*320+x]=z=160*(ez-hh)/(y-83.5);t?P(i,HU[t],.8*lf(l,z)):P(i,[140-y,60-y/3,40+y/4],1)};
 wp2=i=>{zb[i=y*320+x]=d;P(i,HU[t],tex(t,u,64*(ez-(y-83.5)*d/160))*lf(l,d))};
 for(x=0;x<320;x++){
  q=(x-159.5)/160;rx=ca-sa*q;ry=sa+ca*q;tp=0;bt=168;ci=cell(px,py);
  for(d=.01;d<40&&tp<bt;d+=d/50+.002)if((ni=cell(px+rx*d,py+ry*d))!=ci){
   sd=ni%40!=ci%40?1:-1;d=(sd>0?(ni%40+(rx<0)-px)/rx:((ni/40|0)+(ry<0)-py)/ry)||.001;l=LT[ci];
   for(y=M.max(tp,a=M.ceil(84+160*(ez-F[ci])/d));y<bt;y++)fp(F[ci],FT[ci]);bt=M.min(bt,a);
   for(y=tp;y<M.min(bt,a=M.ceil(84+160*(ez-C[ci])/d));y++)fp(C[ci],FL[ci]&1?0:4);tp=M.max(tp,a);
   u=(sd<0?px+rx*d:py+ry*d)*64;t=WT[ni]||WT[ci];l+=sd;
   for(y=M.max(tp,a=M.ceil(84+160*(ez-F[ni])/d));y<bt;y++)wp2();bt=M.min(bt,a);
   for(y=tp;y<M.min(bt,a=M.ceil(84+160*(ez-C[ni])/d));y++)wp2();tp=M.max(tp,a);ci=ni;
  }
 }
};
const blit=(x0,y0,s,w,h,f,z,m,X,Y,i,c)=>{
 for(X=M.max(0,x0|0);X<M.min(320,x0+w*s);X++)for(Y=M.max(0,y0|0);Y<M.min(200,y0+h*s);Y++)z>zb[i=Y*320+X]||(c=f((X-x0)/s|0,(Y-y0)/s|0))&&P(i,c,m);
};
const bm=(b,w,p,u,v,c)=>(c=+b[v*w+(u<w?u:2*w-1-u)])&&p[c-1];
const IMP='0010000001200000012100000012222200122222001231220012222200121313001121110112222212222222122122221221222212212222310122223001222200122110001221000012210001111100';
const IPAL=[[56,24,16],[140,76,44],[255,220,60]];
// sprites: 0/1 imp, 2 fireball, 4 flyer, 6 missile, 7 blast, 8 medkit
const spr=(o,u,v,c)=>{
 if(o.k==2)return(c=M.hypot(u-7.5,v-9.5)/4)<1&&[255,255-c*200,120*(1-c)**2];
 if(o.k==6)return(c=M.hypot(u-7.5,v-9.5)/5)<1&&[230,230-c*120,60];
 if(o.k==7)return(c=M.hypot(u-7.5,v-9.5)/9)<1&&[255,255-c*100,120-c*120];
 if(o.k==8)return v>3&&v<16&&u>3&&u<12&&(u>5&&u<10&&v>5&&v<14?[240,60,60]:[230,230,230]);
 if(o.k==4)return(v>6&&v<13&&((u>0&&u<6)||(u>9&&u<15))&&[90,90,110])||(c=M.hypot(u-7.5,v-9.5)/5)<1&&[200,80-c*70,240-c*100];
 return o.s>3?(v=v*4-60,v>=0&&v<20&&(c=bm(IMP,8,IPAL,u,v))&&c):(v>=0&&v<20&&(c=bm(IMP,8,IPAL,u,v))&&c);
};
const drawThings=(o,s)=>{
 for(o of T)o.d=(o.x-px)*ca+(o.y-py)*sa;
 T.sort((a,b)=>b.d-a.d);
 for(o of T)o.d>.2&&(s=7.5/o.d,blit(160+160*((o.y-py)*ca-(o.x-px)*sa)/o.d-8*s,84-160*(o.z-ez)/o.d-20*s,s,16,20,(u,v)=>spr(o,u,v),o.d,o.k<2?lf(LT[cell(o.x,o.y)],o.d):1));
};
// player
px=3;py=12;pa=pz=vx=vy=sa=0;ca=1;hp=100;ammo=24;kills=0;xl=0;
wp=0;wsw=0;ramp=0;score=0;combo=1;comboT=0;wave=1;lastWave=0;shake=0;
const K=new Uint8Array(256);
mvx=mvy=tf=TS=0;
ontouchstart=ontouchmove=ontouchend=(e,l,t)=>{
 tf=mvx=mvy=l=0;e.type[5]=='s'&&tap();
 for(t of e.touches)t.pageX*2>innerWidth?tf=1:(l=TS=TS||[t.pageX,t.pageY],mvx=cl((t.pageX-TS[0])/40),mvy=cl((t.pageY-TS[1])/40));
 TS=l;
};
onkeydown=onkeyup=e=>{
 K[e.keyCode]=e.type[3]=='d';K[e.keyCode]&&tap();
 if(e.type[3]=='d'&&e.keyCode>=49&&e.keyCode<=52)setWeapon(e.keyCode-49);
 if(e.type[3]=='d'&&e.keyCode==81)setWeapon((wp+3)%4);
};
const cl=v=>M.max(-1,M.min(1,v));
const probe=(x,y,z,r,j,k,o)=>{
 for(o=-9,j=4;j--;)k=cell(x+(j&1?r:-r),y+(j&2?r:-r)),o=F[k]-z>.375||C[k]-M.max(F[k],z)<.875?99:M.max(o,F[k]);
 return o;
};
const movePlayer=(f,s)=>{
 ca=M.cos(pa+=mvx*.1+.08*(K[39]-K[37]));sa=M.sin(pa);
 f=cl(K[38]-K[40]-mvy+(K[87]-K[83]));s=K[68]-K[65];fire=tf|K[32];
 vx+=.0244*(ca*f-sa*s);vy+=.0244*(sa*f+ca*s);
 probe(px+vx,py,pz,.25)<99?px+=vx:vx=0;probe(px,py+vy,pz,.25)<99?py+=vy:vy=0;
 vx*=.906;vy*=.906;pz=probe(px,py,pz,.25);
};
// things: 0/1 imp, 2 fireball, 3 ammo, 4 flyer, 6 missile, 7 blast, 8 medkit
T=[];
const spawn=(k,x,y,z,vx=0,vy=0,vz=0,h=80)=>T.push({k,x,y,z,vx,vy,vz,h,s:0,t:0,d:0});
for(i=137;i<167;i+=3)MS[i]==1||spawn(MS[i],MS[i+1]/2,MS[i+2]/2,F[cell(MS[i+1]/2,MS[i+2]/2)]);
T.push({k:4,x:12,y:6,z:F[cell(12,6)]+1.1,vx:0,vy:0,vz:0,h:60,s:0,t:0,d:0});
const los=(x,y,z,X,Y,Z,j,n,k,b)=>{
 for(n=M.hypot(X-x,Y-y)*8+1,j=0;j<n;j++)if((b=z+(Z-z)*j/n)<F[k=cell(x+(X-x)*j/n,y+(Y-y)*j/n)]||b>C[k])return 0;
 return 1;
};
const ouch=n=>{n>0&&hp&&(hp=M.max(hp-n,0),red+=n,shake=6)};
red=0;
const hurt=(o,n)=>{
 if((o.k<2||o.k==4)&&o.s<4&&n>0){
  if((o.h-=n)>0)o.k||(o.s=o.s||1);
  else{o.s=4;kills++;combo=M.min(combo+1,9);comboT=110;score+=100*combo;shake=Math.max(shake,3)}
 }
};
// weapons: name, cycle tics, pellets, damage per pellet, spread, ammo cost, air bonus
const W=[
 {n:'PISTOL',t:14,p:1,d:10,s:.015,c:0,a:1},
 {n:'SHOTGN',t:44,p:7,d:6,s:.16,c:1,a:1},
 {n:'CHAIN', t:6, p:1,d:4,s:.05,c:1,a:1,rmp:1},
 {n:'MISSLE',t:38,p:1,d:34,s:0,c:3,a:2,k:1}
];
const hitScan=(ang,dmg,tol)=>{
 for(o of T)if(o.k<2||o.k==4){
  const dx=o.x-px,dy=o.y-py,f=dx*ca+dy*sa;
  if(f>.2&&f<32&&M.abs((dy*ca-dx*sa)/f-M.tan(ang))<tol&&los(px,py,ez,o.x,o.y,o.z+(o.k==4?0:.45)))
   hurt(o,dmg*(o.k==4?1:1));
 }
};
const shoot=()=>{
 const w=W[wp];
 if(w.k){spawn(6,px,py,ez-.15,ca*.32,sa*.32,.02,34);shake=4;return}
 const sp=(1+(w.rmp?ramp/9:0))*w.s;
 for(let j=w.p;j--;)hitScan((R()-R())*sp,w.d,w.p>1?.05:.035);
 if(w.rmp)ramp=M.min(ramp+2.5,18);
};
const setWeapon=n=>{n=M.max(0,M.min(3,n|0));if(n!=wp){wp=n;wt=-1;wsw=8;ramp=0}};
window.setWeapon=setWeapon;
window.getGameState=()=>({wp:wp,ammo:ammo,hp:hp,score:score,combo:combo,wave:wave,name:W[wp].n});
// save / restore progress through the Android bridge (localStorage is unreliable on file://)
const stateKeys='px py pa pz vx vy sa ca hp ammo kills xl mvx mvy tic vh ez bob wp wsw ramp score combo comboT wave lastWave gs tt red wt'.split(' ');
const saveState=()=>{
 const s={};for(const k of stateKeys)s[k]=eval(k);
 s.T=T.map(o=>({k:o.k,x:o.x,y:o.y,z:o.z,vx:o.vx,vy:o.vy,vz:o.vz,h:o.h,s:o.s,t:o.t}));
 return s;
};
window.saveGame=()=>{
 try{Android.saveGame(JSON.stringify(saveState()));window.__saveMsg&&window.__saveMsg('SAVED')}catch(e){window.__saveMsg&&window.__saveMsg('SAVE FAIL')}
};
window.loadGame=()=>{
 try{
  const raw=Android.loadGame();
  if(!raw){window.__saveMsg&&window.__saveMsg('NO SAVE');return false}
  const d=JSON.parse(raw);
  for(const k of stateKeys)if(d[k]!==undefined)eval(k+'=d[k]');
  T=(d.T||[]).map(o=>({k:o.k,x:o.x,y:o.y,z:o.z,vx:o.vx||0,vy:o.vy||0,vz:o.vz||0,h:o.h||80,s:o.s||0,t:o.t||0,d:0}));
  for(let n=0;n<=wave-2;n++)expandMap(n);
  window.__saveMsg&&window.__saveMsg('LOADED');
  return true;
 }catch(e){window.__saveMsg&&window.__saveMsg('LOAD FAIL');return false}
};
const think=(o,a,d,f,j,q)=>{
 for(o of T){
  o.t++;
  d=M.hypot(px-o.x,py-o.y);
  if(o.k==2){
   o.x+=o.vx;o.y+=o.vy;o.z+=o.vz;a=o.z+.45;
   d<.35&&a>pz&&a<pz+.9?(ouch(2+2*(R()*6|0)),1):a<F[f=cell(o.x,o.y)]||a>C[f];
   (d<.35||a<F[f]||a>C[f])&&(o.k=5,o.t=6);
  }else if(o.k==6){
   // missile homes gently on the nearest flyer, so it works as an air weapon
   let best=null,bd=9;
   for(q of T)if(q.k==4){const dd=M.hypot(q.x-o.x,q.y-o.y);if(dd<bd){bd=dd;best=q}}
   if(best){a=M.atan2(best.y-o.y,best.x-o.x);o.vx+=M.cos(a)*.01;o.vy+=M.sin(a)*.01;o.vz+=(best.z-o.z)*.008}
   o.x+=o.vx;o.y+=o.vy;o.z+=o.vz;
   for(q of T)if((q.k<2||q.k==4)&&M.hypot(q.x-o.x,q.y-o.y)<.95&&M.abs(q.z-o.z)<1.4){hurt(q,wDamage());q.k=5}
   (o.t>100||o.z<F[f=cell(o.x,o.y)]||o.z>C[f])&&(o.k=7,o.t=0,o.vx=o.vy=o.vz=0);
  }else if(o.k==7){
   o.t>9&&(o.k=5);
  }else if(o.k==3){
   d<.5&&(ammo+=12,o.k=5,score+=25);
  }else if(o.k==8){
   d<.5&&(hp=M.min(100,hp+30),o.k=5,score+=50);
  }else if(o.k==4){
   o.z=F[f=cell(o.x,o.y)]+1.1+M.sin(o.t/7)*.28;
   if(hp&&los(o.x,o.y,o.z,px,py,ez)){
    a=M.atan2(py-o.y,px-o.x);
    d>.8&&(o.x+=M.cos(a)*.028,o.y+=M.sin(a)*.028);
    o.t%150==0&&spawn(2,o.x,o.y,o.z,(px-o.x)/d*.11,(py-o.y)/d*.11,(ez-o.z)/d*.11);
   }
  }else{
   !o.k&&o.s<4&&(o.s==2?(o.t==16&&spawn(2,o.x,o.y,o.z+.05,(px-o.x)/d*.156,(py-o.y)/d*.156,(ez-.8-o.z)/d*.156),o.t>22&&(o.s=1)):
    hp&&los(o.x,o.y,o.z+.7,px,py,ez)&&(o.s?o.t>40&&R()<.01&&(o.s=2,o.t=0):o.s=1),
    o.s==1&&d>.7&&(a=M.atan2(py-o.y,px-o.x)+o.vx,f=M.cos(a)*.042,a=M.sin(a)*.042,
     probe(o.x+f,o.y+a,o.z,.3)<99?(o.x+=f,o.y+=a,o.z=probe(o.x,o.y,o.z,.3)):o.vx=R()*4-2));
   o.s==4&&o.t>110&&(o.k=5);
  }
 }
 T=T.filter(o=>o.k!=5);
};
const wDamage=()=>W[3].d;
// weapon timing: fire on tic 3, recycle after the weapon's cycle
wt=-1;
const weaponTic=()=>{
 wsw>0&&wsw--;
 ramp>0&&(ramp=M.max(0,ramp-.12));
 if(wt<0){if(fire&&hp&&ammo>=W[wp].c&&wsw==0){wt=0}}
 else{
  wt++;
  wt==3&&(ammo-=W[wp].c,shoot());
  wt>=W[wp].t&&(wt=-1);
 }
 xl=wt>2&&wt<10?2:0;
};
const GUN='000000000122000000000122000000000122000000000122000000000122000000000122000000000122000000001122000004333122000043333122000444444122000433333122000433333122000444444122000433333122000043333122000004444122000000111122000001222222000012111111000121111111001211111111';
const GPAL=[[40,40,46],[112,112,124],[156,86,40],[96,52,24]];
const drawGun=(gx,gy)=>{
 gx=124+bob*64*M.cos(tic*3.1416/32);
 gy=104+bob*64*M.abs(M.sin(tic*3.1416/32))+(wt>2)*M.sin((wt-2)/42*3.1416)*28;
 xl&&blit(gx+12,gy-36,3,16,20,(u,v)=>spr({k:2},u,v),0,1);
 const pal=wp==2?[[40,40,46],[150,150,160],[180,180,190],[90,90,100]]:wp==3?[[40,46,40],[110,140,100],[160,200,80],[80,110,60]]:GPAL;
 blit(gx,gy,3,24,22,(u,v)=>bm(GUN,12,pal,u,v),0,1);
};
const tx=(s,x,y,f,c)=>{cx.font='bold '+f+'px sans-serif';cx.fillStyle=c;cx.fillText(s,x,y)};
const box=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)};
const FACE='001111101111111112222122222212111221231322122222212222220122222012211100122220001111';
const drawBar=(i,f)=>{
 for(i=53760;i<64e3;i++)P(i,[108,108,112],1);
 f=hp/100;
 blit(146,172,2,14,12,(u,v)=>bm(FACE,7,[[40,24,16],[240-30*f,60+100*f,50+70*f],hp?[220,220,220]:[40,24,16]],u,v),0,1);
};
const drawHud=()=>{
 tx('AMMO '+ammo,2,193,13,'#d21');
 tx(hp+'%',82,193,13,'#d21');
 tx('SC '+score,180,193,12,'#d21');
 tx('W'+wave+' x'+combo,250,193,12,'#9f9');
 box(159,83,2,2,'rgba(255,255,255,.6)');
};
gs=1;tt=0;
const tap=()=>{(gs>2||vh<.11)&&location.reload()};
const randomOpen=()=>{
 let k,tries=0;
 do{k=cell(1+(R()*37|0),1+(R()*24|0))}while((!OPEN[k]||FL[k]&4)&&tries++<80);
 return k;
};
const spawnWave=()=>{
 wave++;
 expandMap(wave-2);
 let n=3+wave,j,k;
 for(j=0;j<n;j++){
  k=randomOpen();
  spawn(R()<.28?4:0,k%40,(k/40|0),F[k],0,0,0,R()<.25?150:80);
 }
 if(wave%2==0){k=randomOpen();spawn(8,k%40,(k/40|0),F[k]+.1)}
};
const worldTic=()=>{
 FL[cell(px,py)]&4&&(gs=3,tt=tic/35|0);
 red&&red--;
 shake>0&&shake--;
 comboT>0?comboT--:(combo=1);
 gs==1&&tic-lastWave>90&&!T.some(o=>o.k<2||o.k==4)&&(spawnWave(),lastWave=tic);
};
const overlay=()=>{
 box(0,0,320,168,`rgba(255,0,0,${hp?red/100:.5})`);
 gs>2&&(box(0,0,320,168,'#000c'),tx('KILLS '+kills,60,52,32,'#d21'),tx('SCORE '+score,60,84,32,'#fd0'),
  tx('WAVE '+wave,80,116,32,'#9f9'),tx('TIME '+tt+'S',95,148,24,'#d21'));
};
tic=0;vh=ez=.64;
setInterval(()=>{
 if(gs==1){
  tic++;
  hp?movePlayer():(vh=M.max(.1,vh-1/64),fire=0);
  weaponTic();think();worldTic();
 }
 bob=M.min(.25,16*(vx*vx+vy*vy));
 ez=pz+vh+bob/2*M.sin(tic*3.1416/10);
 render(),drawThings(),hp&&drawGun(),drawBar(),cx.putImageData(img,0,0),overlay(),drawHud();
},1e3/35);
