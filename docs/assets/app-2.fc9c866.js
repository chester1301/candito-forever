/* Ideen 1 · 2 · 3 · 6 · 8 – Notizen-Verlauf je Übung, Sprachansage, „Wie Vorgabe“, Zyklus-Vergleich, Suche.
   Alles reine Anzeige/Bedienung auf vorhandenen Daten. Sprachansage-Einstellungen nur auf diesem Gerät (localStorage), keine neuen Trainingsdaten. */
(function(){
const esc2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- 1 Notizen-Verlauf je Übung ---------- */
function xnHist(e){const out=[];rfAllLogs().forEach(x=>{const xn=x.L.xn;if(!xn)return;withProg(x.pid,()=>{Object.keys(xn).forEach(b=>{const bl=P[x.w][x.d].b[+b];if(!bl)return;const ee=(x.L.sw&&x.L.sw[+b])||bl.e;if(ee!==e)return;
  out.push({dt:x.dt,lbl:PROGS[x.pid].name+' · W'+(x.w+1)+' · '+(DAYS[x.d]?DAYS[x.d].tag:'Tag '+(x.d+1)),t:xn[b],pid:x.pid,w:x.w,d:x.d})})})});return out.sort((a,b)=>b.dt-a.dt).slice(0,20)}
function xnHTML(e){const H=xnHist(e);return `<section class="xnh"><h3>Deine Notizen zu dieser Übung</h3>${H.length?H.map(n=>`<div class="xnh-i"><small>${n.dt.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short',year:'numeric'})} · ${esc2(n.lbl)}</small><p>${esc2(n.t)}</p></div>`).join(''):'<p class="xnh-e">Noch keine Notizen. In der Gym-Liste kannst du unter jeder Übung eine Notiz schreiben – sie erscheint dann hier.</p>'}</section>`}
window.cfXnHTML=xnHTML;
const RE0=window.renderEx;if(RE0)window.renderEx=function(){const r=RE0.apply(this,arguments);try{const sh=document.querySelector('#xsheet .sheet-in');if(sh&&S.ui.ex&&!sh.querySelector('.xnh')){const sc=sh.querySelector('.xm')||sh;sc.insertAdjacentHTML('beforeend',xnHTML(S.ui.ex))}}catch(e){console.warn(e)}return r};
const EI0=window.exInfoHTML;if(EI0)window.exInfoHTML=function(){let h=EI0.apply(this,arguments);try{const {w,d}=S.ui;const bl=P[w][d].b[G.b];const L=log(w,d);const e=(L&&L.sw&&L.sw[G.b])||bl.e;
 const card=`<section class="gxi-c">${xnHTML(e)}</section>`;const k=h.lastIndexOf('</div>');h=k>0?h.slice(0,k)+card+h.slice(k):h+card}catch(e){}return h};

/* ---------- 2 Sprachansage im Pausen-Timer ---------- */
const VK='cf-voice';function vc(){try{return Object.assign({on:false,lvl:'normal',rate:1,vn:''},JSON.parse(localStorage.getItem(VK)||'{}'))}catch(e){return {on:false,lvl:'normal',rate:1,vn:''}}}
function vcSave(o){try{localStorage.setItem(VK,JSON.stringify(o))}catch(e){}}
const SY=window.speechSynthesis;function deVoices(){return SY?SY.getVoices().filter(v=>/^de/i.test(v.lang)):[]}
function say(t,force){const c=vc();if(!SY||(!c.on&&!force))return;try{SY.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='de-DE';u.rate=c.rate||1;const v=deVoices().find(x=>x.name===c.vn);if(v)u.voice=v;SY.speak(u)}catch(e){}}
window.cfSay=say;
let unl=false;const unlock=()=>{if(unl||!SY||!vc().on)return;unl=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;SY.speak(u)}catch(e){}};['pointerdown','touchend','click'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
const kgS=v=>String(nf(v,2)).replace('.',',')+' Kilo';
const repS=r=>{const t=String(r).replace('–',' bis ');return t+(t==='1'?' Wiederholung':' Wiederholungen')};
const minS=s=>{const m=Math.floor(s/60),r=Math.round(s%60);return (m?m+(m===1?' Minute':' Minuten'):'')+(r?(m?' ':'')+r+' Sekunden':'')};
function nextInfo(full){try{const c=T.ctx;if(!c)return '';const n=withProg(c.pid||PROG,()=>{const nx=nextOpen(c.w,c.d,c.b,c.i);if(!nx)return null;const bl=P[c.w][c.d].b[nx.b];const L=log(c.w,c.d);const e=(L&&L.sw&&L.sw[nx.b])||bl.e;const T0=glTarget(c.w,c.d,nx.b,nx.i);
 return {n:(EX[e]||{n:e}).n,i:nx.i+1,s:bl.s,kg:T0.sg.kg,vo:T0.sg.t==='v',r:T0.sg.rdisp,e}});if(!n)return 'Das war der letzte Satz.';
 let t=`Als Nächstes: ${n.n}, Satz ${n.i} von ${n.s}.`;if(full&&n.kg!=null){t+=` ${kgS(n.kg)}, ${repS(n.r)}, ${n.vo?'Vorgabe':'Empfehlung der App'}.`;
  try{if(eqType(n.e)==='bb'){const pl=plates(n.kg,barFor(n.e));if(pl.length)t+=' Pro Seite: '+pl.map(p=>String(nf(p,2)).replace('.',',')).join(' und ')+'.'}}catch(e){}}return t}catch(e){return ''}}
function endInfo(){try{const c=T.ctx;if(!c)return 'Pause vorbei. Los geht’s.';const n=withProg(c.pid||PROG,()=>{const nx=nextOpen(c.w,c.d,c.b,c.i);if(!nx)return null;const T0=glTarget(c.w,c.d,nx.b,nx.i);return {kg:T0.sg.kg,r:T0.sg.rdisp}});
 return n&&n.kg!=null?`Pause vorbei. ${kgS(n.kg)}, ${repS(n.r)}. Los geht’s.`:'Pause vorbei. Los geht’s.'}catch(e){return 'Pause vorbei.'}}
let VS={k:null,done:{}};
setInterval(()=>{const c=vc();if(!c.on||!T||!T.on||T.paused||!T.end)return;const k=T.end;if(VS.k!==k){VS={k,done:{}}}const left=(T.end-Date.now())/1000,tot=T.total||0;const D=VS.done;const L=c.lvl;
 const once=(id,txt)=>{if(!D[id]){D[id]=1;say(txt)}};
 if(left>tot-3&&!D.start){D.start=1;say(L==='voll'?'Satz geschafft. Pause läuft, '+minS(tot)+'.':'Pause läuft. '+minS(tot)+'.');return}
 if(L!=='kurz'&&tot>=120&&left<=tot/2&&left>tot/2-2)once('half','Noch '+minS(Math.round(tot/2))+'.');
 if(tot>=60&&left<=30.5&&left>27)once('30','Noch 30 Sekunden. '+nextInfo(L==='voll'));
 if(L!=='kurz'&&left<=3.4&&left>2.5)once('3','Drei. Zwei. Eins.');
 if(left<=0.2&&left>-3)once('end',endInfo());},400);
const VL=[['kurz','Kurz'],['normal','Normal'],['voll','Ausführlich']],VR=[['0.9','Ruhig'],['1','Normal'],['1.15','Zügig']];
function vcHTML(){const c=vc();const vs=deVoices();
 return `<div class="vc" data-vcbox><div class="vc-t"><span><b>Sprachansage in der Pause</b><small>Restzeit, nächster Satz und Gewicht – nur solange die App offen ist</small></span><button type="button" class="vc-sw" data-vc="on" aria-pressed="${c.on}" aria-label="Sprachansage ${c.on?'aus':'ein'}schalten"></button></div>
 ${c.on?`<p class="note2" style="margin:10px 0 0">Umfang</p><div class="seg" style="grid-template-columns:repeat(3,1fr);margin:6px 0 0">${VL.map(([v,l])=>`<button type="button" data-vc="lvl|${v}" aria-pressed="${c.lvl===v}">${l}</button>`).join('')}</div>
 <p class="note2" style="margin:10px 0 0">Sprechtempo</p><div class="seg" style="grid-template-columns:repeat(3,1fr);margin:6px 0 0">${VR.map(([v,l])=>`<button type="button" data-vc="rate|${v}" aria-pressed="${String(c.rate)===v}">${l}</button>`).join('')}</div>
 <p class="note2" style="margin:10px 0 0">Stimme · für eine natürlichere Stimme: iPhone-Einstellungen › Bedienungshilfen › Gesprochene Inhalte › Stimmen › Deutsch, eine „Premium“- oder „Erweitert“-Stimme laden</p>
 <select data-vcvoice aria-label="Stimme"><option value="">Standardstimme</option>${vs.map(v=>`<option value="${esc2(v.name)}"${v.name===c.vn?' selected':''}>${esc2(v.name)}${/premium|enhanced|erweitert/i.test(v.name+v.voiceURI)?' ★':''}</option>`).join('')}</select>
 <button type="button" class="vc-test" data-vc="test">▶ Probe anhören</button>`:''}</div>`}
const RT0=window.rtHTML;if(RT0)window.rtHTML=function(){let h=RT0.apply(this,arguments);const k=h.lastIndexOf('</section>');return k>0?h.slice(0,k)+vcHTML()+h.slice(k):h+vcHTML()};
function vcRefresh(){document.querySelectorAll('[data-vcbox]').forEach(b=>b.outerHTML=vcHTML())}
if(SY)SY.onvoiceschanged=()=>{if(document.querySelector('[data-vcbox]'))vcRefresh()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-vc]');if(!b)return;e.preventDefault();e.stopPropagation();const c=vc();const [k,v]=b.dataset.vc.split('|');
 if(k==='on'){c.on=!c.on;vcSave(c);vcRefresh();if(c.on){unl=false;unlock();say('Sprachansage ist an.',true)}return}
 if(k==='lvl')c.lvl=v;if(k==='rate')c.rate=+v;vcSave(c);vcRefresh();
 if(k==='test'||k==='rate')say(c.lvl==='voll'?'Noch 30 Sekunden. Als Nächstes: High Bar Squat, Satz 2 von 3. 100 Kilo, 7 Wiederholungen, Vorgabe.':'Noch 30 Sekunden. Als Nächstes: High Bar Squat, Satz 2 von 3.',true)},true);
document.addEventListener('change',e=>{const s=e.target.closest('[data-vcvoice]');if(!s)return;const c=vc();c.vn=s.value;vcSave(c);say('So klinge ich. Noch 30 Sekunden.',true)});

/* ---------- 3 „Wie Vorgabe“ im Satz-Fenster ---------- */
const GS0=window.glSetHTML;if(GS0)window.glSetHTML=function(){let h=GS0.apply(this,arguments);try{const {w,d}=S.ui;const L=log(w,d,true);const s=L.b[G.b][G.i];if(s.ok)return h;const sg=sugg(w,d,G.b,G.i);
 const r=pnum(sg.r);if(sg.kg==null&&r==null)return h;const vo=sg.t==='v';const same=(sg.kg==null||pnum(s.kg)===sg.kg)&&(r==null||pnum(s.r)===r);
 const lbl=(sg.kg!=null?nf(sg.kg,2)+' kg':'')+(sg.kg!=null&&r!=null?' × ':'')+(r!=null?r:'');
 const btn=same?`<button type="button" class="gl-asis" disabled>✓ ${vo?'Entspricht der Vorgabe':'Entspricht der Empfehlung'}</button>`:`<button type="button" class="gl-asis${vo?'':' em'}" data-glasis>${vo?'Wie Vorgabe übernehmen':'Empfehlung übernehmen'} · ${lbl}</button><p class="gl-asis-n">${vo?'Gewicht und Wiederholungen laut Canditos Plan':'Empfehlung der App – keine Vorgabe von Candito'} · RPE trägst du selbst ein</p>`;
 const k=h.indexOf('<section class="gl-c">');return k>0?h.slice(0,k)+btn+h.slice(k):h}catch(e){return h}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-glasis]');if(!b)return;e.preventDefault();const {w,d}=S.ui;const L=log(w,d,true);const s=L.b[G.b][G.i];const sg=sugg(w,d,G.b,G.i);const r=pnum(sg.r);
 if(sg.kg!=null){s.kg=String(nf(sg.kg,2));if(s.lt&&s.lt!=='w')s.lt='w'}if(r!=null)s.r=String(r);saveLog(key(w,d));renderGym()},true);

