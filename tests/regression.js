// Usage: node tests/regression.js [baseUrl]  (needs playwright)
const {chromium}=require('playwright');
const BASE=process.argv[2]||'http://localhost:8765/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:700}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(BASE);await p.evaluate(()=>localStorage.clear());await p.reload();
let fails=0;
async function nonBlank(tag){await p.waitForTimeout(250);const n=await p.evaluate(()=>{const c=document.getElementById('cv'),x=c.getContext('2d');const d=x.getImageData(0,0,c.width,c.height).data;let k=0;for(let i=0;i<d.length;i+=4*97)if(d[i]+d[i+1]+d[i+2]>200)k++;return k});
  if(n<5){fails++;console.log('BLANK:',tag)}else console.log('ok:',tag,n)}
async function flick(yOff=0){const box=await p.locator('#cv').boundingBox();const ppm=(box.width-60)/20;
  const g=await p.evaluate(()=>game.info());const dist=g.c-g.x,v=Math.sqrt(2*g.mu*9.8*Math.abs(dist)),px=Math.sign(dist)*v/g.vmax*g.maxd;
  pcts.push(`mu${g.mu}:${Math.round(v/g.vmax*100)}%`);
  const x=box.x+30+g.x*ppm,y=box.y+box.height*.62-25+yOff;await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+px,y,{steps:6});await p.mouse.up();
  await p.waitForTimeout(v/(g.mu*9.8)*1000+2000);}
const pcts=[];
async function back(){if(await p.isVisible('#overlay'))await p.click('#next');else await p.click('#back');await p.waitForTimeout(200)}
for(let rep=0;rep<3;rep++){
  await p.click('text=Pushes');await nonBlank(`push#${rep} L1`);await flick();await nonBlank(`push#${rep} L2`);await flick();
  if(!await p.isVisible('#overlay')){fails++;console.log('push not finished')}await back();
  await p.click('text=Speed Race');for(let k=0;k<3;k++){const q=await p.evaluate(()=>game.info());const sp=q.d/q.t;await nonBlank(`race#${rep} ${q.d}m/${q.t}s`);for(let i=0;i<12;i++)await p.click('#minus');for(let i=1;i<sp;i++)await p.click('#plus');await p.click('#go');await p.waitForTimeout(q.t*1000+2200)}
  if(!await p.isVisible('#overlay')){fails++;console.log('race not finished')}await back();
  await p.click('text=Slide');for(const s of['ice','carpet','grass']){await nonBlank(`n1#${rep} ${s}`);await flick(15)}
  if(!await p.isVisible('#overlay')){fails++;console.log('n1 not finished')}await back();

  await p.click('text=Heavy vs Light');
  const reach=(g,F,m)=>{const a=Math.max(0,F/m-g.MU*9.8),v=a*g.T;return a*g.T*g.T/2+v*v/(2*g.MU*9.8)};
  const waitLvl=async k=>{await p.waitForFunction(k=>game.over||game.info().lvl===k,k,{timeout:40000});await p.waitForTimeout(300)};
  {let g=await p.evaluate(()=>game.info());await nonBlank(`n2#${rep} L1`);await p.click(g.heavyTop?'#pickBot':'#pickTop');await waitLvl(1);
   g=await p.evaluate(()=>game.info());await nonBlank(`n2#${rep} L2`);const m=g.CART+g.n2*g.BRICK;let lo=0,hi=g.FMAX;for(let i=0;i<50;i++){const mid=(lo+hi)/2;reach(g,mid,m)<g.c2-g.x0?lo=mid:hi=mid}
   pcts.push(`n2L2(${g.n2}b,${g.c2.toFixed(1)}m):${Math.round(lo/g.FMAX*100)}%`);
   const box=await p.locator('#cv').boundingBox();const ppm=(box.width-60)/20,x=box.x+30+g.x0*ppm,y=box.y+box.height*.62-25;
   await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+lo/g.FMAX*g.maxd,y,{steps:6});await p.mouse.up();await waitLvl(2);
   g=await p.evaluate(()=>game.info());await nonBlank(`n2#${rep} L3`);let ans=-1;for(let k=0;k<=8;k++){const d=g.x0+reach(g,g.F3,g.CART+k*g.BRICK);if(d>=g.t3[0]&&d<=g.t3[1])ans=k}
   pcts.push(`n2L3(push ${Math.round(g.F3/g.FMAX*100)}%):${ans}b`);for(let k=0;k<ans;k++)await p.click('#bp');await p.click('#bgo');
   await p.waitForFunction(()=>game.over,null,{timeout:40000})}
  if(!await p.isVisible('#overlay')){fails++;console.log('n2 not finished')}await back();
  await p.click('text=Pushes');await nonBlank(`push reopen-quit#${rep}`);await back();
}
console.log('winning drags',pcts.join(' '));console.log('ERRORS',JSON.stringify(errs));await b.close();process.exit(fails||errs.length?1:0)})();
