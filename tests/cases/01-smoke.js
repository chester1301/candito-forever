// Rauchtest: jede Ansicht, jedes Programm, jeder Tag – ohne Fehler und ohne seitliches Überlaufen.
module.exports={name:'Rauchtest – alle Ansichten, Programme und Tage',async run({page,t}){
  const p=await page();
  t.ok(await p.evaluate(()=>typeof CF_VERSION==='string'&&CF_VERSION.length>5),'Version vorhanden');
  for(const tab of ['home','train','gym','prog','coach','sq','setup']){
    await p.evaluate(tab=>{const b=document.querySelector(`nav [data-tab="${tab}"]`);if(b)b.click();else{S.ui.tab=tab;render()}},tab);
    await p.waitForTimeout(150);
    const sw=await p.evaluate(()=>[document.scrollingElement.scrollWidth,innerWidth]);
    t.ok(sw[0]<=sw[1]+1,`Tab ${tab}: kein seitliches Überlaufen (${sw[0]} > ${sw[1]})`);
  }
  await p.evaluate(()=>{try{closeGym(true)}catch(e){}});
  const n=await p.evaluate(()=>{let n=0;for(const id of Object.keys(PROGS)){switchProg(id);for(let w=0;w<NW();w++)for(let d=0;d<ND();d++){S.ui.w=w;S.ui.d=d;S.ui.tab='train';render();openGym();G.plan=true;renderGym();G.plan=false;closeGym(true);n++}}switchProg('intro');return n});
  t.ok(n>200,`Alle Trainingstage gerendert (${n})`);
}};
