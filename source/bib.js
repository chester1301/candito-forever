/* ===================== Programmbibliothek – App-Anbindung =====================
   Übersicht aller Programme: Programm › Variante › Block › Woche › Tag › Übung (Kern: bib-core.js).
   - Eingebaute Candito-Programme werden NUR gelesen (aus PROGS/P) – keine Änderung an Plan oder Regeln.
   - Importierte Programme (PDF mit Text, Bild-PDF mit Texterkennung, JSON, CSV, Text; mehrere Dateien auf einmal) liegen nur auf
     diesem Gerät (localStorage „cf-bib“, Spiegel in IndexedDB „bib/lib“, in jeder Sicherung enthalten).
   - Gym-Übernahme (freigegeben): Ein importiertes Programm wird je Variante zu einem eigenen Trainingsprogramm „lb…“ übersetzt
     (eigener Speicher-Präfix → eigene Trainingsdaten). Nur vollständige und eindeutige Tage sind trainierbar; alle anderen Tage
     sind gesperrt, bis sie in der Bibliothek geprüft wurden. Zustand in S.meta.lib = {act, st:{id:Start-Montag W1}, rm:{id:{SQ,BP,DL}}}.
   - Nichts wird erfunden; Lasten werden nicht automatisch angepasst; RPE wird nie vorbelegt. */
