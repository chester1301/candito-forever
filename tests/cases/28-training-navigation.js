// Training-Navigation „Programm · Woche · Tag“: jede Woche und jeder Tag jedes Programms bleibt erreichbar (über die
// Wochen-Tabs), Programmwechsel über „Programm“, Wochenliste springt in die Tagesansicht. Layout 320/390 ohne Überlauf.
const {seed}=require('../lib');
module.exports={name:'Training-Navigation – Programm, Woche, Tag erreichbar',async run({page,t}){
  for(const W of [390,320]){
    const p=await page({width:W,height:844,fixedTime:'2026-10-22T17:00:00+02:00'});
    await seed(p,4,{pids:['intro'],kg:100});
    await p.evaluate(()=>{switchProg('intro');S.ui.tab='train';S.ui.tdet={};S.ui.w=0;S.ui.d=0;S.ui.tnav='day';render();scrollTo(0,0)});await p.waitForTimeout(200);
    const r=await p.evaluate(()=>({seg:[...document.querySelectorAll('#tl [data-tnav]')].map(b=>b.textContent),tabs:document.querySelectorAll('#tl [data-navw]').length,days:document.querySelectorAll('#tl [data-tw]').length,nw:NW(),nd:ND(),prog:getComputedStyle(document.getElementById('progsw')).display}));
    t.ok(r.seg.join('|')==='Programm|Woche|Tag'&&r.tabs===r.nw&&r.days===r.nd&&r.prog==='none',`${W}px: Umschalter, ${r.nw} Wochen-Tabs, ${r.nd} Tage der gewählten Woche`);
    // alle Programme: jede Woche über die Tabs, jeder Tag antippbar und auswählbar
    const bad=await p.evaluate(async()=>{const out=[];for(const pid of ORD()){switchProg(pid);S.ui.tab='train';S.ui.tnav='day';render();
      for(let w=0;w<NW();w++){document.querySelector(`#tl [data-navw="${w}"]`).click();for(let d=0;d<ND();d++){const b=document.querySelector(`#tl [data-tw="${w}"][data-td="${d}"]`);if(!b){out.push(pid+' W'+(w+1)+'T'+(d+1)+' fehlt');continue}
        const r=b.getBoundingClientRect();if(r.width<44||r.height<44||r.right>innerWidth+1)out.push(pid+' W'+(w+1)+'T'+(d+1)+' Größe');b.click();if(S.ui.w!==w||S.ui.d!==d)out.push(pid+' W'+(w+1)+'T'+(d+1)+' nicht gewählt')}}}
      switchProg('intro');return out});
    t.eq(bad.slice(0,10),[],`${W}px: alle Tage aller ${'10'} Programme erreichbar und wählbar`);
    // Programm-Ansicht
    await p.evaluate(()=>{S.ui.tab='train';render();document.querySelector('#tl [data-tnav="prog"]').click()});await p.waitForTimeout(100);
    const pr=await p.evaluate(()=>({vis:getComputedStyle(document.getElementById('progsw')).display,n:document.querySelectorAll('#progsw [data-prog]').length,ord:ORD().length,sw:document.scrollingElement.scrollWidth}));
    t.ok(pr.vis==='grid'&&pr.n>=pr.ord&&pr.sw<=W+1,`${W}px: „Programm“ zeigt alle ${pr.ord} Programme ohne Überlauf`);
    await p.click('#progsw [data-prog="p8"]');await p.waitForTimeout(200);
    t.ok(await p.evaluate(()=>PROG==='p8'),`${W}px: Programmwechsel aus der Programm-Ansicht`);
    // Wochen-Ansicht → Tag-Ansicht der gewählten Woche
    await p.evaluate(()=>{switchProg('intro');S.ui.tab='train';render();document.querySelector('#tl [data-tnav="week"]').click()});await p.waitForTimeout(100);
    await p.click('#tl .tnwr[data-navw="2"]');await p.waitForTimeout(100);
    t.ok(await p.evaluate(()=>S.ui.tnav==='day'&&!!document.querySelector('#tl [data-tw="2"][data-td="0"]')&&document.querySelector('#tl [data-navw="2"]').getAttribute('aria-pressed')==='true'),`${W}px: Woche 3 aus der Wochenliste öffnet ihre Tage`);
    t.eq(p.errors,[],`${W}px: keine Skriptfehler`);
    await p.close();
  }
}};
