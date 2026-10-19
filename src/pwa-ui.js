/* Candito Forever – App-Rahmen: Offline/Updates, Sicherungs-Erinnerung, Installationshinweis */
(function(){
  'use strict';
  var VERSION=window.CF_VERSION||'dev';
  var box=document.createElement('div');box.id='cfbar';box.setAttribute('role','status');document.body.appendChild(box);
  function show(html,cls){box.className='cfbar '+(cls||'');box.innerHTML=html;box.hidden=false}
  function hide(){box.hidden=true;box.innerHTML=''}
  hide();

  /* ---------- Service Worker: offline + Updates ---------- */
  var waiting=null,reloading=false,wantReload=false;
  function offerUpdate(w){waiting=w||waiting;if(document.body.classList.contains('gymopen')){offerUpdate.later=true;return}show('<div class="cft"><b>Neue Version verfügbar</b><small>Deine Daten bleiben erhalten.</small></div><button type="button" data-cf="upd">Aktualisieren</button>','upd')}
  setInterval(function(){if(offerUpdate.later&&!document.body.classList.contains('gymopen')){offerUpdate.later=false;offerUpdate()}},3000);
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    navigator.serviceWorker.register('./sw.js').then(function(reg){
      if(reg.waiting&&navigator.serviceWorker.controller)offerUpdate(reg.waiting);
      reg.addEventListener('updatefound',function(){var nw=reg.installing;if(!nw)return;nw.addEventListener('statechange',function(){if(nw.state==='installed'&&navigator.serviceWorker.controller)offerUpdate(nw)})});
      var check=function(){reg.update().catch(function(){})};
      document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check()});
      setInterval(check,30*60*1000);
    }).catch(function(){});
    var hadCtrl=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloading)return;if(wantReload){reloading=true;location.reload();return}if(hadCtrl)offerUpdate(null);hadCtrl=true});
  }

  /* ---------- Erinnerung: Sicherung in iCloud ---------- */
  function lastExport(){try{return +localStorage.getItem('cf-lastexport')||0}catch(e){return 0}}
  function snoozed(){try{return +localStorage.getItem('cf-bksnooze')||0}catch(e){return 0}}
  function hasData(){try{return typeof totalOk==='function'&&totalOk()>0}catch(e){return false}}
  function checkBackup(){
    if(!box.hidden&&box.classList.contains('upd'))return;
    var d=Date.now(),le=lastExport();
    if(box.classList.contains('bk'))hide();return; /* Erinnerung erscheint jetzt als Karte auf „Heute“ */
    if(!hasData()||d-le<7*864e5||d<snoozed()){if(box.classList.contains('bk'))hide();return}
    show('<div class="cft"><b>Sicherung fällig</b><small>'+(le?'Letzte iCloud-Sicherung vor '+Math.floor((d-le)/864e5)+' Tagen':'Noch keine Sicherung in iCloud gespeichert')+'</small></div><button type="button" data-cf="bk">Jetzt sichern</button><button type="button" class="x" data-cf="later" aria-label="Später erinnern">✕</button>','bk');
  }
  window.addEventListener('cf-exported',function(){if(box.classList.contains('bk'))hide()});
  setTimeout(checkBackup,4000);setInterval(checkBackup,60*1000);

  box.addEventListener('click',function(e){var b=e.target.closest('[data-cf]');if(!b)return;var a=b.dataset.cf;
    if(a==='upd'){wantReload=true;b.disabled=true;b.textContent='Lädt …';
      navigator.serviceWorker.getRegistration().then(function(r){var w=(r&&r.waiting)||(waiting&&waiting.state!=='redundant'?waiting:null);if(w&&w.state!=='activated'){w.postMessage('skip')}else{reloading=true;location.reload()}}).catch(function(){location.reload()});
      setTimeout(function(){if(!reloading){reloading=true;location.reload()}},2500)}
    if(a==='bk'){try{downloadBackup()}catch(err){}}
    if(a==='later'){try{localStorage.setItem('cf-bksnooze',String(Date.now()+2*864e5))}catch(err){}hide()}
  });

  /* ---------- Hinweis: zum Home-Bildschirm hinzufügen (nur Safari, nicht installiert) ---------- */
  var standalone=window.navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  document.documentElement.classList.toggle('cf-standalone',standalone);
  var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  try{if(ios&&!standalone&&!localStorage.getItem('cf-installhint')){
    setTimeout(function(){if(!box.hidden)return;show('<div class="cft"><b>Als App installieren</b><small>Tippe unten auf <span class="sh">Teilen</span> und dann „Zum Home-Bildschirm“.</small></div><button type="button" class="x" data-cf="later" aria-label="Schließen">✕</button>','inst');localStorage.setItem('cf-installhint','1')},2500)
  }}catch(e){}

  window.CF_APP={version:VERSION,checkBackup:checkBackup};
})();