const BIB_KEY='cf-bib',BIB_GYM_LIVE=true;
const BIB=(function(){
const C=BIBCORE,esc3=C.esc,norm=C.norm;

/* ---------- Speicher (nur Gerät, getrennt von Trainingsdaten) ---------- */
function load(){try{const o=JSON.parse(localStorage.getItem(BIB_KEY)||'null');return o&&o.v===1&&Array.isArray(o.progs)?o:{v:1,progs:[]}}catch(e){return {v:1,progs:[]}}}
function save(o){o.u=Date.now();let ok=true;try{localStorage.setItem(BIB_KEY,JSON.stringify(o))}catch(e){ok=false}mirror(o);return ok}
function mirror(o){try{if(typeof db!=='undefined'&&db)db.doc('bib/lib').set({at:new Date().toISOString(),u:o.u||Date.now(),data:JSON.parse(JSON.stringify(o))}).catch(()=>{})}catch(e){}}
/* Zusammenführen zweier Bibliotheksstände ohne Verlust: fehlende Programme werden ergänzt, vorhandene nie überschrieben */
function union(a,b){const out={v:1,progs:a.progs.slice()};let n=0;(b&&Array.isArray(b.progs)?b.progs:[]).forEach(p=>{if(p&&p.id&&!out.progs.some(x=>x.id===p.id)){out.progs.push(p);n++}});return {lib:out,added:n}}
function dbSync(d){try{d.doc('bib/lib').get().then(s=>{const loc=load();const rem=s&&s.exists?(s.data()||{}).data:null;
  if(rem&&Array.isArray(rem.progs)){const u=union(loc,rem);if(u.added){try{localStorage.setItem(BIB_KEY,JSON.stringify(u.lib))}catch(e){}register();try{if(typeof render==='function')render()}catch(e){}}
   if(u.lib.progs.length>rem.progs.length)mirror(u.lib)}else if(loc.progs.length)mirror(loc)}).catch(()=>{})}catch(e){}}

/* ---------- Eingebaute Programme (nur lesen) ---------- */
const BASE=[['intro',['intro']],['p8',['p8','p8b','p8c']],['p10',['p10','p10b','p10c','p10d']],['p3',['p3']],['p10w',['p10w']]];
const HYN={l:'Niedrig',m:'Moderat',h:'Hoch'};
function builtin(){const out=[];BASE.forEach(([base,ids])=>{const have=ids.filter(id=>typeof PROGS!=='undefined'&&PROGS[id]);if(!have.length)return;const g=PROGS[have[0]];
 const weeks=g.P.map((wk,w)=>({n:w+1,name:g.WEEKS[w]||'',days:wk.map((day,d)=>({n:d+1,name:(g.DAYS[d]&&g.DAYS[d].tag)||('Tag '+(d+1)),wd:(g.DAYS[d]&&g.DAYS[d].wdl)||'',focus:day.f||'',notes:day.d||'',hints:(g.INFO&&g.INFO[w+'-'+d])||[],
  ex:day.b.map(bl=>({eid:bl.e,name:(EX[bl.e]||{n:bl.e}).n,sets:bl.s,reps:bl.r,amrap:/AMRAP/i.test(String(bl.r)),rpe:bl.rpe!=null?bl.rpe:null,rpeEst:!!bl.rpeEst,
   load:bl.pct!=null?{pct:bl.pct,ref:bl.ref||null,text:bl.pct+' % '+(bl.ref==='TOP'?'der Top-Satz-Last':bl.ref?'der '+bl.ref+'-Referenz':'')}:bl.test?{text:'Test-Satz ('+bl.test+')'}:null,
   hype:bl.h?HYN[bl.h]:null,opt:!!bl.opt,notes:bl.x||'',flags:[]}))}))}));
 out.push({id:'bi-'+base,src:'builtin',name:g.name.replace(/ · Zyklus \d+$/,''),sub:g.sub,variants:have.map((id,i)=>({id,name:have.length>1?'Zyklus '+(i+1):'Standard',label:PROGS[id].name})),blocks:[{name:'Gesamtphase',weeks}]})});return out}

/* ---------- Texterkennung für Bild-PDFs (nur lokal auf dem Gerät) ----------
   Nutzt die Texterkennung des Browsers (Shape-Detection-API „TextDetector“, in Safari auf Apples Vision-Framework gestützt),
   sofern sie verfügbar ist. Keine Cloud, keine Fremdbibliothek. Sonst: Mac-Importer oder iPhone-Kurzbefehl. */
function ocrEngine(){if(window.__cfOcrEngine)return window.__cfOcrEngine;try{if('TextDetector' in window){const td=new window.TextDetector();return {name:'Safari-Texterkennung',detect:b=>td.detect(b)}}}catch(e){}return null}
async function toBitmap(img){if(img.kind==='jpeg')return createImageBitmap(new Blob([img.bytes],{type:'image/jpeg'}));return createImageBitmap(new ImageData(img.data,img.w,img.h))}
async function ocrPages(R,eng,onProg){const pages=[];for(let i=0;i<R.images.length;i++){if(onProg)onProg(`Texterkennung Seite ${i+1} von ${R.images.length} …`);
  let img=await C.pdfImage(R,R.images[i]);const bm=await toBitmap(img);img=null;let res=[];try{res=await eng.detect(bm,i)}finally{try{bm.close&&bm.close()}catch(e){}}
  pages.push(C.linesFromBoxes((res||[]).map(t=>{const b=t.boundingBox||t;return {text:t.rawValue!=null?t.rawValue:t.text,x:b.x||0,y:b.y||0,h:b.height||b.h||10}})))}return pages}

/* ---------- Eine Datei lesen ---------- */
const MAXPDF=220e6;
async function sha(f){try{const b=await f.arrayBuffer();const h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return ''}}
async function parseFile(file,onProg){const nm=file.name||'Datei';const base=C.baseName(nm);const ext=(nm.split('.').pop()||'').toLowerCase();
 if(ext==='json'||file.type==='application/json')return C.parseJSON(await file.text(),{file:nm});
 if(ext==='csv'||file.type==='text/csv')return C.parseCSV(await file.text(),{file:nm,name:base});
 if(ext==='txt'||file.type==='text/plain'){const tx=await file.text();const parts=C.splitMulti(tx);const multi=parts.length>1||parts.some(p=>p.file);
  return {progs:parts.map(p=>C.parseText(p.text,{file:p.file||nm,fallback:C.baseName(p.file||nm),fmt:'text',src:multi?'ocr':'text'}))}}
 if(ext==='pdf'||file.type==='application/pdf'){if(file.size>MAXPDF)return {error:`Die PDF ist sehr groß (${Math.round(file.size/1e6)} MB) – das ist für das iPhone zu viel auf einmal. Bitte mit dem Mac-Importer umwandeln (Hilfe: „Bild-PDFs umwandeln“).`,imageOnly:true};
  let R;try{if(onProg)onProg('PDF wird gelesen …');R=await C.pdfRead(await file.arrayBuffer())}catch(e){return {error:'PDF nicht lesbar: '+e.message}}
  if(R.text.replace(/\s/g,'').length>=40)return {progs:[C.parseText(R.text,{file:nm,fallback:base,fmt:'pdf'})]};
  if(!R.images.length)return {error:'In der PDF wurde kein auslesbarer Text gefunden.'};
  const eng=ocrEngine();
  if(!eng)return {error:`Diese PDF enthält nur Bilder (${R.images.length} Bildseiten, z. B. Screenshots) und keinen auslesbaren Text. Die Texterkennung ist in diesem Browser nicht verfügbar – nutze den Mac-Importer (mehrere PDFs auf einmal) oder den iPhone-Kurzbefehl. Hilfe: „Bild-PDFs umwandeln“.`,imageOnly:true,pages:R.images.length};
  let pages;try{pages=await ocrPages(R,eng,onProg)}catch(e){return {error:'Texterkennung fehlgeschlagen: '+(e&&e.message||e)+' – bitte den Mac-Importer nutzen.',imageOnly:true}}
  const p=C.parseText(pages.join('\n\f\n'),{file:nm,fallback:base,fmt:'pdf-ocr',src:'ocr'});p.ocrBy=eng.name||'Texterkennung';p.pages=pages.length;return {progs:[p],pages:pages.length}}
 return {error:'Dateityp nicht unterstützt. Erlaubt: PDF, JSON, CSV, TXT.'}}
/* Kompatibel zur ersten Version: eine Datei → {progs}|{error} */
async function importFile(file){return parseFile(file)}

/* ---------- Mehrfachimport: alle Dateien → Vorschau (Kopie der Bibliothek), erst „Übernehmen“ speichert ---------- */
async function importFiles(files,onProg){const lib=JSON.parse(JSON.stringify(load()));const seen=new Map();lib.progs.forEach(p=>(p.files||[]).forEach(f=>{if(f.sha)seen.set(f.sha,p.name)}));
 const rows=[];let i=0;for(const f of files){i++;const pre=t=>onProg&&onProg(`Datei ${i} von ${files.length}: ${f.name} · ${t}`);pre('prüfen …');
  const h=await sha(f);if(h&&seen.has(h)){rows.push({file:f.name,status:'Dublette',msg:`gleiche Datei bereits ${seen.get(h)===true?'in dieser Auswahl':'importiert ('+seen.get(h)+')'}`});continue}
  let R;try{R=await parseFile(f,pre)}catch(e){R={error:String(e&&e.message||e)}}
  if(R.error){rows.push({file:f.name,status:R.imageOnly?'Nur Bilder':'Fehler',msg:R.error});continue}
  if(!R.progs.length){rows.push({file:f.name,status:'Fehler',msg:'Keine Programme erkannt'});continue}
  R.progs.forEach(p=>{if(h&&!(p.files||[]).length)p.files=[{name:f.name,sha:h,pages:R.pages||p.pages||0}]});
  R.progs.forEach(p=>{const lbl=p.file&&p.file!==f.name?f.name+' › '+p.file:f.name;C.merge(lib,[p],lbl).forEach(r=>rows.push(r))});
  if(h)seen.set(h,true);R.progs.forEach(p=>(p.files||[]).forEach(x=>{if(x.sha&&!seen.has(x.sha))seen.set(x.sha,true)}))}
 const ids=[...new Set(rows.filter(r=>r.target).map(r=>r.target))];return {rows,lib,ids}}

/* ---------- Übersetzung in ein trainierbares Programm ---------- */
const h8=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(16).padStart(8,'0')};
const cidOf=(p,v)=>'lb'+h8(p.id+'|'+v.id);
const WDL=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],WDS=['Mo','Di','Mi','Do','Fr','Sa','So'];
const DEFOFF={1:[0],2:[0,3],3:[0,2,4],4:[0,1,3,4],5:[0,1,3,4,5],6:[0,1,2,3,4,5],7:[0,1,2,3,4,5,6]};
const LM=()=>{if(!S.meta.lib||typeof S.meta.lib!=='object')S.meta.lib={act:null,st:{},rm:{}};if(!S.meta.lib.st)S.meta.lib.st={};if(!S.meta.lib.rm)S.meta.lib.rm={};return S.meta.lib};
const lockDay=(why,detail,f)=>({f:'Gesperrt · '+why,d:detail||why,b:[],lock:why,f0:f||''});
const isPctRef=(x,g)=>x.load&&x.load.pct!=null&&(x.load.ref&&/^(SQ|BP|DL)$/.test(x.load.ref)||['sq','bp','dl'].includes(g)&&/\b1\s*-?\s*rm\b|\be1rm\b|\bmax\b|maximum/i.test(x.load.text||''));
function compile(p,vi,cid){const v=p.variants[vi]||p.variants[0];const bl=C.blocksOf(p,v.name).filter(b=>b.weeks.length);let nd=0;bl.forEach(b=>b.weeks.forEach(W=>W.days.forEach(D=>{if(D.n>nd)nd=D.n})));nd=Math.max(1,Math.min(7,nd));
 const wds=[];for(let d=1;d<=nd;d++){let wd=null;bl.forEach(b=>b.weeks.forEach(W=>{const D=W.days.find(x=>x.n===d);if(wd==null&&D&&D.wd){const k=norm(D.wd).split(' ')[0];if(C.WD[k]!=null)wd=C.WD[k]}}));wds.push(wd)}
 const inc=wds.every((x,i)=>x!=null&&(i===0||x>wds[i-1]));const offs=inc?wds.map(x=>x-wds[0]):DEFOFF[nd];const w0=inc?wds[0]:0;
 const DAYS=offs.map((o,i)=>({tag:'Tag '+(i+1),wd:WDS[(w0+o)%7],wdl:WDL[(w0+o)%7],off:o}));
 const P=[],WEEKS=[],INFO={},wmap=[];let locked=0;
 bl.forEach(b=>{const mx=Math.max(...b.weeks.map(W=>W.n));for(let n=1;n<=mx;n++){const W=b.weeks.find(x=>x.n===n);const w=P.length;wmap.push({b:b.name,n});
  WEEKS.push(W?((bl.length>1?b.name+(W.name?' · ':''):'')+(W.name||(bl.length>1?'':'Woche '+n))):'fehlt im Import');const row=[];
  for(let d=1;d<=nd;d++){const D=W&&W.days.find(x=>x.n===d);
   if(!W){row.push(lockDay('Woche fehlt im Import','Diese Woche ist in den importierten Dateien nicht enthalten. Importiere sie, dann wird der Tag trainierbar.'));locked++;continue}
   if(!D){row.push(lockDay('Tag fehlt im Import','Dieser Trainingstag ist in den importierten Dateien nicht enthalten.'));locked++;continue}
   const g=C.toGymDay(D);
   if(!g.ok){row.push(lockDay('Vorgaben unvollständig','Gesperrt, bis die Angaben in der Programmbibliothek geprüft sind: '+g.issues.map(i=>i.name+' ('+i.need.join(', ')+')').join('; '),D.focus));locked++;continue}
   const blocks=g.day.b.map((bk,i)=>{const x=D.ex[i];const o=Object.assign({},bk);const gg=EX[o.e]&&EX[o.e].g;if(isPctRef(x,gg)){o.pct=x.load.pct;o.ref=x.load.ref&&/^(SQ|BP|DL)$/.test(x.load.ref)?x.load.ref:gg.toUpperCase()}return o});
   const hints=(D.hints||[]).slice();D.ex.forEach(x=>{if(x.notes)hints.push((EX[x.eid]?EX[x.eid].n:x.name)+': '+x.notes)});if(hints.length)INFO[w+'-'+(d-1)]=hints;
   row.push({f:D.focus||D.name||('Tag '+d),d:D.notes||'',b:blocks})}
  P.push(row)}});
 if(!P.length){P.push([lockDay('Keine Wochen erkannt','Das Programm enthält keine lesbaren Wochen.')]);WEEKS.push('Woche 1');locked++}
 let tw=P.length-1,td=0;outer:for(let w=P.length-1;w>=0;w--)for(let d=P[w].length-1;d>=0;d--)if(P[w][d].b.length){tw=w;td=d;break outer}
 const nm=p.name+(p.variants.length>1?' · '+v.name:'');
 return {P,WEEKS,REFS:{SQ:{n:'Kniebeuge-1RM'},BP:{n:'Bank-1RM'},DL:{n:'Kreuzheben-1RM'}},DAYS,INFO,ORIG:DAYS.map(x=>x.wdl),name:nm,short:nm.length>14?nm.slice(0,13)+'…':nm,sub:P.length+' Wochen · Bibliothek',pre:cid+'-',test:[tw,td],
  lib:{pid:p.id,vid:v.id,vname:v.name,wmap,locked,days:P.length*nd-locked}}}
