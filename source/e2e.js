// 実ブラウザ(Chrome headless)での通し検算。ローカルサーバ http://127.0.0.1:8073/ が必要。実行: node source/e2e.js
const fs = require('fs'), path = require('path');
const { launch } = require('./cdp.js');
const helpers = fs.readFileSync(path.join(__dirname, 'e2e-helpers.js'), 'utf8');
const body = `(async()=>{
const R={}; const truth=await (await fetch('source/testdata/truth.json')).json(); const st=await (await fetch('source/testdata/truth-stress.json')).json();
const sum=async(list)=>{let exp=0,found=0,cov=0,extra=0;for(const m of list){const o=await __evalFile(m);exp+=o.rows.filter(r=>r.want||r.found===false).length;found+=o.rows.filter(r=>r.found).length;cov+=o.rows.filter(r=>r.found&&r.cover).length;extra+=o.extra;}return {exp,found,cov,extra};};
const std=truth.filter(m=>m.set!=='s4'); R.S1S3_all_conditions=await sum(std); R.S1S3_16px_white=await sum(std.filter(m=>m.px===16&&m.cond==='w')); R.S1S3_12px=await sum(std.filter(m=>m.px===12)); R.S1S3_lowcontrast=await sum(std.filter(m=>m.cond==='lc')); R.S1S3_dark=await sum(std.filter(m=>m.cond==='d')); R.S1S3_24px=await sum(std.filter(m=>m.px===24));
R.S4_decoys=await sum(truth.filter(m=>m.set==='s4')); R.stress=await sum(st.filter(m=>m.set!=='s4')); R.stress_decoys=await sum(st.filter(m=>m.set==='s4'));
const bad=['example','taro','info','000','4111','090','0120','www','https'];
for (const mode of ['fill','blur']){ let leak=0,cand=0,n=0; for(const m of std.filter(m=>m.px!==24||m.cond==='w')){ await __run(m.file); document.querySelector('input[name=mode][value='+mode+']').click(); const url=await __saveUrl(); const lines=await __reocr(url); n++; const c=lines.flatMap(l=>SP.findCandidates(l)).length; cand+=c; if(c||lines.some(l=>bad.some(b=>l.includes(b)))) leak++; } R['S6_'+mode]={images:n,leakImages:leak,candidatesAfter:cand}; }
R.reocr_sanity=(await __reocr('source/testdata/s1_16_w.png')).length;
// 候補が出る前に保存できないこと(古い結果が残らない)
const blob=await (await fetch('source/testdata/s3_16_w.png')).blob(); const dt=new DataTransfer(); dt.items.add(new File([blob],'a.png',{type:'image/png'})); const inp=document.getElementById('file'); inp.files=dt.files; inp.dispatchEvent(new Event('change')); await new Promise(r=>setTimeout(r,30));
R.saveDisabledWhileOcr=document.getElementById('saveBtn').disabled; for(let i=0;i<100&&__sp.ocrState!=='done';i++) await new Promise(r=>setTimeout(r,100)); R.saveEnabledAfter=!document.getElementById('saveBtn').disabled;
R.dbs=indexedDB.databases?(await indexedDB.databases()).length:'n/a'; R.ls=localStorage.length+sessionStorage.length;
return JSON.stringify(R,null,1);})()`;
(async () => {
  const c = await launch(9376);
  await c.open('http://127.0.0.1:8073/index.html?e2e', 1000, 900, 1, false, 'light');
  await c.ev(helpers);
  console.log(await c.ev(body)); c.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
