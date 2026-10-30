/* Scroll-scrubbed engine + scenes 1–5. Everything is a pure function of scroll position. */
window.ST = (() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const clamp = (v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const seg = (p,a,d)=>clamp((p-a)/d);
const E = {
  out:t=>1-Math.pow(1-t,3),
  inq:t=>t*t,
  back:t=>{const c=1.70158,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2)},
  bounce:t=>{const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375},
  bump:(p,c,w)=>Math.max(0,1-Math.abs(p-c)/w)
};
const NS='http://www.w3.org/2000/svg';
const scenes={}; // id -> fn(p, now)

/* ---------- sound (optional; browsers need one tap to allow audio) ---------- */
let ctx=null, soundOn=false;
$('#soundBtn').onclick=()=>{soundOn=!soundOn; if(soundOn&&!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)();
  $('#soundBtn').textContent=soundOn?'♪ sound on':'♪ sound off';};
function click(vol=.15,freq=2200){
  if(!soundOn||!ctx) return;
  const len=.03,b=ctx.createBuffer(1,ctx.sampleRate*len,ctx.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,6);
  const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=freq*(.8+Math.random()*.4);
  const g=ctx.createGain();g.gain.value=vol;s.connect(f).connect(g).connect(ctx.destination);s.start();
}
function chime(){ if(!soundOn||!ctx) return;
  [880,1320].forEach((fr,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.12;o.frequency.value=fr;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.6);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.7);});
}
// fire a sound only when a value crosses upward (scrolling forward)
const edges={};
function edge(key,val,fn){ const prev=edges[key]; edges[key]=val; if(prev!==undefined && val>prev) fn(); }

/* ---------- word-by-word text reveal ---------- */
function split(el){
  const words=[];
  (function walk(node){
    [...node.childNodes].forEach(c=>{
      if(c.nodeType===3){
        const frag=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(pt=>{ if(!pt) return;
          if(/^\s+$/.test(pt)) frag.appendChild(document.createTextNode(' '));
          else { const s=document.createElement('span'); s.className='w'; s.textContent=pt; frag.appendChild(s); words.push(s); } });
        node.replaceChild(frag,c);
      } else if(c.nodeType===1 && c.tagName!=='BR') walk(c);
    });
  })(el);
  return words;
}
const texts=new Map(); // scene el -> [{words,at,dur,out}]
$$('.scene').forEach(sc=>{
  texts.set(sc, [...sc.querySelectorAll('.t')].map(el=>{
    const words=split(el);
    return {el,words,at:+el.dataset.at||0,dur:+el.dataset.dur||Math.min(.07,.012+words.length*.004),out:el.dataset.out?+el.dataset.out:null};
  }));
});
function revealTexts(sc,p){
  texts.get(sc).forEach(t=>{
    const n=t.words.length, o=t.out==null?0:E.out(seg(p,t.out,.05));
    t.words.forEach((w,i)=>{
      const q=E.out(seg(p,t.at+(i/n)*t.dur,.03));
      const k=(q*1000|0)+'|'+(o*1000|0); if(w._k===k) return; w._k=k;
      const vis=q*(1-o);
      w.style.opacity=vis;
      w.style.transform=`translate3d(0,${((1-q)*.55-o*.5).toFixed(3)}em,0)`;
      w.style.filter=vis>.98?'none':`blur(${((1-q)*7+o*5).toFixed(2)}px)`;
    });
  });
}

/* ================= 1. OPEN ================= */
const stamps=$$('.stamp'), hours=$$('#hours span'), shake1=$('#s-open .shake');
scenes['s-open']=(p,now)=>{
  let impact=0;
  stamps.forEach((s,i)=>{
    const a=.03+i*.08, q=seg(p,a,.05);
    const sc=1+2.2*(1-E.inq(q));
    s.style.opacity=(Math.min(1,q*2)*.9).toFixed(3);
    s._r=s._r||s.style.getPropertyValue('--r');
    s.style.transform=`scale(${sc.toFixed(3)}) rotate(${s._r})`;
    impact+=E.bump(p,a+.055,.025);
    edge('stamp'+i,q>=1?1:0,()=>click(.45,380));
  });
  shake1.style.transform=`translate(${(Math.sin(now/18)*impact*7).toFixed(2)}px,${(Math.cos(now/15)*impact*5).toFixed(2)}px)`;
  hours.forEach((h,i)=>{ const f=E.out(seg(p,.52+i*.04,.035)); h.style.setProperty('--f',f.toFixed(3)); edge('h'+i,f>=1?1:0,()=>click(.2,900)); });
  $('#cue').style.opacity=1-seg(p,0,.04);
};

