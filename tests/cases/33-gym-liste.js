// Gym als Liste (Standard seit 22.10.2026): alle Übungen untereinander, Satz-Fenster, Werkzeuge je Übung, Menü,
// Pause unten, Lastarten (Gewichte/Körpergewicht/Bänder), Stange je Übung, eigener Scheibenbestand, Ansichtswechsel.
// Bucht über denselben Weg wie der bisherige Gym-Modus (Doppelbuchungsschutz, Pausen-Timer); RPE nie vorbelegt.
const {seed}=require('../lib');
const slide=p=>p.evaluate(()=>{const b=document.querySelector('#gym .gls [data-g="log"]');if(!b)return false;b._ok=true;b.click();return true});
module.exports={name:'Gym als Liste – Werkzeuge, Satz, Lastarten, Ausrüstung, Pause, Menü',async run({page,t}){
  for(const W of [390,320]){
    const p=await page({width:W,height:844,fixedTime:'2026-10-24T17:00:00+02:00',gymList:true});
    await seed(p,4,{pids:['intro'],kg:100});
    await p.evaluate(()=>{switchProg('intro');S.ui.w=1;S.ui.d=0;startSession(1,0);const L=log(1,0,true);L.flow=1;L.ck=1;openGym()});await p.waitForTimeout(500);
    const L0=await p.evaluate(()=>{const day=P[1][0];const ex=[...document.querySelectorAll('#gym .gl-ex')];
      return {list:gymList(),n:ex.length,nb:day.b.length,rows:ex.map(e=>e.querySelectorAll('.gl-row').length),sets:day.b.map(b=>b.s),
        tools:ex.map(e=>[...e.querySelectorAll('.gl-tools button')].map(b=>Object.keys(b.dataset).filter(k=>k!=='glb').join(','))),
        info:ex.every(e=>!!e.querySelector('[data-exinfo]')),wuExp:day.b.map((b,i)=>warmups(1,0,i,100)!==null),
        sw:document.querySelector('#gym .gym-in').scrollWidth,cw:innerWidth,fin:!!document.querySelector('#gym .gl-fin[data-g="finish"]'),menu:!!document.querySelector('#gym [data-glsh="menu"]'),sess:!!document.querySelector('#gym [data-sp],#gym [data-sstart]')}});
    t.ok(L0.list&&L0.n===L0.nb&&JSON.stringify(L0.rows)===JSON.stringify(L0.sets),`${W}px: Liste ist Standard, jede Übung mit allen Sätzen`);
    t.ok(L0.tools.every((tl,i)=>tl.includes('hiopen')&&tl.includes('ex')&&tl.includes('rcopen')&&(tl.includes('gwuopen')===L0.wuExp[i]))&&L0.info,`${W}px: Werkzeuge je Übung (Aufwärmen, Verlauf, Analyse, RPE-Planer, Info)`);
    t.ok(L0.fin&&L0.menu&&L0.sess&&L0.sw<=L0.cw+1,`${W}px: Abschluss, Menü, Trainingszeit, kein Überlauf`);
    // Werkzeuge beziehen sich auf die jeweilige Übung
    const tw=await p.evaluate(()=>{const out={};const b=document.querySelectorAll('#gym .gl-ex')[1];
      b.querySelector('[data-hiopen]').click();out.hi=[G.hi,G.b];G.hi=false;renderGym();
      document.querySelectorAll('#gym .gl-ex')[1].querySelector('[data-rcopen]').click();out.rp=[!!G.rpo||!!G.rc,G.b];G.rpo=false;G.rc=null;renderGym();
      document.querySelectorAll('#gym .gl-ex')[0].querySelector('[data-exinfo]').click();const gx=document.getElementById('gxi');out.info=[!!gx&&!gx.hidden,G.b];exInfoClose();
      const wb=document.querySelectorAll('#gym .gl-ex')[0].querySelector('[data-gwuopen]');if(wb){wb.click();out.wu=[G.wu,G.b];G.wu=false;renderGym()}return out});
    t.eq([tw.hi,tw.rp,tw.info],[[true,1],[true,1],[true,0]],`${W}px: Verlauf, RPE-Planer und Info öffnen für die angetippte Übung`);
    if(tw.wu)t.eq(tw.wu,[true,0],`${W}px: Aufwärmen öffnet für die angetippte Übung`);
    // Satz-Fenster
    await p.evaluate(()=>document.querySelector('#gym .gl-row.cur [data-gls]').click());await p.waitForTimeout(200);
    const S1=await p.evaluate(()=>{const g=document.querySelector('#gym .gls');const s=log(1,0).b[G.b][G.i];const sc=g.querySelector('.gls-sc');
      const small=[...g.querySelectorAll('button,input')].filter(x=>{const r=x.getBoundingClientRect();return r.width>0&&(r.height<44||r.width<44)&&!x.matches('.gl-num input')}).map(x=>x.className||x.dataset);
      return {open:G.sheet==='set',seg:g.querySelectorAll('[data-gllt]').length,kg:!!g.querySelector('#g-kg'),r:!!g.querySelector('#g-r'),stepKg:g.querySelectorAll('[data-step="kg"]').length,
        bar:!!g.querySelector('[data-glsh="bar"]'),inv:!!g.querySelector('[data-glsh="inv"]'),rt:!!g.querySelector('[data-glsh="rt"]'),log:!!g.querySelector('[data-g="log"]'),reset:!!g.querySelector('[data-glreset]'),
        rpe:s.rpe??null,rpeShown:g.querySelector('[data-glrpe="0.5"]').closest('.gl-c').querySelector('.gl-num b').textContent,small,sw:sc.scrollWidth,cw:sc.clientWidth,
        fs:[...g.querySelectorAll('input,textarea')].filter(x=>parseFloat(getComputedStyle(x).fontSize)<16).length}});
    t.ok(S1.open&&S1.seg===3&&S1.kg&&S1.r&&S1.stepKg===2&&S1.bar&&S1.inv&&S1.rt&&S1.log&&S1.reset,`${W}px: Satz-Fenster mit Lastart, kg, Wdh., Stange, Scheiben, Auto-Timer, Speichern, Zurücksetzen`);
    t.ok(S1.rpe==null&&S1.rpeShown==='–',`${W}px: RPE nicht vorbelegt`);
    t.ok(S1.sw<=S1.cw+1&&S1.small.length===0&&S1.fs===0,`${W}px: kein Überlauf, Tippflächen ≥ 44 px, Felder ≥ 16 px (${JSON.stringify(S1.small).slice(0,120)})`);
    await p.click('#gym .gls [data-glrpe="0.5"]');await p.waitForTimeout(100);
    t.eq(await p.evaluate(()=>log(1,0).b[G.b][G.i].rpe),'6',`${W}px: erster Tipp auf + setzt RPE 6`);
    await p.click('#gym .gls [data-glrpe="clear"]');await p.waitForTimeout(100);
    // Speichern + Doppelbuchungsschutz
    const before=await p.evaluate(()=>log(1,0).b.flat().filter(z=>z.ok).length);
    await p.evaluate(()=>{const b=document.querySelector('#gym .gls [data-g="log"]');b._ok=true;b.click();b._ok=true;b.click()});await p.waitForTimeout(500);
    const A=await p.evaluate(()=>({n:log(1,0).b.flat().filter(z=>z.ok).length,sheet:G.sheet,T:T.on,bar:!!document.querySelector('#gym .gl-tb'),big:!!document.querySelector('#gym .grest')}));
    t.ok(A.n===before+1&&A.sheet===null&&A.T&&A.bar&&!A.big,`${W}px: genau ein Satz gebucht, zurück zur Liste, Pause unten als Leiste`);
    const tb=await p.evaluate(()=>{const t0=T.total;document.querySelector('#gym .gl-tb [data-t="add"][data-v="15"]').click();const t1=T.total;document.querySelector('#gym .gl-tb [data-t="gmax"]').click();const big=!!document.querySelector('#gym .grest');
      document.querySelector('#gym .grest [data-t="gmin"]').click();const small=!!document.querySelector('#gym .gl-tb')&&!document.querySelector('#gym .grest');return {d:t1-t0,big,small}});
    t.ok(tb.d===15&&tb.big&&tb.small,`${W}px: Pause +15 s, groß öffnen und wieder verkleinern`);
    await p.evaluate(()=>document.querySelector('#gym .gl-tb [data-t="skip"]').click());await p.waitForTimeout(150);
    t.ok(await p.evaluate(()=>!T.on&&!document.querySelector('#gym .gl-tb')),`${W}px: Pause beenden`);
    // Stange je Übung
    await p.evaluate(()=>document.querySelector('#gym .gl-row.cur [data-gls]').click());await p.waitForTimeout(150);
    const e=await p.evaluate(()=>P[1][0].b[G.b].e);
    await p.evaluate(()=>document.querySelector('#gym [data-glsh="bar"]').click());await p.waitForTimeout(100);
    await p.evaluate(()=>{document.querySelector('#gym [data-glbar="25"]').click()});await p.waitForTimeout(80);
    await p.evaluate(()=>{document.querySelector('#gym [data-glbarper]').click()});await p.waitForTimeout(80);
    await p.evaluate(()=>{document.querySelector('#gym [data-glbarok]').click()});await p.waitForTimeout(150);
    const B=await p.evaluate(e=>({ex:(S.meta.barEx||{})[e],glob:S.meta.bar||20,sheet:G.sheet,pill:document.querySelector('#gym [data-glsh="bar"]').textContent,pl:plates(100,barFor(e)).reduce((a,x)=>a+x,0)}),e);
    t.ok(B.ex===25&&B.glob===20&&B.sheet==='set'&&/25 kg/.test(B.pill)&&B.pl===37.5,`${W}px: Stange 25 kg nur für diese Übung, Scheiben passen sich an`);
    // Scheibenbestand
    await p.evaluate(()=>document.querySelector('#gym [data-glsh="inv"]').click());await p.waitForTimeout(100);
    t.ok(await p.evaluate(()=>document.querySelectorAll('#gym .gl-ir').length===PLS.length&&!!document.querySelector('#gym [data-glinv="50|2"]')),`${W}px: Scheibenliste inkl. neuer Größen`);
    await p.evaluate(()=>document.querySelector('#gym [data-glinv="20|2"]').click());await p.waitForTimeout(100);
    t.eq(await p.evaluate(()=>S.meta.inv),{20:2},`${W}px: Bestand gespeichert`);
    await p.evaluate(()=>document.querySelector('#gym [data-glinvreset]').click());await p.waitForTimeout(100);
    t.eq(await p.evaluate(()=>[JSON.stringify(S.meta.inv||{}),plates(100).join('+')]),['{}','25+15'],`${W}px: zurück auf unbegrenzt, Rechnung wie bisher`);
    await p.evaluate(()=>document.querySelector('#gym .gls-h [data-glsh]').click());await p.waitForTimeout(100);
    // Lastarten: Bänder und Körpergewicht zählen nicht ins e1RM
    await p.evaluate(()=>document.querySelector('#gym [data-gllt="band"]').click());await p.waitForTimeout(100);
    await p.evaluate(()=>document.querySelector('#gym [data-glband="mini"]').click());await p.waitForTimeout(100);
    const Bd=await p.evaluate(()=>{const s=log(1,0).b[G.b][G.i];return {lt:s.lt,band:s.band,kg:s.kg,e1:e1Of(Object.assign({},s,{r:'5'}),P[1][0].b[G.b])}});
    t.eq(Bd,{lt:'band',band:'mini',kg:'0',e1:null},`${W}px: Bänder gespeichert, kein e1RM`);
    await p.evaluate(()=>document.querySelector('#gym [data-gllt="bw"]').click());await p.waitForTimeout(100);
    await p.evaluate(()=>document.querySelector('#gym [data-glbwm="add"]').click());await p.waitForTimeout(80);
    await p.evaluate(()=>document.querySelector('#gym [data-gladd="2.5"]').click());await p.waitForTimeout(80);
    t.eq(await p.evaluate(()=>{const s=log(1,0).b[G.b][G.i];return [s.lt,s.add,s.band??null]}),['bw','2,5',null],`${W}px: Körpergewicht mit Zusatzgewicht`);
    await p.evaluate(()=>document.querySelector('#gym [data-gllt="w"]').click());await p.waitForTimeout(80);
    t.eq(await p.evaluate(()=>{const s=log(1,0).b[G.b][G.i];return [s.lt??null,s.add??null,s.kg??null]}),[null,null,null],`${W}px: zurück zu Gewichten, nichts bleibt hängen`);
    await p.evaluate(()=>document.querySelector('#gym [data-glx]').click());await p.waitForTimeout(100);
    // Menü
    await p.evaluate(()=>document.querySelector('#gym [data-glsh="menu"]').click());await p.waitForTimeout(150);
    const M=await p.evaluate(()=>{const g=document.querySelector('#gym .gls');return ['gplan','glsh','glview','g','glnote'].map(k=>!!g.querySelector(`[data-${k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}]`))});
    t.ok(M.every(Boolean)&&!(await p.evaluate(()=>!!document.querySelector('#gym .gls [data-glck],#gym .gls [data-glgwu]'))),`${W}px: Menü mit Tagesplan, Ausrüstung, Ansicht, Abschluss, Notiz`);
    await p.evaluate(()=>document.querySelector('#gym [data-gplan="1"]').click());await p.waitForTimeout(150);
    t.ok(await p.evaluate(()=>G.plan&&!!document.querySelector('#gym .gplan')),`${W}px: Tagesplan öffnet`);
    await p.evaluate(()=>{G.plan=false;renderGym();document.querySelector('#gym [data-glsh="menu"]').click()});await p.waitForTimeout(100);
    await p.evaluate(()=>document.querySelector('#gym [data-glview="classic"]').click());await p.waitForTimeout(250);
    t.ok(await p.evaluate(()=>!gymList()&&!!document.querySelector('#gym .gtop')&&!!document.querySelector('#gym .gq [data-glview="list"]')),`${W}px: bisheriger Gym-Modus wählbar, mit Knopf zurück zur Liste`);
    await p.evaluate(()=>document.querySelector('#gym .gq [data-glview="list"]').click());await p.waitForTimeout(250);
    t.ok(await p.evaluate(()=>gymList()&&!!document.querySelector('#gym .gl')),`${W}px: zurück zur Liste`);
    t.eq(p.errors,[],`${W}px: keine Skriptfehler`);await p.close();
  }
  // Kompletter Weg: Heute → Training starten → Ablauf (1, 2) → Gym als Liste
  const r=await page({width:390,height:844,fixedTime:'2026-10-20T17:00:00+02:00',gymList:true});
  await r.evaluate(()=>{switchProg('intro');S.ui.tab='home';render()});await r.click('[data-act="homego"]');await r.waitForTimeout(300);
  await r.click('#ckin [data-ckovgo="1"]');await r.waitForTimeout(150);
  const nw=await r.evaluate(()=>document.querySelectorAll('#ckin [data-wuck]').length);for(let k=0;k<nw;k++)await r.evaluate(k=>document.querySelectorAll('#ckin [data-wuck]')[k].click(),k);
  await r.click('#ckin [data-ckstep="1"]');await r.waitForTimeout(150);
  await r.evaluate(()=>['sleeph','energy','food','strength'].forEach(k=>document.querySelector(`#ckin [data-ck="${k}|3"]`).click()));await r.waitForTimeout(100);
  await r.click('#ckin [data-ckgo]');await r.waitForTimeout(500);
  t.ok(await r.evaluate(()=>!$('#gym').hidden&&!!document.querySelector('#gym .gl')&&document.getElementById('ckin').hidden),'Ablauf führt in die Gym-Liste');t.eq(r.errors,[],'Ablauf: keine Skriptfehler');await r.close();
  // Gym-Reiter bei nicht gestartetem Training: erst „So läuft es ab“, schließen schließt auch den Gym
  const u=await page({width:390,height:844,fixedTime:'2026-10-20T17:00:00+02:00',gymList:true});
  await u.evaluate(()=>{switchProg('intro');S.ui.w=0;S.ui.d=3;openGym()});await u.waitForTimeout(300);
  t.ok(await u.evaluate(()=>!document.getElementById('ckin').hidden&&document.querySelector('#ckin .fl-h').textContent==='So läuft es ab'&&!log(0,3).start),'Gym öffnen zeigt zuerst den Ablauf, Training noch nicht gestartet');
  await u.click('#ckin [data-ckclose]');await u.waitForTimeout(300);
  t.ok(await u.evaluate(()=>$('#gym').hidden&&document.getElementById('ckin').hidden),'Ablauf schließen schließt auch den Gym');
  t.eq(u.errors,[],'Gym-Reiter: keine Skriptfehler');await u.close();
  // Classic-Design: Liste ohne Fehler
  const q=await page({width:390,height:844,fixedTime:'2026-10-24T17:00:00+02:00',gymList:true});
  await q.evaluate(()=>{localStorage.setItem('cf-theme','classic')});await q.reload();await q.waitForTimeout(3000);
  await q.evaluate(()=>{switchProg('intro');S.ui.w=1;S.ui.d=0;startSession(1,0);const L=log(1,0,true);L.flow=1;L.ck=1;openGym()});await q.waitForTimeout(400);
  await q.evaluate(()=>document.querySelector('#gym .gl-row.cur [data-gls]').click());await q.waitForTimeout(200);
  t.ok(await q.evaluate(()=>!!document.querySelector('#gym .gls .gl-seg')),'Classic-Design: Satz-Fenster');t.eq(q.errors,[],'Classic-Design: keine Skriptfehler');await q.close();
}};
