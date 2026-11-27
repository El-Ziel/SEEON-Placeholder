/* SEEON experience: one engine, four scenes. Texts come from window.EXP_SCENES and window.EXP_UI (per language). */
(function(){
const SCENES=window.EXP_SCENES, U=window.EXP_UI, L=U.labels;
const stage=document.getElementById('stage'), sheet=document.getElementById('sheet');
const $=id=>document.getElementById(id);
const track=(n,p)=>{ try{ if(window.gtag) window.gtag('event',n,p||{}); }catch(e){} };
const JACKETS=['#2f3e57','#3a3f46','#8a6f4d','#56664c','#6e3b42','#8e97a3','#1f5c63','#4a4458'];
const HAIR=['#2a211c','#111','#c9a56b','#9a9a9a','#6b3a26','#3d2b1f'];
function personSVG(i){
  const j=JACKETS[i%JACKETS.length], h=HAIR[(i*7)%HAIR.length];
  return '<svg viewBox="0 0 44 44" aria-hidden="true"><ellipse cx="23" cy="26" rx="14" ry="9" fill="rgba(0,0,0,.18)"/>'+
    '<ellipse cx="22" cy="24" rx="14" ry="8.5" fill="'+j+'"/><rect x="19.5" y="26" width="5" height="4" rx="1" fill="#fff" opacity=".9"/>'+
    '<circle cx="22" cy="20" r="6.6" fill="'+h+'"/><circle class="ring" cx="22" cy="22" r="19"/></svg>';
}
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const R=(cls,x,y,w,h,rx)=>'<rect class="'+cls+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="'+(rx||4)+'"/>';
const C=(cls,x,y,r)=>'<circle class="'+cls+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r.toFixed(1)+'"/>';
const T=(cls,x,y,t,anchor)=>'<text class="'+cls+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'"'+(anchor?' text-anchor="'+anchor+'"':'')+'>'+esc(t)+'</text>';

function zone(g,W,H,z){
  const [lab,fx,fy,fw,fh,cls,kind]=z; const x=fx*W,y=fy*H,w=fw*W,h=fh*H,wh=Math.max(14,h*.11);
  g.push(R('shade',x+4,y+6,w,h,6), R(cls,x,y,w,h,6), R('wall',x,y,w,wh), T('sign',x+10,y+wh/2+4,lab));
  if(kind==='stand'){ const cw=Math.min(w*.45,120), ch=Math.max(10,h*.1);
    g.push(R('counter',x+w/2-cw/2,y+h-ch-12,cw,ch,3), C('plant',x+w-14,y+wh+14,8), R('furn',x+14,y+wh+12,Math.min(w*.3,70),Math.max(8,h*.08),3)); }
  else if(kind==='tables'){ g.push(R('counter',x+12,y+wh+10,w*.5,Math.max(10,h*.09),3)); const n=w>h?4:3; for(let i=0;i<n;i++) g.push(C('furn',x+w*(.2+i*(.6/(n-1))),y+h*.72,Math.max(9,Math.min(w,h)*.07))); }
  else if(kind==='rows'){ const sw=w*.5, sh=Math.max(10,h*.12); g.push(R('counter',x+w/2-sw/2,y+wh+8,sw,sh,3)); const cols=w>h*1.5?7:5; for(let r=0;r<3;r++)for(let c=0;c<cols;c++){ const cx=x+w*(.12+c*(.76/(cols-1))), cy=y+wh+sh+22+r*Math.max(14,h*.13); if(cy<y+h-8) g.push(R('furn',cx-5,cy-4,10,8,2)); } }
  else if(kind==='sofas'){ const n=w>h?3:2; for(let i=0;i<n;i++){ const cx=x+w*(.2+i*(.6/Math.max(1,n-1))), cy=y+h*.6; g.push(R('furn',cx-26,cy-22,52,12,4),R('furn',cx-26,cy+12,52,12,4),C('counter',cx,cy-3,9)); } }
  else if(kind==='desks'){ const n=w>h?4:3; for(let i=0;i<n;i++){ const cx=x+w*(.15+i*(.7/(n-1))); g.push(R('counter',cx-18,y+wh+14,36,14,2),R('furn',cx-6,y+wh+32,12,10,2)); } }
  else if(kind==='bar'){ g.push(R('counter',x+w*.1,y+wh+12,w*.8,Math.max(12,h*.14),3)); for(let i=0;i<5;i++) g.push(C('furn',x+w*(.18+i*.16),y+wh+12+Math.max(12,h*.14)+14,6)); }
  else if(kind==='desk'){ g.push(R('counter',x+w*.15,y+h*.45,w*.7,Math.max(12,h*.18),3)); }
  else if(kind==='gate'){ g.push(R('glass',x+6,y+wh+6,w-12,h-wh-12,4)); }
  return {x,y,w,h:wh+6};
}

function drawScene(sc,variant){
  const W=stage.clientWidth, H=stage.clientHeight, port=H>W, g=[], walls=[];
  g.push(R('floor',0,0,W,H,0));
  let seats=null;
  if(sc.layout==='fair'){
    g.push(port? R('aisle',0,H*.57,W,H*.08,0)+R('aisle',W*.47,0,W*.06,H*.6,0) : R('aisle',0,H*.45,W,H*.11,0)+R('aisle',W*.325,0,W*.035,H,0)+R('aisle',W*.645,0,W*.035,H,0));
    const Z=port?[[L.stand+' B12',.05,.04,.42,.17,'c1','stand'],[L.stand+' B14',.53,.04,.42,.15,'c2','stand'],[L.stand+' B17',.05,.29,.40,.17,'c3','stand'],[L.coffee,.55,.31,.40,.22,'c2','tables'],[L.speakers,.06,.70,.88,.25,'c1','rows']]
                :[[L.stand+' B12',.04,.07,.26,.30,'c1','stand'],[L.stand+' B14',.38,.06,.24,.24,'c2','stand'],[L.stand+' B17',.70,.08,.26,.32,'c3','stand'],[L.coffee,.05,.63,.28,.31,'c2','tables'],[L.speakers,.64,.63,.31,.31,'c1','rows']];
    Z.forEach(z=>walls.push(zone(g,W,H,z)));
    g.push(T('floorlabel',W-12,H-10,L.hall,'end'));
  }
  else if(sc.layout==='lounge'){
    g.push(R('glass',0,0,W,Math.max(10,H*.03),0));
    const Z=port?[[L.window,.05,.05,.90,.18,'c1','sofas'],[L.desks,.05,.28,.42,.20,'c3','desks'],[L.coffeept,.53,.28,.42,.20,'c2','bar'],[L.quiet,.05,.55,.90,.18,'c1','sofas'],[L.gate,.05,.78,.90,.17,'c3','gate']]
                :[[L.window,.03,.07,.44,.30,'c1','sofas'],[L.desks,.53,.07,.20,.30,'c3','desks'],[L.coffeept,.78,.07,.19,.30,'c2','bar'],[L.quiet,.03,.58,.40,.36,'c1','sofas'],[L.gate,.50,.62,.47,.32,'c3','gate']];
    Z.forEach(z=>walls.push(zone(g,W,H,z)));
    g.push(T('floorlabel',W-12,H-10,L.lounge,'end'));
  }
  else if(sc.layout==='lobby'){
    const eve=variant==='evening';
    const Z=port?[[L.reception,.05,.04,.55,.14,'c2','desk'],[L.lifts,.66,.04,.29,.14,'c3','desk'],[L.lobbyLounge,.05,.24,.90,.24,'c1','sofas'],[eve?L.barOpen:L.barClosed,.05,.54,.55,.18,'c2','bar'],[L.entrance,.05,.78,.90,.17,'c3','gate']]
                :[[L.reception,.04,.07,.30,.22,'c2','desk'],[L.lifts,.38,.07,.18,.22,'c3','desk'],[L.lobbyLounge,.04,.40,.52,.52,'c1','sofas'],[eve?L.barOpen:L.barClosed,.62,.07,.34,.36,'c2','bar'],[L.entrance,.62,.55,.34,.37,'c3','gate']];
    Z.forEach(z=>walls.push(zone(g,W,H,z)));
    if(!eve){ const z=Z[0]; for(let i=0;i<3;i++) g.push(R('furn',z[1]*W+18+i*28,z[2]*H+z[4]*H-22,18,13,3)); }
    g.push(T('floorlabel',W-12,H-10,(eve?'19:20':'08:10')+' · '+L.lobby,'end'));
  }
  else if(sc.layout==='train'){
    seats=[];
    const long=port?H:W, short=port?W:H, pad=18, bodyS=short*.84, off=(short-bodyS)/2;
    const P=(a,b)=>port?[b,a]:[a,b];
    const box=(a,b,la,lb,cls,rx)=>{ const [x,y]=P(a,b); const [w,h]=port?[lb,la]:[la,lb]; return R(cls,x,y,w,h,rx); };
    g.push(box(pad,off-6,long-pad*2,bodyS+12,'wall',22), box(pad+4,off,long-pad*2-8,bodyS,'c1',18));
    const aisleW=bodyS*.18, seatS=(bodyS-aisleW)/4, rows=Math.max(6,Math.floor((long-pad*2-80)/(seatS*1.25)));
    g.push(box(pad+40,off+bodyS/2-aisleW/2,long-pad*2-80,aisleW,'aisle',4));
    const step=(long-pad*2-80)/rows;
    for(let r=0;r<rows;r++){ const a=pad+40+r*step+step*.1;
      [0,1,2,3].forEach(k=>{ const b=off+(k<2?k*seatS:aisleW+k*seatS); g.push(box(a,b+3,step*.55,seatS-6,'furn',5)); seats.push(P(a+step*.3,b+seatS/2)); });
      if(r%2===0){ g.push(box(a+step*.62,off+4,step*.3,seatS*2-8,'counter',3), box(a+step*.62,off+bodyS-seatS*2+4,step*.3,seatS*2-8,'counter',3)); }
    }
    for(let i=0;i<Math.floor(long/120);i++){ g.push(box(pad+30+i*120,off-6,60,4,'glass',2), box(pad+30+i*120,off+bodyS+2,60,4,'glass',2)); }
    const [lx,ly]=port?[short-12,H-10]:[W-12,H-6]; g.push(T('floorlabel',lx,ly,L.car,'end'));
  }
  const svg=$('hall'); svg.setAttribute('viewBox','0 0 '+W+' '+H); svg.innerHTML=g.join('');
  return {walls,seats};
}

let sceneId=null, sc=null, variant='morning', state, timer, walkTimer, current=null, layout=null, lastSize=null;
const touch=window.matchMedia('(hover: none)').matches;
const tip=document.createElement('div'); tip.className='tip'; tip.hidden=true; stage.insertBefore(tip,$('backdrop'));
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function initials(n){return n.replace('Dr. ','').split(' ').map(s=>s[0]).join('').slice(0,2)}
function fmt(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function showTip(b){ tip.textContent=sc.people[b.dataset.i].t; tip.style.left=b.style.left; tip.style.top=b.style.top; tip.hidden=false; }
function hideTip(){ tip.hidden=true; }

function spots(n){
  const W=stage.clientWidth,H=stage.clientHeight;
  if(layout.seats) return shuffle(layout.seats.slice()).slice(0,n).map(([x,y])=>({x,y}));
  const pts=[], min=Math.max(50,Math.min(W,H)/7);
  for(let k=0;k<n;k++) pts.push(freeSpot(W,H,pts,min));
  return pts;
}
function freeSpot(W,H,pts,min){
  for(let t=0;t<600;t++){
    const x=26+Math.random()*(W-52), y=30+Math.random()*(H-56);
    const ok=!pts.some(p=>Math.hypot(p.x-x,p.y-y)<min*(t>300?.75:1)) && !layout.walls.some(r=>x>r.x-14&&x<r.x+r.w+14&&y>r.y-18&&y<r.y+r.h+14);
    if(ok) return {x,y};
  }
  return {x:26+Math.random()*(W-52),y:30+Math.random()*(H-56)};
}
function placePeople(){
  stage.querySelectorAll('.p').forEach(e=>e.remove()); hideTip();
  const W=stage.clientWidth,H=stage.clientHeight;
  layout=drawScene(sc,variant);
  const sp=spots(sc.people.length), order=shuffle(sc.people.map((_,i)=>i));
  order.forEach((idx,k)=>{
    const b=document.createElement('button'); b.type='button'; b.className='p'; b.dataset.i=idx; b.innerHTML=personSVG(idx);
    b.style.left=(sp[k].x/W*100)+'%'; b.style.top=(sp[k].y/H*100)+'%';
    b.setAttribute('aria-label',U.person+' '+(k+1)+': '+sc.people[idx].t);
    if(state.heard.has(idx)) b.classList.add('opened'); if(state.talked.has(idx)) b.classList.add('talked');
    b.addEventListener('mouseenter',()=>{ if(!touch) showTip(b); });
    b.addEventListener('mouseleave',()=>{ if(!touch) hideTip(); });
    b.addEventListener('focus',()=>showTip(b)); b.addEventListener('blur',hideTip);
    b.addEventListener('click',()=>{
      if(touch && !b.classList.contains('hinted')){ stage.querySelectorAll('.p.hinted').forEach(e=>e.classList.remove('hinted')); b.classList.add('hinted'); showTip(b); return; }
      hideTip(); openPerson(idx,b);
    });
    stage.insertBefore(b,sheet);
  });
  lastSize=[W,H];
}
function startWalking(){
  clearInterval(walkTimer);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || sc.layout==='train') return;
  walkTimer=setInterval(()=>{
    if(state.done) return;
    const W=stage.clientWidth,H=stage.clientHeight, ps=[...stage.querySelectorAll('.p')];
    const movers=shuffle(ps.filter(b=>!b.classList.contains('active')&&!b.classList.contains('hinted')&&b!==document.activeElement)).slice(0,2);
    const pts=ps.filter(b=>!movers.includes(b)).map(b=>({x:parseFloat(b.style.left)/100*W,y:parseFloat(b.style.top)/100*H}));
    movers.forEach(b=>{ const s=freeSpot(W,H,pts,Math.max(50,Math.min(W,H)/7)); pts.push(s); b.style.left=(s.x/W*100)+'%'; b.style.top=(s.y/H*100)+'%'; });
    if(!tip.hidden) hideTip();
  },3500);
}
function hud(){ $('found').textContent=state.found.size; $('heard').textContent=state.heard.size; $('time').textContent=fmt(state.secs); $('revealBtn').hidden=state.done; }

function setScene(id,push){
  if(!SCENES[id]) id=Object.keys(SCENES)[0];
  sceneId=id; sc=SCENES[id]; variant='morning';
  document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected',String(t.dataset.id===id)));
  $('where').textContent=sc.where; $('title').textContent=sc.title;
  [$('youWho').textContent,$('youOffer').textContent,$('youLook').textContent]=sc.you;
  $('timeToggle').hidden=!sc.times;
  document.querySelectorAll('#timeToggle button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===variant)));
  if(push){ try{ history.replaceState(null,'','#'+id); }catch(e){ location.hash=id; } track('experience_scene',{scene:id}); }
  start();
}
function start(){
  state={found:new Set(),heard:new Set(),talked:new Set(),secs:0,done:false};
  clearInterval(timer); timer=setInterval(()=>{ if(!state.done){state.secs++; hud();} },1000);
  stage.classList.remove('revealed'); const ph=$('phone'); if(ph) ph.remove();
  $('reveal').hidden=true; sheet.hidden=true; $('backdrop').hidden=true;
  placePeople(); hud(); startWalking();
}
function openPerson(i,btn){
  if(state.done) return;
  stage.querySelectorAll('.p.active').forEach(e=>e.classList.remove('active'));
  btn.classList.add('active','opened'); current={i,btn};
  const p=sc.people[i]; state.heard.add(i); hud();
  $('sName').textContent=p.n; $('sRole').textContent=p.r; $('sPersonal').textContent=p.p; $('sBusiness').textContent=p.b;
  const v=$('sVerdict');
  if(state.talked.has(i)){ v.hidden=false; v.className='verdict'+(p.hit?' hit':''); v.textContent=p.hit?U.already:p.miss; $('sActions').hidden=true; }
  else { v.hidden=true; $('sActions').hidden=false; }
  sheet.hidden=false; $('backdrop').hidden=false; $('talkBtn').focus({preventScroll:true});
}
function closeSheet(){ stage.querySelectorAll('.p.hinted').forEach(e=>e.classList.remove('hinted')); sheet.hidden=true; $('backdrop').hidden=true; if(current) current.btn.classList.remove('active'); current=null; }
$('talkBtn').addEventListener('click',()=>{
  if(!current) return; const {i,btn}=current, p=sc.people[i], v=$('sVerdict');
  state.talked.add(i); btn.classList.add('talked'); $('sActions').hidden=true; v.hidden=false;
  if(p.hit){ state.found.add(i); v.className='verdict hit'; v.textContent=U.hit; }
  else { v.className='verdict'; v.textContent=p.miss; }
  hud(); if(state.found.size===3) setTimeout(reveal,1400);
});
$('walkBtn').addEventListener('click',closeSheet); $('closeSheet').addEventListener('click',closeSheet); $('backdrop').addEventListener('click',closeSheet);
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && !sheet.hidden) closeSheet(); });
$('revealBtn').addEventListener('click',reveal);
$('againBtn').addEventListener('click',()=>{ start(); stage.scrollIntoView({behavior:'smooth',block:'center'}); });
document.querySelectorAll('#timeToggle button').forEach(b=>b.addEventListener('click',()=>{
  variant=b.dataset.v; document.querySelectorAll('#timeToggle button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  if(!state.done){ closeSheet(); placePeople(); }
}));
document.querySelectorAll('[data-book]').forEach(a=>a.addEventListener('click',()=>track('experience_book',{scene:sceneId})));

function reveal(){
  if(state.done) return;
  state.done=true; clearInterval(timer); clearInterval(walkTimer); closeSheet(); hideTip();
  stage.classList.add('revealed'); hud();
  const ph=document.createElement('div'); ph.className='phone'; ph.id='phone';
  let items=''; sc.people.forEach(p=>{ if(!p.hit) return; items+='<div class="item"><div class="av">'+esc(initials(p.n))+'</div><div><strong>'+esc(p.n)+'</strong><span>'+esc(p.r)+'</span><em>'+esc(p.why)+'</em></div></div>'; });
  ph.innerHTML='<div class="bar"></div><div class="ph"><b>SEEON</b><span>'+esc(sc.phone[0])+'</span></div><p class="sub">'+esc(sc.phone[1])+'</p>'+items+'<p class="foot">'+esc(sc.phone[2])+'</p>';
  stage.appendChild(ph);
  const f=state.found.size, h=state.heard.size, t=fmt(state.secs);
  $('rTitle').textContent = f===3 ? U.rAll(t,h) : f===0 ? U.rNone : U.rSome(f);
  $('rStats').textContent=U.stats(h,t,state.talked.size);
  $('rHead').textContent=sc.head; $('rNote').textContent=sc.note;
  const m=$('matches'); m.innerHTML='';
  sc.people.forEach((p,i)=>{ if(!p.hit) return; const d=document.createElement('div'); d.className='match';
    d.innerHTML='<strong></strong><span></span><p></p><span></span>';
    d.children[0].textContent=p.n; d.children[1].textContent=p.r; d.children[2].textContent=p.why;
    d.children[3].textContent=state.found.has(i)?U.foundP(p):U.missed; m.appendChild(d); });
  $('reveal').hidden=false; $('reveal').scrollIntoView({behavior:'smooth',block:'start'});
  track('experience_reveal',{scene:sceneId,found:f});
}

const tabs=$('tabs');
Object.entries(SCENES).forEach(([id,s])=>{ const b=document.createElement('button'); b.type='button'; b.className='tab'; b.setAttribute('role','tab'); b.dataset.id=id; b.textContent=s.tab; b.addEventListener('click',()=>setScene(id,true)); tabs.appendChild(b); });
window.addEventListener('hashchange',()=>{ const id=location.hash.slice(1); if(SCENES[id] && id!==sceneId) setScene(id,false); });
let rT=null;
window.addEventListener('resize',()=>{ clearTimeout(rT); rT=setTimeout(()=>{
  const W=stage.clientWidth,H=stage.clientHeight;
  if(lastSize && Math.abs(lastSize[0]-W)<40 && Math.abs(lastSize[1]-H)<40 && (lastSize[0]>lastSize[1])===(W>H)) return;
  if(!state.done){ closeSheet(); placePeople(); } else { layout=drawScene(sc,variant); lastSize=[W,H]; }
},250); });
setScene(SCENES[location.hash.slice(1)]?location.hash.slice(1):Object.keys(SCENES)[0],false);
})();
