// Fehlerprotokoll: Fehler werden lokal erfasst, gleiche zusammengezählt, Bericht kopierbar, Leeren.
module.exports={name:'Fehlerprotokoll – erfassen, zusammenzählen, kopieren, leeren',async run({page,t}){
  const p=await page();
  t.eq(await p.evaluate(()=>cfErr.list().length),0,'Frischer Start ohne Einträge');
  // Fehler-Ereignis auslösen, ohne einen echten Seitenfehler zu erzeugen
  await p.evaluate(()=>{for(let i=0;i<2;i++)window.dispatchEvent(new ErrorEvent('error',{message:'Testfehler A',filename:'http://x/assets/app.js',lineno:12,colno:3,error:new Error('Testfehler A')}));
    window.dispatchEvent(new ErrorEvent('error',{message:'Testfehler B',filename:'app.js',lineno:1,colno:1}))});
  const l=await p.evaluate(()=>cfErr.list());
  t.eq(l.map(x=>[x.m,x.n]),[['Testfehler B',1],['Testfehler A',2]],'Zwei Fehler, der doppelte zusammengezählt');
  t.ok(l[1].s==='app.js:12:3'&&!!l[1].ver,'Ort und App-Version gespeichert');
  // Bild-Ladefehler zählen nicht
  await p.evaluate(()=>{const im=document.createElement('img');document.body.appendChild(im);im.dispatchEvent(new Event('error'));im.remove()});
  t.eq(await p.evaluate(()=>cfErr.list().length),2,'Ladefehler von Bildern werden ignoriert');
  // Einstellungen: Karte, Kopieren, Leeren
  await p.evaluate(()=>{S.ui.tab='setup';render()});await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>/3 Einträge/.test(document.querySelector('.errlog')?.textContent||'')),'Karte in den Einstellungen zeigt 3 Einträge');
  await p.evaluate(()=>document.querySelector('[data-errcopy]').click());await p.waitForTimeout(300);
  const rep=await p.evaluate(()=>window.__lastErrReport||'');
  t.ok(/Fehlerbericht/.test(rep)&&/Testfehler A \(2×\)/.test(rep)&&/App-Version/.test(rep),'Bericht enthält Fehler, Anzahl und Version');
  t.ok(!/"logs"|kg|Wdh/.test(rep),'Bericht enthält keine Trainingsdaten');
  await p.evaluate(()=>document.querySelector('[data-errclear]').click());await p.waitForTimeout(300);
  t.ok(await p.evaluate(()=>cfErr.list().length===0&&/keine Fehler/.test(document.querySelector('.errlog')?.textContent||'')),'Leeren setzt das Protokoll zurück');
}};
