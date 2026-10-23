// Programmbibliothek – Erkennung von Superset-Screenshots (Texterkennung): Tagesübersicht + Detailseiten, gescrollte Übersicht ohne Kopf,
// gekürzte Zeilen, Bedingungen („Only do if …“), Sätze bis zum Versagen, zwei Lesungen (unlesbares RPE aus der Übersicht bestätigt),
// ODER-Optionen gesperrt, Übungszuordnung ohne Varianten zu vermischen, Abgleich mit dem eingebauten Candito-Programm (bestätigen/verschieben).
// Testtexte frei erfunden; der Abgleichtest baut seinen Text zur Laufzeit aus dem eingebauten Plan (nichts davon liegt als Datei vor).
module.exports={name:'Programmbibliothek – Erkennung aus Screenshots, Zuordnung, Abgleich mit eingebautem Programm',async run({page,t}){
  const p=await page({width:390,height:844});
  const pages=[
   ['09:41','Day 1 - Monday (W1, TESTPROGRAMM S, V1)','W Legs','Description','Testnotiz fuer den Tag.','Close description','Exercises','Comp Squat','3 x 5 at RPE 7.0 on the last set w/ low...','Paused Deadlift','2 x 4 at RPE 6.5 on average w/...'],
   ['oll 5G','Leg Extension','(Optional) 3 x 12 at RPE 7.0 on each s...','Close Grip Bench Press --- Only Do if You\'re a Moderate Grip...','3 x 8 at RPE 6.0 on the first set w/...'],
   ['09:42','COMP SQUAT x','3 x 5 at RPE 7.0 on the last set w/ low','hype. =)'],
   ['09:42','CLOSE GRIP BENCH PRESS --- x','ONLY DO IF YOU\'RE A MODERATE','GRIP BENCHER','3 x 8 at RPE 6.0 on the first set w/','moderate hype.'],
   ['09:43','PAUSED DEADLIFT x','2 x 4 at RPE 65 on average w/ low hype.'],
   ['09:44','Day 2 - Thursday (W1, TESTPROGRAMM S, V1)','W Chest','Exercises','Paused Barbell Bench Press','1x 3 at RPE 8.0 w/ high hype.','Cable Curl w/ Straight Bar','(Optional) 2 sets to failure w/ a weigh...','Paused Barbell Bench Press','1x 5 w/ 87.5% OR 90% of the test single'],
   ['09:45','CABLE CURL W/ STRAIGHT BAR x','(Optional) 2 sets to failure w/ a weight you','can do for at least 10 reps.'],
   ['09:46','LEG EXTENSION x','(Optional) 3 x 12 at RPE 7.0 on each set w/ low hype.']];
  const r=await p.evaluate(txt=>{const P=BIB.parseText(txt,{src:'ocr',fmt:'pdf-ocr',file:'test.pdf'});const lib={v:1,progs:[P],ex:{}};BIB.autoEx(lib);
    const D=P.blocks[0].weeks[0].days;const ex=d=>D[d].ex.map(x=>({e:x.eid,s:x.sets,r:x.reps,rpe:x.rpe,k:x.kind||null,opt:!!x.opt,cond:x.cond||null,conf:!!x.conf,f:x.flags}));
    return {name:P.name,v:P.variants[0].name,d1:ex(0),d2:ex(1),ok:D.map(d=>BIB.toGymDay(d).ok),notes:D[0].notes}},pages.map(x=>x.join('\n')).join('\n\f\n'));
  t.eq([r.name,r.v],['TESTPROGRAMM S','V1'],'Programm und Variante aus dem Tageskopf');
  t.eq(r.d1.map(x=>[x.e,x.s,x.r,x.rpe]),[['csq',3,'5',7],['pdl',2,'4',6.5],['lext',3,'12',7],['cgb',3,'8',6]],'Tag 1: Reihenfolge aus Übersicht (auch gescrollt ohne Kopf), Vorgaben aus Detailseiten');
  t.ok(r.d1[0].k==='im letzten Satz'&&r.d1[0].conf&&r.d1[1].conf&&r.d1[1].f.length===0,'Zwei Lesungen stimmen überein; unlesbares RPE („65“) durch die Übersicht bestätigt (6,5)');
  t.ok(r.d1[2].opt&&/moderate grip bencher/i.test(r.d1[3].cond||'')&&r.d1[3].opt,'„(Optional)“ und Bedingung „Only do if …“ als optionale Übung mit Hinweis');
  t.eq(r.d2.map(x=>[x.e,x.s,x.r,x.rpe]),[['pbb',1,'3',8],['ccurl',2,'AMRAP',10],['pbb',1,'5',null]],'Tag 2: Sätze bis zum Versagen = AMRAP @ RPE 10 (wie im eingebauten Plan)');
  t.ok(r.d2[2].f.some(f=>/Optionen/.test(f))&&r.ok[0]===true&&r.ok[1]===false,'ODER-Option sperrt Tag 2; Tag 1 automatisch trainierbar');
  // Übungszuordnung: Synonyme ja, Varianten nein
  const m=await p.evaluate(()=>[['Barbell Row (Underhand Grip)','Lat Pulldown w/ Underhand Grip','3 Second Pause Bench Press','Conventional Stance Snatch Grip Deadlift','Wide Stance Snatch Grip Deadlift','DB Bulgarian Split Squat (Glute Bias)','Barbell Bulgarian Split Squat','High Bar Squat','High Bar Constant Tension Squat','Feet Up Close Grip Bench Press'].map(n=>BIB.matchEx(n))]);
  t.eq(m[0],['row','lat','pb3','sgdl',null,'bss','bbss','hbs','hbct','xfeetupclosegripbenchpress'],'Synonyme zugeordnet, Varianten (Wide Stance, Barbell vs. DB, High Bar vs. Constant Tension) getrennt');
  // Abgleich mit dem eingebauten 3RM-Programm: falsch einsortierte Detailseite wird bestätigt und verschoben
  const v=await p.evaluate(()=>{const W=PROGS.p3.P[0];const ok=bl=>bl.rpe!=null&&/^\d+$/.test(String(bl.r))&&EX[bl.e];const rx=bl=>`${bl.s} x ${bl.r} at RPE ${bl.rpe.toFixed(1)} on the last set w/ moderate hype.`;
    let mv=null;for(let d=0;d<W.length&&!mv;d++)for(const bl of W[d].b){if(!ok(bl))continue;const where=W.map((dd,i)=>dd.b.some(b=>b.e===bl.e&&b.s===bl.s&&String(b.r)===String(bl.r)&&b.rpe===bl.rpe)?i:-1).filter(i=>i>=0);if(where.length===1&&d<W.length-1){mv={d,bl};break}}
    const pg=[];W.forEach((day,d)=>{const L=day.b.filter(ok).filter(bl=>!(mv&&d===mv.d&&bl===mv.bl));pg.push(['10:00',`Day ${d+1} - Monday (W1, 3 RM, V2)`,'Exercises',...L.flatMap(bl=>[EX[bl.e].n,rx(bl)]),'Start workout'].join('\n'));
     L.forEach(bl=>pg.push(['10:01',EX[bl.e].n.toUpperCase(),rx(bl)].join('\n')));if(mv&&d===mv.d+1)pg.push(['10:02',EX[mv.bl.e].n.toUpperCase(),rx(mv.bl)].join('\n'))});
    const P=BIB.parseText(pg.join('\n\f\n'),{src:'ocr',fmt:'pdf-ocr'});const lib={v:1,progs:[P],ex:{}};BIB.autoEx(lib);const before=P.blocks[0].weeks[0].days[mv.d+1].ex.filter(x=>x.amb).length;const n=BIB.autoVerify(lib);
    const D=P.blocks[0].weeks[0].days;const x=D[mv.d].ex.find(e=>e.eid===mv.bl.e&&e.sets===mv.bl.s&&e.rpe===mv.bl.rpe&&e.moved);
    /* Tage, deren eingebaute Vorgaben vollständig im Testtext stehen, sind trainierbar; Tage mit ausgelassener Vorgabe (ohne RPE) widersprechen dem eingebauten Plan → gesperrt */
    const full=W.map(day=>day.b.every(ok));const st=D.map((d,i)=>[BIB.toGymDay(d).ok,full[i],/Weicht vom eingebauten/.test(d.chk||'')]);
    return {before,n,moved:!!x,ref:x&&x.ref,amb:D.flatMap(d=>d.ex).filter(e=>e.amb).length,trainable:st.every(([o,f,c])=>o===f&&c===!f),someLocked:full.includes(false)}});
  t.ok(v.before===1&&v.moved&&v.amb===0&&v.trainable&&v.someLocked,`Abgleich mit eingebautem 3RM-Programm: unsicher einsortierte Übung bestätigt und verschoben (${v.ref}); Tage mit fehlender Vorgabe gesperrt`);
  // Nichts darf stillschweigend verloren gehen: vermischte Übersichtszeilen („Find 10 RM …“, „(Optional) - 3 x …“, doppelter Name) und Tage ohne Tagesübersicht bleiben gesperrt
  const lost=await p.evaluate(()=>{const pg=[['09:41','Day 1 - Monday (W1, TESTPROGRAMM L, V1)','Exercises','Paused Barbell Bench Press','Find 10 RM - Anywhere from RPE 8.5-...','Paused Barbell Bench Press','3 x 5 at RPE 5.0 on average w/ low...','Standing Cable Ab Crunch','(Optional) - 3 x 12-15 at RPE 7.0 on...','Feet Up Bench Press','Feet Up Bench Press','2 x 12 at RPE 7.0 on each set w/ low...','Start workout'],
     ['09:42','PAUSED BARBELL BENCH PRESS x','3 x 5 at RPE 5.0 on average w/ low hype.'],['09:43','FEET UP BENCH PRESS x','2 x 12 at RPE 7.0 on each set w/ low hype.'],
     ['09:44','Day 2 - Thursday (W1, TESTPROGRAMM L, V1)','W Legs'],['09:45','COMP SQUAT x','3 x 5 at RPE 7.0 on the last set w/ low hype.']].map(x=>x.join('\n')).join('\n\f\n');
    const P=BIB.parseText(pg,{src:'ocr',fmt:'pdf-ocr'});BIB.save({v:1,progs:[P],ex:{}});window.__lid=P.id;const D=P.blocks[0].weeks[0].days;const g=D.map(d=>BIB.toGymDay(d));
    return {n:D[0].ex.length,mix:D[0].ex.filter(x=>x.ovMix).length,crunch:D[0].ex.some(x=>/Ab Crunch/.test(x.ovLine||'')&&x.flags.some(f=>/Ab Crunch/.test(f))),ok1:g[0].ok,ok2:g[1].ok,chk2:D[1].chk||'',json:BIB.parseJSON(JSON.stringify({programs:[P]})).progs[0].blocks[0].weeks[0].days.map(d=>[BIB.toGymDay(d).ok,!!d.chk])}});
  t.ok(lost.crunch&&lost.mix>=2&&!lost.ok1,'Vermischte Übersichtszeilen bleiben als markierte Einträge erhalten und sperren den Tag (nichts geht stillschweigend verloren)');
  // Nutzer vergleicht mit dem Original und bestätigt die Vollständigkeit → erst dann trainierbar
  const cf=await p.evaluate(async()=>{bibOpen();document.querySelector(`#bibv [data-bbp="${window.__lid}"]`).click();document.querySelector('#bibv [data-bbw="1"]').click();document.querySelector('#bibv [data-bbd="2"]').click();
    const btn=document.querySelector('#bibv [data-bbchk]');const had=!!btn&&/Tagesübersicht nicht gefunden/.test(document.querySelector('#bibv').textContent);if(btn)btn.click();await new Promise(r=>setTimeout(r,100));
    const D=BIB.load().progs[0].blocks[0].weeks[0].days[1];return {had,ok:D.chkOk===true&&BIB.toGymDay(D).ok,gone:!document.querySelector('#bibv [data-bbchk]')}});
  t.ok(cf.had&&cf.ok&&cf.gone,'Tag ohne Übersicht: Grund angezeigt, nach „Mit dem Original verglichen“ trainierbar');
  t.ok(!lost.ok2&&/Tagesübersicht nicht gefunden/.test(lost.chk2)&&JSON.stringify(lost.json)==='[[false,false],[false,true]]','Tag ohne Tagesübersicht gesperrt (auch nach JSON-Export/-Import)');
  // Robuster PDF-Leser: 16-Bit-Seitenbilder (wie im 10-Wochen-PDF) und abgeschnittene Datei ohne Querverweistabelle
  const fx=n=>require('fs').readFileSync(require('path').join(__dirname,'..','fixtures','bib',n)).toString('base64');
  const pr=await p.evaluate(async([a,b])=>{const u=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));const px=(im,x,y)=>im.data[(y*im.w+x)*4];
    const R1=await BIBCORE.pdfRead(u(a));const i1=await BIBCORE.pdfImage(R1,R1.images[0]);const R2=await BIBCORE.pdfRead(u(b));const i2=await BIBCORE.pdfImage(R2,R2.images[0]);
    return {n1:R1.images.length,dark:px(i1,100,90),light:px(i1,10,10),n2:R2.images.length,d2:px(i2,100,110),l2:px(i2,10,10)}},[fx('bild-16bit.pdf'),fx('bild-abgeschnitten.pdf')]);
  t.eq(pr,{n1:1,dark:0,light:255,n2:2,d2:0,l2:255},'PDF-Leser: 16-Bit-Bilder und beschädigte Datei (ohne Querverweise) werden korrekt gelesen');
  t.eq(p.errors,[],'Keine Skriptfehler');
}};
