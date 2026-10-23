// Programmbibliothek – vollständige Integration: Gym-Übernahme (trainierbare Programme, gesperrte Tage, 1RM-Bezug, Warm-up,
// Pausentimer, Verlauf, Zuordnung der Trainingsdaten), Programmwechsel ohne Überschreiben, Korrektur unsicherer Angaben,
// Mehrfachimport (Zuordnung, Dubletten, Lücken, Qualität), Bild-PDF über eine Texterkennung (hier Test-Erkennung),
// Mac-Importer (gemeinsamer Kern), Sicherung inkl. Bibliothek und Wiederherstellung in einer frischen Testkopie.
// Alle Testdaten sind frei erfunden (tests/fixtures/bib) – kein Candito- oder Superset-Inhalt.
const fs=require('fs'),path=require('path');const {seed}=require('../lib');
const CAP=()=>{window.__dl=null;window.claude=window.claude||{};const u=window.claude.use;window.claude.use=async(n)=>n==='downloads'?{save:async x=>{window.__dl=x}}:u&&u.call(window.claude,n)};
module.exports={name:'Programmbibliothek – Gym-Übernahme, Programmwechsel, Mehrfachimport, Texterkennung, Sicherung',async run({page,t,root}){
  const FX=path.join(root,'tests','fixtures','bib');const fx=n=>fs.readFileSync(path.join(FX,n));const file=(n,type)=>({name:n,mimeType:type,buffer:fx(n)});
  const waitImp=p=>p.waitForFunction(()=>{const h=document.querySelector('#bibv .bb-ph h2');return h&&h.textContent!=='Import läuft'},null,{timeout:30000});
  const p=await page({width:390,height:844});await seed(p,4,{pids:['intro'],kg:100});
  // Referenzstand: Candito-Programme, Berechnungen und vorhandene Trainingsdaten
  const REF=()=>JSON.stringify({ord:ORD(),logs:Object.keys(S.logs).filter(k=>!/^lb/.test(k)).sort().map(k=>[k,JSON.stringify(S.logs[k].b)]),
    calc:['intro','p8','p10','p3','p10w'].map(id=>withProg(id,()=>{const o=[];for(let w=0;w<Math.min(2,NW());w++)for(let d=0;d<ND();d++)P[w][d].b.forEach((bl,b)=>{const v=sugg(w,d,b,0);o.push([w,d,b,v&&v.kg,v&&v.why])});return o}))});
  const ref0=await p.evaluate(`(${REF})()`);
  // 1) Import über die echte Dateiauswahl, Qualität und Lücken
  await p.evaluate(()=>{bibOpen()});await p.setInputFiles('#bbfile',[file('gym-programm.json','application/json')]);await waitImp(p);
  await p.evaluate(()=>document.querySelector('#bibv [data-bbok]').click());
  const q=await p.evaluate(()=>{const x=BIB.load().progs.find(p=>p.name==='Testprogramm Gym');const Q=BIB.quality(x);return {id:x.id,ok:Q.ok,days:Q.days,locked:Q.locked,mw:Q.missingWeeks,ui:!!document.querySelector('#bibv .bb-q')&&/Fehlende Wochen: W2/.test(document.querySelector('#bibv .bb-q').textContent),start:!!document.querySelector('#bibv [data-bbstartgo]')}});
  t.eq([q.ok,q.days,q.locked,q.mw,q.ui,q.start],[3,4,1,['W2'],true,true],'Import: 3 von 4 Tagen trainierbar, 1 gesperrt, fehlende Woche W2 angezeigt, Startknopf vorhanden');
  // 2) 1RM nur für dieses Programm, dann starten
  await p.fill('#bibv [data-bbrm$="|BP"]','100');await p.evaluate(()=>{const i=document.querySelector('#bibv [data-bbrm$="|BP"]');i.dispatchEvent(new Event('change',{bubbles:true}))});
  await p.evaluate(()=>document.querySelector('#bibv [data-bbstartgo]').click());await p.waitForTimeout(300);
  const st=await p.evaluate(()=>{const g=PROGS[PROG];return {lib:!!g.lib,act:S.meta.lib.act===PROG,tab:S.ui.tab,head:!!document.querySelector(`#progsw [data-prog="${PROG}"]`),closed:document.getElementById('bibv').hidden,sq:S.meta.sqActive||null,
    nw:NW(),nd:ND(),days:DAYS.map(x=>[x.wd,x.off]),mon:dayDate(0,0).getDay(),b:P[0][0].b.map(b=>[b.e,b.s,b.r,b.rpe??null]),pct:[P[0][0].b[1].pct,P[0][0].b[1].ref],x:P[0][0].b[0].x,lock:[!!P[0][1].lock,P[1][0].lock,P[1][1].lock],am:P[2][0].b[0].r,info:(INFO['0-0']||[]).join('|')}});
  t.ok(st.lib&&st.act&&st.tab==='train'&&st.head&&st.closed&&!st.sq,'Start: Bibliotheksprogramm aktiv, Training geöffnet, in der Programmleiste auswählbar '+JSON.stringify([st.lib,st.act,st.tab,st.head,st.closed,st.sq]));
  t.eq([st.nw,st.nd,st.days,st.mon],[3,2,[['Mo',0],['Do',3]],1],'Wochen 1–3 (W2 fehlt), 2 Tage Mo/Do aus den Wochentagen, Start an einem Montag');
  t.eq([st.b,st.pct],[[['csq',3,'5',7],['pbb',3,'6',8]],[75,'BP']],'Übungen, Sätze, Wiederholungen, RPE und %-Vorgabe (75 % vom 1RM) unverändert übernommen');
  t.ok(/im letzten Satz/.test(st.x)&&st.am==='AMRAP'&&/Testhinweis A/.test(st.info)&&/Testnotiz Kniebeuge/.test(st.info),'RPE-Bezug („im letzten Satz“), AMRAP und Coaching-Hinweise erhalten '+JSON.stringify([st.x,st.am,st.info]));
  t.eq(st.lock,[true,'Woche fehlt im Import','Woche fehlt im Import'],'Unvollständiger Tag und fehlende Woche sind gesperrt (keine trainierbare Einheit)');
  // 3) Vorgabe aus dem 1RM, RPE leer
  const sg=await p.evaluate(()=>{const v=sugg(0,0,1,0);return {kg:v.kg,why:v.why,rpe:setOf(0,0,1,0).rpe??null}});
  t.ok(sg.kg===75&&/75 %/.test(sg.why)&&/Bank-1RM/.test(sg.why)&&sg.rpe==null,`Last aus Bibliotheks-1RM: ${sg.kg} kg (${sg.why}); RPE nicht vorbelegt`);
  // 4) Gym-Modus: Satz buchen, Warm-up, Timer, Verlauf
  await p.evaluate(()=>{S.ui.w=0;S.ui.d=0;const L=log(0,0,true);L.b[0][0].kg=100;L.b[0][0].r=5;saveLog(key(0,0));render();openGym();G.b=0;G.i=0;G.wu=false;renderGym()});await p.waitForTimeout(300);
  await p.evaluate(()=>{const b=document.querySelector('#gym [data-g="log"]');b._ok=true;b.click()});await p.waitForTimeout(300);
  const gl=await p.evaluate(()=>{const k=PROGS[PROG].pre+'w1d1';const L=S.logs[k];return {k,ok:!!(L&&L.b[0][0].ok),kg:L&&L.b[0][0].kg,rpe:L&&L.b[0][0].rpe,intro:Object.keys(S.logs).filter(x=>/^w\d/.test(x)).length}});
  t.ok(gl.ok&&+gl.kg===100&&gl.rpe==null&&gl.k.startsWith('lb'),`Satz im Gym gebucht unter eigenem Schlüssel ${gl.k}, RPE leer`);
  try{await p.evaluate(()=>{stopRest();closeSheet()})}catch(e){}
  await p.evaluate(()=>{G.wu=true;renderGym()});await p.waitForTimeout(150);
  t.ok(await p.evaluate(()=>document.querySelectorAll('#gym [data-gwu]').length>=2&&/Empfehlung/.test(document.querySelector('#gym').textContent)),'Warm-up-Rechner funktioniert (als Empfehlung)');
  await p.evaluate(()=>{G.wu=false;renderGym();startRest(120,{w:0,d:0,b:0,i:1})});t.ok(await p.evaluate(()=>T.on&&T.total===120),'Pausentimer läuft');await p.evaluate(()=>{stopRest();try{closeSheet()}catch(e){}});
  const hi=await p.evaluate(()=>{closeGym(true);S.ui.w=2;S.ui.d=0;render();openGym();G.b=0;G.i=0;const H=exHistory('csq');G.hi=true;renderGym();const r={n:H.filter(h=>h.pid===PROG).length,ui:/Verlauf/.test(document.querySelector('#gym').textContent)};G.hi=false;closeGym(true);return r});
  t.ok(hi.n>=1&&hi.ui,'Trainingshistorie zeigt den Satz aus Woche 1 dieses Programms');
  // 5) gesperrter Tag im Gym und im Fortschritt
  const lk=await p.evaluate(()=>{S.ui.w=0;S.ui.d=1;render();openGym();const txt=document.querySelector('#gym').textContent;closeGym(true);const pd=phaseDone(PROG);return {g:/Gesperrt/.test(txt),t:pd.t}});
  t.ok(lk.g&&lk.t===3,`Gesperrter Tag im Gym als „Gesperrt“, Fortschritt zählt nur trainierbare Tage (${lk.t})`);
  // 6) Programmwechsel: nichts überschrieben, Candito-Berechnungen unverändert
  const sw=await p.evaluate(()=>{const cid=PROG;const before=JSON.stringify(S.logs[cid+'-w1d1']);switchProg('intro');const a=PROG;const sq=Object.keys(PROGS).find(id=>isSQ(id));sqBegin(sq);const r1=[S.meta.sqActive===sq,S.meta.lib.act];
    BIB.begin(cid);const r2=[S.meta.sqActive||null,S.meta.lib.act===cid,PROG===cid];return {a,r1,r2,same:JSON.stringify(S.logs[cid+'-w1d1'])===before,cid}});
  t.ok(sw.a==='intro'&&sw.r1[0]&&sw.r1[1]===null&&sw.r2[0]===null&&sw.r2[1]&&sw.r2[2]&&sw.same,'Wechsel Jahresplan ↔ Side Quest ↔ Bibliothek: genau ein Zusatzprogramm aktiv, Einträge bleiben erhalten');
  const ref1=await p.evaluate(`(${REF})()`);
  t.ok(ref1===ref0,'Candito-Programme, -Berechnungen und bestehende Trainingsdaten unverändert');
  // 7) Korrektur in der Bibliothek: unvollständiger Tag wird erst nach Prüfung trainierbar; trainierte Tage sind schreibgeschützt
  await p.evaluate(id=>{bibOpen();document.querySelector(`#bibv [data-bbp="${id}"]`).click();document.querySelector('#bibv [data-bbw="1"]').click();document.querySelector('#bibv [data-bbd="2"]').click()},q.id);
  const ed0=await p.evaluate(()=>({lock:!!document.querySelector('#bibv .bb-err'),btn:document.querySelectorAll('#bibv [data-bbedit]').length}));
  await p.evaluate(()=>document.querySelector('#bibv [data-bbedit="1"]').click());
  await p.selectOption('#bbe-ex','cdl');await p.fill('#bbe-s','3');await p.check('#bbe-ok');await p.evaluate(()=>document.querySelector('#bibv [data-bbesave]').click());await p.waitForTimeout(150);
  const ed1=await p.evaluate(cid=>({ok:!!document.querySelector('#bibv .bb-okl'),b:PROGS[cid].P[0][1].b.length,lock:!!PROGS[cid].P[0][1].lock}),sw.cid);
  t.ok(ed0.lock&&ed0.btn===2&&ed1.ok&&ed1.b===2&&!ed1.lock,'Unvollständiger Tag: nach Zuordnung und Prüfung trainierbar');
  const ro=await p.evaluate(()=>{document.querySelector('#bibv [data-bbcr="w"]').click();document.querySelector('#bibv [data-bbd="1"]').click();return {edit:document.querySelectorAll('#bibv [data-bbedit]').length,note:/schreibgeschützt/.test(document.querySelector('#bibv').textContent)}});
  t.ok(ro.edit===0&&ro.note,'Tag mit Trainingseinträgen: Vorgaben schreibgeschützt');
  const dl=await p.evaluate(()=>{document.querySelector('#bibv [data-bbcr="p"]').click();return {del:!!document.querySelector('#bibv [data-bbdel]'),lock:/Löschen gesperrt/.test(document.querySelector('#bibv').textContent)}});
  t.ok(!dl.del&&dl.lock,'Löschen gesperrt, solange Trainingsdaten bestehen');
  // 8) Mehrfachimport: Zuordnung, Dublette, fehlende Woche, Kurzbefehl-Text, Bild-PDF ohne Erkennung
  await p.evaluate(()=>document.querySelector('#bibv [data-bbcr="root"]').click());
  await p.setInputFiles('#bbfile',[file('multi-woche-1.txt','text/plain'),file('multi-woche-3.txt','text/plain'),file('multi-woche-1-kopie.txt','text/plain'),file('kurzbefehl.txt','text/plain'),file('bild-programm.pdf','application/pdf'),file('test-programm.csv','text/csv')]);await waitImp(p);
  const mi=await p.evaluate(()=>{const R=BIB.ui.state().imp;const st=R.rows.map(r=>r.file+':'+r.status);const M=R.lib.progs.find(x=>x.name==='TESTPROGRAMM M');const K=R.lib.progs.find(x=>x.name==='TESTPROGRAMM K');const q=M&&BIB.quality(M,'V1');
    return {st,m:M&&[M.variants.map(v=>v.name),M.blocks[0].weeks.map(w=>w.n),q.missingWeeks],k:K&&K.blocks[0].weeks.map(w=>w.n),ui:document.querySelectorAll('#bibv .bb-fr').length,qual:/Tage trainierbar · Qualität/.test(document.querySelector('#bibv').textContent)}});
  t.eq(mi.st,['multi-woche-1.txt:neu','multi-woche-3.txt:ergänzt','multi-woche-1-kopie.txt:Dublette','kurzbefehl.txt › multi-woche-1.pdf:neu','kurzbefehl.txt › multi-woche-2.pdf:ergänzt','bild-programm.pdf:Nur Bilder','test-programm.csv:neu'],'Mehrfachimport: Status je Datei (neu, ergänzt, Dublette, Nur Bilder)');
  t.eq([mi.m,mi.k,mi.ui,mi.qual],[[['V1'],[1,3],['W2']],[1,2],7,true],'Wochen-Dateien einem Programm/einer Variante zugeordnet, fehlende Woche W2 erkannt, Qualität angezeigt');
  await p.evaluate(()=>document.querySelector('#bibv [data-bbok]').click());
  const mi2=await p.evaluate(()=>{const L=BIB.load();return {n:L.progs.length,files:(L.progs.find(x=>x.name==='TESTPROGRAMM M').files||[]).length}});
  // erneuter Import derselben Datei → Dublette, nichts doppelt
  await p.setInputFiles('#bbfile',[file('multi-woche-3.txt','text/plain')]);await waitImp(p);
  const mi3=await p.evaluate(()=>{const R=BIB.ui.state().imp;return {err:(document.querySelector('#bibv .bb-ph h2')||{}).textContent,rows:R.rows&&R.rows.map(r=>r.status)}});
  t.ok(mi2.n===4&&mi2.files===2&&mi3.rows&&mi3.rows[0]==='Dublette','Übernommen: 4 Programme; erneuter Import derselben Datei als Dublette erkannt');
  await p.evaluate(()=>document.querySelector('#bibv [data-bbimpx]').click());
  // 9) Bild-PDF mit (Test-)Texterkennung: Seitenbilder werden korrekt entpackt (Flate+Prädiktor, JPEG), Text strukturiert
  await p.evaluate(()=>{window.__ocrSeen=[];window.__cfOcrEngine={name:'Test-Erkennung',detect:async(bm,i)=>{const c=document.createElement('canvas');c.width=bm.width;c.height=bm.height;const x=c.getContext('2d');x.drawImage(bm,0,0);
    const px=(a,b)=>[...x.getImageData(a,b,1,1).data].slice(0,3);window.__ocrSeen.push({w:bm.width,h:bm.height,dark:i===0?px(100,110):px(30,30),light:i===0?px(10,10):px(200,200),red:i===0?px(320,520):null});
    const L=i===0?['Day 1 - Monday (W1, TESTPROGRAMM BILD)','Legs','COMP SQUAT','3 x 5 at RPE 7.5']:['Day 2 - Thursday (W1, TESTPROGRAMM BILD)','Chest','PAUSED BARBELL BENCH PRESS','4 x 6 at RPE 8'];
    return L.map((t,k)=>({rawValue:t,boundingBox:{x:10,y:40*(k+1),width:300,height:20}})).reverse()}}});
  await p.setInputFiles('#bbfile',[file('bild-programm.pdf','application/pdf')]);await waitImp(p);
  const oc=await p.evaluate(()=>{const R=BIB.ui.state().imp;const P0=R.lib.progs.find(x=>x.name==='TESTPROGRAMM BILD');const D=P0&&P0.blocks[0].weeks[0].days;return {seen:window.__ocrSeen,d:D&&D.map(d=>[d.n,d.focus,d.ex.map(x=>[x.eid,x.sets,x.reps,x.rpe])]),ocr:P0&&P0.ocr}});
  const s0=oc.seen[0]||{},s1=oc.seen[1]||{};const dk=a=>a&&a.every(v=>v<40),lt=a=>a&&a.every(v=>v>180);
  t.ok(oc.seen.length===2&&s0.w===400&&s0.h===600&&dk(s0.dark)&&lt(s0.light)&&s0.red&&s0.red[0]>200&&s0.red[1]<40&&dk(s1.dark),'Bild-PDF: beide Seitenbilder (Flate mit PNG-Prädiktor, JPEG) pixelgenau entpackt');
  t.eq([oc.d,oc.ocr],[[[1,'Legs',[['csq',3,'5',7.5]]],[2,'Chest',[['pbb',4,'6',8]]]],true],'Erkannter Text in Lesereihenfolge geordnet und strukturiert (als Texterkennung markiert)');
  await p.evaluate(()=>{delete window.__cfOcrEngine;document.querySelector('#bibv [data-bbimpx]').click()});
  // 10) Mac-Importer: gleicher Kern, Dubletten, JSON kompatibel
  const core=require(path.join(root,'tools','mac-importer','bib-core.js'));const {pipeline}=require(path.join(root,'tools','mac-importer','importer.js'));
  const pg=fx('test-programm.txt').toString().split(/\n(?=Day 2|Week 2)/);
  const MR=pipeline([{name:'a.pdf',sha:'aa',pages:pg},{name:'a-kopie.pdf',sha:'aa',pages:[]},{name:'b.pdf',sha:'bb',pages:['Day 1 - Monday (W3, TESTPROGRAMM A)','COMP SQUAT','2 x 2 at RPE 8']}],core);
  t.ok(MR.rows.map(r=>r.status).join()==='neu,Dublette,ergänzt'&&MR.json.programs.length===1&&/fehlende Wochen: W2/.test(MR.report)===false&&/W3/.test(MR.report),'Mac-Importer: Zuordnung, Dublette und Bericht');
  await p.setInputFiles('#bbfile',[{name:'Programmbibliothek-Import-test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(MR.json))}]);await waitImp(p);
  const mj=await p.evaluate(()=>{const R=BIB.ui.state().imp;const A=R.lib.progs.find(x=>x.name==='TESTPROGRAMM A');return A&&{w:A.blocks[0].weeks.map(w=>w.n),ocr:A.ocr,eid:A.blocks[0].weeks[0].days[0].ex[0].eid,files:A.files.map(f=>f.name)}});
  t.eq(mj,{w:[1,2,3],ocr:true,eid:'csq',files:['a.pdf','b.pdf']},'Mac-Importer-JSON in der App gelesen, Übungen dem Katalog zugeordnet, Quelle vermerkt');
  await p.evaluate(()=>{document.querySelector('#bibv [data-bbimpx]').click();bibClose()});
  // 11) Sicherung enthält Bibliothek + Zuordnung; Wiederherstellung in frischer Kopie
  await p.evaluate(()=>{S.meta.inc=1.25;saveMeta()});await p.evaluate(`(${CAP})()`);
  await p.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'backup'};render()});await p.click('[data-act="bkdl"]');await p.waitForTimeout(300);
  const bk=await p.evaluate(()=>window.__dl);const J=JSON.parse(bk.data);
  t.ok(J.bib&&J.bib.progs.length===4&&J.meta.lib&&J.meta.lib.st[sw.cid]&&J.logs[sw.cid+'-w1d1'],'Sicherungsdatei enthält Bibliothek, Programmzuordnung und Trainingsdaten');
  const auto=await p.evaluate(async()=>{writeBackup();await new Promise(r=>setTimeout(r,400));const s=await db.collection('backup').get();const d=s.docs.map(x=>x.data()).pop();const m=await db.doc('bib/lib').get();return {bib:!!(d&&d.bib&&d.bib.progs.length===4),mirror:!!(m.exists&&m.data().data.progs.length===4)}});
  t.ok(auto.bib&&auto.mirror,'Automatische Sicherung und Gerätespiegel (IndexedDB) enthalten die Bibliothek');
  const b=await page({width:390,height:844});
  t.eq(await b.evaluate(()=>[BIB.load().progs.length,totalOk()]),[0,0],'Testkopie startet leer');
  await b.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'backup'};render()});
  await b.setInputFiles('#bkfile',{name:bk.filename,mimeType:'application/json',buffer:Buffer.from(bk.data)});await b.waitForTimeout(800);
  const rs=await b.evaluate(cid=>{const g=PROGS[cid];return {n:BIB.load().progs.length,reg:!!(g&&g.lib),act:S.meta.lib&&S.meta.lib.act,inc:S.meta.inc,set:withProg(cid,()=>{const L=log(0,0);return L&&L.b[0][0].ok&&+L.b[0][0].kg}),day:withProg(cid,()=>P[0][1].b.length)}},sw.cid);
  t.eq(rs,{n:4,reg:true,act:sw.cid,inc:1.25,set:100,day:2},'Wiederhergestellt: alle Programme, Einstellungen, aktives Programm, Satz und Korrektur');
  await b.reload();await b.waitForTimeout(2600);
  const rs2=await b.evaluate(cid=>{switchProg(cid);S.ui.w=0;S.ui.d=0;render();openGym();const ok=!!document.querySelector('#gym');const v=sugg(0,0,1,0);closeGym(true);S.ui.w=2;const H=exHistory('csq').filter(h=>h.pid===cid).length;return {prog:PROG===cid,ok,kg:v.kg,H}},sw.cid);
  t.ok(rs2.prog&&rs2.ok&&rs2.kg===75&&rs2.H>=1,'Nach Neuladen: Programm trainierbar, 1RM-Vorgabe und Verlauf wieder da '+JSON.stringify(rs2));
  await b.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={setup:'backup'};render()});
  await b.setInputFiles('#bkfile',{name:bk.filename,mimeType:'application/json',buffer:Buffer.from(bk.data)});await b.waitForTimeout(800);
  t.eq(await b.evaluate(()=>BIB.load().progs.length),4,'Erneutes Einspielen erzeugt keine doppelten Programme');
  // 12) Darstellung bei 320 px: keine horizontale Überbreite in den neuen Ansichten
  const c=await page({width:320,height:700});
  await c.evaluate(t=>{const L={v:1,progs:BIB.parseJSON(t).progs};localStorage.setItem('cf-bib',JSON.stringify(L))},fx('gym-programm.json').toString());
  const ov=await c.evaluate(()=>{bibOpen();const sc=()=>document.querySelector('#bibv .bb-sc');const r=[];const chk=n=>r.push([n,sc().scrollWidth<=innerWidth+1]);chk('root');
    document.querySelector('#bibv [data-bbhelp]').click();chk('hilfe');document.querySelector('#bibv [data-bbhelpx]').click();
    document.querySelector('#bibv [data-bbp]:not([data-bbp^="bi-"])').click();chk('programm');document.querySelector('#bibv [data-bbw="1"]').click();document.querySelector('#bibv [data-bbd="2"]').click();chk('tag');
    document.querySelector('#bibv [data-bbedit="1"]').click();chk('korrektur');return r.filter(x=>!x[1]).map(x=>x[0])});
  t.eq(ov,[],'320 px: Startseite, Hilfe, Programm, Tag und Korrektur ohne Überbreite');
  t.eq([...p.errors,...b.errors,...c.errors],[],'Keine Skriptfehler');
}};
