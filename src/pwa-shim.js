/* Candito Forever – PWA-Schicht.
   Ersetzt die claude.ai-Laufzeit (window.claude.use) durch lokale Gegenstücke:
   - 'db'        → Datenbank im Gerätespeicher (IndexedDB), gleiche Schnittstelle wie in der Claude-Version
   - 'downloads' → iOS-Teilen-Menü („In Dateien sichern“ / iCloud Drive), sonst normaler Download
   - 'sample'    → nicht verfügbar (Claude-Analyse und Bild-Lesen gibt es nur in der Claude-Version) */
(function(){
  'use strict';
  var DBN='candito-forever', ST='docs', MAXBK=60;
  var idb=null, mem=new Map(), listeners=[];
  var clone=function(v){return v===undefined?undefined:JSON.parse(JSON.stringify(v))};
  var opened=new Promise(function(res){
    try{var r=indexedDB.open(DBN,1);
      r.onupgradeneeded=function(){r.result.createObjectStore(ST)};
      r.onsuccess=function(){idb=r.result;res()};
      r.onerror=function(){res()};r.onblocked=function(){res()};
    }catch(e){res()}
  });
  var loaded=opened.then(function(){return new Promise(function(res){
    if(!idb)return res();
    try{var rq=idb.transaction(ST).objectStore(ST).openCursor();
      rq.onsuccess=function(){var c=rq.result;if(c){mem.set(String(c.key),c.value);c.continue()}else res()};
      rq.onerror=function(){res()};
    }catch(e){res()}
  })});
  function tx(fn){if(!idb)return Promise.resolve();return new Promise(function(res,rej){try{var t=idb.transaction(ST,'readwrite');fn(t.objectStore(ST));t.oncomplete=function(){res()};t.onerror=function(){rej(t.error)};t.onabort=function(){rej(t.error)}}catch(e){rej(e)}})}
  function colOf(p){return p.slice(0,p.indexOf('/'))}
  function colSnap(n){var docs=[];mem.forEach(function(v,k){if(colOf(k)===n){var id=k.slice(n.length+1);docs.push({id:id,exists:true,data:function(){return clone(v)}})}});return {docs:docs,size:docs.length,empty:!docs.length}}
  function docSnap(p){var v=mem.get(p);return {id:p.split('/').pop(),exists:v!==undefined,data:function(){return clone(v)}}}
  function notify(p){var c=colOf(p);listeners.slice().forEach(function(l){if(l.t==='c'&&l.n===c)setTimeout(function(){l.cb(colSnap(c))},0);else if(l.t==='d'&&l.n===p)setTimeout(function(){l.cb(docSnap(p))},0)})}
  function prune(){var ks=[];mem.forEach(function(v,k){if(colOf(k)==='backup')ks.push(k)});if(ks.length<=MAXBK)return;ks.sort();var del=ks.slice(0,ks.length-MAXBK);del.forEach(function(k){mem.delete(k)});tx(function(s){del.forEach(function(k){s.delete(k)})}).catch(function(){})}
  function listen(t,n,cb){var l={t:t,n:n,cb:cb};listeners.push(l);loaded.then(function(){if(listeners.indexOf(l)>=0)cb(t==='c'?colSnap(n):docSnap(n))});return function(){var i=listeners.indexOf(l);if(i>=0)listeners.splice(i,1)}}
  function docRef(p){return {
    id:p.split('/').pop(),
    set:function(data,opt){return loaded.then(function(){var v=(opt&&opt.merge)?Object.assign({},mem.get(p)||{},clone(data)):clone(data);mem.set(p,v);notify(p);var w=tx(function(s){s.put(v,p)});if(colOf(p)==='backup')prune();return w})},
    update:function(data){return this.set(data,{merge:true})},
    delete:function(){return loaded.then(function(){mem.delete(p);notify(p);return tx(function(s){s.delete(p)})})},
    get:function(){return loaded.then(function(){return docSnap(p)})},
    onSnapshot:function(cb){return listen('d',p,cb)}
  }}
  var db={
    collection:function(n){return {onSnapshot:function(cb){return listen('c',n,cb)},doc:function(id){return docRef(n+'/'+id)},get:function(){return loaded.then(function(){return colSnap(n)})}}},
    doc:function(p){return docRef(p)}
  };
  var downloads={save:function(o){
    var name=o.filename||'datei.txt',type=o.mimeType||(/\.json$/.test(name)?'application/json':/\.csv$/.test(name)?'text/csv':'text/plain');
    var blob=o.data instanceof Blob?o.data:new Blob([o.data],{type:type});
    var mark=function(){if(/sicherung/.test(name)){try{localStorage.setItem('cf-lastexport',String(Date.now()))}catch(e){}window.dispatchEvent(new Event('cf-exported'))}};
    var file=null;try{file=new File([blob],name,{type:type})}catch(e){}
    if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
      return navigator.share({files:[file],title:name}).then(mark)
    }
    mark();
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},4000);return Promise.resolve();
  }};
  window.claude={use:function(n){return Promise.resolve(n==='db'?db:n==='downloads'?downloads:null)}};
  window.CF_PWA={db:db,loaded:loaded};
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
})();