/* ---------- 6 Zyklus-Vergleich ---------- */
function cycStats(id){return withProg(id,()=>{let ton=0,sets=0,ev=0,hit=0,dv=[],done=0;for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){const L=log(w,d);if(!L)continue;if(L.done)done++;
  P[w][d].b.forEach((bl,b)=>{(L.b[b]||[]).forEach((z,i)=>{if(!z||!z.ok)return;sets++;const kg=pnum(z.kg),r=pnum(z.r);if(kg&&r)ton+=kg*r;const rp=pnum(z.rpe);if(rp!=null&&bl.rpe!=null&&!bl.rpeEst)dv.push(rp-bl.rpe)})});
  if(L.done){const a=dayAdh(w,d);ev+=a.ev;hit+=a.hit}}
 const Lf=phaseLift(id);return {done,tot:NS(),ton,sets,adh:ev?hit/ev*100:null,dev:dv.length?dv.reduce((a,b)=>a+b,0)/dv.length:null,sq:Lf.sq.val,bp:Lf.bp.val,dl:Lf.dl.val,total:Lf.tot}})}
function cmpHTML(){const ids=ORD().filter(id=>withProg(id,()=>{for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){const L=log(w,d);if(L&&L.b&&L.b.some(a=>(a||[]).some(z=>z&&z.ok)))return true}return false}));
 if(ids.length<2)return `<section class="card cmp"><h2 class="h2" style="margin:0">Zyklus-Vergleich</h2><p class="cmp-n">Sobald du in zwei Zyklen trainiert hast, kannst du sie hier nebeneinander vergleichen (${ids.length}/2).</p></section>`;
 let a=S.ui.cmpA,b=S.ui.cmpB;if(!ids.includes(a))a=ids[ids.length-2];if(!ids.includes(b)||b===a)b=ids.find(x=>x!==a&&ids.indexOf(x)>ids.indexOf(a))||ids.find(x=>x!==a);
 const A=cycStats(a),B=cycStats(b);const sel=(k,v)=>`<select data-cmp="${k}" aria-label="Zyklus ${k==='A'?'links':'rechts'}">${ids.map(id=>`<option value="${id}"${id===v?' selected':''}>${esc2(PROGS[id].name)}</option>`).join('')}</select>`;
 const f=(v,u,dg)=>v==null?'–':nf(v,dg==null?0:dg)+(u||'');
 const row=(l,x,y,u,dg,better,diffU)=>{let d='',cl='eq';if(x!=null&&y!=null){const df=y-x;if(Math.abs(df)>1e-9){const good=better==='up'?df>0:better==='down'?df<0:null;cl=good==null?'eq':good?'up':'dn';d=(df>0?'+':'−')+nf(Math.abs(df),dg==null?0:dg)+(diffU!=null?diffU:(u||''))}else d='='}
  return `<span class="l">${l}</span><span class="v">${f(x,u,dg)}</span><span class="v">${f(y,u,dg)}</span><span class="d ${cl}">${d}</span>`};
 return `<section class="card cmp"><h2 class="h2" style="margin:0">Zyklus-Vergleich</h2><div class="cmp-sel">${sel('A',a)}<span>vs.</span>${sel('B',b)}</div>
 <div class="cmp-t"><span class="h">Wert</span><span class="h" style="text-align:right">${esc2(PROGS[a].name)}</span><span class="h" style="text-align:right">${esc2(PROGS[b].name)}</span><span class="h" style="text-align:right">Δ</span>
 ${row('Kniebeuge e1RM',A.sq,B.sq,' kg',0,'up')}${row('Bank e1RM',A.bp,B.bp,' kg',0,'up')}${row('Kreuzheben e1RM',A.dl,B.dl,' kg',0,'up')}${row('Total e1RM',A.total,B.total,' kg',0,'up')}
 ${row('Einheiten',A.done,B.done,'',0,'up')}${row('Sätze',A.sets,B.sets,'',0,null)}${row('Volumen',A.ton/1000,B.ton/1000,' t',1,null)}${row('Plan-Treue',A.adh,B.adh,' %',0,'up',' P.')}${row('RPE Ist − Soll',A.dev,B.dev,'',1,'down')}</div>
 <p class="cmp-n">e1RM = geschätztes 1RM aus deinen Sätzen (Test-Satz, wenn vorhanden). Plan-Treue = Sätze, die Canditos Vorgaben getroffen haben. Reine Auswertung – nichts am Plan ändert sich.</p></section>`}