function variantsAll(){const L=load();const out=[];L.progs.forEach(p=>p.variants.forEach((v,vi)=>out.push({p,v,vi,cid:cidOf(p,v)})));return out}
/* Registriert alle je gestarteten Bibliotheksprogramme in PROGS – vor dem ersten Anzeigen (boot) und nach jeder Änderung */
function register(){const M=S.meta.lib;if(!M)return 0;const want=new Set(Object.keys(M.st||{}));if(M.act)want.add(M.act);if(!want.size)return 0;let n=0;
 variantsAll().forEach(o=>{if(want.has(o.cid)){try{PROGS[o.cid]=compile(o.p,o.vi,o.cid);n++}catch(e){}}});
 try{if(PROGS[PROG]&&PROGS[PROG].lib)setProg(PROG)}catch(e){}try{SG.clear();rfAllLogs.gen=(rfAllLogs.gen||0)+1}catch(e){}return n}
function active(){const M=S.meta.lib;return M&&M.act&&PROGS[M.act]?M.act:null}
const isoMon=t=>{const d=new Date(t);d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return isoD(d)};
const firstW=g=>{for(let w=0;w<g.P.length;w++)if(g.P[w].some(x=>x.b.length))return w;return 0};
function startOf(cid,g0){const M=S.meta.lib;if(M&&M.st&&M.st[cid])return M.st[cid];const g=g0||PROGS[cid];const t=new Date(nextMonday()+'T12:00:00');if(g)t.setDate(t.getDate()-firstW(g)*7);return isoD(t)}
function rm(cid,r){const M=S.meta.lib;const v=M&&M.rm&&M.rm[cid]&&M.rm[cid][r];return v?pnum(v):null}
function hasLogsCid(cid){const pre=cid+'-';return Object.keys(S.logs).some(k=>k.startsWith(pre)&&(()=>{const L=S.logs[k];return L&&(L.done||(L.b||[]).some(a=>(a||[]).some(z=>z&&(z.ok||pnum(z.kg)))))})())}
function ensure(o){if(!PROGS[o.cid])PROGS[o.cid]=compile(o.p,o.vi,o.cid);return PROGS[o.cid]}
function begin(cid,startIso){const M=LM();const o=variantsAll().find(x=>x.cid===cid);if(!o)return false;PROGS[cid]=compile(o.p,o.vi,cid);
 const g=PROGS[cid];if(!g.lib.days){toast('Noch kein Tag trainierbar – bitte zuerst die markierten Angaben prüfen');return false}
 if(startIso||!M.st[cid]){const mon=isoMon(new Date((startIso||startOf(cid,g))+'T12:00:00'));const t=new Date(mon+'T12:00:00');if(startIso)t.setDate(t.getDate()-firstW(g)*7);M.st[cid]=isoD(t)}
 M.act=cid;S.meta.sqActive=null;saveMeta();if(window.bibClose)bibClose();switchProg(cid);S.ui.tab='train';pickToday();render();window.scrollTo({top:0});toast(g.name+' gestartet – eigene Trainingsdaten, nichts Bestehendes wird verändert');return true}
function end(){const M=LM();M.act=null;saveMeta();switchProg.manual=0;const a=autoProg();if(a&&a!==PROG)switchProg(a);else render();toast('Bibliotheksprogramm beendet – Einträge bleiben gespeichert')}
function dump(){return load()}
/* Wiederherstellen aus einer Sicherung: ergänzt fehlende Programme, nichts wird überschrieben */
function restore(b){if(!b||!Array.isArray(b.progs))return 0;const u=union(load(),b);if(u.added)save(u.lib);return u.added}

return {load,save,builtin,parseText:C.parseText,parseCSV:C.parseCSV,parseJSON:C.parseJSON,parseRx:C.parseRx,pdfRead:C.pdfRead,importFile,importFiles,parseFile,toGymDay:d=>Object.assign(C.toGymDay(d),{live:BIB_GYM_LIVE}),
 matchEx:C.matchEx,norm,esc:esc3,compile,register,active,startOf,rm,cidOf,variantsAll,hasLogsCid,begin,end,dump,restore,union,dbSync,ocrEngine,ensure,quality:C.quality,merge:C.merge,firstW,isoMon}})();
window.BIB=BIB;

/* Anbindung an die bestehende Programmlogik (nur für Bibliotheksprogramme; eingebaute Programme bleiben unberührt) */
function libActive(){return BIB.active()}
function xActive(){return sqActive()||libActive()}
function xActs(){const a=[];if(sqActive())a.push(sqActive());if(libActive())a.push(libActive());return a}
function lockN(id){const g=PROGS[id];if(!g||!g.lib)return 0;let n=0;g.P.forEach(wk=>wk.forEach(x=>{if(x.lock)n++}));return n}

