'use strict';
const C={bg:'#0f1b2d',blue:'#58c4dd',yellow:'#ffd866',teal:'#5cd0b3',red:'#fc6255',txt:'#e8eef7',grid:'#1c2c46'};
const KEY='pp-stars-v1';
let stars={};try{stars=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){stars={}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(stars))}catch(e){}};
const $=id=>document.getElementById(id);

const GROUPS=[
 {name:'1 · Foundations',items:[{id:'push',name:'💪 Pushes & Pulls',needs:null},{id:'race',name:'🏁 Speed Race',needs:'push'}]},
 {name:"2 · Newton's Laws",items:[{id:'n1',name:'🏒 Slide & Stop (1st Law)',needs:'race'},{id:'n2',name:'🛒 Heavy vs Light (2nd Law)',soon:1},{id:'n3',name:'🎈 Balloon Rocket (3rd Law)',soon:1}]},
 {name:'3 · Gravity',items:[{id:'g1',name:'🪶 Feather & Hammer',soon:1},{id:'g2',name:'🕰️ Pendulums',soon:1}]},
 {name:'4 · Energy',items:[{id:'e1',name:'🎢 Build a Coaster',soon:1}]},
 {name:'5 · Electricity',items:[{id:'c1',name:'💡 Light the Bulb',soon:1},{id:'c2',name:'🔋 Voltage = Pressure',soon:1}]},
];
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);

function renderMap(){
  const g=$('groups');g.innerHTML='';
  for(const grp of GROUPS){
    const d=document.createElement('div');d.className='group';
    d.innerHTML=`<h3>${grp.name}</h3>`;const it=document.createElement('div');it.className='items';
    for(const m of grp.items){
      const b=document.createElement('button');b.className='item';
      const open=!m.soon&&(!m.needs||(stars[m.needs]||0)>=1);
      if(!open){b.classList.add('locked');b.innerHTML=`🔒 ${m.name}<span class="st" style="color:#6d7d98;font-size:.8em">${m.soon?'coming soon':'earn a ⭐ in the last level'}</span>`}
      else{b.innerHTML=`${m.name}<span class="st">${starStr(stars[m.id]||0)}</span>`;b.onclick=()=>start(m.id,m.name)}
      it.appendChild(b)}
    d.appendChild(it);g.appendChild(d)}
}

