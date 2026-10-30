/* Scenes 6–10 + the scroll loop. */
(() => {
const {$,$$,clamp,seg,E,NS,scenes,texts,revealTexts,click,chime,edge}=window.ST;
let ended=false;

/* ================= 6. SUN ================= */
const st=$('#stars');
for(let i=0;i<70;i++){const c=document.createElementNS(NS,'circle');c.setAttribute('cx',Math.random()*100);c.setAttribute('cy',Math.random()*62);c.setAttribute('r',(Math.random()*.22+.06).toFixed(2));c.setAttribute('fill','#fffbe0');st.appendChild(c)}
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',');
scenes['s-sun']=(p)=>{
  const n=E.out(seg(p,.1,.65));
  $('#sunStage').style.background=`linear-gradient(180deg, rgb(${mix([248,228,186],[46,52,86],n)}) 0%, rgb(${mix([243,226,196],[132,112,128],n)}) 68%)`;
  const sb=$('#sunball'); sb.style.top=(10+E.inq(seg(p,0,.8))*72)+'vh';
  sb.style.opacity=(1-seg(p,.6,.25)*.9).toFixed(3);
  const ch=$('#chaser'); ch.style.left=(8+E.out(seg(p,0,.85))*40)+'vw';
  const ph=p*90, la=Math.sin(ph)*7;
  $('#legA').setAttribute('d',`M12 30 L${12-la} 45`); $('#legB').setAttribute('d',`M12 30 L${12+la} 45`);
  ch.style.transform=`translateY(${(-Math.abs(Math.sin(ph))*4*(1-seg(p,.8,.1))).toFixed(1)}px)`;
  st.style.opacity=seg(p,.45,.3).toFixed(3);
  $$('.sun-txt').forEach(t=>t.style.color=n>.45?'#f3ecdc':'#1f1b16');
};

/* ================= 7. WALL + TRACKER ================= */
const W=$('#wallSvg'); let wh='';
for(let i=0;i<22;i++){const y=580-i*26,x=40+(i%2)*6+i*1.2; wh+=`<path class="ws" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M${x} ${y} l110 0 l0 -26" fill="none" stroke="#1f1b16" stroke-width="2.4"/>`;}
wh+=`<g id="wallBob" transform="translate(70 580)"><circle cx="0" cy="-30" r="5" fill="#1f1b16"/><path d="M0 -25 L0 -10 M0 -10 L-5 0 M0 -10 L5 0 M0 -20 L-6 -30 M0 -20 L6 -30" stroke="#1f1b16" stroke-width="2.2" stroke-linecap="round"/></g>`;
W.innerHTML=wh; const wsteps=$$('.ws');
const pool=['Reconcile FY tax ledger','Rewrite Q3 report (again)','Chase 14 overdue invoices','Deck for Monday 8am','Answer 212 unread emails','Update the tracker','Status update on status update','Audit last quarter’s audit','Fix formatting in shared doc','Sync about the sync','Cover for Dave’s leave','Weekend on-call','Draft Q4 forecast','Redo invoice templates','Re-reconcile FY tax ledger'];
function stateAt(k){
  const list=[{id:0,b:1,t:'THE BIG ONE: full restructure by Monday'}]; let nid=1,pi=0;
  for(let i=0;i<4;i++) list.push({id:nid++,t:pool[pi++],born:0});
  for(let j=0;j<k;j++){
    list.splice(list.findIndex(x=>!x.b),1);
    const add=1+(j%2)+(j>4?1:0);
    for(let a=0;a<add;a++){ const it={id:nid++,t:pool[pi++%pool.length],born:j+1,b:(nid%5===0)}; if(it.b){it.t='BOULDER: '+it.t;list.unshift(it)} else list.push(it); }
  }
  return list;
}
let lastKey='';
function renderTasks(k,checking){
  const key=k+(checking?'c':''); if(key===lastKey) return; const fresh=lastKey!==''&&parseInt(lastKey)<k; lastKey=key;
  const list=stateAt(k), target=list.findIndex(x=>!x.b);
  $('#tasks').innerHTML=list.slice(0,8).map((x,i)=>`<li class="${x.b?'boulder ':''}${fresh&&x.born===k?'new ':''}${checking&&i===target?'done':''}"><span class="box"></span>${x.b?'<span class="rock"></span>':''}<span>${x.t}</span>${x.b?'<span class="tag">ASAP</span>':''}</li>`).join('');
  $('#doneN').textContent=k; $('#leftN').textContent=list.length;
  if(checking) click(.3,1500);
}
scenes['s-wall']=(p)=>{
  wsteps.forEach((s,i)=>s.setAttribute('stroke-dashoffset',(1-E.out(seg(p,i*.011,.05))).toFixed(3)));
  const tr=E.back(seg(p,.27,.08)), tk=$('#tracker');
  tk.style.opacity=clamp(tr*1.4); tk.style.transform=`translateX(${((1-tr)*80).toFixed(1)}px) rotate(${((1-tr)*4).toFixed(2)}deg)`;
  const prog=seg(p,.38,.44)*10, k=Math.floor(prog);
  renderTasks(k, prog-k>.55 && k<10);
  $$('#week .we i').forEach((el,i)=>{const q=E.back(seg(p,.84+i*.035,.04)); el.style.opacity=clamp(q); el.style.transform=`rotate(-14deg) scale(${(2.4-q*1.4).toFixed(3)})`;});
  $('#wallBob').setAttribute('transform',`translate(70 ${(580-E.out(seg(p,.05,.2))*26).toFixed(1)})`);
};

/* ================= divider ================= */
scenes['s-div']=(p)=>{ $$('#divider span').forEach((s,i)=>{const q=E.back(seg(p,.15+i*.1,.15)); s.style.opacity=clamp(q); s.style.transform=`translateY(${((1-q)*-40).toFixed(1)}px)`;}); };

/* ================= 8. HOUSE ================= */
const taps=$('#taps'), tapEls=[], words=['tap','tap','tak','tap','click','tap','TAP','tap','clack','tap'];
for(let i=0;i<150;i++){const s=document.createElement('span');s.className='tap';s.textContent=words[i%words.length];
  s.style.left=Math.random()*94+'%';s.style.top=Math.random()*94+'%';s.style.fontSize=(12+Math.random()*Math.random()*80)+'px';s._r=Math.random()*40-20;taps.appendChild(s);tapEls.push(s);}
let lastTaps=0;
scenes['s-house']=(p,now)=>{
  const k=seg(p,.12,.26), fade=1-seg(p,.4,.12)*.88, n=Math.floor(k*tapEls.length);
  tapEls.forEach((s,i)=>{ const q=clamp(k*tapEls.length-i); s.style.opacity=(q*(.15+((i*37)%60)/100)*fade).toFixed(3); s.style.transform=`rotate(${s._r}deg) scale(${(1.6-q*.6).toFixed(2)})`; });
  if(n>lastTaps) click(.1+k*.2); lastTaps=n;
  const amp=k*(1-seg(p,.4,.1));
  $('#houseShake').style.transform=`translate(${(Math.sin(now/22)*amp*5).toFixed(2)}px,${(Math.cos(now/19)*amp*4).toFixed(2)}px)`;
  $('#dishes').style.transform=`translateY(${((1-E.out(seg(p,.08,.08)))*60).toFixed(1)}px)`;
  $('#dishes').style.opacity=(E.out(seg(p,.08,.08))*.7).toFixed(3);
  const bc=$('#bigClock'), cq=E.out(seg(p,.7,.04)); bc.style.opacity=cq;
  const mins=3*60+12+Math.floor(E.inq(seg(p,.72,.12))*240); let h=Math.floor(mins/60)+12,m=mins%60; h=h%12||12;
  bc.textContent=`${h}:${String(m).padStart(2,'0')} PM`;
  bc.style.transform=`scale(${(1+E.bump(p,.84,.03)*.12).toFixed(3)})`;
};

/* ================= 9. PHONE ================= */
const reply='Sorry, I can’t; I’ve got a big assignment to do';
const months=['Sep 2026','Aug 2026','Jun 2026','May 2026','Mar 2026','Jan 2026','Dec 2025','Oct 2025','Aug 2025','Jul 2025','May 2025','Feb 2025','Dec 2024','Oct 2024','Jul 2024','Apr 2024','Jan 2024','Nov 2023','Aug 2023','May 2023','Feb 2023','Nov 2022','Jul 2022','Mar 2022','Dec 2021','Aug 2021','Apr 2021','Dec 2020'];
const gh=$('#ghosts'); const ghosts=months.slice().reverse().map(m=>{const d=document.createElement('div');d.className='ghost';d.innerHTML=`<small>${m}</small><div class="bubble me">${reply}</div>`;gh.appendChild(d);return d;});
let lastChars=0;
scenes['s-phone']=(p)=>{
  const ts=E.out(seg(p,.02,.03)); $('#ts').style.opacity=ts;
  const m=E.back(seg(p,.03,.04)), son=$('#sonMsg'); son.style.opacity=clamp(m); son.style.transform=`translateY(${((1-m)*20).toFixed(1)}px) scale(${(.8+m*.2).toFixed(3)})`;
  edge('ping',m>=.5?1:0,chime);
  const pq=seg(p,.04,.05), wig=Math.sin(pq*Math.PI*6)*4*(1-pq);
  // typing then erasing the usual reply
  const L=reply.length; let c;
  if(p<.84) c=Math.floor(seg(p,.28,.1)*L); else c=Math.floor((1-seg(p,.84,.06))*L);
  $('#fieldTxt').textContent=reply.slice(0,c);
  if(c!==lastChars){ click(.12,2400); lastChars=c; }
  $('#sendIcon').style.opacity=c===L?1:.3;
  $('#sendIcon').style.transform=`scale(${c===L?(1+E.bump(p,.4,.02)*.25).toFixed(3):1})`;
  // the countless times before
  const gN=Math.floor(E.inq(seg(p,.42,.18))*ghosts.length);
  ghosts.forEach((g,i)=>g.style.display=i>=ghosts.length-gN?'flex':'none');
  // he hesitates — the phone trembles; then he lets go
  const hes=seg(p,.76,.04)*(1-seg(p,.86,.04)), tremble=Math.sin(p*900)*hes*1.5;
  const f=E.inq(seg(p,.92,.08));
  const ph=$('#phoneEl');
  ph.style.transform=`translateY(${(f*45).toFixed(1)}vh) rotate(${(wig+tremble-f*18).toFixed(2)}deg) scale(${(1-f*.15).toFixed(3)})`;
  ph.style.opacity=(1-f*.85).toFixed(3); ph.style.filter=f>0?`blur(${(f*3).toFixed(2)}px)`:'none';
  ended = p>.92 || ended && p>.9;
};

/* ================= 10. PATH ================= */
const C=$('#crumble'); let ch='';
for(let i=0;i<12;i++) ch+=`<rect x="${20+i*16}" y="${270-i*22}" width="40" height="8" fill="#fffdf5" stroke="#1f1b16" stroke-width="2"/>`;
C.innerHTML=ch; const bricks=[...C.querySelectorAll('rect')].map(r=>({r,dx:(Math.random()-.5)*120,rot:(Math.random()-.5)*160}));
const trail=$('#trail'), TL=trail.getTotalLength(); trail.style.strokeDasharray=TL; trail.style.strokeDashoffset=TL;
const cols=['#c2321f','#e9a23b','#7a5bb0','#e46d8a','#f2c94c','#3f7a4a'];
const flowers=[];
for(let i=0;i<34;i++){
  const f=.03+i/34*.95, pt=trail.getPointAtLength(f*TL), pt2=trail.getPointAtLength(Math.min(TL,f*TL+2));
  const ang=Math.atan2(pt2.y-pt.y,pt2.x-pt.x), side=i%2?1:-1, h=18+Math.random()*34, a=ang+side*Math.PI/2+(Math.random()-.5)*.5;
  const ex=Math.cos(a)*h, ey=Math.sin(a)*h, col=cols[i%cols.length], petals=i%3!==2;
  const g=document.createElementNS(NS,'g'); g.setAttribute('class','flower');
  g.innerHTML=`<path d="M0 0 Q ${ex*.3+side*6} ${ey*.5} ${ex} ${ey}" stroke="#3f7a4a" stroke-width="2" fill="none"/><ellipse cx="${ex*.5+side*5}" cy="${ey*.5}" rx="7" ry="3" fill="#5f9a5a" transform="rotate(${a*57.3} ${ex*.5+side*5} ${ey*.5})"/>`+
    (petals?[0,1,2,3,4].map(k=>`<circle cx="${ex+Math.cos(k*1.256)*5}" cy="${ey+Math.sin(k*1.256)*5}" r="4.2" fill="${col}"/>`).join('')+`<circle cx="${ex}" cy="${ey}" r="3" fill="#f7e08a"/>`:`<circle cx="${ex}" cy="${ey}" r="3.5" fill="#5f9a5a"/>`);
  $('#flowers').appendChild(g); flowers.push({g,f,x:pt.x,y:pt.y});
}
scenes['s-path']=(p)=>{
  const g=E.out(seg(p,0,.5));
  $('#pathStage').style.background=`linear-gradient(180deg, rgb(${mix([243,236,220],[238,240,214],g)}) 0%, rgb(${mix([233,223,200],[214,230,190],g)}) 100%)`;
  bricks.forEach((b,i)=>{ const q=E.inq(seg(p,.02+(11-i)*.012,.14)); b.r.style.transformBox='fill-box'; b.r.style.transformOrigin='center';
    b.r.style.transform=`translate(${(b.dx*q).toFixed(1)}px,${(q*700).toFixed(1)}px) rotate(${(b.rot*q).toFixed(1)}deg)`; b.r.style.opacity=(1-q).toFixed(3); });
  const d=E.out(seg(p,.2,.65)); trail.style.strokeDashoffset=(TL*(1-d)).toFixed(1);
  flowers.forEach(fl=>{ const s=E.back(clamp((d-fl.f)*14)); fl.g.setAttribute('transform',`translate(${fl.x.toFixed(1)} ${fl.y.toFixed(1)}) scale(${s.toFixed(3)})`); });
  const wp=trail.getPointAtLength(Math.max(1,d*TL)), w=$('#walker');
  w.setAttribute('transform',`translate(${wp.x.toFixed(1)} ${(wp.y-Math.abs(Math.sin(d*120))*3).toFixed(1)})`);
  w.style.opacity=seg(p,.2,.03);
  const la=Math.sin(d*120)*5; $('#wLegA').setAttribute('d',`M0 -10 L${-la} 0`); $('#wLegB').setAttribute('d',`M0 -10 L${la} 0`);
  if(p>.02) ended=true;
};

/* ================= loop ================= */
const sceneEls=$$('.scene');
const days=['MON','TUE','WED','THU','FRI','SAT','SUN'];
let sy=scrollY, idle=0, lastY=scrollY;
const toast=$('#toast'); toast.textContent='GET BACK TO WORK!';
function frame(now){
  sy+=(scrollY-sy)*.14; if(Math.abs(scrollY-sy)<.3) sy=scrollY;
  const max=document.documentElement.scrollHeight-innerHeight, gp=clamp(sy/max);
  $('#progress').style.width=(gp*100)+'%';
  sceneEls.forEach(sc=>{
    const top=sc.offsetTop-sy, h=sc.offsetHeight;
    if(top>innerHeight || top+h<0) return;
    const p=clamp(-top/(h-innerHeight));
    revealTexts(sc,p);
    const fn=scenes[sc.id]; if(fn) fn(p,now);
  });
  // HUD clock runs through his week, then stops
  if(ended){ $('#clock').textContent='NOW'; }
  else { const t=gp*6*24*60*.62+9*60, day=Math.floor(t/1440)%7; let m=Math.floor(t%1440),h=Math.floor(m/60),mm=m%60; const ap=h>=12?'PM':'AM'; h=h%12||12;
    $('#clock').textContent=`${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${ap} · ${days[day]}`; }
  // stop scrolling for a while and the boss notices
  if(Math.abs(scrollY-lastY)>1){ idle=now; lastY=scrollY; }
  toast.classList.toggle('show', !ended && gp>.01 && now-idle>8000 && (now-idle)%9000<1800);
  requestAnimationFrame(frame);
}
requestAnimationFrame(t=>{idle=t;frame(t)});
})();