/* ===================== Programmbibliothek – Oberfläche ===================== */
(function(){const E=BIB.esc,norm=BIB.norm;let ST={};const ST0=()=>({p:null,v:0,b:0,w:null,d:null,imp:null,paste:false,del:null,gym:null,edit:null,help:false,busy:null});ST=ST0();
function all(){return BIB.builtin().concat(BIB.load().progs)}
function cnt(p){let w=0,d=0,x=0,f=0;(p.blocks||[]).forEach(b=>(b.weeks||[]).forEach(W=>{w++;(W.days||[]).forEach(D=>{d++;(D.ex||[]).forEach(X=>{x++;if(X.flags&&X.flags.length)f++})})}));return {w,d,x,f}}
const ICO={back:'<path d="M15 6l-6 6 6 6"/>',up:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',warn:'<path d="M12 4 2 20h20L12 4z"/><path d="M12 10v4M12 17h.01"/>',chev:'<path d="m9 6 6 6-6 6"/>',lib:'<path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-.8 3 15.6-3.5.8z"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 play:'<path d="M7 5v14l12-7z"/>',ok:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"/>'};
const ic=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;
function flagsHTML(f){return f&&f.length?`<p class="bb-fl">${ic('warn')}<span>${f.map(E).join(' · ')}</span></p>`:''}
function exHTML(x,i,canEdit){const load=x.load?(x.load.text||(x.load.pct!=null?x.load.pct+' %':x.load.kg!=null?x.load.kg+' kg':'')):'';
 return `<article class="bb-ex${x.flags&&x.flags.length?' warn':''}"><div class="bb-exh"><b>${E(x.name||'–')}</b>${x.eid?'':'<span class="bb-tag w">nicht im Katalog</span>'}${x.opt?'<span class="bb-tag">optional</span>':''}${x.ok?'<span class="bb-tag ok">geprüft</span>':''}</div>
 ${x.eid&&EX[x.eid]&&norm(EX[x.eid].n)!==norm(x.name)?`<p class="bb-raw">Katalog: ${E(EX[x.eid].n)}</p>`:''}
 <dl class="bb-kv"><div><dt>Sätze</dt><dd>${x.sets!=null?E(x.sets):'<i>fehlt</i>'}</dd></div><div><dt>Wdh.</dt><dd>${x.reps!=null?E(x.reps):'<i>fehlt</i>'}</dd></div><div><dt>RPE</dt><dd>${x.rpe!=null?E(String(x.rpe).replace('.',','))+(x.rpeEst?' (Schätzung)':''):x.rpeTxt?E(x.rpeTxt):x.rpeBad?'<i>unlesbar</i>':'–'}${x.kind&&(x.rpe!=null||x.rpeTxt)?`<small class="bb-k">${E(x.kind)}</small>`:''}</dd></div><div><dt>Last</dt><dd>${load?E(load):'–'}</dd></div>${x.hype?`<div><dt>Hype</dt><dd>${E(x.hype)}</dd></div>`:''}</dl>
 ${x.notes?`<p class="bb-nt">${E(x.notes)}</p>`:''}${flagsHTML(x.flags)}${x.raw&&x.flags&&x.flags.length?`<p class="bb-raw">Gelesen: „${E(x.raw)}“</p>`:''}
 ${canEdit?`<button type="button" class="bb-btn s sm" data-bbedit="${i}">${ic('edit')}Angaben prüfen / korrigieren</button>`:''}</article>`}
function crumbs(p){const c=[['Bibliothek','root']];if(p){c.push([p.name,'p']);if(ST.w!=null)c.push(['Woche '+ST.w,'w']);if(ST.d!=null)c.push(['Tag '+ST.d,'d'])}return `<nav class="bb-cr" aria-label="Pfad">${c.map(([t,k],i)=>i<c.length-1?`<button type="button" data-bbcr="${k}">${E(t)}</button><span>›</span>`:`<b>${E(t)}</b>`).join('')}</nav>`}
const cur=()=>{const P=all();return ST.p?P.find(x=>x.id===ST.p):null};
const blkOf=p=>p.blocks[ST.b]||p.blocks[0];
function vo(p){const v=p.variants[ST.v]||p.variants[0];return {p,v,vi:p.variants.indexOf(v),cid:BIB.cidOf(p,v)}}
/* Tage, für die schon trainiert wurde, sind für Korrekturen gesperrt (Trainingsdaten dürfen nicht überschrieben werden) */
function dayLogged(p,bname,wn,dn){return p.variants.some(v=>{const cid=BIB.cidOf(p,v);let g=PROGS[cid];if(!g){const o=BIB.variantsAll().find(x=>x.cid===cid);if(!o)return false;try{g=BIB.compile(o.p,o.vi,cid)}catch(e){return false}}
 const w=g.lib.wmap.findIndex(m=>m.b===bname&&m.n===wn);if(w<0)return false;const L=S.logs[cid+'-w'+(w+1)+'d'+dn];return !!(L&&(L.done||(L.b||[]).some(a=>(a||[]).some(z=>z&&(z.ok||pnum(z.kg))))))})}
function qualHTML(p,vn){const q=BIB.quality(p,vn);const pct=q.score;
 return `<section class="bb-q"><div class="bb-qh"><b>Datenqualität</b><span class="bb-tag ${q.locked||q.missingWeeks.length||q.missingDays.length?'w':'ok'}">${pct} % vollständig</span></div>
 <div class="bb-qbar"><i style="width:${pct}%"></i></div>
 <dl class="bb-kv"><div><dt>Wochen</dt><dd>${q.weeks.length}</dd></div><div><dt>Tage</dt><dd>${q.days}</dd></div><div><dt>Trainierbar</dt><dd>${q.ok}</dd></div><div><dt>Gesperrt</dt><dd class="${q.locked?'w':''}">${q.locked}</dd></div><div><dt>Übungen</dt><dd>${q.ex}</dd></div><div><dt>Markiert</dt><dd class="${q.flagged?'w':''}">${q.flagged}</dd></div></dl>
 ${q.missingWeeks.length?`<p class="bb-fl">${ic('warn')}<span>Fehlende Wochen: ${E(q.missingWeeks.join(', '))}</span></p>`:''}
 ${q.missingDays.length?`<p class="bb-fl">${ic('warn')}<span>Fehlende Trainingstage: ${E(q.missingDays.slice(0,24).join(', '))}${q.missingDays.length>24?' …':''}</span></p>`:''}</section>`}
function trainHTML(p){const o=vo(p);const g=PROGS[o.cid]||BIB.compile(o.p,o.vi,o.cid);const act=libActive()===o.cid,sqa=sqActive(),la=libActive();const st=PROGS[o.cid]&&S.meta.lib&&S.meta.lib.st&&S.meta.lib.st[o.cid];
 const fw=BIB.firstW(g);const sd=new Date(BIB.startOf(o.cid,g)+'T12:00:00');sd.setDate(sd.getDate()+fw*7);const needRm=[...new Set(g.P.flat().flatMap(x=>x.b.filter(b=>b.ref).map(b=>b.ref)))];
 const RN={SQ:'Kniebeuge-1RM',BP:'Bank-1RM',DL:'Kreuzheben-1RM'};
 return `<section class="bb-tr${act?' on':''}"><div class="bb-qh"><b>Als Trainingsprogramm</b>${act?'<span class="bb-tag ok">aktiv</span>':st?'<span class="bb-tag">gestartet</span>':''}</div>
 <p class="bb-note">${g.lib.days} von ${g.lib.days+g.lib.locked} Trainingstagen trainierbar${g.lib.locked?` · ${g.lib.locked} gesperrt (fehlend oder unvollständig – werden nicht als Einheit angelegt)`:''}. Eigene Trainingsdaten, getrennt von deinem Jahresplan.</p>
 ${act?`<div class="bb-imp"><button type="button" class="bb-btn" data-bbgo="${o.cid}">${ic('play')}Zum Training</button><button type="button" class="bb-btn s" data-bbend>Beenden</button></div>`:
 `${st&&BIB.hasLogsCid(o.cid)?`<p class="bb-note">Bereits trainiert – Start bleibt beim gespeicherten Datum (Woche ${fw+1} ab ${sd.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})}), damit deine Einträge ihren Tagen zugeordnet bleiben.</p>`:`<label class="bb-l" for="bbstart">Start: Montag der Woche ${fw+1}</label><input type="date" id="bbstart" class="bb-in" value="${isoD(sd)}">`}
 ${needRm.length?`<p class="bb-note">Einige Vorgaben sind Prozent vom 1RM. Trage dafür dein 1RM ein (nur für dieses Programm):</p><div class="bb-rm">${needRm.map(r=>`<label class="bb-l">${RN[r]}<input class="bb-in" inputmode="decimal" data-bbrm="${o.cid}|${r}" value="${BIB.rm(o.cid,r)!=null?E(String(BIB.rm(o.cid,r))):''}" placeholder="kg"></label>`).join('')}</div>`:''}
 <button type="button" class="bb-btn" data-bbstartgo="${o.cid}" ${g.lib.days?'':'disabled'}>${ic('play')}${st&&BIB.hasLogsCid(o.cid)?'Fortsetzen':sqa||la?'Wechseln & starten':'Programm starten'}</button>
 ${sqa||la?`<p class="bb-note">Aktiv ist gerade: ${E(PROGS[sqa||la].name)}. Beim Start wird es pausiert – alle Einträge bleiben gespeichert.</p>`:''}`}</section>`}
function rootHTML(){const P=all();const bi=P.filter(x=>x.src==='builtin'),im=P.filter(x=>x.src!=='builtin');const la=libActive();
 const card=x=>{const c=cnt(x);let q=null;if(x.src!=='builtin')q=BIB.quality(x);return `<button type="button" class="bb-card" data-bbp="${x.id}"><span class="bb-ct"><b>${E(x.name)}</b><small>${x.src==='builtin'?'Eingebaut · nur lesen':'Importiert'+(x.files&&x.files.length?' · '+x.files.length+' '+(x.files.length===1?'Datei':'Dateien'):x.file?' · '+E(x.file):'')} · ${x.variants.length} ${x.variants.length===1?'Variante':'Varianten'} · ${c.w} Wochen · ${c.d} Tage · ${c.x} Übungen</small>${c.f?`<em class="bb-tag w">${c.f} unvollständig</em>`:''}${q?`<em class="bb-tag ${q.locked?'w':'ok'}">${q.ok}/${q.days} Tage trainierbar</em>`:''}</span>${ic('chev')}</button>`};
 return `${la?`<section class="bb-tr on"><div class="bb-qh"><b>Aktives Bibliotheksprogramm</b><span class="bb-tag ok">aktiv</span></div><p class="bb-note">${E(PROGS[la].name)}</p><div class="bb-imp"><button type="button" class="bb-btn" data-bbgo="${la}">${ic('play')}Zum Training</button><button type="button" class="bb-btn s" data-bbend>Beenden</button></div></section>`:''}
 <div class="bb-imp"><label class="bb-btn"><input type="file" id="bbfile" multiple accept=".pdf,.json,.csv,.txt,application/pdf,application/json,text/csv,text/plain" hidden>${ic('up')}Dateien importieren</label><button type="button" class="bb-btn s" data-bbpaste>Text einfügen</button></div>
 <button type="button" class="bb-btn s" data-bbhelp>${ic('help')}Bild-PDFs umwandeln (Mac · iPhone)</button>
 <p class="bb-note">Mehrere Dateien auf einmal: PDF, JSON (auch vom Mac-Importer), CSV oder TXT. Programme, Varianten, Wochen und Tage werden automatisch zugeordnet, doppelte Dateien übersprungen. Nur eigene oder zur Nutzung freigegebene Dateien importieren – die Bibliothek liest ausschließlich Dateien, die du selbst auswählst, und ruft keine Inhalte aus Apps oder Diensten (z. B. Superset) ab.</p>
 <h3 class="bb-h">Eingebaute Candito-Programme</h3>${bi.map(card).join('')}<h3 class="bb-h">Importiert</h3>${im.length?im.map(card).join(''):'<p class="bb-e">Noch nichts importiert.</p>'}`}
function progHTML(p){const c=cnt(p);const blk=blkOf(p);const imp=p.src!=='builtin';const o=imp?vo(p):null;const logs=imp&&p.variants.some(v=>BIB.hasLogsCid(BIB.cidOf(p,v)));const isAct=imp&&p.variants.some(v=>libActive()===BIB.cidOf(p,v));
 const vbl=imp?BIBCORE.blocksOf(p,o.v.name):p.blocks;
 return `${crumbs(p)}<header class="bb-ph"><h2>${E(p.name)}</h2><p>${p.src==='builtin'?'Eingebaut · Canditos Vorgaben, nur lesen':'Importiert'+(p.file?' aus '+E(p.file):'')+(p.ocr?' · Texterkennung':'')} · ${c.x} Übungen${c.f?` · <b class="w">${c.f} unvollständig</b>`:''}</p></header>
  ${p.variants.length>1?`<p class="bb-l">Variante</p><div class="seg bb-seg" style="grid-template-columns:repeat(${Math.min(4,p.variants.length)},1fr)">${p.variants.map((v,i)=>`<button type="button" data-bbv="${i}" aria-pressed="${ST.v===i}">${E(v.name)}</button>`).join('')}</div>${p.src==='builtin'?'<p class="bb-note">Die Zyklen nutzen denselben Plan von Candito; sie unterscheiden sich nur in deinen Trainingsdaten.</p>':''}`:''}
  ${imp?qualHTML(p,o.v.name)+trainHTML(p):''}
  ${imp?`<details class="bb-un"><summary>${ic('edit')} Programm umbenennen</summary><div class="bb-rm" style="margin-top:6px"><input id="bbrn" class="bb-in" value="${E(p.name)}" aria-label="Programmname"><button type="button" class="bb-btn s sm" data-bbren="${p.id}">Name speichern</button></div><p class="bb-note">Der Name dient nur der Anzeige. Die Zuordnung deiner Trainingsdaten bleibt unverändert.</p></details>`:''}
  ${vbl.length>1?`<p class="bb-l">Block</p><div class="seg bb-seg" style="grid-template-columns:repeat(${Math.min(3,vbl.length)},1fr)">${vbl.map(b=>{const i=p.blocks.indexOf(b);return `<button type="button" data-bbb="${i}" aria-pressed="${ST.b===i}">${E(b.name)}</button>`}).join('')}</div>`:''}
  <p class="bb-l">${E(blk.name)} · Wochen</p>${blk.weeks.map(W=>{const f=W.days.reduce((a,D)=>a+D.ex.filter(x=>x.flags&&x.flags.length).length+(D.flags?1:0),0);const lk=imp?W.days.filter(D=>!BIBCORE.toGymDay(D).ok).length:0;return `<button type="button" class="bb-card" data-bbw="${W.n}"><span class="bb-ct"><b>Woche ${W.n}${W.name?' · '+E(W.name):''}</b><small>${W.days.length} Tage · ${W.days.reduce((a,D)=>a+D.ex.length,0)} Übungen</small>${f?`<em class="bb-tag w">${f} unvollständig</em>`:''}${lk?`<em class="bb-tag w">${lk} ${lk===1?'Tag':'Tage'} gesperrt</em>`:''}</span>${ic('chev')}</button>`}).join('')||'<p class="bb-e">Keine Wochen erkannt.</p>'}
  ${p.unparsed&&p.unparsed.length?`<details class="bb-un"><summary>${ic('warn')} ${p.unparsed.length} Zeilen nicht zugeordnet</summary><pre>${E(p.unparsed.slice(0,80).join('\n'))}</pre></details>`:''}
  ${p.files&&p.files.length?`<details class="bb-un"><summary>${ic('lib')} Quelle: ${p.files.length} ${p.files.length===1?'Datei':'Dateien'}</summary><pre>${E(p.files.map(f=>f.name+(f.pages?' · '+f.pages+' S.':'')).join('\n'))}</pre></details>`:''}
  ${imp?(logs||isAct?`<p class="bb-note">${ic('lock')} Löschen gesperrt: ${isAct?'Programm ist aktiv':'zu diesem Programm gibt es Trainingseinträge'} – dein Verlauf bleibt vollständig erhalten.</p>`:ST.del===p.id?`<button type="button" class="bb-del armed" data-bbdel="${p.id}">Wirklich löschen? Nochmal tippen</button>`:`<button type="button" class="bb-del" data-bbdel="${p.id}">Aus Bibliothek löschen</button>`)+`<button type="button" class="bb-btn s" data-bbexp="${p.id}" style="margin-top:8px">Als JSON exportieren</button>`:''}`}
function body(){const p=cur();
 if(ST.busy)return `<header class="bb-ph"><h2>Import läuft</h2><p class="bb-prog" aria-live="polite">${E(ST.busy)}</p></header><div class="bb-spin" aria-hidden="true"></div>`;
 if(ST.help)return helpHTML();if(ST.imp)return importPreview();if(ST.paste)return pasteHTML();if(ST.gym)return gymPrev();if(ST.edit)return editHTML();
 if(!p)return rootHTML();
 if(ST.w==null)return progHTML(p);
 const blk=blkOf(p);const W=blk.weeks.find(x=>x.n===ST.w);if(!W){ST.w=null;return body()}const imp=p.src!=='builtin';
 if(ST.d==null)return `${crumbs(p)}<header class="bb-ph"><h2>Woche ${W.n}${W.name?' · '+E(W.name):''}</h2></header>${W.days.map(D=>{const g=imp?BIBCORE.toGymDay(D):null;return `<button type="button" class="bb-card" data-bbd="${D.n}"><span class="bb-ct"><b>${E(D.name)}${D.wd?' · '+E(D.wd):''}${D.focus?' · '+E(D.focus):''}</b><small>${D.ex.length} Übungen${D.ex.length?' · '+E(D.ex.slice(0,3).map(x=>x.name).join(', '))+(D.ex.length>3?' …':''):''}</small>${g?(g.ok?'<em class="bb-tag ok">trainierbar</em>':'<em class="bb-tag w">gesperrt – prüfen</em>'):D.flags||D.ex.some(x=>x.flags&&x.flags.length)?'<em class="bb-tag w">prüfen</em>':''}</span>${ic('chev')}</button>`}).join('')}`;
 const D=W.days.find(x=>x.n===ST.d);if(!D){ST.d=null;return body()}
 const g=imp?BIBCORE.toGymDay(D):null;const logged=imp&&dayLogged(p,blk.name,W.n,D.n);
 return `${crumbs(p)}<header class="bb-ph"><h2>${E(D.name)}${D.wd?' · '+E(D.wd):''}</h2><p>Woche ${W.n}${D.focus?' · '+E(D.focus):''} · ${D.ex.length} Übungen</p></header>
 ${g?(g.ok?`<p class="bb-okl">${ic('ok')}<span>Trainierbar – alle Übungen eindeutig und vollständig.</span></p>`:`<p class="bb-err">${ic('lock')}<span>Gesperrt für das Training: ${g.issues.map(i=>E(i.name)+' ('+i.need.map(E).join(', ')+')').join('; ')}. Prüfe die Angaben unten.</span></p>`):''}
 ${logged?`<p class="bb-note">${ic('lock')} Für diesen Tag gibt es schon Trainingseinträge – die Vorgaben sind deshalb schreibgeschützt.</p>`:''}
 ${D.notes?`<section class="bb-co"><b>Coaching-Hinweise</b><p>${E(D.notes)}</p>${(D.hints||[]).map(h=>`<p>${E(h)}</p>`).join('')}</section>`:(D.hints||[]).length?`<section class="bb-co"><b>Coaching-Hinweise</b>${D.hints.map(h=>`<p>${E(h)}</p>`).join('')}</section>`:''}
 ${flagsHTML(D.flags)}${imp&&!logged&&D.ex.some(x=>(x.flags||[]).some(f=>/unsicher|gekürzt/.test(f))&&!x.rpeBad&&!x.alt)?`<button type="button" class="bb-btn s" data-bbcday>${ic('ok')}Mit dem Original verglichen – unsichere Lesungen dieses Tages bestätigen</button><p class="bb-note">Bestätigt nur unsicher gelesene oder gekürzte Angaben. Fehlende Sätze/Wiederholungen, unlesbare RPE-Werte und ODER-Optionen musst du einzeln eintragen.</p>`:''}${D.ex.map((x,i)=>exHTML(x,i,imp&&!logged)).join('')}
 ${imp?`<button type="button" class="bb-btn" data-bbgym>${ic('eye')}Im Gym-Layout ansehen</button><p class="bb-note">Vorschau über die kontrollierte Gym-Schnittstelle – hier wird nichts gespeichert. Trainiert wird über „Als Trainingsprogramm“ im Programm.</p>`:''}`}
function rowStat(r){const k={neu:'ok','ergänzt':'ok','bereits vorhanden':'','Dublette':'','Konflikt':'w','Fehler':'w','Nur Bilder':'w'}[r.status];return `<li class="bb-fr"><span><b>${E(r.file)}</b><small>${r.prog?E(r.prog)+(r.variant&&r.variant!=='Standard'?' · '+E(r.variant):'')+(r.weeks&&r.weeks.length?' · W'+[...new Set(r.weeks)].join(', W'):''):''}${r.added?' · '+r.added+' Tage neu':''}${r.same?' · '+r.same+' Tage schon vorhanden':''}${r.conflict&&r.conflict.length?' · abweichend, nicht überschrieben: '+E(r.conflict.join(', ')):''}${r.msg?E(r.msg):''}</small></span><em class="bb-tag ${k||''}">${E(r.status)}</em></li>`}
function importPreview(){const R=ST.imp;if(R.error)return `<header class="bb-ph"><h2>Import nicht möglich</h2></header><p class="bb-err">${ic('warn')}<span>${E(R.error)}</span></p><button type="button" class="bb-btn s" data-bbimpx>Zurück</button>${R.imageOnly?'<button type="button" class="bb-btn" data-bbhelp style="margin-top:8px">Bild-PDFs umwandeln</button><button type="button" class="bb-btn s" data-bbpaste style="margin-top:8px">Text einfügen</button>':''}`;
 const progs=R.ids.map(id=>R.lib.progs.find(p=>p.id===id)).filter(Boolean);const ok=progs.length>0;
 return `<header class="bb-ph"><h2>Import prüfen</h2><p>${R.rows.length} ${R.rows.length===1?'Eintrag':'Einträge'} aus ${R.files} ${R.files===1?'Datei':'Dateien'} · ${progs.length} ${progs.length===1?'Programm':'Programme'} betroffen – bitte vor dem Übernehmen kontrollieren.</p></header>
 <section class="bb-sum"><b>Importstatus je Datei</b><ul class="bb-fl2">${R.rows.map(rowStat).join('')}</ul></section>
 ${progs.map(p=>{const c=cnt(p);return `<section class="bb-sum"><b>${E(p.name)}</b><small class="bb-note">${p.variants.map(v=>E(v.name)).join(' · ')}${p.ocr?' · aus Texterkennung':''}</small>
  <dl class="bb-kv"><div><dt>Wochen</dt><dd>${c.w}</dd></div><div><dt>Tage</dt><dd>${c.d}</dd></div><div><dt>Übungen</dt><dd>${c.x}</dd></div><div><dt>Unvollständig</dt><dd class="${c.f?'w':''}">${c.f}</dd></div></dl>
  ${p.variants.map(v=>{const q=BIB.quality(p,v.name);return `<p class="bb-note"><b>${E(v.name)}:</b> ${q.ok}/${q.days} Tage trainierbar · Qualität ${q.score} %${q.missingWeeks.length?' · fehlende Wochen: '+E(q.missingWeeks.join(', ')):''}${q.missingDays.length?' · fehlende Tage: '+E(q.missingDays.slice(0,12).join(', '))+(q.missingDays.length>12?' …':''):''}</p>`}).join('')}
  ${p.flags?flagsHTML(p.flags):''}${p.unparsed&&p.unparsed.length?`<p class="bb-note">${p.unparsed.length} Zeilen konnten keinem Tag zugeordnet werden – sie bleiben sichtbar unter „nicht zugeordnet“.</p>`:''}
  ${(p.blocks[0]&&p.blocks[0].weeks.slice(0,1).flatMap(W=>W.days.slice(0,1)).map(D=>`<p class="bb-l">Beispiel: Woche ${p.blocks[0].weeks[0].n} · ${E(D.name)}</p>${D.ex.slice(0,3).map(x=>exHTML(x)).join('')}`).join(''))||''}</section>`}).join('')}
 <div class="bb-imp">${ok?'<button type="button" class="bb-btn" data-bbok>In Bibliothek übernehmen</button>':''}<button type="button" class="bb-btn s" data-bbimpx>${ok?'Verwerfen':'Zurück'}</button></div>`}
function pasteHTML(){return `<header class="bb-ph"><h2>Text einfügen</h2><p>Zum Beispiel per „Live Text“ aus Screenshots kopiert oder vom iPhone-Kurzbefehl. Erkannt werden Zeilen wie „Week 4 -- Test Week“, „Day 1 - Monday (W4, INTRO)“, Übungsnamen in GROSSBUCHSTABEN und „3 x 3 at RPE 8“. Mehrere Dateien: Abschnitte mit „=== Datei: Name ===“ trennen.</p></header>
 <label class="bb-l" for="bbname">Programmname</label><input id="bbname" class="bb-in" placeholder="z. B. Candito 3RM-Phase (eigene Notizen)"><label class="bb-l" for="bbtxt">Text</label><textarea id="bbtxt" class="bb-in" rows="12" placeholder="Week 1 -- …&#10;Day 1 - Monday (W1, …)&#10;COMP SQUAT&#10;3 x 3 at RPE 8"></textarea>
 <div class="bb-imp"><button type="button" class="bb-btn" data-bbparse>Auswerten</button><button type="button" class="bb-btn s" data-bbimpx>Abbrechen</button></div>`}
function gymPrev(){const g=ST.gym;return `<header class="bb-ph"><h2>Gym-Vorschau</h2><p>Nur ansehen – nichts wird gespeichert. ${g.ok?'Dieser Tag ist trainierbar.':'Dieser Tag ist gesperrt, bis die markierten Angaben geprüft sind.'}</p></header>
 ${g.issues.length?`<p class="bb-err">${ic('warn')}<span>${g.issues.length} ${g.issues.length===1?'Übung kann':'Übungen können'} nicht ins Gym übernommen werden: ${g.issues.map(i=>E(i.name)+' ('+i.need.join(', ')+')').join('; ')}</span></p>`:''}
 <div class="bb-gym">${g.day.b.map((bl,i)=>`<section class="bb-gx"><b>${E((EX[bl.e]||{n:bl.e}).n)}</b><p>${E(bl.x)}</p>${Array.from({length:bl.s},(_,k)=>`<div class="bb-gr"><span>${k+1}</span><em>× ${E(bl.r)}${bl.rpe!=null?' @ RPE '+String(bl.rpe).replace('.',','):''}</em><i>+</i></div>`).join('')}</section>`).join('')||'<p class="bb-e">Keine übernehmbaren Übungen.</p>'}</div>
 <button type="button" class="bb-btn s" data-bbgymx>Zurück zum Tag</button>`}
function exOpts(sel){const g={sq:'Kniebeuge',bp:'Bankdrücken',dl:'Kreuzheben'};const ks=Object.keys(EX).sort((a,b)=>EX[a].n.localeCompare(EX[b].n,'de'));
 const grp=k=>g[EX[k].g]||'Weitere Übungen';const by={};ks.forEach(k=>{(by[grp(k)]=by[grp(k)]||[]).push(k)});
 return `<option value="">– nicht zugeordnet –</option>`+['Kniebeuge','Bankdrücken','Kreuzheben','Weitere Übungen'].filter(n=>by[n]).map(n=>`<optgroup label="${n}">${by[n].map(k=>`<option value="${E(k)}"${k===sel?' selected':''}>${E(EX[k].n)}</option>`).join('')}</optgroup>`).join('')}
function editHTML(){const p=cur();const blk=blkOf(p);const W=blk.weeks.find(x=>x.n===ST.w);const D=W.days.find(x=>x.n===ST.d);const x=D.ex[ST.edit.i];const ld=x.load?(x.load.text||(x.load.pct!=null?x.load.pct+' %':x.load.kg!=null?x.load.kg+' kg':'')):'';
 return `<header class="bb-ph"><h2>Angaben prüfen</h2><p>${E(x.name)} · Woche ${W.n} · ${E(D.name)}</p></header>
 ${x.raw?`<p class="bb-raw">Gelesen: „${E(x.raw)}“</p>`:''}${flagsHTML(x.flags)}
 <label class="bb-l" for="bbe-ex">Übung im Katalog</label><select id="bbe-ex" class="bb-in">${exOpts(x.eid)}</select>
 <div class="bb-rm"><label class="bb-l">Sätze<input id="bbe-s" class="bb-in" inputmode="numeric" value="${x.sets!=null?E(x.sets):''}"></label><label class="bb-l">Wdh.<input id="bbe-r" class="bb-in" value="${x.reps!=null?E(x.reps):''}" placeholder="z. B. 5, 6-8, AMRAP"></label><label class="bb-l">RPE<input id="bbe-rpe" class="bb-in" inputmode="decimal" value="${x.rpe!=null?E(String(x.rpe).replace('.',',')):x.rpeTxt?E(x.rpeTxt):''}" placeholder="z. B. 7,5 oder 8–8,5"></label></div>
 ${W.days.length>1?`<label class="bb-l" for="bbe-day">Gehört zu Tag</label><select id="bbe-day" class="bb-in">${W.days.map(d=>`<option value="${d.n}"${d.n===D.n?' selected':''}>${E(d.name)}${d.wd?' · '+E(d.wd):''}${d.focus?' · '+E(d.focus):''}</option>`).join('')}</select>`:''}
 <label class="bb-l" for="bbe-l">Lastvorgabe (wie im Original, z. B. „75 % of 1RM“)</label><input id="bbe-l" class="bb-in" value="${E(ld)}">
 <label class="bb-l" for="bbe-n">Hinweis</label><textarea id="bbe-n" class="bb-in" rows="3">${E(x.notes||'')}</textarea>
 <label class="bb-chk"><input type="checkbox" id="bbe-opt" ${x.opt?'checked':''}> Optionale Übung</label>
 <label class="bb-chk"><input type="checkbox" id="bbe-ok" ${x.ok?'checked':''}> Mit dem Original verglichen – Angaben stimmen</label>
 <p class="bb-note">Nur übernehmen, was im Original steht – nichts ergänzen oder schätzen. Erst mit dem Haken „verglichen“ wird ein unsicher gelesener Eintrag trainierbar.</p>
 <div class="bb-imp"><button type="button" class="bb-btn" data-bbesave>Speichern</button><button type="button" class="bb-btn s" data-bbex>Abbrechen</button></div>`}
function helpHTML(){const eng=BIB.ocrEngine();const pwa=typeof PWA!=='undefined'&&PWA;
 return `<header class="bb-ph"><h2>Bild-PDFs umwandeln</h2><p>Screenshots-PDFs (z. B. aus PDF24) enthalten keinen Text. Drei lokale Wege – keine Cloud:</p></header>
 <section class="bb-co"><b>1 · Direkt in der App</b><p>${eng?'Texterkennung ist in diesem Browser verfügbar ('+E(eng.name)+'): Bild-PDFs einfach über „Dateien importieren“ auswählen.':'In diesem Browser ist keine Texterkennung verfügbar. Safari hat sie nur als experimentelle Funktion („Shape Detection API“ unter Einstellungen › Apps › Safari › Erweitert › Feature Flags). Ob sie in der Home-Bildschirm-App greift, hängt von der iOS-Version ab – der Mac-Importer ist der zuverlässige Weg.'}</p></section>
 <section class="bb-co"><b>2 · Mac-Importer (empfohlen, viele PDFs auf einmal)</b><p>Nutzt die Texterkennung von macOS (Vision) direkt auf deinem Mac.</p>
  <p>1. ${pwa?'<a href="./tools/Programmbibliothek-Mac-Importer.zip" download>Mac-Importer laden</a>':'Mac-Importer laden (Datei „Programmbibliothek-Mac-Importer.zip“ aus der App-Installation, Ordner tools)'} und entpacken.<br>2. Alle PDFs in einen Ordner legen.<br>3. „Programmbibliothek-Import.command“ per Rechtsklick › Öffnen starten und den Ordner wählen.<br>4. Die entstandene Datei „Programmbibliothek-Import-….json“ per AirDrop oder iCloud Drive aufs iPhone und hier über „Dateien importieren“ auswählen.</p>
  <p>Gleiche Dateien werden übersprungen, Programme, Varianten, Wochen und Tage zugeordnet, und ein Prüfbericht liegt daneben.</p></section>
 <section class="bb-co"><b>3 · iPhone-Kurzbefehl (ohne Mac)</b><p>Einmal in der App „Kurzbefehle“ anlegen: <br>1. „Im Share-Sheet anzeigen“ für PDFs aktivieren.<br>2. „Wiederholen mit jedem“ Objekt in der Kurzbefehl-Eingabe.<br>3. Darin: Text „=== Datei: [Name] ===“ (Variable „Name“ des Objekts), dann „Bild aus PDF-Seite erstellen“, dann „Wiederholen mit jedem“ Bild › „Text aus Bild extrahieren“.<br>4. Nach den Schleifen: „Text kombinieren“ (neue Zeilen) › „Datei sichern“ als „Programme.txt“ in iCloud Drive.<br>Dann PDFs in „Dateien“ markieren › Teilen › Kurzbefehl, und „Programme.txt“ hier importieren.</p></section>
 <button type="button" class="bb-btn s" data-bbhelpx>Zurück</button>`}
function render(){let el=document.getElementById('bibv');if(!el){el=document.createElement('div');el.id='bibv';el.className='bibv';document.body.appendChild(el)}
 el.innerHTML=`<div role="dialog" aria-modal="true" aria-label="Programmbibliothek"><div class="bb-top"><button type="button" class="bb-x" data-bbback aria-label="Zurück">${ic('back')}</button><div><small>Einstellungen</small><h1>Programmbibliothek</h1></div></div><div class="bb-sc">${body()}</div></div>`;el.hidden=false;document.body.classList.add('bibopen')}
function open(){ST=ST0();render()}
function close(){const el=document.getElementById('bibv');if(el)el.hidden=true;document.body.classList.remove('bibopen')}
function go(f){f();render();const s=document.querySelector('#bibv .bb-sc');if(s)s.scrollTop=0}
window.bibOpen=open;window.bibClose=close;BIB.ui={open,close,state:()=>ST};
const prog=t=>{ST.busy=t;const el=document.querySelector('#bibv .bb-prog');if(el)el.textContent=t;else render()};
async function runImport(files){ST.imp=null;ST.paste=false;ST.help=false;prog('Dateien werden gelesen …');let R;try{R=await BIB.importFiles(files,prog)}catch(e){R={error:String(e&&e.message||e)}}ST.busy=null;
 if(!R.error){R.files=files.length;if(!R.ids.length){const bad=R.rows.filter(r=>/Fehler|Nur Bilder/.test(r.status));if(R.rows.length===1&&bad.length===1)R={error:bad[0].msg,imageOnly:bad[0].status==='Nur Bilder'};}}
 go(()=>ST.imp=R)}
BIB.ui.runImport=runImport;
function commitImport(){const R=ST.imp;const ok=BIB.save(R.lib);BIB.register();const id=R.ids[0];go(()=>{ST.imp=null;ST.p=ok&&R.ids.length===1?id:null;ST.v=0;ST.b=0;ST.w=null;ST.d=null});if(typeof toast==='function')toast(ok?`${R.ids.length} ${R.ids.length===1?'Programm':'Programme'} in der Bibliothek gespeichert`:'Speichern fehlgeschlagen – Speicher voll?')}
function saveEdit(){const L=BIB.load();const p=L.progs.find(x=>x.id===ST.p);if(!p)return;const blk=p.blocks[ST.b]||p.blocks[0];const W=blk.weeks.find(x=>x.n===ST.w);const D=W.days.find(x=>x.n===ST.d);const x=D.ex[ST.edit.i];
 if(dayLogged(p,blk.name,W.n,D.n)){toast('Für diesen Tag gibt es schon Trainingseinträge – Vorgaben bleiben unverändert');return}
 const v=id=>document.getElementById(id);const n=BIBCORE.num;const s=n(v('bbe-s').value),rp=n(v('bbe-rpe').value),r=v('bbe-r').value.trim(),lt=v('bbe-l').value.trim();
 x.eid=v('bbe-ex').value||null;x.sets=s!=null&&s>0?Math.round(s):null;x.reps=r?(/amrap|max/i.test(r)?'AMRAP':r.replace(/\s+/g,'').replace('-','–')):null;x.amrap=/amrap/i.test(r);
 const rv=v('bbe-rpe').value.trim();const rr=rv.match(/^(\d{1,2}(?:[.,]\d)?)\s*[-–]\s*(\d{1,2}(?:[.,]\d)?)$/);if(rr){x.rpe=null;x.rpeTxt=rr[1].replace('.',',')+'–'+rr[2].replace('.',',')}else{x.rpe=rp!=null&&rp>=1&&rp<=10?rp:null;delete x.rpeTxt}if(rv)delete x.rpeBad;
 if(lt){const R=BIBCORE.parseRx(lt);x.load=R.load&&R.load.pct!=null?{pct:R.load.pct,text:lt}:R.load&&R.load.kg!=null?{kg:R.load.kg,text:lt}:{text:lt}}else x.load=null;
 x.notes=v('bbe-n').value.trim();x.opt=v('bbe-opt').checked;x.ok=v('bbe-ok').checked;if(x.ok){delete x.amb;delete x.alt;x.cut=false}x.flags=BIBCORE.flagEx(x,p.ocr?'ocr':'json');
 const nd=v('bbe-day')?+v('bbe-day').value:D.n;let moved='';if(nd!==D.n){const T=W.days.find(d=>d.n===nd);if(T&&!dayLogged(p,blk.name,W.n,nd)){D.ex.splice(ST.edit.i,1);T.ex.push(x);moved=' · verschoben zu '+T.name;ST.d=nd}else if(T){toast('Ziel-Tag hat schon Trainingseinträge – nicht verschoben');return}}
 BIBCORE.finish(p);BIB.save(L);BIB.register();go(()=>ST.edit=null);toast('Angaben gespeichert'+moved)}
function confirmDay(){const L=BIB.load();const p=L.progs.find(x=>x.id===ST.p);if(!p)return;const blk=p.blocks[ST.b]||p.blocks[0];const W=blk.weeks.find(x=>x.n===ST.w);const D=W.days.find(x=>x.n===ST.d);
 if(dayLogged(p,blk.name,W.n,D.n))return;let n=0;D.ex.forEach(x=>{if((x.flags||[]).some(f=>/unsicher|gekürzt/.test(f))&&!x.rpeBad&&!x.alt){x.ok=true;delete x.amb;x.cut=false;x.flags=BIBCORE.flagEx(x,p.ocr?'ocr':'json');n++}});BIBCORE.finish(p);BIB.save(L);BIB.register();render();toast(n?`${n} ${n===1?'Angabe':'Angaben'} als geprüft markiert`:'Nichts zu bestätigen')}
document.addEventListener('click',e=>{const t=e.target.closest('[data-tdk="bib"],[data-bibopen]');if(t){e.preventDefault();e.stopPropagation();open()}},true);
document.addEventListener('click',e=>{const el=document.getElementById('bibv');if(!el||el.hidden||!el.contains(e.target))return;const t=e.target.closest('button');if(!t||ST.busy)return;const d=t.dataset;
 if(d.bbback!=null){if(ST.help){go(()=>ST.help=false);return}if(ST.edit){go(()=>ST.edit=null);return}if(ST.gym){go(()=>ST.gym=null);return}if(ST.imp||ST.paste){go(()=>{ST.imp=null;ST.paste=false});return}if(ST.d!=null)go(()=>ST.d=null);else if(ST.w!=null)go(()=>ST.w=null);else if(ST.p)go(()=>ST.p=null);else close();return}
 if(d.bbp)go(()=>{ST.p=d.bbp;ST.v=0;ST.b=0;ST.w=null;ST.d=null;ST.del=null;const p=cur();if(p&&p.src!=='builtin'){const la=libActive();const vi=la?p.variants.findIndex(v=>BIB.cidOf(p,v)===la):-1;if(vi>0)ST.v=vi;const bl=BIBCORE.blocksOf(p,p.variants[ST.v].name)[0];if(bl)ST.b=p.blocks.indexOf(bl)}});
 else if(d.bbv!=null){ST.v=+d.bbv;const p=cur();if(p&&p.blocks.length>1){const vn=p.variants[ST.v].name;const bi=p.blocks.findIndex(b=>b.variant===vn);if(bi>=0)ST.b=bi}render()}
 else if(d.bbb!=null){ST.b=+d.bbb;render()}
 else if(d.bbw)go(()=>ST.w=+d.bbw);else if(d.bbd)go(()=>ST.d=+d.bbd);
 else if(d.bbcr){go(()=>{if(d.bbcr==='root'){ST.p=null;ST.v=0;ST.b=0;ST.w=null;ST.d=null}else if(d.bbcr==='p'){ST.w=null;ST.d=null}else if(d.bbcr==='w')ST.d=null})}
 else if(d.bbpaste!=null)go(()=>{ST.imp=null;ST.help=false;ST.paste=true});
 else if(d.bbhelp!=null)go(()=>{ST.imp=null;ST.help=true});else if(d.bbhelpx!=null)go(()=>ST.help=false);
 else if(d.bbparse!=null){const tx=document.getElementById('bbtxt').value,nm=document.getElementById('bbname').value.trim();const parts=BIBCORE.splitMulti(tx);const multi=parts.length>1||parts.some(x=>x.file);
  const progs=parts.map((x,i)=>BIB.parseText(x.text,{name:nm?(multi&&parts.length>1?nm+' '+(i+1):nm):undefined,file:x.file||'',fallback:x.file?BIBCORE.baseName(x.file):undefined,fmt:'text',src:'ocr'}));
  const lib=JSON.parse(JSON.stringify(BIB.load()));const rows=[];progs.forEach((p,i)=>BIB.merge(lib,[p],parts[i].file||'Eingefügter Text').forEach(r=>rows.push(r)));
  go(()=>{ST.paste=false;ST.imp={rows,lib,ids:[...new Set(rows.map(r=>r.target).filter(Boolean))],files:parts.length}})}
 else if(d.bbimpx!=null)go(()=>{ST.imp=null;ST.paste=false});
 else if(d.bbok!=null)commitImport();
 else if(d.bbdel){const p=BIB.load().progs.find(x=>x.id===d.bbdel);if(p&&p.variants.some(v=>BIB.hasLogsCid(BIB.cidOf(p,v))||libActive()===BIB.cidOf(p,v))){toast('Löschen gesperrt – zu diesem Programm gibt es Trainingseinträge');return}
  if(ST.del!==d.bbdel){ST.del=d.bbdel;render();return}const L=BIB.load();L.progs=L.progs.filter(p=>p.id!==d.bbdel);BIB.save(L);go(()=>{ST.del=null;ST.p=null});if(typeof toast==='function')toast('Aus der Bibliothek gelöscht')}
 else if(d.bbexp){const p=BIB.load().progs.find(x=>x.id===d.bbexp);if(!p)return;const body=JSON.stringify({format:'candito-bib',v:1,programs:[p]},null,1);const fn=(p.name||'programm').replace(/[^\wäöüÄÖÜß -]+/g,'')+'.json';
  (async()=>{try{const dl=await window.claude?.use?.('downloads');if(dl){await dl.save({filename:fn,data:body});return}}catch(e){}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([body],{type:'application/json'}));a.download=fn;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)})()}
 else if(d.bbgym!=null){const p=cur();const W=blkOf(p).weeks.find(x=>x.n===ST.w);const D=W.days.find(x=>x.n===ST.d);go(()=>ST.gym=BIB.toGymDay(D))}
 else if(d.bbgymx!=null)go(()=>ST.gym=null);
 else if(d.bbren){const nm=(document.getElementById('bbrn')||{}).value;if(!nm||!nm.trim())return;const L=BIB.load();const p=L.progs.find(x=>x.id===d.bbren);if(!p)return;p.name=nm.trim().slice(0,80);BIB.save(L);BIB.register();render();toast('Name gespeichert')}
 else if(d.bbcday!=null)confirmDay();else if(d.bbedit!=null)go(()=>ST.edit={i:+d.bbedit});else if(d.bbex!=null)go(()=>ST.edit=null);else if(d.bbesave!=null)saveEdit();
 else if(d.bbstartgo){const v=(document.getElementById('bbstart')||{}).value;BIB.begin(d.bbstartgo,v||undefined)}
 else if(d.bbgo){close();if(PROG!==d.bbgo)switchProg(d.bbgo);S.ui.tab='train';pickToday();render();window.scrollTo({top:0})}
 else if(d.bbend!=null){close();BIB.end()}});
document.addEventListener('change',async e=>{const t=e.target;
 if(t.dataset&&t.dataset.bbrm){const [cid,r]=t.dataset.bbrm.split('|');const M=S.meta.lib||(S.meta.lib={act:null,st:{},rm:{}});if(!M.rm)M.rm={};if(!M.rm[cid])M.rm[cid]={};const v=pnum(t.value);if(v)M.rm[cid][r]=v;else delete M.rm[cid][r];saveMeta();try{SG.clear()}catch(x){}toast('1RM gespeichert');return}
 if(t.id!=='bbfile')return;const fs=t.files?[...t.files]:[];t.value='';if(!fs.length)return;runImport(fs)});
})();
