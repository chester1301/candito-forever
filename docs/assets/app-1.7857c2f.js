/* Juggernaut-Ideen 1–11: Readiness-Bühne, Einheiten-Raster, Schlaf & Gewicht, Kraft-Kacheln, Gym-Liste (Streifen, Satzgruppe, Notiz je Übung, Titel-Pille), Fortsetzen-Pille, Monatskalender.
   Reine Anzeige aus vorhandenen Daten; einziges neues Feld: L.xn = {Block-Index: Notiz} (von Marcel freigegeben). */
(function(){
const WD=['S','M','D','M','D','F','S'];
function last7(){const t0=new Date();t0.setHours(12,0,0,0);const a=[];for(let i=6;i>=0;i--){const d=new Date(t0);d.setDate(d.getDate()-i);a.push(d)}return a}
function dayVals(get){const m={};rfAllLogs().forEach(x=>{const v=get(x.L);if(v!=null)m[isoD(x.dt)]=v});Object.entries(S.meta.rest||{}).forEach(([k,o])=>{const v=get(o);if(v!=null&&m[k]==null)m[k]=v});return m}
let gid=0;
function miniLine(vals){const W=150,H=46;const pts=vals.map((v,i)=>v==null?null:[i,v]).filter(Boolean);
 if(!pts.length)return `<svg class="jx-ml" viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="0" x2="${W}" y1="${H-6}" y2="${H-6}" stroke="#2c2e36" stroke-dasharray="3 4"/></svg>`;
 const lo=Math.min(...pts.map(p=>p[1])),hi=Math.max(...pts.map(p=>p[1]));const X=i=>6+i*(W-12)/6,Y=v=>H-8-((v-lo)/((hi-lo)||1))*(H-20);
 const d=pts.map((p,j)=>(j?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join(' ');const l=pts[pts.length-1];const id='jxg'+(++gid);
 return `<svg class="jx-ml" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f64f6" stop-opacity=".55"/><stop offset="1" stop-color="#3f64f6" stop-opacity="0"/></linearGradient></defs>${pts.length>1?`<path d="${d} L${X(l[0])} ${H} L${X(pts[0][0])} ${H}Z" fill="url(#${id})"/>`:''}<path d="${d}" fill="none" stroke="#3f64f6" stroke-width="3" stroke-linecap="round"/><circle cx="${X(l[0])}" cy="${Y(l[1])}" r="4.5" fill="#6683ff"/></svg>`}
/* 2 – Raster der Einheiten (Zeile = Trainingstag, Spalte = Woche) */
function gridHTML(){const n=NW(),m=ND();let done=0,cells='';
 for(let d=0;d<m;d++)for(let w=0;w<n;w++){const L=log(w,d);const ok=L&&L.done;if(ok)done++;const live=L&&typeof isLive==='function'&&isLive(L);cells+=`<i class="${ok?'ok':live?'live':''}" style="grid-row:${d+2};grid-column:${w+1}"></i>`}
 const head=Array.from({length:n},(_,w)=>`<b style="grid-row:1;grid-column:${w+1}">${w+1}</b>`).join('');
 return `<button type="button" class="card jx-grid" data-go-pd="verlauf" aria-label="${done} von ${n*m} Einheiten erledigt – Verlauf öffnen"><span class="jx-gl"><b>${done}</b><span>${done===1?'Einheit':'Einheiten'}</span><small>von ${n*m} erledigt</small></span>
  <span class="jx-gg" style="grid-template-columns:repeat(${n},22px)" aria-hidden="true">${head}${cells}</span><span class="jx-more">Verlauf ›</span></button>`}
/* 3 – Schlaf (Check-in-Antwort 1–5 = 5 bis 9+ Std) & Körpergewicht */
function tilesHTML(){const ds=last7();
 const sl=dayVals(L=>L&&L.feel&&L.feel.sleeph!=null?L.feel.sleeph+4:null);const bw=dayVals(L=>L&&pnum(L.bw));
 const sv=ds.map(d=>sl[isoD(d)]??null),bv=ds.map(d=>bw[isoD(d)]??null);
 const sAll=Object.values(sl).slice(-7);const sAvg=sAll.length?sAll.reduce((a,b)=>a+b,0)/sAll.length:null;const sLast=Object.keys(sl).length?sl[Object.keys(sl).sort().pop()]:null;
 const bLast=curBw();const hrs=v=>v>=9?'9+':nf(v,0);
 const axis=`<div class="jx-ax" aria-hidden="true">${ds.map(d=>`<span>${WD[d.getDay()]}</span>`).join('')}</div>`;
 return `<div class="jx-two">
 <section class="card jx-t"><p class="jx-th"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>Schlaf</p><b>${sLast!=null?hrs(sLast)+' Std':'–'}</b><small>${sAvg!=null?'Ø '+nf(sAvg,1)+' laut Check-in':'aus dem Check-in'}</small>${miniLine(sv)}${axis}</section>
 <section class="card jx-t"><p class="jx-th"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 9.5a4 4 0 0 1 6 0M12 12l1.5-2"/></svg>Gewicht</p><b>${bLast!=null?nf(bLast,1)+' kg':'–'}</b><small>${bLast!=null?'zuletzt eingetragen':'im Check-in eintragen'}</small>${miniLine(bv)}${axis}</section></div>`}
/* 4 – Kraft-Kacheln (e1RM) */
function maxHTML(){let D=null;try{D=progData()}catch(e){}const b=(D&&D.best)||{};const N={sq:'Kniebeuge',bp:'Bankdrücken',dl:'Kreuzheben'};
 return `<div class="jx-max">${['sq','bp','dl'].map(k=>`<button type="button" class="card jx-m" data-go-pd="kraft" aria-label="${N[k]} e1RM ${b[k]!=null?nf(b[k],0)+' kg':'noch offen'} – Kraft öffnen"><b>${b[k]!=null?nf(b[k],0)+'<em> kg</em>':'–'}</b><small>${N[k]}</small><span>e1RM</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>`).join('')}</div>`}
/* 6 – Fortsetzen-Pille */
function resume(){let el=document.getElementById('jx-res');const r=typeof runningSession==='function'?runningSession():null;const tb=document.getElementById('tbar');
 const show=r&&document.getElementById('gym').hidden&&(!tb||tb.hidden);
 if(!show){if(el)el.hidden=true;return}
 if(!el){el=document.createElement('button');el.type='button';el.id='jx-res';el.className='jx-res';document.body.appendChild(el);el.addEventListener('click',()=>{const r2=runningSession();if(r2){S.ui.w=r2.w;S.ui.d=r2.d;el.hidden=true;openGym()}})}
 const min=Math.max(0,Math.round((Date.now()-r.L.start)/60000));el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg><span><b>Training fortsetzen</b><small>${esc(P[r.w][r.d].f)} · ${Math.floor(min/60)}:${String(min%60).padStart(2,'0')} h</small></span>`;el.hidden=false}
setInterval(()=>{try{if(!document.hidden)resume()}catch(e){}},30000);
/* Gym nach dem Öffnen einmal nachmessen: passt die Ansicht nicht ohne Scrollen, mit eingeschwungenem Layout neu aufbauen */
{const O0=window.openGym;if(O0)window.openGym=function(){const r=O0.apply(this,arguments);setTimeout(()=>{try{const g=document.getElementById('gym');if(!g.hidden&&g.scrollHeight>g.clientHeight+2)renderGym()}catch(e){}},350);return r}}
/* Schrift wird nachgeladen: Gym-Ansicht danach neu messen, damit sie ohne Scrollen passt */
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{try{if(!document.getElementById('gym').hidden)renderGym()}catch(e){}});
/* 8 – Monatskalender im Verlauf */
let CM=null,CV='cal';
function calHTML(){const now=new Date();if(!CM)CM=new Date(now.getFullYear(),now.getMonth(),1);
 const tr={};rfAllLogs().forEach(x=>{if(x.L.done)tr[isoD(x.dt)]=1});
 const pl={};for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){const L=log(w,d);if(L&&L.done)continue;const dt=dayDate(w,d);if(dt)pl[isoD(dt)]=1}
 const y=CM.getFullYear(),m=CM.getMonth();const first=new Date(y,m,1),start=new Date(first);start.setDate(1-((first.getDay()+6)%7));const tk=isoD(now);
 let cells='';for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);if(i>=35&&d.getMonth()!==m)break;const k=isoD(new Date(d.getFullYear(),d.getMonth(),d.getDate(),12));const out=d.getMonth()!==m;const fut=k>tk;
  const cls=out?'out':tr[k]?'tr':pl[k]?'pl':fut?'fu':'pa';cells+=`<span class="${cls}${tk===k?' td':''}">${d.getDate()}</span>`}
 const cnt=Object.keys(tr).length;const off=CV==='list'?' off':'';
 return `<section class="card jx-cal"><div class="jx-ch"><p>${cnt} ${cnt===1?'Einheit':'Einheiten'} abgeschlossen</p><span class="jx-vt" role="group" aria-label="Ansicht"><button type="button" data-jxv="cal" aria-pressed="${CV==='cal'}" aria-label="Kalender"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg></button><button type="button" data-jxv="list" aria-pressed="${CV==='list'}" aria-label="Nur Liste"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg></button></span></div>
 <div class="jx-mh${off}"><button type="button" data-jxm="-1" aria-label="Vormonat">‹</button><b>${first.toLocaleDateString('de-DE',{month:'long',year:'numeric'})}</b><button type="button" data-jxm="1" aria-label="Nächster Monat">›</button></div>
 <div class="jx-wd${off}" aria-hidden="true">${['Mo','Di','Mi','Do','Fr','Sa','So'].map(x=>`<span>${x}</span>`).join('')}</div><div class="jx-days${off}">${cells}</div>
 <p class="jx-lg${off}"><span><i class="tr"></i>Trainiert</span><span><i class="pl"></i>Geplant</span><span><i class="fu"></i>Kommend</span></p></section>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-jxm],[data-jxv]');if(!b)return;if(b.dataset.jxm)CM.setMonth(CM.getMonth()+ +b.dataset.jxm);else CV=b.dataset.jxv;const c=document.querySelector('.jx-cal');if(c)c.outerHTML=calHTML()});
/* Einhängen in die Bildschirme */
const R0=window.render;window.render=function(){const r=R0.apply(this,arguments);try{post()}catch(e){console.warn(e)}return r};
function post(){document.body.classList.add('jx');const v=document.getElementById('view');const tab=S.ui.tab;
 if(tab==='home'&&!v.querySelector('.jx-grid')){const g=v.querySelector('.greet'),jr=v.querySelector('.card.jr'),hero=v.querySelector('.card.hero');
  if(jr&&g){g.after(jr);if(!jr.classList.contains('jr-empty')&&(S.meta.ds||{}).jr!=='ring')jr.classList.add('jx-jr')}
  if(hero)hero.insertAdjacentHTML('afterend',gridHTML()+tilesHTML()+maxHTML());
  {const he=v.querySelector('.card.hero');if(he)he.classList.add('jx-cur')}
  if(g&&typeof homeOrd==='function'){const M={jr:v.querySelector('.card.jr'),hero:v.querySelector('.card.hero'),grid:v.querySelector('.jx-grid'),tiles:v.querySelector('.jx-two'),max:v.querySelector('.jx-max')};let an=g;homeOrd().forEach(k=>{if(k==='hero'){const rd=v.querySelector('.rday');if(rd){an.after(rd);an=rd}}const n=M[k];if(n){an.after(n);an=n}})}
  const pz=[...v.querySelectorAll('.phead')].find(h=>/^Zustand/.test(h.textContent.trim()));if(pz)pz.remove()}
 if(tab==='train'){const t=v.querySelector('.card.trh');if(t){const n=nextSession(),r=typeof runningSession==='function'?runningSession():null;const c=(r&&r.w===S.ui.w&&r.d===S.ui.d)||(n&&n.w===S.ui.w&&n.d===S.ui.d);t.classList.toggle('jx-cur',!!c)}}
 if(tab==='prog'&&S.ui.pd==='verlauf'&&!v.querySelector('.jx-cal')){const b=v.querySelector('.pdbody');const seg=b&&[...b.children].find(c=>/\b1W\b/.test(c.textContent)&&c.textContent.length<40);
  const tgt=seg||(b&&b.firstElementChild);if(tgt)tgt.insertAdjacentHTML(seg?'beforebegin':'afterend',calHTML())}
 resume()}
/* 5 & 7 – Gym-Liste: Satzgruppe, Notiz je Übung, Titel-Pille beim Scrollen */
const G0=window.renderGymL;if(G0)window.renderGymL=function(){const r=G0.apply(this,arguments);try{gpost()}catch(e){console.warn(e)}return r};
function noteBtn(b,t){return `<button type="button" class="jx-note" data-jxnote="${b}" aria-label="Notiz zur Übung ${t?'ändern':'hinzufügen'}"><b>Notizen</b>${t?`<span class="jx-nt">${esc(t)}</span>`:`<span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>Notiz hinzufügen</span>`}</button>`}
function gpost(){const g=document.getElementById('gym');const {w,d}=S.ui;const L=log(w,d,true);const xn=L.xn||{};

 {const day=P[w][d];const HC2={h:'#e8262f',m:'#f59a45',l:'#f6d65e'};const LC={sq:'#6f8cff',bp:'#5ad1e6',dl:'#b48cff',acc:'#8f9bc4'};g.querySelectorAll('.gl-ex').forEach(ex=>{const b=+String(ex.id).replace('glx-','');const bl=day.b[b];if(!bl)return;const e=(L.sw&&L.sw[b])||bl.e;ex.dataset.sth=HC2[bl.h]||'';ex.dataset.hyk=bl.h||'';ex.dataset.stl=LC[(EX[e]||{}).g]||''})}
 g.querySelectorAll('.gl-ex').forEach(ex=>{if(ex.querySelector('.jx-note'))return;const b=+String(ex.id).replace('glx-','');
  const x=ex.querySelector('.gl-x');if(x&&!ex.querySelector('.jx-sg')){const m=x.textContent.match(/^(\d+)\s*[×x]\s*([\d–\-]+)/);if(m)x.insertAdjacentHTML('beforebegin',`<p class="jx-sg">${m[1]} ${m[1]==='1'?'Satz':'Sätze'} × ${m[2]} Wdh.</p>`)}
  ex.insertAdjacentHTML('beforeend',noteBtn(b,xn[b]))});
 const top=g.querySelector('.gl-top'),h=g.querySelector('.gl-hd h1');if(top&&h&&!top.querySelector('.jx-tp')){const sp=top.querySelector('span[style*="flex:1"]');const p=document.createElement('span');p.className='jx-tp';p.setAttribute('aria-hidden','true');p.textContent=h.textContent;if(sp)sp.after(p);else top.appendChild(p)}
 if(!g._jx){g._jx=()=>{g.classList.toggle('jx-sc',g.scrollTop>90);gymHyFollow(g)};g.addEventListener('scroll',g._jx,{passive:true})}g._jx()}
/* Gym-Hintergrund nach Hype: Lichtkegel folgt der Übung, die gerade oben im Bild ist */
function gymHyFollow(g){if(!(S.meta.ds||{}).gymhy)return;const exs=g.querySelectorAll('.gl-ex');if(!exs.length)return;const y=g.getBoundingClientRect().top+Math.min(220,g.clientHeight*.3);let cur=exs[0];
 for(const ex of exs){if(ex.getBoundingClientRect().top<=y)cur=ex;else break}const k=cur.dataset.hyk||'n';if(g.dataset.hy!==k)g.dataset.hy=k}
/* Notiz-Fenster */
function noteOpen(b){const {w,d}=S.ui;const L=log(w,d,true);const day=P[w][d];const ex=EX[(L.sw&&L.sw[b])||day.b[b].e]||{};
 let el=document.getElementById('jxnote');if(!el){el=document.createElement('div');el.id='jxnote';el.className='jx-nbox';document.body.appendChild(el)}
 el.innerHTML=`<div role="dialog" aria-modal="true" aria-label="Notiz zur Übung"><h3>${esc(ex.n||'Übung')}</h3><p>Notiz zu dieser Übung in dieser Einheit – nur auf dem iPhone gespeichert.</p><textarea id="jxnt" rows="5" placeholder="z. B. Technik, Gefühl, Hinweise fürs nächste Mal …">${esc((L.xn||{})[b]||'')}</textarea><div class="jx-nb"><button type="button" class="jx-nc" data-jxnc>Abbrechen</button><button type="button" class="jx-ns" data-jxns="${b}">Speichern</button></div></div>`;
 el.hidden=false;setTimeout(()=>{const t=document.getElementById('jxnt');if(t)t.focus()},50)}
document.addEventListener('click',e=>{const o=e.target.closest('[data-jxnote]');if(o){e.preventDefault();e.stopPropagation();noteOpen(+o.dataset.jxnote);return}
 const el=document.getElementById('jxnote');if(!el||el.hidden)return;
 if(e.target.closest('[data-jxnc]')||e.target===el){el.hidden=true;return}
 const s=e.target.closest('[data-jxns]');if(s){const b=+s.dataset.jxns;const {w,d}=S.ui;const L=log(w,d,true);const v=(document.getElementById('jxnt').value||'').trim();
  L.xn=Object.assign({},L.xn||{});if(v)L.xn[b]=v;else delete L.xn[b];if(!Object.keys(L.xn).length)delete L.xn;saveLog(key(w,d));el.hidden=true;try{renderGym()}catch(_){}}},true);
/* Inline-Farben aus Vorlagen (Ringe, Häkchen): Grün -> Hellblau, Readiness ausgenommen */
if((window.CF_THEME||'blue')==='blue'&&window.cfJgConv){const conv=window.cfJgConv;const SKIP='.jr,.jrs,#jrsheet,.jr-ring,.rf';
 const one=e=>{if(!e.getAttribute||(e.closest&&e.closest(SKIP)))return;['stroke','fill','stop-color'].forEach(k=>{const v=e.getAttribute(k);if(v){const n=conv(v);if(n!==v)e.setAttribute(k,n)}});const st=e.getAttribute('style');if(st){const n2=conv(st);if(n2!==st)e.setAttribute('style',n2)}};
 const all=r=>{one(r);r.querySelectorAll&&r.querySelectorAll('[style],[stroke],[fill],[stop-color]').forEach(one)};
 new MutationObserver(ms=>{for(const m of ms){if(m.type==='attributes')one(m.target);else m.addedNodes.forEach(n=>{if(n.nodeType===1)all(n)})}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','stroke','fill','stop-color']});all(document.body)}
})();