window.cfCmpHTML=cmpHTML;
document.addEventListener('change',e=>{const s=e.target.closest('[data-cmp]');if(!s)return;S.ui['cmp'+s.dataset.cmp]=s.value;const c=document.querySelector('.cmp');if(c)c.outerHTML=cmpHTML()});

/* ---------- 8 Suche ---------- */
const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss');
function hl(t,q){const s=String(t||'');if(!q)return esc2(s);const n=norm(s),i=n.indexOf(norm(q));if(i<0)return esc2(s);return esc2(s.slice(0,i))+'<mark>'+esc2(s.slice(i,i+q.length))+'</mark>'+esc2(s.slice(i+q.length))}
const cut=(t,q,n=90)=>{const s=String(t||'');const i=norm(s).indexOf(norm(q));if(i<0||s.length<=n)return s.slice(0,n)+(s.length>n?' …':'');const a=Math.max(0,i-30);return (a?'… ':'')+s.slice(a,a+n)+(a+n<s.length?' …':'')};
function srResults(q){q=q.trim();if(q.length<2)return '<p class="sr-e">Mindestens 2 Zeichen – z. B. „Paused“, „Knie“, „Tag 3“.</p>';const nq=norm(q);const G={ex:[],ses:[],note:[],plan:[]};
 Object.keys(EX).forEach(e=>{if(norm(EX[e].n).includes(nq))G.ex.push(`<button type="button" data-srex="${e}"><b>${hl(EX[e].n,q)}</b><small>Übungsinfo, Verlauf und Notizen</small></button>`)});
 histSessions().forEach(s=>{const lbl=s.prog+' · W'+(s.w+1)+' · '+(s.day.f||'');const ds=s.dt.toLocaleDateString('de-DE',{day:'numeric',month:'short',year:'numeric'});const exm=s.ex.find(x=>norm(x.name).includes(nq));
  if(norm(lbl).includes(nq)||exm)G.ses.push(`<button type="button" data-srsv="${s.pid}|${s.w}|${s.d}"><b>${hl(s.day.f||lbl,q)}</b><small>${ds} · ${esc2(s.prog)} W${s.w+1}${exm?' · '+hl(exm.name,q)+(exm.kg?' '+esc2(exm.kg)+' kg × '+esc2(exm.r):''):''}</small></button>`);
  const L=s.L;const notes=[['Notiz',L.note],['Erreicht',L.ach],['Besser machen',L.imp],...Object.entries(L.xn||{}).map(([b,t])=>{const bl=withProg(s.pid,()=>P[s.w][s.d].b[+b]);return [(bl&&EX[(L.sw&&L.sw[+b])||bl.e]||{}).n||'Übung',t]})];
  notes.forEach(([k,t])=>{if(t&&norm(t).includes(nq))G.note.push(`<button type="button" data-srsv="${s.pid}|${s.w}|${s.d}"><b>${esc2(k)} · ${ds}</b><small>${hl(cut(t,q),q)}</small></button>`)})});
 for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){const day=P[w][d];const m=day.b.find(bl=>norm((EX[bl.e]||{}).n).includes(nq));if(m||norm(day.f).includes(nq))G.plan.push(`<button type="button" data-srplan="${w}|${d}"><b>W${w+1} · ${hl(day.f,q)}</b><small>${esc2(PROGS[PROG].name)}${m?' · '+hl(EX[m.e].n,q)+' · '+esc2(m.x||''):''}</small></button>`)}
 const grp=(t,a)=>a.length?`<div class="sr-g"><h3>${t} · ${a.length}</h3>${a.slice(0,8).join('')}</div>`:'';
 const h=grp('Übungen',G.ex)+grp('Notizen',G.note)+grp('Abgeschlossene Einheiten',G.ses)+grp('Im Plan · '+esc2(PROGS[PROG].name),G.plan);return h||`<p class="sr-e">Nichts gefunden für „${esc2(q)}“.</p>`}