/* ================= 2. BOSS ================= */
const shout=$('#shout'); const chars=[];
(()=>{ // split shout into letters
  const html=shout.innerHTML.split('<br>'); shout.innerHTML='';
  html.forEach((line,li)=>{ [...line].forEach(c=>{ const s=document.createElement('span'); s.className='ch'; s.textContent=/\s/.test(c)?' ':c;c===' '?' ':c;
    s._dx=(Math.random()-.5)*900; s._dy=(Math.random()-.5)*600; s._r=(Math.random()-.5)*540; shout.appendChild(s); chars.push(s); });
    if(li<html.length-1) shout.appendChild(document.createElement('br')); });
})();
scenes['s-boss']=(p,now)=>{
  const amp=seg(p,.26,.06)*(1-seg(p,.5,.2));
  chars.forEach((c,i)=>{
    const q=E.back(seg(p,.03+i*.009,.09)), r=1-q;
    const jx=Math.sin(now/30+i*1.7)*amp*4, jy=Math.cos(now/26+i)*amp*4;
    c.style.opacity=clamp(q*1.5).toFixed(3);
    c.style.transform=`translate(${(c._dx*r+jx).toFixed(1)}px,${(c._dy*r+jy).toFixed(1)}px) rotate(${(c._r*r).toFixed(1)}deg) scale(${(1+r*1.5).toFixed(3)})`;
  });
  const b=E.back(seg(p,.58,.1));
  $('#bonus').style.opacity=clamp(b);
  $('#bonus').style.transform=`translateY(${((1-b)*60).toFixed(1)}px) rotate(${(-2-(1-b)*14).toFixed(2)}deg)`;
  $('#bonusAmt').textContent=(12.95*E.out(seg(p,.62,.22))).toFixed(2);
};

/* ================= 3. DESK ================= */
const failures=[['Q3 REPORT v7','“Not what we asked for.”'],['INVOICE #4471','Figures don’t reconcile.'],['PROMOTION PITCH','Draft 12. Deleted.'],['TAX RECON','Start over. Again.'],['SORRY EMAIL','to: son. Never sent.'],['SLIDE 1 of 40','“Make it pop.”'],['WEEKLY UPDATE','Due yesterday.']];
const spots=[[6,64],[24,80],[68,72],[84,58],[10,42],[78,86],[46,84]];
const ballSVG=`<svg viewBox="0 0 60 56"><path d="M8 26 C4 12 18 3 30 6 C44 2 58 12 54 28 C58 42 44 54 30 50 C14 54 2 42 8 26Z" fill="#fbf8ee" stroke="#b5a988" stroke-width="1.5"/><path d="M14 22 L26 30 L22 40 M30 12 L34 26 L46 22 M38 34 L30 30 L26 44 M20 14 L28 20" stroke="#c8bd9f" stroke-width="1.3" fill="none"/></svg>`;
const balls=failures.map((f,i)=>{
  const b=document.createElement('div'); b.className='ball'; b.innerHTML=ballSVG; b.style.left=spots[i][0]+'%'; b.style.top=spots[i][1]+'%';
  const n=document.createElement('div'); n.className='note'; n.innerHTML=`<b>${f[0]}</b>${f[1]}`;
  n.style.left=clamp(spots[i][0]-8,0,62)+'%'; n.style.top=clamp(spots[i][1]-16,2,66)+'%'; n._r=Math.random()*16-8;
  $('#desktop').append(b,n); return {b,n};
});
const monLines='> re: re: re: FWD: URGENT\n> please action by EOD\n> per my last email\n> per my last email\n> circling back\n> just following up\n> ';
scenes['s-desk']=(p)=>{
  $('#dim').style.opacity=(seg(p,.25,.3)*.9).toFixed(3);
  const g=seg(p,.25,.3);
  $('#monitor').style.boxShadow=`0 0 ${60+g*140}px ${20+g*50}px rgba(255,246,201,${.6+g*.4})`;
  $('#monText').innerHTML=monLines.slice(0,Math.floor(seg(p,.3,.4)*monLines.length)).replace(/\n/g,'<br>');
  let opened=0;
  balls.forEach(({b,n},i)=>{
    const d=E.bounce(seg(p,.03+i*.03,.1)), u=seg(p,.5+i*.045,.05), ue=E.back(u);
    b.style.opacity=(d>0?1:0)*(1-u);
    b.style.transform=`translateY(${((1-d)*-560).toFixed(1)}px) rotate(${(i*47+(1-d)*260+u*180).toFixed(1)}deg) scale(${(1-u*.8).toFixed(3)})`;
    n.style.opacity=clamp(u*2);
    n.style.transform=`rotate(${(n._r+(1-ue)*-30).toFixed(1)}deg) scale(${(.3+ue*.7).toFixed(3)})`;
    if(u>=1) opened++;
    edge('ball'+i,d>=1?1:0,()=>click(.25,500));
    edge('note'+i,u>=1?1:0,()=>click(.3,700));
  });
  $('#failcount').textContent = opened===0?' ': opened<failures.length?`${opened} failure${opened>1?'s':''} unfolded`:`${opened} of ${opened}. Countless more in the bin.`;
};

