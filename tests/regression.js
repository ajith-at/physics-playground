// Usage: node tests/regression.js [baseUrl]  (needs playwright)
const {chromium}=require('playwright');
const BASE=process.argv[2]||'http://localhost:8765/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:700}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(BASE);await p.evaluate(()=>localStorage.clear());await p.reload();
let fails=0;
async function nonBlank(tag){await p.waitForTimeout(250);const n=await p.evaluate(()=>{const c=document.getElementById('cv'),x=c.getContext('2d');const d=x.getImageData(0,0,c.width,c.height).data;let k=0;for(let i=0;i<d.length;i+=4*97)if(d[i]+d[i+1]+d[i+2]>200)k++;return k});
  if(n<5){fails++;console.log('BLANK:',tag)}else console.log('ok:',tag,n)}
async function flick(startM,mult,yOff=0,wait=6000){const box=await p.locator('#cv').boundingBox();const W=box.width,ppm=(W-60)/20,MAXD=Math.min(320,W*.4);
  const x=box.x+30+startM*ppm,y=box.y+box.height*.62-25+yOff;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+mult*MAXD/1.7,y,{steps:6});await p.mouse.up();
  await p.waitForTimeout(wait);}
async function back(){if(await p.isVisible('#overlay'))await p.click('#next');else await p.click('#back');await p.waitForTimeout(200)}
for(let rep=0;rep<3;rep++){
  await p.click('text=Pushes');await nonBlank(`push#${rep} L1`);await flick(3,1);await nonBlank(`push#${rep} L2`);await flick(17,-1);
  if(!await p.isVisible('#overlay')){fails++;console.log('push not finished')}await back();
  await p.click('text=Speed Race');for(const sp of[4,5,9]){await nonBlank(`race#${rep} sp${sp}`);for(let i=0;i<12;i++)await p.click('#minus');for(let i=1;i<sp;i++)await p.click('#plus');await p.click('#go');await p.waitForTimeout(sp===4?5200:sp===5?6000:4000)}
  if(!await p.isVisible('#overlay')){fails++;console.log('race not finished')}await back();
  await p.click('text=Slide');for(const s of['ice','carpet','grass']){await nonBlank(`n1#${rep} ${s}`);await flick(2,1,15,11500)}
  if(!await p.isVisible('#overlay')){fails++;console.log('n1 not finished')}await back();
  await p.click('text=Pushes');await nonBlank(`push reopen-quit#${rep}`);await back();
}
console.log('ERRORS',JSON.stringify(errs));await b.close();process.exit(fails||errs.length?1:0)})();