function srOpen(){let el=document.getElementById('srbox');if(!el){el=document.createElement('div');el.id='srbox';el.className='srbox';document.body.appendChild(el)}
 el.innerHTML=`<div role="dialog" aria-modal="true" aria-label="Suche"><div class="sr-h"><input id="srq" type="search" enterkeyhint="search" placeholder="Übung, Notiz, Einheit …" autocomplete="off" value="${esc2(S.ui.srq||'')}"><button type="button" data-srclose>Fertig</button></div><div class="sr-r" id="srr">${srResults(S.ui.srq||'')}</div></div>`;el.hidden=false;document.body.classList.add('sropen');setTimeout(()=>{const i=document.getElementById('srq');if(i)i.focus()},60)}
function srClose(){const el=document.getElementById('srbox');if(el)el.hidden=true;document.body.classList.remove('sropen')}
window.cfSrOpen=srOpen;
document.addEventListener('input',e=>{if(e.target.id!=='srq')return;S.ui.srq=e.target.value;clearTimeout(srOpen.t);srOpen.t=setTimeout(()=>{const r=document.getElementById('srr');if(r)r.innerHTML=srResults(S.ui.srq)},120)});
document.addEventListener('click',e=>{const t=e.target.closest('[data-sropen],[data-srclose],[data-srex],[data-srsv],[data-srplan]');if(!t)return;e.preventDefault();e.stopPropagation();
 if(t.dataset.sropen!=null){srOpen();return}srClose();if(t.dataset.srclose!=null)return;
 if(t.dataset.srex){openEx(t.dataset.srex);return}
 if(t.dataset.srsv){const [pid,w,d]=t.dataset.srsv.split('|');svOpen(pid,+w,+d,false);return}
 if(t.dataset.srplan){const [w,d]=t.dataset.srplan.split('|');S.ui.tab='train';S.ui.w=+w;S.ui.d=+d;render();scrollTo(0,0)}},true);
/* Such-Knopf im Kopf neben dem Zahnrad */
{const g=document.getElementById('gear');if(g&&!document.getElementById('srch')){g.insertAdjacentHTML('beforebegin','<button type="button" class="iconbtn srbtn" id="srch" data-sropen aria-label="Suchen"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>')}}
})();