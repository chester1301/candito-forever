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
  var tried=0;try{tried=+sessionStorage.getItem('cf-upd-tried')||0}catch(e){}
  function offerUpdate(w,ver){waiting=w||waiting;if(document.body.classList.contains('gymopen')){offerUpdate.later=true;return}show('<div class="cft"><b>Neue Version verfügbar</b><small>'+(ver?'Version '+ver+' · ':'')+'Deine Daten bleiben erhalten.</small></div><button type="button" data-cf="upd">Aktualisieren</button>'+(tried?'<button type="button" data-cf="force">Erzwingen</button>':''),'upd')}
  /* Harter Weg, wenn der normale Wechsel hängt: Service Worker abmelden, App-Cache leeren, Seite frisch vom Server laden. Trainingsdaten (localStorage/IndexedDB) bleiben unberührt. */
  function forceUpdate(){try{sessionStorage.removeItem('cf-upd-tried')}catch(e){}
    var done=false,go=function(){if(done)return;done=true;location.replace(location.pathname+'?fresh='+Date.now())};
    setTimeout(go,4000);
    var p1=('serviceWorker' in navigator)?navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister()}))}).catch(function(){}):Promise.resolve();
    var p2=('caches' in window)?caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('cf-app-')===0}).map(function(k){return caches.delete(k)}))}).catch(function(){}):Promise.resolve();
    Promise.all([p1,p2]).then(go,go)}
  window.CF_FORCE_UPDATE=forceUpdate;
  try{if(location.search.indexOf('fresh=')>=0)history.replaceState(null,'',location.pathname)}catch(e){}
  document.addEventListener('click',function(e){if(e.target.closest('[data-cf-force]')){forceUpdate()}});
  /* Zusätzlich zur Service-Worker-Meldung: version.json direkt prüfen (ohne Cache) – falls der Worker-Wechsel hängt. */
  function checkVersion(){try{fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){if(j&&j.version&&j.version!==VERSION&&box.hidden)offerUpdate(null,j.version)}).catch(function(){})}catch(e){}}
  setTimeout(checkVersion,6000);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(checkVersion,800)});
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
    if(a==='force'){b.disabled=true;b.textContent='Lädt …';forceUpdate();return}
    if(a==='upd'){wantReload=true;b.disabled=true;b.textContent='Lädt …';try{sessionStorage.setItem('cf-upd-tried',String(tried+1))}catch(err){}
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
