// Pausen-Modus: Neustart-Grenze (11 Tage laut Candito-Regel der App), Phasen nach dem Fortsetzen (gleiche Rechnung wie
// pauseResume/shiftFrom), Erholungs-Check-in, Canditos Wissen. Fortsetzen verschiebt wie bisher. Layout 390/320.
const {seed}=require('../lib');
module.exports={name:'Pausen-Modus – Grenze, Phasen, Erholung, Wissen',async run({page,t}){
  for(const W of [390,320]){
    const p=await page({width:W,height:844,fixedTime:'2026-10-22T13:00:00+02:00'});
    await seed(p,3,{pids:['intro']});
    await p.evaluate(()=>{switchProg('intro');pauseOn();S.meta.pause.since='2026-10-15';S.meta.pause.nd='2026-10-17';saveMeta();S.ui.tab='home';render()});await p.waitForTimeout(200);
    const r=await p.evaluate(()=>{const I=pauseInfo();const c=[...document.querySelectorAll('#view .pzx')];
      const st=withProg('p8',progStart);const exp=new Date(st+'T12:00:00');exp.setDate(exp.getDate()+I.weeks*7);
      return {n:c.length,lim:c[0].querySelector('.pzx-h b').textContent,ph:c[1].querySelectorAll('.pzph>div').length,weeks:I.weeks,expP8:isoD(exp),
        wi:!!document.querySelector('.pzwi'),rest:JSON.stringify(S.meta.rest||{}),sw:document.scrollingElement.scrollWidth}});
    t.eq(r.n,3+(r.wi?1:0),`${W}px: Zusatzkarten vorhanden`);t.ok(r.wi,`${W}px: Canditos Wissen „Krank …“ eingebunden`);
    t.eq(r.lim,'noch 4 Tage',`${W}px: Neustart-Grenze nach 7 Tagen Pause`);
    t.ok(r.ph===4&&r.sw<=W+1,`${W}px: 3 Phasen + Zusammenfassung, kein Überlauf`);
    t.eq(r.rest,'{}',`${W}px: nichts gespeichert, Check-in nur auf Wunsch`);
    await p.click('.pzx [data-rdopen]');await p.waitForTimeout(150);
    t.ok(await p.evaluate(()=>!document.getElementById('ckin').hidden),`${W}px: Erholungs-Check-in öffnet`);
    await p.evaluate(()=>ckClose());await p.waitForTimeout(100);
    await p.click('[data-pz="off"]');await p.waitForTimeout(300);
    const a=await p.evaluate(()=>({pause:!!S.meta.pause,p8:withProg('p8',progStart)}));
    t.ok(!a.pause&&a.p8===r.expP8,`${W}px: Fortsetzen verschiebt wie angezeigt (8 Week ab ${r.expP8})`);
    t.eq(p.errors,[],`${W}px: keine Skriptfehler`);await p.close();
  }
}};