/* ================= 4. STAIRS ================= */
const S=$('#stairSvg'), N=18, pts=[];
S.innerHTML=`<defs><radialGradient id="lg"><stop offset="0" stop-color="#fffbe0"/><stop offset=".4" stop-color="#ffe9a0" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient></defs><g id="world"><circle id="light" cx="200" cy="40" r="95" fill="url(#lg)"/></g>`;
const world=$('#world'), steps=[];
for(let i=0;i<N;i++){
  const t=i/(N-1), x=200+130*Math.sin(t*Math.PI*1.6)*(1-t*.55), y=600-560*Math.pow(t,.75), w=78-t*44;
  pts.push([x,y]);
  const g=document.createElementNS(NS,'g');
  g.innerHTML=`<path d="M${x-w/2} ${y} l${w} 0 l-6 10 l${-w+12} 0 Z" fill="#fffdf5" stroke="#1f1b16" stroke-width="2"/><path d="M${x-w/2+6} ${y+10} l0 ${18+t*10}" stroke="#1f1b16" stroke-width="1.2" opacity=".5"/>`;
  g._c=[x,y]; g._w=(i%2?1:-1)*(1+t*5); world.appendChild(g); steps.push(g);
}
const bob=document.createElementNS(NS,'g');
bob.innerHTML=`<circle cx="0" cy="-30" r="5" fill="#1f1b16"/><path d="M0 -25 L0 -10 M0 -20 L-6 -14 M0 -20 L7 -26" stroke="#1f1b16" stroke-width="2.2" stroke-linecap="round"/><path class="lgA" d="M0 -10 L-5 0" stroke="#1f1b16" stroke-width="2.2" stroke-linecap="round"/><path class="lgB" d="M0 -10 L5 0" stroke="#1f1b16" stroke-width="2.2" stroke-linecap="round"/><rect x="-12" y="-19" width="8" height="6" fill="#c2321f"/>`;
world.appendChild(bob);
const plates=['Junior Analyst','Analyst','Senior Analyst','Team Lead','Assistant Manager','Manager'].map(t=>{
  const s=document.createElement('span'); s.className='plate'; s.textContent=t; s._r=Math.random()*8-4; $('#plates').appendChild(s); return s; });