// ---------- canvas ----------
const cv=$('cv'),ctx=cv.getContext('2d');let W=0,H=0;
function resize(){const r=cv.getBoundingClientRect(),dpr=window.devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resize);
function arrow(x1,y1,x2,y2,col,w=5,label){
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<4)return;
  const ux=dx/L,uy=dy/L,h=Math.min(20,L*.45);
  ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2-ux*h*.8,y2-uy*h*.8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*h-uy*h*.55,y2-uy*h+ux*h*.55);ctx.lineTo(x2-ux*h+uy*h*.55,y2-uy*h-ux*h*.55);ctx.closePath();ctx.fill();
  if(label)text(label,(x1+x2)/2,(y1+y2)/2-18,col,18);
}
function text(s,x,y,col=C.txt,size=20,align='center'){ctx.fillStyle=col;ctx.font=`${size}px "Trebuchet MS",sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y)}
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function brick(x,y,w,h,col){ // LEGO brick, x=center, y=bottom
  ctx.fillStyle=col;ctx.strokeStyle='#0008';ctx.lineWidth=2;
  const n=Math.max(2,Math.round(w/22)),sw=w/n;
  for(let i=0;i<n;i++){rrect(x-w/2+i*sw+sw*.2,y-h-8,sw*.6,10,3);ctx.fill();ctx.stroke()}
  rrect(x-w/2,y-h,w,h,5);ctx.fill();ctx.stroke();
}

// ---------- game framework ----------
let game=null,last=0;
function start(id,name){
  $('map').classList.add('hidden');$('game').classList.remove('hidden');$('overlay').classList.add('hidden');
  $('title').textContent=name;resize();
  game=id==='race'?raceGame():slideGame(id);game.id=id;game.name=name;
}
function toMap(){game=null;$('game').classList.add('hidden');$('map').classList.remove('hidden');renderMap()}
$('back').onclick=toMap;$('next').onclick=toMap;$('again').onclick=()=>start(game.id,game.name);
$('reset').onclick=()=>{if(confirm('Reset all stars?')){stars={};save();renderMap()}};
function finish(n,title,expl){
  const id=game.id;stars[id]=Math.max(stars[id]||0,n);save();
  $('stars').innerHTML=`<span style="color:${C.yellow}">${'★'.repeat(n)}</span><span style="color:#33435e">${'★'.repeat(3-n)}</span>`;
  $('ovTitle').textContent=title;$('ovText').innerHTML=expl;$('overlay').classList.remove('hidden');
}
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
  if(game&&W){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=C.grid;ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    game.update(dt);game.draw()}
  requestAnimationFrame(loop)}
function pos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);game&&game.down&&game.down(pos(e))});
cv.addEventListener('pointermove',e=>{game&&game.move&&game.move(pos(e))});
cv.addEventListener('pointerup',e=>{game&&game.up&&game.up(pos(e))});
cv.addEventListener('pointercancel',e=>{game&&game.up&&game.up(pos(e))});

// ---------- sliding games: push/pull + Newton 1 ----------
const G=9.8,LEN=20;
function slideGame(id){
  const rounds=id==='push'?[
    {mu:.3,name:'Floor',col:'#3a4a66',x:3,t:[12,15],obj:'brick',hint:'Drag from the brick to PUSH it onto the yellow pad'},
    {mu:.3,name:'Floor',col:'#3a4a66',x:17,t:[5,8],obj:'brick',hint:'Now drag the other way to PULL it back'},
  ]:[
    {mu:.03,name:'❄️ Ice',col:'#9fd8ef',x:2,t:[13,15.5],obj:'puck',hint:'Ice is slippery! Flick gently…'},
    {mu:.2,name:'🟫 Carpet',col:'#8a5a44',x:2,t:[13,15.5],obj:'puck',hint:'Carpet grabs the puck more'},
    {mu:.45,name:'🌱 Grass',col:'#3f8f4f',x:2,t:[13,15.5],obj:'puck',hint:'Grass is the grippiest!'},
  ];
  let r=0,tries=0,s,drag=null,msg='',msgT=0;
  const ctrl=$('controls');
  function reset(){const R=rounds[r];s={x:R.x,v:0,moving:false,done:false,wait:0};drag=null;
    const need=Math.sqrt(2*R.mu*G*(Math.abs((R.t[0]+R.t[1])/2-R.x)));R.vmax=need*1.7;
    ctrl.innerHTML=`<span style="color:${C.teal}">${R.hint}</span>`;$('hud').textContent=`Level ${r+1}/${rounds.length} · tries ${tries}`}
  reset();
  const ppm=()=>(W-60)/LEN,gx=m=>30+m*ppm(),gy=()=>H*.62,MAXD=()=>Math.min(320,W*.4);
  return{
    down(p){if(s.moving||s.wait)return;if(Math.abs(p.x-gx(s.x))<70&&Math.abs(p.y-(gy()-25))<80)drag={x:p.x}},
    move(p){if(drag)drag.x=p.x},
    up(){if(!drag)return;const d=Math.max(-MAXD(),Math.min(MAXD(),drag.x-gx(s.x)));drag=null;if(Math.abs(d)<8)return;
      s.v=rounds[r].vmax*d/MAXD();s.moving=true;tries++;$('hud').textContent=`Level ${r+1}/${rounds.length} · tries ${tries}`},
    update(dt){const R=rounds[r];msgT=Math.max(0,msgT-dt);
      if(s.moving){const dec=R.mu*G*dt;s.x+=s.v*dt;if(Math.abs(s.v)<=dec){s.v=0}else s.v-=Math.sign(s.v)*dec;
        if(s.x<0.6){s.x=0.6;s.v=0}if(s.x>LEN-.6){s.x=LEN-.6;s.v=0}
        if(s.v===0){s.moving=false;const ok=s.x>=R.t[0]&&s.x<=R.t[1];
          if(ok){msg='✅ Perfect stop!';msgT=1.2;s.wait=1.2;s.next=true}
          else{msg=(R.t[0]>R.x)===(s.x<R.t[0])?'Too gentle — push harder!':'Too hard — gentler!';msgT=1.4;s.wait=1.4}}}
      else if(s.wait){s.wait-=dt;if(s.wait<=0){s.wait=0;if(s.next){r++;if(r>=rounds.length)return end();}reset()}}},
    draw(){const R=rounds[r],y=gy();
      ctx.fillStyle=R.col;ctx.fillRect(30,y,W-60,24);text(R.name,W/2,y+50,C.txt,22);
      ctx.fillStyle=C.yellow+'44';ctx.fillRect(gx(R.t[0]),y-90,gx(R.t[1])-gx(R.t[0]),90);
      ctx.fillStyle=C.yellow;ctx.fillRect(gx(R.t[0]),y-4,gx(R.t[1])-gx(R.t[0]),6);text('STOP HERE',(gx(R.t[0])+gx(R.t[1]))/2,y-105,C.yellow,16);
      const x=gx(s.x);
      if(R.obj==='brick')brick(x,y,70,42,'#e3463c');
      else{ctx.fillStyle='#222';ctx.strokeStyle=C.blue;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y-8,26,10,0,0,7);ctx.fill();ctx.stroke();ctx.fillRect(x-26,y-16,52,8)}
      if(drag){const d=Math.max(-MAXD(),Math.min(MAXD(),drag.x-x));const lbl=id==='push'?(d>0===(R.t[0]>R.x)?(r===1?'pull':'push'):'push'):'flick';
        if(r===1&&id==='push'){ctx.strokeStyle='#c9b48a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-25);ctx.lineTo(x+d,y-25);ctx.stroke()}
        arrow(x,y-25,x+d,y-25,C.yellow,7,lbl+' '+Math.round(Math.abs(d)/MAXD()*100)+'%')}
      else if(!s.moving&&!s.wait){const k=(Math.sin(performance.now()/300)+1)/2;arrow(x,y-80,x+(R.t[0]>R.x?1:-1)*(40+20*k),y-80,C.yellow+'88',4);text('drag me',x,y-110,C.yellow+'aa',16)}
      if(s.moving){const vs=s.v*ppm()*.35;arrow(x,y-70,x+vs,y-70,C.teal,5,'speed');arrow(x,y+12,x-Math.sign(s.v)*Math.max(20,R.mu*160),y+12,C.red,5);text('friction',x-Math.sign(s.v)*50,y+38,C.red,15)}
      if(msgT>0){ctx.globalAlpha=Math.min(1,msgT*2);text(msg,W/2,H*.18,C.txt,32);ctx.globalAlpha=1}}
  };
  function end(){const n=rounds.length,st=tries<=n+1?3:tries<=n*2+1?2:1;ctrl.innerHTML='';
    if(id==='push')finish(st,'Forces move things!','A <b style="color:#ffd866">force</b> is a push or a pull. A bigger arrow means a bigger force, so the brick moves faster.<br><span style="color:#fc6255">Friction</span> is a sneaky force that rubs against moving things and slows them down until they stop.');
    else finish(st,"Newton's 1st Law!",'A moving thing <b>keeps moving</b> unless a force stops it. On <span style="color:#9fd8ef">ice</span> there is almost no friction, so a tiny flick goes a long way. <span style="color:#3f8f4f">Grass</span> has lots of friction, so you need a big push. With <i>no</i> friction at all (like in space), the puck would slide forever!')}
}

// ---------- race game ----------
function raceGame(){
  const rounds=[{d:12,t:3},{d:20,t:4},{d:18,t:2}];
  let r=0,tries=0,speed=1,s,msg='',msgT=0;const ctrl=$('controls');
  function ui(){ctrl.innerHTML=`<button class="btn" id="minus">−</button><span style="min-width:150px;text-align:center;color:${C.teal}">speed <b id="sp">${speed}</b> m/s</span><button class="btn" id="plus">+</button><button class="btn go" id="go">GO ▶</button>`;
    $('minus').onclick=()=>{if(!s.run){speed=Math.max(1,speed-1);$('sp').textContent=speed}};
    $('plus').onclick=()=>{if(!s.run){speed=Math.min(12,speed+1);$('sp').textContent=speed}};
    $('go').onclick=()=>{if(!s.run&&!s.wait){s.run=true;s.time=0;s.x=0;tries++;hud()}}}
  const hud=()=>$('hud').textContent=`Race ${r+1}/${rounds.length} · tries ${tries}`;
  function reset(){s={x:0,time:0,run:false,wait:0};ui();hud()}
  reset();
  return{
    update(dt){const R=rounds[r];msgT=Math.max(0,msgT-dt);
      if(s.run){s.time+=dt;s.x=speed*s.time;if(s.x>=R.d){s.x=R.d;s.time=R.d/speed;s.run=false;
        if(speed===R.d/R.t){msg=`✅ ${s.time.toFixed(1)} s — exactly right!`;s.next=true;s.wait=1.6}
        else{msg=s.time>R.t?`🐢 ${s.time.toFixed(1)} s — too slow!`:`🐇 ${s.time.toFixed(1)} s — too fast!`;s.wait=1.6}msgT=1.6}}
      else if(s.wait){s.wait-=dt;if(s.wait<=0){s.wait=0;if(s.next){r++;if(r>=rounds.length)return end();}
        else{s.x=0;s.time=0}if(s.next)reset()}}},
    draw(){const R=rounds[r],y=H*.6,x0=60,x1=W-60,ppm=(x1-x0)/R.d,gx=m=>x0+m*ppm;
      text(`Drive ${R.d} metres in exactly ${R.t} seconds`,W/2,H*.12,C.txt,Math.min(28,W/26));
      ctx.fillStyle='#24344f';ctx.fillRect(x0-20,y,x1-x0+40,30);
      for(let m=0;m<=R.d;m++){const X=gx(m);ctx.strokeStyle=m%5?'#4a5a76':C.blue;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X,y+30);ctx.lineTo(X,y+(m%5?40:48));ctx.stroke();if(m%5===0||m===R.d)text(m+' m',X,y+64,C.blue,15)}
      for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#fff':'#000';ctx.fillRect(x1,y-40+i*8,8,8);ctx.fillStyle=i%2?'#000':'#fff';ctx.fillRect(x1+8,y-40+i*8,8,8)}
      const X=gx(s.x);brick(X,y-8,56,22,'#2f7de1');ctx.fillStyle='#ddd';ctx.strokeStyle='#111';ctx.lineWidth=4;for(const o of[-16,16]){ctx.beginPath();ctx.arc(X+o,y-4,8,0,7);ctx.fill();ctx.stroke()}
      if(s.run)arrow(X,y-62,X+speed*12,y-62,C.teal,5,speed+' m/s');
      // stopwatch
      const cx=W/2,cy=H*.32,rad=Math.min(48,H*.1);ctx.strokeStyle=C.yellow;ctx.lineWidth=4;ctx.beginPath();ctx.arc(cx,cy,rad,0,7);ctx.stroke();
      ctx.strokeStyle=C.teal+'99';ctx.lineWidth=8;ctx.beginPath();ctx.arc(cx,cy,rad+9,-Math.PI/2,-Math.PI/2+2*Math.PI*Math.min(1,R.t/10));ctx.stroke();
      const a=-Math.PI/2+2*Math.PI*(s.time%10)/10;arrow(cx,cy,cx+Math.cos(a)*rad*.8,cy+Math.sin(a)*rad*.8,C.yellow,4);
      text(s.time.toFixed(1)+' s',cx+rad+50,cy,C.yellow,26);text('goal '+R.t+' s',cx-rad-50,cy,C.teal,20);
      if(msgT>0){ctx.globalAlpha=Math.min(1,msgT*2);text(msg,W/2,H*.85,C.txt,30);ctx.globalAlpha=1}}
  };
  function end(){ctrl.innerHTML='';const st=tries<=4?3:tries<=7?2:1;
    finish(st,'Speed = distance ÷ time','<b style="color:#5cd0b3">Speed</b> tells how many metres you go each second. To drive <b>12 m</b> in <b>3 s</b> you need <b>4 m</b> every second, because 12 ÷ 3 = 4.<br>Faster speed = more metres every second!')}
}

renderMap();requestAnimationFrame(loop);
