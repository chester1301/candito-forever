// Übungstausch: Voreinstellungen aus Canditos App (sw), Original dauerhaft/heute, Zyklen teilen Plan-Objekte.
module.exports={name:'Übungstausch – Voreinstellung, Original, nur heute, Zyklen',async run({page,t}){
  const p=await page();
  const eff=await p.evaluate(()=>{const o={};const g=(pid,w,d)=>withProg(pid,()=>P[w][d].b.map(x=>(x.e0||x.e)+'→'+x.e));o.p10d3=g('p10',0,2);o.p10d4=g('p10',0,3);o.p8d4=g('p8',0,3);o.p3d2=g('p3',0,1);o.p10wd2=g('p10w',0,1);return o});
  t.ok(eff.p10d3.includes('slp→bss')&&eff.p10d3.includes('shc→sgm'),'10RM Tag 3: Single Leg Press→DB BSS, Seated Ham Curl→Seated Good Morning');
  t.ok(eff.p10d4.includes('lp→bbss'),'10RM Tag 4: Leg Press→Barbell BSS');
  t.ok(eff.p8d4.filter(x=>x==='mrow→row').length===2,'8 Week Tag 4: Machine Row→Barbell Row (2 Blöcke)');
  t.ok(eff.p3d2.includes('mrow→row'),'3RM Tag 2: Machine Row→Barbell Row');
  t.ok(eff.p10wd2.includes('xbarbellbackextension→lhc')&&eff.p10wd2.includes('mrow→row'),'10 Week Tag 2: Back Extension→Lying Ham Curl, Machine Row→Barbell Row');
  // Kennzeichnung im Trainings-Tab
  await p.evaluate(()=>{switchProg('p10');S.ui.w=0;S.ui.d=2;S.ui.tab='train';render()});await p.waitForTimeout(400);
  const tags=await p.evaluate(()=>[...document.querySelectorAll('main .swtag')].map(x=>x.textContent));
  t.eq(tags,['⇄ Ersatz für Single Leg Press (Glute-Bias) · laut Candito · wie in Canditos App','⇄ Ersatz für Seated Hamstring Curl · laut Candito · wie in Canditos App'],'Kennzeichnung „Ersatz für … · wie in Canditos App“');
  // Tausch-Sheet: Original, Voreinstellung, Claude-Alternative getrennt
  await p.evaluate(()=>swSheet(0,2,2));await p.waitForTimeout(300);
  const rows=await p.evaluate(()=>[...document.querySelectorAll('#swsh .swo')].map(x=>(x.classList.contains('on')?'*':'')+x.querySelector('b').textContent+'|'+x.querySelector('small').textContent));
  t.eq(rows[0],'Single Leg Press (Glute-Bias)|Original laut Plan','Original zuerst');
  t.ok(/^\*DB Bulgarian Split Squat\|Alternative laut Candito · so in Canditos App gewählt/.test(rows[1]),'Voreinstellung markiert');
  t.ok(rows.some(r=>/Alternative von Claude/.test(r)),'Claude-Alternativen als solche gekennzeichnet');
  // Original dauerhaft wählen → gilt in allen Wochen, bleibt nach Neuladen
  await p.evaluate(()=>{SW.mode='perm';swPick('slp')});await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>[P[0][2].b[2].e,P[3][2].b[2].e,S.meta.swap.slp]),['slp','slp','slp'],'Original dauerhaft (alle Wochen)');
  await p.reload();await p.waitForTimeout(3000);
  t.eq(await p.evaluate(()=>{switchProg('p10');return P[0][2].b[2].e}),'slp','Bleibt nach Neuladen');
  // zurück zur Voreinstellung
  await p.evaluate(()=>{S.ui.w=0;S.ui.d=2;S.ui.tab='train';render();swSheet(0,2,2);SW.mode='perm';swPick('bss')});await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>P[0][2].b[2].e),'bss','Zurück zur Voreinstellung');
  // nur heute: Original → nur dieser Tag, auch wenn p10b/p10c dieselben Plan-Objekte teilen
  await p.evaluate(()=>{swSheet(0,2,2);SW.mode='temp';swPick('slp')});await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>[P[0][2].b[2].e,P[1][2].b[2].e,(log(0,2).sw||{})[2]]),['slp','bss','slp'],'Nur heute: nur dieser Tag');
  await p.evaluate(()=>{swSheet(0,2,2);SW.mode='temp';swPick('bss')});await p.waitForTimeout(300);
  t.eq(await p.evaluate(()=>[P[0][2].b[2].e,JSON.stringify(log(0,2).sw||{})]),['bss','{}'],'Tages-Tausch zurückgenommen');
  // Hauptlifts sind nicht tauschbar
  t.eq(await p.evaluate(()=>[swOpts('csq'),swOpts('pbb'),swOpts('cdl')]),[null,null,null],'Kniebeuge, Bank, Kreuzheben nicht tauschbar');
}};