scenes['s-stairs']=(p,now)=>{
  // climb to the top, slip on the last step ("trapped in the harsh reality"), tumble back down
  const climbF=E.out(seg(p,0,.42))*(N-1);
  const slip=seg(p,.44,.04), fall=seg(p,.48,.12), land=E.out(seg(p,.6,.03));
  let f=climbF, hop=0, ang=0;
  if(fall>0){
    f=(N-1)*(1-E.inq(fall));                         // gravity: slow first, then faster
    const fi=f-Math.floor(f); hop=Math.abs(Math.sin(fi*Math.PI))*16*(1-fall*.6);
    ang=-35-fall*595;                                // ends lying flat (-630° ≡ 90°)
    edge('tumble',Math.floor((N-1)-f),()=>click(.35,260+Math.random()*200));
  } else if(slip>0){
    ang=-35*E.back(slip); hop=Math.sin(slip*Math.PI)*10;
    edge('slip',slip>=.5?1:0,()=>click(.4,180));
  }
  const i=Math.min(N-2,Math.floor(f)), fr=f-i;
  const a=pts[i], b=pts[i+1], x=a[0]+(b[0]-a[0])*fr+(slip>0&&fall===0?-slip*6:0);
  const y=a[1]+(b[1]-a[1])*fr-(fall>0||slip>0?hop:Math.sin(fr*Math.PI)*9)+land*12;
  bob.setAttribute('transform',`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${ang.toFixed(1)} 0 -15)`);
  const leg=fall>0?Math.sin(fall*40)*8:slip>0?slip*10:Math.sin(fr*Math.PI*2)*6;
  bob.querySelector('.lgA').setAttribute('d',`M0 -10 L${-5+leg} 0`); bob.querySelector('.lgB').setAttribute('d',`M0 -10 L${5-leg} 0`);
  steps.forEach((s,k)=>{ const v=clamp((climbF-k+4)/2.5); const wob=Math.sin(now/600+k)*s._w*(.3+p)*(1+E.bump(p,.46,.03)*6);
    s.setAttribute('opacity',v.toFixed(3));
    s.setAttribute('transform',`translate(0 ${((1-v)*30).toFixed(1)}) rotate(${wob.toFixed(2)} ${s._c[0]} ${s._c[1]})`); });
  // camera follows him up, then pulls back to show how little the top gave him
  const t=f/(N-1), z=1.35-.35*E.out(seg(p,.64,.18)), cx=200+(x-200)*.5*(1-seg(p,.64,.18)), cy=320+(y-320)*.6*(1-seg(p,.64,.18));
  world.setAttribute('transform',`translate(200 320) scale(${z.toFixed(3)}) translate(${-cx} ${-cy})`);
  const L=$('#light'); L.setAttribute('cy',(40-seg(p,.4,.2)*40).toFixed(1)); L.setAttribute('r',(95-seg(p,.45,.18)*70).toFixed(1));
  plates.forEach((pl,k)=>{ const q=seg(p,.83+k*.022,.05), d=E.bounce(q);
    pl.style.opacity=clamp(q*4);
    pl.style.transform=`translateY(${((d-1)*220).toFixed(1)}px) rotate(${(pl._r+(1-d)*-25).toFixed(1)}deg)`;
    pl.style.setProperty('--dust',seg(p,.9+k*.01,.08).toFixed(3));
    edge('pl'+k,q>=.36?1:0,()=>click(.35,300)); });
  if(Math.random()<.05 && p>.02 && p<.6) click(.04);
};

/* ================= 5. DECAY ================= */
scenes['s-decay']=(p)=>{
  const ph=E.out(seg(p,.1,.12)), tq=E.out(seg(p,.3,.25));
  const photo=$('#photo');
  photo.style.opacity=ph;
  photo.style.transform=`translateY(${((1-ph)*40).toFixed(1)}px) rotate(${(-3-tq*3).toFixed(2)}deg)`;
  photo.querySelector('.t1').setAttribute('transform',`translate(${-18*tq} ${8*tq}) rotate(${-7*tq} 30 45)`);
  photo.querySelector('.t2').setAttribute('transform',`translate(${22*tq} ${-6*tq}) rotate(${6*tq} 90 45)`);
  photo.querySelector('.t2').setAttribute('opacity',(1-tq*.5).toFixed(3));
  photo.style.filter=`grayscale(${tq}) blur(${(seg(p,.55,.3)*1.5).toFixed(2)}px)`;
  const d1=$('#s-decay .drift'), d2=$('#s-decay .drift2');
  d1.style.transform=`translateX(${(seg(p,.12,.3)*30).toFixed(1)}px)`;
  d2.style.letterSpacing=(seg(p,.2,.3)*.35).toFixed(3)+'em';
  d2.style.transform=`translateX(${(seg(p,.2,.3)*50).toFixed(1)}px)`;
  const st=E.out(seg(p,.86,.1));
  $('#steeper').style.transform=`rotate(${(-st*7).toFixed(2)}deg) skewX(${(-st*10).toFixed(2)}deg)`;
};

return {$,$$,clamp,seg,E,NS,scenes,texts,revealTexts,click,chime,edge};
})();
