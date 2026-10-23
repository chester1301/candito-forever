// Programmbibliothek: Kachel, Hierarchie (Programm › Variante › Block › Woche › Tag › Übung), Import PDF/JSON/CSV/TXT,
// Parser, Markierung unvollständiger Angaben, kontrollierte Gym-Schnittstelle (nur Vorschau).
// Prüft ausdrücklich: eingebaute Programme, Trainingsdaten (S.logs) und Einstellungen (S.meta) bleiben unverändert.
// Testdaten in tests/fixtures/bib/ sind frei erfunden (kein Candito-Inhalt).
const fs=require('fs'),path=require('path');const {seed}=require('../lib');
module.exports={name:'Programmbibliothek – Hierarchie, Import, Parser, Markierungen, Gym-Schnittstelle',async run({page,t,root}){
  const FX=path.join(root,'tests','fixtures','bib');const fx=n=>fs.readFileSync(path.join(FX,n));
  for(const W of [390,320]){
    const p=await page({width:W,height:844,gymList:true});await seed(p,4,{pids:['intro'],kg:100});
    const before=await p.evaluate(()=>JSON.stringify({logs:S.logs,P:PROGS.intro.P.length,b:PROGS.intro.P[0][0].b.map(b=>[b.e,b.s,b.r,b.rpe,b.pct])}));
    // Kachel + Öffnen
    const tile=await p.evaluate(()=>{S.ui.tab='setup';S.ui.tdet={};render();const tl=document.querySelector('[data-tdk="bib"]');if(!tl)return {tile:false};tl.click();const v=document.getElementById('bibv');
      return {tile:true,open:!!v&&!v.hidden,bi:document.querySelectorAll('#bibv [data-bbp^="bi-"]').length,sw:document.querySelector('#bibv .bb-sc').scrollWidth<=innerWidth+1}});
    t.ok(tile.tile&&tile.open&&tile.bi===5&&tile.sw,`${W}px: Kachel „Programmbibliothek“ öffnet die Bibliothek mit 5 eingebauten Programmen`);
    // Hierarchie eingebaut: 10RM mit 4 Varianten bis zur Übung
    const h=await p.evaluate(()=>{const c=s=>{const e=document.querySelector('#bibv '+s);if(e)e.click();return !!e};const o={};c('[data-bbp="bi-p10"]');o.var=document.querySelectorAll('#bibv [data-bbv]').length;
      c('[data-bbw="1"]');c('[data-bbd="1"]');o.ex=document.querySelectorAll('#bibv .bb-ex').length;o.plan=PROGS.p10.P[0][0].b.length;o.kv=!!document.querySelector('#bibv .bb-ex .bb-kv');o.gym=!!document.querySelector('#bibv [data-bbgym]');
      o.cr=document.querySelectorAll('#bibv .bb-cr button').length;c('[data-bbcr="root"]');o.root=!!document.querySelector('#bibv [data-bbp="bi-intro"]');return o});
    t.ok(h.var===4&&h.ex===h.plan&&h.kv&&!h.gym&&h.cr===3&&h.root,`${W}px: Hierarchie Programm › Variante › Woche › Tag › Übungen (eingebaut nur lesen)`);
    // Import über die echte Dateiauswahl
    const imp=async(n,type)=>{await p.evaluate(()=>{const r=document.querySelector('#bibv [data-bbcr="root"]');if(r)r.click()});await p.setInputFiles('#bbfile',{name:n,mimeType:type,buffer:fx(n)});await p.waitForTimeout(400);return p.evaluate(()=>({h:(document.querySelector('#bibv .bb-ph h2')||{}).textContent,err:(document.querySelector('#bibv .bb-err')||{}).textContent||'',ok:!!document.querySelector('#bibv [data-bbok]')}))};
    const pd=await imp('test-programm.pdf','application/pdf');t.ok(pd.ok&&pd.h==='Import prüfen',`${W}px: Text-PDF wird gelesen (${pd.err||pd.h})`);
    await p.evaluate(()=>document.querySelector('#bibv [data-bbok]').click());
    const pr=await p.evaluate(()=>{const L=BIB.load();const x=L.progs[L.progs.length-1];const W1=x.blocks[0].weeks[0],D1=W1.days[0],D2=W1.days[1];const sq=D1.ex[0],dl=D1.ex[1],cu=D2.ex[1];
      return {name:x.name,weeks:x.blocks[0].weeks.length,wn:W1.name,d1:[D1.wd,D1.focus,/Testbeschreibung/.test(D1.notes)],sq:[sq.eid,sq.sets,sq.reps,sq.rpe,sq.hype,sq.notes,sq.flags.length],dl:[dl.eid,dl.sets,dl.reps,dl.load&&dl.load.pct],
       cu:[cu.eid,cu.flags.length>=2],am:x.blocks[0].weeks[1].days[0].ex[0].amrap,warn:document.querySelectorAll('#bibv .bb-tag.w').length}});
    t.eq([pr.name,pr.weeks,pr.wn,pr.d1],['TESTPROGRAMM A',2,'Testblock',['Monday','Legs',true]],`${W}px: Parser erkennt Programm, Wochen, Tage, Fokus und Beschreibung`);
    t.eq([pr.sq,pr.dl],[['csq',3,'5',7,'Moderat','Testhinweis zur Technik.',0],['pdl',2,'4',80]],`${W}px: Parser liest Übung, Sätze, Wdh., RPE, Hype, %-Last und Hinweise`);
    t.ok(pr.cu[0]===null&&pr.cu[1]&&pr.am&&pr.warn>0,`${W}px: Unbekannte Übung und fehlende Vorgaben werden markiert, AMRAP erkannt`);
    // Bild-PDF: ehrlicher Hinweis statt erfundener Daten
    await p.evaluate(()=>{document.querySelector('#bibv [data-bbcr="root"]')?.click()});
    const ip=await imp('bild-programm.pdf','application/pdf');t.ok(!ip.ok&&/nur Bilder/.test(ip.err),`${W}px: Bild-PDF ohne Text wird erkannt und nicht erfunden`);
    await p.evaluate(()=>document.querySelector('#bibv [data-bbimpx]').click());
    // CSV
    const cv=await imp('test-programm.csv','text/csv');t.ok(cv.ok,`${W}px: CSV wird gelesen`);await p.evaluate(()=>document.querySelector('#bibv [data-bbok]').click());
    const cr=await p.evaluate(()=>{const x=BIB.load().progs.find(p=>p.name==='Testprogramm B');const D=x.blocks[0].weeks[0].days;return {w:x.blocks[0].weeks.length,a:[D[0].ex[0].eid,D[0].ex[0].sets,D[0].ex[0].load.pct,D[0].ex[0].hype,D[0].ex[1].rpe],miss:D[1].ex[0].flags.includes('Satzanzahl fehlt')}});
    t.eq(cr,{w:2,a:['csq',3,75,'Moderat',8],miss:true},`${W}px: CSV mit Last, RPE, Hype und markierter Lücke`);
    // JSON mit Varianten und Blöcken
    await p.evaluate(()=>{document.querySelector('#bibv [data-bbcr="root"]')?.click()});
    const js=await imp('test-programm.json','application/json');t.ok(js.ok,`${W}px: JSON wird gelesen`);await p.evaluate(()=>document.querySelector('#bibv [data-bbok]').click());
    const jr=await p.evaluate(()=>{const v=document.querySelectorAll('#bibv [data-bbv]').length;document.querySelector('#bibv [data-bbv="1"]').click();const bl=document.querySelector('#bibv [data-bbb][aria-pressed="true"]');
      const x=BIB.load().progs.find(p=>p.name==='Testprogramm C');return {v,b:bl&&bl.textContent,rx:[x.blocks[0].weeks[0].days[0].ex[1].sets,x.blocks[0].weeks[0].days[0].ex[1].rpe],kurz:x.blocks[1].weeks[0].days[0].ex[0].flags.includes('Wiederholungen fehlen')}});
    t.eq(jr,{v:2,b:'Kurz-Block',rx:[2,8],kurz:true},`${W}px: JSON mit Varianten, Blöcken und markierter Lücke`);
    // Eingefügter Text + Gym-Schnittstelle (nur Vorschau, nichts gespeichert)
    await p.evaluate(()=>{document.querySelector('#bibv [data-bbcr="root"]')?.click()});await p.evaluate(()=>{document.querySelector('#bibv [data-bbpaste]').click()});
    await p.fill('#bbtxt',fx('test-programm.txt').toString());await p.fill('#bbname','Eingefügt');await p.evaluate(()=>{document.querySelector('#bibv [data-bbparse]').click()});
    await p.evaluate(()=>document.querySelector('#bibv [data-bbok]').click());
    const g=await p.evaluate(()=>{const c=s=>document.querySelector('#bibv '+s)?.click();c('[data-bbw="1"]');c('[data-bbd="2"]');const btn=!!document.querySelector('#bibv [data-bbgym]');c('[data-bbgym]');
      const gx=document.querySelectorAll('#bibv .bb-gx').length,err=(document.querySelector('#bibv .bb-err')||{}).textContent||'';const x=BIB.load().progs.find(p=>p.name==='Eingefügt');const R=BIB.toGymDay(x.blocks[0].weeks[0].days[1]);
      return {btn,gx,err:/Fantasie Curl/.test(err),ok:R.ok,live:R.live,b:R.day.b.map(b=>[b.e,b.s,b.r,b.rpe])}});
    t.ok(g.btn&&g.gx===1&&g.err&&g.ok===false&&g.live===false&&JSON.stringify(g.b)===JSON.stringify([['pbb',4,'6',8]]),`${W}px: Gym-Schnittstelle prüft, wandelt und zeigt nur eine Vorschau (Übernahme gesperrt)`);
    // Löschen mit Nachfrage
    const dl=await p.evaluate(()=>{document.querySelector('#bibv [data-bbgymx]')?.click();document.querySelector('#bibv [data-bbcr="p"]')?.click();const n0=BIB.load().progs.length;const b=document.querySelector('#bibv [data-bbdel]');b.click();const armed=!!document.querySelector('#bibv .bb-del.armed');document.querySelector('#bibv [data-bbdel]').click();return {armed,d:n0-BIB.load().progs.length}});
    t.eq(dl,{armed:true,d:1},`${W}px: Löschen fragt erst nach`);
    // Nichts Bestehendes verändert
    const after=await p.evaluate(()=>JSON.stringify({logs:S.logs,P:PROGS.intro.P.length,b:PROGS.intro.P[0][0].b.map(b=>[b.e,b.s,b.r,b.rpe,b.pct])}));
    const meta=await p.evaluate(()=>[JSON.stringify(S.meta).includes('Testprogramm'),Object.keys(localStorage).filter(k=>/bib/.test(k))]);
    t.ok(before===after&&!meta[0]&&meta[1].join()==='cf-bib',`${W}px: Trainingsdaten, Programme und Einstellungen unverändert; Bibliothek nur in eigenem Speicher`);
    await p.evaluate(()=>{localStorage.removeItem('cf-bib')});
    t.eq(p.errors,[],`${W}px: keine Fehler`);await p.close()}
}};
