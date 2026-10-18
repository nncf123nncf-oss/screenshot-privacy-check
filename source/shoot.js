// 投稿用の素材を撮る(Chrome headless・DPR2)。架空のダミー画像だけを読み込む。実行: node source/shoot.js <出力フォルダ>
const fs = require('fs'), path = require('path');
const { launch } = require('./cdp.js');
const OUT = process.argv[2] || path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const helpers = fs.readFileSync(path.join(__dirname, 'e2e-helpers.js'), 'utf8');
const D = '2026-10-18';
async function load(c, file) {
  await c.ev(helpers);
  await c.ev(`(async()=>{ const b=await (await fetch('source/testdata/${file}')).blob(); const dt=new DataTransfer(); dt.items.add(new File([b],'${file}',{type:'image/png'})); const i=document.getElementById('file'); i.files=dt.files; i.dispatchEvent(new Event('change')); for(let k=0;k<200;k++){ await new Promise(r=>setTimeout(r,100)); if(__sp.ocrState==='done') break; } return __sp.boxes.length; })()`);
}
(async () => {
  const c = await launch(9374);
  // Card1: PC幅・塗りつぶし(既定)・自動検出5件
  await c.open('http://127.0.0.1:8073/index.html', 1000, 1100, 2, false, 'light');
  await load(c, 'dummy-inquiry.png');
  await c.sleep(600);
  const r1 = JSON.parse(await c.ev(`JSON.stringify({boxes:__sp.boxes.map(b=>b.kind), h:document.documentElement.scrollHeight, ctl:document.querySelector('.a-ctl').getBoundingClientRect().toJSON(), view:document.getElementById('view').getBoundingClientRect().toJSON(), hide:document.getElementById('hideCount').getBoundingClientRect().toJSON(), mode:document.getElementById('hideCount').parentElement.getBoundingClientRect().toJSON()})`));
  console.log('card1', JSON.stringify(r1));
  await c.shot(path.join(OUT, '01-desktop-fill-' + D + '.png'), { x: 0, y: 0, width: 1000, height: Math.ceil(r1.mode.bottom + 16) });
  c.close();
  // Card2: 375px・ぼかし・手でなぞって1つ足した状態(別の画像)
  const m = await launch(9375);
  await m.open('http://127.0.0.1:8073/index.html', 375, 900, 2, true, 'light');
  await load(m, 'dummy-memo.png');
  await m.ev(`document.querySelector('input[name=mode][value=blur]').click(); document.getElementById('manualBtn').click(); 0`);
  await m.ev(`(()=>{ const v=document.getElementById('view'); const r=v.getBoundingClientRect(); const sx=r.width/__sp.w, sy=r.height/__sp.h; const ev=(t,x,y)=>v.dispatchEvent(new PointerEvent(t,{pointerId:9,clientX:r.left+x*sx,clientY:r.top+y*sy,bubbles:true,cancelable:true,pointerType:'touch'})); ev('pointerdown',8,164); ev('pointermove',100,180); ev('pointermove',160,198); ev('pointerup',160,198); document.getElementById('manualBtn').click(); return __sp.boxes.length; })()`);
  await m.sleep(600);
  const r2 = JSON.parse(await m.ev(`JSON.stringify({boxes:__sp.boxes.map(b=>(b.auto?'auto:':'manual:')+b.kind), tools:document.querySelector('.tools').getBoundingClientRect().toJSON(), view:document.getElementById('view').getBoundingClientRect().toJSON(), sy:scrollY})`));
  console.log('card2', JSON.stringify(r2));
  const top = Math.max(0, Math.floor(r2.tools.top + r2.sy - 8)), bottom = Math.ceil(r2.view.bottom + r2.sy + 12);
  await m.shot(path.join(OUT, '02-mobile375-blur-manual-' + D + '.png'), { x: 0, y: top, width: 375, height: bottom - top });
  m.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
