const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:1024}});
for(const f of process.argv.slice(2)){await p.goto('file://'+process.cwd()+'/'+f);await p.screenshot({path:f.replace('.svg','.png'),omitBackground:false})}
await b.close()})();
